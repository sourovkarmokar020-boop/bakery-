import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Search, Tag, ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { resolveLocalImageUrl } from "@/lib/productImages";

interface ShippingCharge {
  area_name: string;
  charge: number;
}

interface CartLine {
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "bkash", label: "Bkash" },
  { value: "nagad", label: "Nagad" },
];

export default function ManualOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState(0);

  const [shippingCharges, setShippingCharges] = useState<ShippingCharge[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShipping();
    fetchProducts();
  }, []);

  const fetchShipping = async () => {
    const { data } = await supabase
      .from("shipping_charges")
      .select("area_name, charge")
      .eq("is_active", true);
    if (data && data.length > 0) {
      setShippingCharges(data as any);
    } else {
      setShippingCharges([
        { area_name: "ঢাকার ভিতরে", charge: 70 },
        { area_name: "ঢাকার বাহিরে", charge: 150 },
      ]);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, base_price, sale_price, image_url")
      .eq("is_active", true);
    setAllProducts(data || []);
  };

  const productResults = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return allProducts.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [productQuery, allProducts]);

  const deliveryCharge = Number(shippingCharges.find((s) => s.area_name === area)?.charge) || 0;
  const subtotal = cartLines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const total = Math.max(0, subtotal + deliveryCharge - Number(discount || 0));

  const addProduct = (product: any) => {
    setCartLines((prev) => {
      const existing = prev.find((l) => l.product_id === product.id);
      if (existing) {
        return prev.map((l) => (l.product_id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url || null,
          price: Number(product.sale_price ?? product.base_price ?? 0),
          quantity: 1,
        },
      ];
    });
    setProductQuery("");
  };

  const updateQty = (index: number, quantity: number) => {
    setCartLines((prev) => prev.map((l, i) => (i === index ? { ...l, quantity: Math.max(1, quantity) } : l)));
  };

  const removeLine = (index: number) => {
    setCartLines((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setArea("");
    setPaymentMethod("cod");
    setNote("");
    setDiscount(0);
    setCartLines([]);
  };

  const placeOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !area) {
      toast({ title: "নাম, ফোন, ঠিকানা ও ডেলিভারি লোকেশন দিন", variant: "destructive" });
      return;
    }
    if (cartLines.length === 0) {
      toast({ title: "অন্তত একটি প্রোডাক্ট যোগ করুন", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: pendingStatus } = await supabase
        .from("order_statuses")
        .select("id")
        .eq("name", "Pending")
        .single();

      if (!pendingStatus) {
        toast({ title: "সিস্টেম এরর। পরে আবার চেষ্টা করুন।", variant: "destructive" });
        return;
      }

      const orderNumber = `ORD-${Date.now()}`;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          delivery_area: area,
          delivery_charge: deliveryCharge,
          subtotal,
          discount: Number(discount) || 0,
          total,
          status_id: pendingStatus.id,
          payment_method: paymentMethod,
          payment_status: "unpaid",
          notes: note || null,
        })
        .select("id")
        .single();

      if (orderError) {
        toast({ title: (orderError as any)?.message || "অর্ডার তৈরি করতে সমস্যা হয়েছে।", variant: "destructive" });
        return;
      }

      await supabase.from("order_items").insert(
        cartLines.map((l) => ({
          order_id: order.id,
          product_id: l.product_id,
          product_name: l.product_name,
          product_image: l.product_image,
          price: l.price,
          quantity: l.quantity,
          variant_info: null,
        }))
      );

      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id, total_orders, total_spent")
        .eq("phone", phone)
        .maybeSingle();

      if (existingCustomer) {
        await supabase
          .from("customers")
          .update({
            total_orders: (existingCustomer.total_orders || 0) + 1,
            total_spent: Number(existingCustomer.total_spent || 0) + total,
            name,
            address,
          })
          .eq("id", existingCustomer.id);
      } else {
        await supabase.from("customers").insert({
          name,
          phone,
          address,
          total_orders: 1,
          total_spent: total,
        });
      }

      toast({ title: `অর্ডার #${orderNumber} তৈরি হয়েছে` });
      resetForm();
      navigate("/admin/orders");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-primary" /> ম্যানুয়াল অর্ডার</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ফোন বা ফেসবুক মেসেজে আসা অর্ডার এখান থেকে ম্যানুয়ালি তৈরি করুন</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* Left: Customer info + discount */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-3">
              <p className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> কাস্টমার তথ্য</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">নাম *</label>
                  <Input placeholder="কাস্টমারের নাম" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">ফোন নম্বর *</label>
                  <Input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">ঠিকানা *</label>
                <Input placeholder="সম্পূর্ণ ঠিকানা" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">ডেলিভারি লোকেশন *</label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      {shippingCharges.map((s) => (
                        <SelectItem key={s.area_name} value={s.area_name}>{s.area_name} — ৳{s.charge}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">পেমেন্ট মেথড</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">নোট (ঐচ্ছিক)</label>
                <Input placeholder="Facebook message / বিশেষ নির্দেশনা" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> এক্সট্রা ডিসকাউন্ট</p>
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="pl-7"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Product search + cart */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> প্রোডাক্ট যোগ করুন</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="প্রোডাক্টের নাম লিখুন..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="pl-9"
              />
              {productResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-primary" />
                        {p.name}
                      </span>
                      <span className="text-muted-foreground text-xs">৳{Number(p.sale_price ?? p.base_price ?? 0).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {cartLines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">এখনো কোনো প্রোডাক্ট যোগ করা হয়নি</p>
            ) : (
              <div className="space-y-2">
                {cartLines.map((l, i) => (
                  <div key={l.product_id} className="flex items-center gap-2 border rounded-lg p-2">
                    {l.product_image ? (
                      <img src={resolveLocalImageUrl(l.product_image)} alt={l.product_name} className="w-10 h-10 object-cover rounded bg-muted shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{l.product_name}</p>
                      <p className="text-xs text-muted-foreground">৳{l.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateQty(i, l.quantity - 1)} className="p-1.5 hover:bg-muted"><Minus className="w-3 h-3" /></button>
                      <span className="w-7 text-center text-sm">{l.quantity}</span>
                      <button onClick={() => updateQty(i, l.quantity + 1)} className="p-1.5 hover:bg-muted"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="text-sm font-semibold w-16 text-right">৳{(l.price * l.quantity).toLocaleString()}</span>
                    <button onClick={() => removeLine(i)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="space-y-1 p-3 bg-muted/30 rounded-lg text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">সাবটোটাল</span><span>৳{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি চার্জ</span><span>৳{deliveryCharge.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-red-600"><span>ডিসকাউন্ট</span><span>-৳{Number(discount).toLocaleString()}</span></div>}
                  <div className="flex justify-between font-bold text-base border-t pt-1"><span>সর্বমোট</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button className="w-full h-12 text-base rounded-lg" onClick={placeOrder} disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
        অর্ডার প্লেস করুন
      </Button>
    </div>
  );
}

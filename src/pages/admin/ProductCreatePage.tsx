import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { getCategoryPath } from "@/lib/categoryPath";

interface LocalVariant {
  size_name: string;
  size_value: string;
  price: string;
  stock_quantity: string;
}

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState<LocalVariant[]>([]);

  const [form, setForm] = useState({
    name: "",
    name_en: "",
    name_bn: "",
    category_id: "",
    sub_category_id: "",
    sub_sub_category_id: "",
    brand_id: "",
    purchase_price: "",
    base_price: "",
    sale_price: "",
    stock_quantity: "",
    sku: "",
    image_url: "",
    images: [] as string[],
    weight: "",
    weight_en: "",
    weight_bn: "",
    unit: "",
    unit_en: "",
    unit_bn: "",
    description: "",
    description_en: "",
    description_bn: "",
    short_description: "",
    short_description_en: "",
    short_description_bn: "",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [c, b] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
    ]);
    const allCats = c.data || [];
    setCategories(allCats.filter((cat: any) => !cat.parent_id));
    setSubCategories(allCats.filter((cat: any) => cat.parent_id));
    setBrands(b.data || []);
  };

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const addVariant = () => {
    setVariants([...variants, { size_name: "", size_value: "", price: "", stock_quantity: "0" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof LocalVariant, value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_bn.trim()) {
      toast({ title: "প্রোডাক্টের ইংরেজি ও বাংলা নাম উভয়ই দিন", variant: "destructive" });
      return;
    }
    if ((form.description_en.trim() && !form.description_bn.trim()) || (form.description_bn.trim() && !form.description_en.trim())) {
      toast({ title: "প্রোডাক্টের বিবরণ ইংরেজি ও বাংলা উভয় ভাষায় দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const name = form.name_bn || form.name_en;
    const slugSource = form.name_en || name;
    const slug = slugSource.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + Date.now();
    const payload = {
      name,
      name_en: form.name_en,
      name_bn: form.name_bn,
      slug,
      category_id: form.sub_sub_category_id || form.sub_category_id || form.category_id || null,
      brand_id: form.brand_id || null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      base_price: Number(form.base_price) || 0,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      sku: form.sku || null,
      image_url: form.image_url || null,
      images: form.images,
      weight: form.weight_bn || form.weight_en || null,
      weight_en: form.weight_en || null,
      weight_bn: form.weight_bn || null,
      unit: form.unit_bn || form.unit_en || null,
      unit_en: form.unit_en || null,
      unit_bn: form.unit_bn || null,
      description: form.description_bn || form.description_en || null,
      description_en: form.description_en || null,
      description_bn: form.description_bn || null,
      short_description: form.short_description_bn || form.short_description_en || null,
      short_description_en: form.short_description_en || null,
      short_description_bn: form.short_description_bn || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
    };
    const { error, data } = await supabase.from("products").insert(payload).select("id").single();
    if (error) {
      setSaving(false);
      toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }

    // Save variants if any
    for (const v of variants) {
      if (!v.size_name.trim()) continue;
      let sizeId: string;
      const { data: existingSize } = await supabase
        .from("sizes").select("id").eq("name", v.size_name.trim()).maybeSingle();
      if (existingSize) {
        sizeId = existingSize.id;
      } else {
        const { data: newSize } = await supabase
          .from("sizes").insert({ name: v.size_name.trim(), value: v.size_value.trim() || null }).select("id").single();
        if (!newSize) continue;
        sizeId = newSize.id;
      }
      await supabase.from("product_variants").insert({
        product_id: data.id,
        size_id: sizeId,
        price: v.price ? Number(v.price) : null,
        stock_quantity: Number(v.stock_quantity) || 0,
        is_active: true,
      });
    }

    setSaving(false);
    toast({ title: "প্রোডাক্ট যোগ হয়েছে ✅" });
    navigate(`/admin/products/edit/${data.id}`);
  };

  const childCats = subCategories.filter((sc: any) => sc.parent_id === form.category_id);
  const grandCats = subCategories.filter((sc: any) => sc.parent_id === form.sub_category_id);

  // Full list (mains + children) so we can show the whole path, e.g. Clothing → Men → T-Shirt.
  const allCats = [...categories, ...subCategories];
  const selectedCatId = form.sub_sub_category_id || form.sub_category_id || form.category_id;
  const selectedPath = getCategoryPath(allCats, selectedCatId).join(" → ");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-bold">Product Create</h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          Manage
        </Button>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl shadow-sm p-6 space-y-6">
        {/* Product Names (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Product Name (English) *</Label>
            <Input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} placeholder="Enter English name" />
          </div>
          <div className="space-y-2">
            <Label>Product Name (বাংলা) *</Label>
            <Input value={form.name_bn} onChange={(e) => update("name_bn", e.target.value)} placeholder="বাংলা নাম লিখুন" />
          </div>
        </div>

        {/* Categories (cascading up to 3 levels) + Brand */}
        {selectedPath && (
          <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
            <span className="text-muted-foreground">এই প্রোডাক্ট যাবে: </span>
            <span className="font-semibold text-primary">{selectedPath}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>মেইন ক্যাটাগরি *</Label>
            <Select value={form.category_id} onValueChange={(val) => { update("category_id", val); update("sub_category_id", ""); update("sub_sub_category_id", ""); }}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {childCats.length > 0 && (
            <div className="space-y-2">
              <Label>সাব-ক্যাটাগরি</Label>
              <Select value={form.sub_category_id} onValueChange={(val) => { update("sub_category_id", val); update("sub_sub_category_id", ""); }}>
                <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                  {childCats.map((sc: any) => <SelectItem key={sc.id} value={sc.id}>{getCategoryPath(allCats, sc.id).join(" → ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {grandCats.length > 0 && (
            <div className="space-y-2">
              <Label>সাব-সাব ক্যাটাগরি</Label>
              <Select value={form.sub_sub_category_id} onValueChange={(val) => update("sub_sub_category_id", val)}>
                <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                  {grandCats.map((gc: any) => <SelectItem key={gc.id} value={gc.id}>{getCategoryPath(allCats, gc.id).join(" → ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Brands</Label>
            <Select value={form.brand_id} onValueChange={(val) => update("brand_id", val)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>ক্রয় মূল্য (৳)</Label>
            <Input type="number" value={form.purchase_price} onChange={(e) => update("purchase_price", e.target.value)} placeholder="ঐচ্ছিক" />
          </div>
          <div className="space-y-2">
            <Label>Old Price (৳)</Label>
            <Input type="number" value={form.base_price} onChange={(e) => update("base_price", e.target.value)} placeholder="পুরোনো দাম" />
          </div>
          <div className="space-y-2">
            <Label>New Price * (৳)</Label>
            <Input type="number" value={form.sale_price} onChange={(e) => update("sale_price", e.target.value)} placeholder="বর্তমান দাম" />
          </div>
        </div>

        {/* Stock, SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Stock *</Label>
            <Input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} placeholder="স্টক পরিমাণ" />
          </div>
          <div className="space-y-2">
            <Label>Product Code (Optional)</Label>
            <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} placeholder="Leave empty for auto-generate" />
          </div>
        </div>

        {/* Weight (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Weight (English)</Label>
            <Input value={form.weight_en} onChange={(e) => update("weight_en", e.target.value)} placeholder="e.g. 500, 1" />
          </div>
          <div className="space-y-2">
            <Label>Weight (বাংলা)</Label>
            <Input value={form.weight_bn} onChange={(e) => update("weight_bn", e.target.value)} placeholder="যেমন: ৫০০, ১" />
          </div>
        </div>

        {/* Unit (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unit (English)</Label>
            <Input value={form.unit_en} onChange={(e) => update("unit_en", e.target.value)} placeholder="e.g. gm, kg, pcs" />
          </div>
          <div className="space-y-2">
            <Label>Unit (বাংলা)</Label>
            <Input value={form.unit_bn} onChange={(e) => update("unit_bn", e.target.value)} placeholder="যেমন: গ্রাম, কেজি, পিস" />
          </div>
        </div>

        {/* Short Description (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Short Description (English)</Label>
            <Textarea rows={2} value={form.short_description_en} onChange={(e) => update("short_description_en", e.target.value)} placeholder="English short description..." />
          </div>
          <div className="space-y-2">
            <Label>Short Description (বাংলা)</Label>
            <Textarea rows={2} value={form.short_description_bn} onChange={(e) => update("short_description_bn", e.target.value)} placeholder="বাংলা সংক্ষিপ্ত বর্ণনা..." />
          </div>
        </div>

        {/* Description (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Description (English) *</Label>
            <Textarea rows={5} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} placeholder="English details description..." />
          </div>
          <div className="space-y-2">
            <Label>Description (বাংলা) *</Label>
            <Textarea rows={5} value={form.description_bn} onChange={(e) => update("description_bn", e.target.value)} placeholder="বাংলা বিস্তারিত বিবরণ..." />
          </div>
        </div>

        {/* Product Images */}
        <div className="space-y-3 border-t pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Images</p>
          <ImageUpload
            mainImage={form.image_url}
            images={form.images}
            onMainChange={(url) => update("image_url", url)}
            onImagesChange={(urls) => update("images", urls)}
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Label>Status</Label>
            <Switch checked={form.is_active} onCheckedChange={(v) => update("is_active", v)} />
          </div>
          <div className="flex items-center gap-2">
            <Label>অফারে কিনুন</Label>
            <Switch checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
          </div>
        </div>

        {/* Inline Variant Manager */}
        <div className="space-y-3 border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">ভ্যারিয়েন্ট (ওজন/সাইজ)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="w-4 h-4 mr-1" /> যোগ করুন
            </Button>
          </div>
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground">কোনো ভ্যারিয়েন্ট নেই। প্রয়োজনে যোগ করুন।</p>
          )}
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label className="text-xs">নাম *</Label>
                <Input placeholder="যেমন: ২৫০ গ্রাম" value={v.size_name} onChange={(e) => updateVariant(i, "size_name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ভ্যালু</Label>
                <Input placeholder="250g" value={v.size_value} onChange={(e) => updateVariant(i, "size_value", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">দাম (৳)</Label>
                <Input type="number" placeholder="আলাদা দাম" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">স্টক</Label>
                <Input type="number" value={v.stock_quantity} onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeVariant(i)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <Button onClick={handleSave} disabled={saving} className="rounded-full px-8 bg-primary hover:bg-primary/90">
          {saving ? "সেভ হচ্ছে..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useLanguage, getLocalizedField, getLocalizedName } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Minus, Loader2, Copy, Check, Coins, Ticket, X, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase, type AppliedCoupon } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { trackInitiateCheckout, trackPurchase, trackAddPaymentInfo } from "@/components/TrackingManager";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [area, setArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [shippingCharges, setShippingCharges] = useState<{ area_name: string; area_name_en?: string; area_name_bn?: string; charge: number }[]>([]);

  // কয়েন — খরচের অঙ্ক সবসময় সার্ভার থেকে আসে, এখানে শুধু দেখানো হয়
  const [coinConfig, setCoinConfig] = useState<{
    is_enabled: boolean; allow_checkout_redeem: boolean; allow_product_redeem: boolean;
    earn_coins_per_100: number; min_order_to_earn: number; max_coins_per_order: number | null;
  } | null>(null);
  const [coinQuote, setCoinQuote] = useState<{
    available: number; max_coins: number; max_discount: number;
    min_balance_to_redeem: number; will_earn: number;
  } | null>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [rewards, setRewards] = useState<{
    id: string; name: string; image_url: string | null; value_taka: number;
    coin_cost: number; remaining: number; in_stock: boolean; affordable: boolean;
    already_taken: number; max_per_customer: number | null;
  }[]>([]);
  const [pickedReward, setPickedReward] = useState<string | null>(null);

  // কুপন — ছাড়ের অঙ্ক সার্ভার থেকেই আসে, এখানে শুধু কোড লেখা ও দেখানো হয়
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment details
  const [paymentSenderNumber, setPaymentSenderNumber] = useState("");
  const [paymentTransactionId, setPaymentTransactionId] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const hasTrackedCheckout = useRef(false);

  useEffect(() => {
    fetchShipping();
  }, []);

  // Track InitiateCheckout when user enters the cart page with items
  useEffect(() => {
    if (items.length > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      trackInitiateCheckout({
        value: totalPrice,
        num_items: totalItems,
        content_ids: items.map(i => String(i.product.id)),
        content_names: items.map(i => i.product.name),
      });
    }
  }, [items.length, totalPrice, totalItems]);

  // Track AddPaymentInfo when user selects a payment method
  useEffect(() => {
    if (paymentMethod && items.length > 0) {
      trackAddPaymentInfo({
        value: payableTotal,
        currency: "BDT",
        payment_method: paymentMethod,
      });
    }
  }, [paymentMethod]);

  const getEnglishShippingName = (name: string) => {
    if (name.includes("ঢাকার ভিতরে")) return "Inside Dhaka";
    if (name.includes("ঢাকার বাইরে")) return "Outside Dhaka";
    return name;
  };

  const getShippingName = (sc: any, lang: "en" | "bn") => {
    if (lang === "en") {
      const enName = sc.area_name_en || "";
      const hasBangla = /[\u0980-\u09FF]/.test(enName);
      if (enName && !hasBangla) {
        return enName;
      }
      return getEnglishShippingName(sc.area_name);
    } else {
      return sc.area_name_bn || sc.area_name;
    }
  };

  const fetchShipping = async () => {
    const { data } = await supabase
      .from("shipping_charges")
      .select("area_name, area_name_en, area_name_bn, charge")
      .eq("is_active", true);
    if (data && data.length > 0) {
      setShippingCharges(data);
    } else {
      // fallback defaults
      setShippingCharges([
        { area_name: "ঢাকার ভিতরে", area_name_en: "Inside Dhaka", area_name_bn: "ঢাকার ভিতরে", charge: 70 },
        { area_name: "ঢাকার বাহিরে", area_name_en: "Outside Dhaka", area_name_bn: "ঢাকার বাহিরে", charge: 150 },
      ]);
    }
  };

  const selectedShipping = shippingCharges.find((s) => s.area_name === area);
  const deliveryCharge = Number(selectedShipping?.charge) || 0;

  useEffect(() => {
    supabase.coins.getSettings().then(({ data }) => setCoinConfig(data || null));
  }, []);

  const couponDiscount = appliedCoupon?.discount || 0;
  // কয়েনের ছাড় কুপনের পরের অঙ্কের উপর হিসাব হয় — সার্ভারেও একই নিয়ম, তাই
  // কার্টে দেখানো সংখ্যা আর অর্ডারের সময়কার হিসাব মিলে যায়
  const coinBase = Math.max(0, totalPrice - couponDiscount);

  // সাবটোটাল বদলালে কোট আবার নেওয়া হয় — ছাড়ের সীমা অর্ডারের অঙ্কের উপর নির্ভর করে
  useEffect(() => {
    if (!coinConfig?.is_enabled || coinBase <= 0) { setCoinQuote(null); return; }

    let cancelled = false;
    supabase.coins.quote(coinBase).then(({ data }) => {
      if (cancelled) return;
      setCoinQuote(data || null);
      if (!data || data.max_coins <= 0) setUseCoins(false);
    });

    return () => { cancelled = true; };
  }, [coinConfig?.is_enabled, coinBase]);

  // কার্ট বদলালে কুপনটি আবার যাচাই হয় — পণ্য বাদ দিলে ন্যূনতম অর্ডারের শর্ত
  // ভেঙে যেতে পারে, তখন ছাড়টা নিজে থেকেই উঠে যায়
  useEffect(() => {
    if (!appliedCoupon || totalPrice <= 0) return;

    let cancelled = false;
    supabase.coupons.validate(appliedCoupon.code, totalPrice).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data) {
        setAppliedCoupon(null);
        toast.error((error as any)?.message || (language === "en" ? "Coupon is no longer applicable." : "কুপনটি আর প্রযোজ্য নয়।"));
      } else if (data.discount !== appliedCoupon.discount) {
        setAppliedCoupon(data);
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice]);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    setCouponLoading(true);
    const { data, error } = await supabase.coupons.validate(code, totalPrice);
    setCouponLoading(false);

    if (error || !data) {
      toast.error((error as any)?.message || (language === "en" ? "This coupon code is not valid." : "এই কুপন কোডটি সঠিক নয়।"));
      return;
    }

    setAppliedCoupon(data);
    setCouponCode("");
    toast.success(language === "en" ? `Coupon applied — ৳${data.discount} off` : `কুপন প্রয়োগ হয়েছে — ৳${data.discount} ছাড়`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success(language === "en" ? "Coupon removed" : "কুপন বাতিল হয়েছে");
  };

  // ফ্রি প্রোডাক্টের তালিকা — কার্টের অঙ্কের উপর নির্ভর করে না, তাই একবারই আনা হয়।
  // কয়েন ছাড় আর ফ্রি প্রোডাক্ট আলাদা পথ, দুটো একসাথেও নেওয়া যায়।
  useEffect(() => {
    if (!coinConfig?.is_enabled || !coinConfig?.allow_product_redeem) { setRewards([]); return; }

    let cancelled = false;
    supabase.coins.rewards().then(({ data }) => {
      if (!cancelled) setRewards(Array.isArray(data) ? data : []);
    });

    return () => { cancelled = true; };
  }, [coinConfig?.is_enabled, coinConfig?.allow_product_redeem]);

  const availableRewards = rewards.filter(
    (r) => r.in_stock && (r.max_per_customer === null || r.already_taken < r.max_per_customer),
  );
  const pickedRewardItem = availableRewards.find((r) => r.id === pickedReward) || null;

  const canRedeem = !!coinConfig?.is_enabled && !!coinConfig?.allow_checkout_redeem
    && !!coinQuote && coinQuote.max_coins > 0;
  const coinDiscount = canRedeem && useCoins ? coinQuote!.max_discount : 0;
  const payableTotal = Math.max(0, totalPrice + deliveryCharge - couponDiscount - coinDiscount);

  // গেস্ট চেকআউটেও কয়েন জমা হয় (ফোন নম্বর দিয়ে কাস্টমার মেলানো হয়), তাই
  // লগইন না করলেও কত কয়েন পাবে সেটা দেখানো হয়। লগইন থাকলে সার্ভারের হিসাব
  // ব্যবহার হয়, কারণ সেখানে লেভেল মাল্টিপ্লায়ারও ধরা থাকে।
  const willEarn = coinQuote?.will_earn ?? (
    coinConfig?.is_enabled && totalPrice >= (coinConfig.min_order_to_earn || 0)
      ? Math.min(
          Math.floor((totalPrice / 100) * (coinConfig.earn_coins_per_100 || 0)),
          coinConfig.max_coins_per_order ?? Number.MAX_SAFE_INTEGER,
        )
      : 0
  );

  // Auto-save an "অসম্পূর্ণ অর্ডার" draft ~1s after the customer stops typing,
  // so incomplete checkouts are recoverable from the admin panel.
  const draftIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    const hasInfo = name.trim() || phone.trim() || address.trim();
    if (!hasInfo || items.length === 0) return;

    saveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, phone, address, area, paymentMethod, items, deliveryCharge, paymentSenderNumber, paymentTransactionId]);

  const handleCopyNumber = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
      toast.success(language === "en" ? "Number copied!" : "নম্বর কপি হয়েছে!");
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch (err) {
      toast.error(language === "en" ? "Could not copy!" : "কপি করতে পারছি না!");
    }
  };

  const saveDraft = async () => {
    const payload = {
      customer_name: name || null,
      customer_phone: phone || null,
      customer_address: address || null,
      delivery_area: area || null,
      delivery_charge: deliveryCharge,
      payment_method: paymentMethod,
      payment_sender_number: paymentSenderNumber || null,
      payment_transaction_id: paymentTransactionId || null,
      items: items.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      total: totalPrice + deliveryCharge,
    };

    if (!draftIdRef.current) {
      const { data } = await supabase.from("abandoned_carts").insert(payload).select("id").single();
      if (data?.id) draftIdRef.current = data.id;
    } else {
      await supabase.from("abandoned_carts").update(payload).eq("id", draftIdRef.current);
    }
  };

  // লাইভ bKash (Merchant API) চালু থাকলে sender/trx ID লাগে না — কাস্টমার বিকাশ পেমেন্ট পেজে redirect হয়
  const liveBkash = settings.payment_bkash_live_enabled === "true";

  const handleOrder = async () => {
    // Check if any item is out of stock
    const hasOutOfStockItem = items.some(item => !item.product.inStock);
    if (hasOutOfStockItem) {
      toast.error(language === "en" ? "Out of stock items are in cart! Please remove them." : "স্টক শেষ পণ্য কার্টে আছে! অনুগ্রহ করে সেগুলো সরিয়ে নিন।");
      return;
    }

    if (!name || !phone || !address || !area) {
      toast.error(language === "en" ? "Please fill in all information!" : "সব তথ্য পূরণ করুন!");
      return;
    }
    
    // Check if payment details are required (live bKash এ redirect হয়, ম্যানুয়াল trx ID লাগে না)
    const isLiveBkashOrder = paymentMethod === "bkash" && liveBkash;
    if (paymentMethod !== "cod" && !isLiveBkashOrder && (!paymentSenderNumber.trim() || !paymentTransactionId.trim())) {
      toast.error(language === "en" ? "Please enter payment number and transaction ID!" : "পেমেন্ট নম্বর এবং ট্রানজ্যাকশন আইডি দিন!");
      return;
    }

    setLoading(true);
    try {
      // Get pending status
      const { data: pendingStatus } = await supabase
        .from("order_statuses")
        .select("id")
        .eq("name", "Pending")
        .single();

      if (!pendingStatus) {
        toast.error(language === "en" ? "System error. Please try again later." : "সিস্টেম এরর। পরে আবার চেষ্টা করুন।");
        setLoading(false);
        return;
      }

      const orderNumber = `ORD-${Date.now()}`;
      const subtotal = totalPrice;
      const total = subtotal + deliveryCharge;

      // Get current user if logged in
      const { data: { session } } = await supabase.auth.getSession();

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          customer_email: session?.user?.email || null,
          delivery_area: area,
          delivery_charge: deliveryCharge,
          subtotal,
          total,
          status_id: pendingStatus.id,
          payment_method: paymentMethod,
          payment_sender_number: paymentMethod !== "cod" && !isLiveBkashOrder ? paymentSenderNumber : null,
          payment_transaction_id: paymentMethod !== "cod" && !isLiveBkashOrder ? paymentTransactionId : null,
          payment_status: paymentMethod === "cod" ? "unpaid" : (isLiveBkashOrder ? "pending" : "paid"),
          user_id: session?.user?.id || null,
        })
        .select("id")
        .single();

      if (orderError) {
        console.error("Order error:", orderError);
        toast.error((orderError as any)?.message || (language === "en" ? "Order placement failed. Please try again." : "অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"));
        setLoading(false);
        return;
      }

      // Insert order items
      // cart id হয় "productId::variantId::colorId" আকারে — order এ আসল product id টাই যায়
      // (রঙ/সাইজের নাম product_name এর ভেতরেই থাকে)
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_name: item.product.name,
        product_image: item.product.image || null,
        product_id: String(item.product.id).split("::")[0],
        price: item.product.price,
        quantity: item.quantity,
        variant_info: null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
      }

      // Update customer record or create one
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
          email: session?.user?.email || null,
          user_id: session?.user?.id || null,
          total_orders: 1,
          total_spent: total,
        });
      }

      // কুপন প্রয়োগ — কয়েনের আগে, কারণ কয়েনের সীমা কুপনের পরের অঙ্কের উপর হিসাব হয়।
      // ছাড় ও নতুন টোটাল সার্ভারেই বসে, তাই এখান থেকে শুধু কোডটা যায়।
      let finalTotal = total;
      if (appliedCoupon) {
        const { data: couponResult, error: couponError } = await supabase.coupons.apply(order.id, appliedCoupon.code);
        if (couponError) {
          toast.error((couponError as any)?.message || (language === "en"
            ? "Coupon could not be applied. Order placed at full price."
            : "কুপন ব্যবহার করা যায়নি। অর্ডারটি পূর্ণ মূল্যে হয়েছে।"));
        } else if (couponResult) {
          finalTotal = couponResult.total;
        }
      }

      // কয়েন প্রয়োগ — কাস্টমার রেকর্ড তৈরি হওয়ার পরে, কারণ কয়েন ওই রেকর্ডের সাথে যুক্ত।
      // ছাড়ের অঙ্ক ও অর্ডারের নতুন টোটাল দুটোই সার্ভারে হিসাব হয়, তাই এখান থেকে
      // কোনো টাকার অঙ্ক পাঠানো হয় না — শুধু কয়েনের সংখ্যা।
      if (useCoins && canRedeem) {
        const { data: coinResult, error: coinError } = await supabase.coins.apply(order.id, coinQuote!.max_coins);
        if (coinError) {
          toast.error((coinError as any)?.message || (language === "en"
            ? "Coins could not be applied. Order placed at full price."
            : "কয়েন ব্যবহার করা যায়নি। অর্ডারটি পূর্ণ মূল্যে হয়েছে।"));
        } else if (coinResult) {
          finalTotal = coinResult.total;
        }
      }

      // ফ্রি প্রোডাক্ট — কয়েন ছাড়ের থেকে আলাদা কল, কারণ এটা টাকার নয় স্টকের
      // হিসাব। ব্যর্থ হলে অর্ডার বাতিল হয় না, শুধু ফ্রি আইটেমটা যোগ হয় না।
      if (pickedRewardItem) {
        const { error: rewardError } = await supabase.coins.redeemProduct(order.id, pickedRewardItem.id);
        if (rewardError) {
          toast.error((rewardError as any)?.message || (language === "en"
            ? "Free product could not be added. Your order is confirmed."
            : "ফ্রি প্রোডাক্টটি যোগ করা যায়নি। আপনার অর্ডারটি হয়ে গেছে।"));
        }
      }

      // Track Purchase
      trackPurchase({
        transaction_id: orderNumber,
        value: finalTotal,
        currency: "BDT",
        content_ids: items.map(i => String(i.product.id)),
        content_names: items.map(i => i.product.name),
        num_items: items.length,
        phone: phone,
      });

      if (draftIdRef.current) {
        await supabase.from("abandoned_carts").update({ recovered: true }).eq("id", draftIdRef.current);
      }

      // লাইভ bKash: অর্ডার তৈরির পর কাস্টমারকে বিকাশ পেমেন্ট পেজে পাঠানো হয়
      if (isLiveBkashOrder) {
        const { data: pay, error: payError } = await supabase.bkash.createPayment(
          order.id,
          `${window.location.origin}/bkash/callback`
        );
        if (payError || !pay?.bkashURL) {
          toast.error((payError as any)?.message || (language === "en" ? "Could not initiate bKash payment. Please try again." : "বিকাশ পেমেন্ট শুরু করা যায়নি। আবার চেষ্টা করুন।"));
          setLoading(false);
          return;
        }
        sessionStorage.setItem("bkash_order_number", orderNumber);
        clearCart();
        window.location.href = pay.bkashURL;
        return;
      }

      clearCart();
      navigate("/thank-you", { state: { orderNumber } });
    } catch (err) {
      console.error(err);
      toast.error(language === "en" ? "Something went wrong. Please try again." : "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner /><Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold mb-2">{t("cart_empty")}</h2>
          <p className="text-muted-foreground mb-6">{language === "en" ? "Add some items to get started" : "কিছু পণ্য যোগ করুন"}</p>
          <Link to="/"><Button className="rounded-full">{language === "en" ? "Shop Now" : "শপিং করুন"}</Button></Link>
        </div>
        <Footer /><MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-6">
        <div className="bg-accent/10 border border-accent rounded-lg p-3 mb-6 text-sm text-center">
          {language === "en" ? "To confirm order, fill in the details and click 'Order Now' or call" : "অর্ডার কনফার্ম করতে তথ্যগুলো পূরণ করে 'অর্ডার করুন' বাটনে ক্লিক করুন অথবা কল করুন"} <a href={`tel:${settings.checkout_hotline || settings.site_phone || "09647132995"}`} className="text-[#1B3A5F] font-bold hover:underline">{settings.checkout_hotline || settings.site_phone || "09647132995"}</a>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="font-semibold">{language === "en" ? "Enter your name *" : "আপনার নাম লিখুন *"}</Label>
                <Input className="mt-1" placeholder={language === "en" ? "Full Name" : "পুরো নাম"} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label className="font-semibold">{language === "en" ? "Enter your number *" : "আপনার নাম্বার লিখুন *"}</Label>
                <Input className="mt-1" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label className="font-semibold">{language === "en" ? "Enter Address *" : "ঠিকানা লিখুন *"}</Label>
                <Input className="mt-1" placeholder={language === "en" ? "Full Address" : "সম্পূর্ণ ঠিকানা"} value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <Label className="font-semibold">{language === "en" ? "Select Delivery Area *" : "ডেলিভারি এরিয়া নির্বাচন করুন *"}</Label>
                <RadioGroup value={area} onValueChange={setArea} className="mt-2 space-y-2">
                  {shippingCharges.map((sc) => (
                    <label
                      key={sc.area_name}
                      htmlFor={`area-${sc.area_name}`}
                      className={`flex items-center gap-3 border-2 rounded-lg p-3 cursor-pointer transition-colors ${area === sc.area_name ? "border-[#1B3A5F] bg-[#1B3A5F]/5" : "border-border hover:border-[#1B3A5F]/50"}`}
                    >
                      <RadioGroupItem value={sc.area_name} id={`area-${sc.area_name}`} />
                      <div className="flex-1">
                        <span className="font-medium">
                          {getShippingName(sc, language)}
                        </span>
                        <span className="text-[#1B3A5F] font-bold ml-2">৳ {sc.charge}</span>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="font-semibold">{language === "en" ? "Payment Method" : "পেমেন্ট মেথড"}</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-wrap gap-3 mt-2">
                  {settings.payment_cod_enabled !== "false" && (
                    <label
                      htmlFor="cod"
                      className={`flex items-center gap-2 border-2 rounded-lg px-4 py-2.5 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-[#1B3A5F] bg-[#1B3A5F]/5" : "border-border hover:border-[#1B3A5F]/50"}`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <span className="font-medium">{language === "en" ? "Cash On Delivery" : "ক্যাশ অন ডেলিভারি"}</span>
                    </label>
                  )}
                  {settings.payment_bkash_enabled !== "false" && (
                    <label
                      htmlFor="bkash"
                      className={`flex items-center gap-2 border-2 rounded-lg px-4 py-2.5 cursor-pointer transition-colors ${paymentMethod === "bkash" ? "border-[#1B3A5F] bg-[#1B3A5F]/5" : "border-border hover:border-[#1B3A5F]/50"}`}
                    >
                      <RadioGroupItem value="bkash" id="bkash" />
                      {settings.payment_bkash_logo && (
                        <img src={settings.payment_bkash_logo} alt="bKash" className="h-6 w-auto object-contain" />
                      )}
                      <span className="font-medium">{language === "en" ? "bKash" : "বিকাশ"}</span>
                    </label>
                  )}
                  {settings.payment_nagad_enabled !== "false" && (
                    <label
                      htmlFor="nagad"
                      className={`flex items-center gap-2 border-2 rounded-lg px-4 py-2.5 cursor-pointer transition-colors ${paymentMethod === "nagad" ? "border-[#1B3A5F] bg-[#1B3A5F]/5" : "border-border hover:border-[#1B3A5F]/50"}`}
                    >
                      <RadioGroupItem value="nagad" id="nagad" />
                      {settings.payment_nagad_logo && (
                        <img src={settings.payment_nagad_logo} alt="Nagad" className="h-6 w-auto object-contain" />
                      )}
                      <span className="font-medium">{language === "en" ? "Nagad" : "নগদ"}</span>
                    </label>
                  )}
                </RadioGroup>
              </div>
              
              {paymentMethod === "bkash" && liveBkash && (
                <div
                  className="border-2 rounded-xl p-5 shadow-sm space-y-2"
                  style={{
                    background: `linear-gradient(to bottom right, ${settings.brand_color}10, ${settings.brand_color}20)`,
                    borderColor: settings.brand_color
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: settings.brand_color }}
                    >
                      ৳
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: settings.brand_color }}>{language === "en" ? "bKash Online Payment" : "bKash অনলাইন পেমেন্ট"}</h3>
                      <p className="text-sm" style={{ color: `${settings.brand_color}cc` }}>
                        {language === "en" ? "Clicking 'Order Now' redirects you to the bKash payment page — pay using your wallet number and PIN" : "\"অর্ডার করুন\" চাপলে আপনাকে বিকাশ পেমেন্ট পেজে নিয়ে যাওয়া হবে — সেখানে নম্বর ও PIN দিয়ে পেমেন্ট সম্পন্ন করুন"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: settings.brand_color }}>
                    {language === "en" ? "Payment Amount:" : "পেমেন্টের পরিমাণ:"} ৳ {payableTotal}
                  </p>
                </div>
              )}

              {paymentMethod === "bkash" && !liveBkash && settings.payment_bkash_number && (
                <div 
                  className="border-2 rounded-xl p-5 space-y-4 shadow-sm"
                  style={{ 
                    background: `linear-gradient(to bottom right, ${settings.brand_color}10, ${settings.brand_color}20)`,
                    borderColor: settings.brand_color
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: settings.brand_color }}
                    >
                      ৳
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: settings.brand_color }}>{language === "en" ? "bKash Payment" : "bKash পেমেন্ট"}</h3>
                      <p className="text-sm" style={{ color: `${settings.brand_color}cc` }}>{language === "en" ? "Send money to the number below" : "নিচের নম্বরে টাকা পাঠান"}</p>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-white rounded-lg p-4 border"
                    style={{ borderColor: `${settings.brand_color}40` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs" style={{ color: `${settings.brand_color}aa` }}>{language === "en" ? "Payment Number" : "পেমেন্ট নম্বর"}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 hover:opacity-90"
                        style={{ color: settings.brand_color }}
                        onClick={() => handleCopyNumber(settings.payment_bkash_number)}
                      >
                        {copiedNumber === settings.payment_bkash_number ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-2xl font-bold font-mono" style={{ color: settings.brand_color }}>{settings.payment_bkash_number}</p>
                    {settings.payment_bkash_type && (
                      <p className="text-xs mt-1" style={{ color: `${settings.brand_color}aa` }}>{language === "en" ? "Account Type" : "অ্যাকাউন্ট টাইপ"}: {settings.payment_bkash_type}</p>
                    )}
                  </div>

                  <div 
                    className="space-y-2 rounded-lg p-3"
                    style={{ backgroundColor: `${settings.brand_color}20` }}
                  >
                    <p className="font-semibold text-sm" style={{ color: settings.brand_color }}>{language === "en" ? "How to Pay:" : "কিভাবে পেমেন্ট করবেন:"}</p>
                    {language === "en" ? (
                      <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: `${settings.brand_color}cc` }}>
                        <li>Select "Send Money" in your bKash app</li>
                        <li>Enter the number above</li>
                        <li>Enter amount: <strong>৳ {payableTotal}</strong></li>
                        <li>Confirm with your PIN</li>
                        <li>Copy Transaction ID</li>
                      </ol>
                    ) : (
                      <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: `${settings.brand_color}cc` }}>
                        <li>আপনার bKash অ্যাপ থেকে "Send Money" বেছে নিন</li>
                        <li>উপরের নম্বরটি লিখুন</li>
                        <li>পরিমাণ লিখুন: <strong>৳ {payableTotal}</strong></li>
                        <li>আপনার PIN দিয়ে কনফার্ম করুন</li>
                        <li>ট্রানজ্যাকশন ID কপি করুন</li>
                      </ol>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div style={{ '--ring-color': settings.brand_color } as React.CSSProperties}>
                      <Label className="font-semibold" style={{ color: settings.brand_color }}>{language === "en" ? "Your bKash Number (from which you paid) *" : "আপনার bKash নম্বর (যার মাধ্যমে পেমেন্ট করেছেন) *"}</Label>
                      <Input
                        className="mt-1 focus-visible:ring-[var(--ring-color)]"
                        style={{ borderColor: `${settings.brand_color}60` }}
                        placeholder="01XXXXXXXXX"
                        value={paymentSenderNumber}
                        onChange={(e) => setPaymentSenderNumber(e.target.value)}
                      />
                    </div>
                    <div style={{ '--ring-color': settings.brand_color } as React.CSSProperties}>
                      <Label className="font-semibold" style={{ color: settings.brand_color }}>{language === "en" ? "Transaction ID *" : "ট্রানজ্যাকশন আইডি (Transaction ID) *"}</Label>
                      <Input
                        className="mt-1 focus-visible:ring-[var(--ring-color)]"
                        style={{ borderColor: `${settings.brand_color}60` }}
                        placeholder="ABCD12345678"
                        value={paymentTransactionId}
                        onChange={(e) => setPaymentTransactionId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === "nagad" && settings.payment_nagad_number && (
                <div 
                  className="border-2 rounded-xl p-5 space-y-4 shadow-sm"
                  style={{ 
                    background: `linear-gradient(to bottom right, ${settings.brand_color}10, ${settings.brand_color}20)`,
                    borderColor: settings.brand_color
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: settings.brand_color }}
                    >
                      ৳
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: settings.brand_color }}>{language === "en" ? "Nagad Payment" : "Nagad পেমেন্ট"}</h3>
                      <p className="text-sm" style={{ color: `${settings.brand_color}cc` }}>{language === "en" ? "Send money to the number below" : "নিচের নম্বরে টাকা পাঠান"}</p>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-white rounded-lg p-4 border"
                    style={{ borderColor: `${settings.brand_color}40` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs" style={{ color: `${settings.brand_color}aa` }}>{language === "en" ? "Payment Number" : "পেমেন্ট নম্বর"}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 hover:opacity-90"
                        style={{ color: settings.brand_color }}
                        onClick={() => handleCopyNumber(settings.payment_nagad_number)}
                      >
                        {copiedNumber === settings.payment_nagad_number ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-2xl font-bold font-mono" style={{ color: settings.brand_color }}>{settings.payment_nagad_number}</p>
                    {settings.payment_nagad_type && (
                      <p className="text-xs mt-1" style={{ color: `${settings.brand_color}aa` }}>{language === "en" ? "Account Type" : "অ্যাকাউন্ট টাইপ"}: {settings.payment_nagad_type}</p>
                    )}
                  </div>

                  <div 
                    className="space-y-2 rounded-lg p-3"
                    style={{ backgroundColor: `${settings.brand_color}20` }}
                  >
                    <p className="font-semibold text-sm" style={{ color: settings.brand_color }}>{language === "en" ? "How to Pay:" : "কিভাবে পেমেন্ট করবেন:"}</p>
                    {language === "en" ? (
                      <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: `${settings.brand_color}cc` }}>
                        <li>Select "Send Money" in your Nagad app</li>
                        <li>Enter the number above</li>
                        <li>Enter amount: <strong>৳ {payableTotal}</strong></li>
                        <li>Confirm with your PIN</li>
                        <li>Copy Transaction ID</li>
                      </ol>
                    ) : (
                      <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: `${settings.brand_color}cc` }}>
                        <li>আপনার Nagad অ্যাপ থেকে "Send Money" বেছে নিন</li>
                        <li>উপরের নম্বরটি লিখুন</li>
                        <li>পরিমাণ লিখুন: <strong>৳ {payableTotal}</strong></li>
                        <li>আপনার PIN দিয়ে কনফার্ম করুন</li>
                        <li>ট্রানজ্যাকশন ID কপি করুন</li>
                      </ol>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div style={{ '--ring-color': settings.brand_color } as React.CSSProperties}>
                      <Label className="font-semibold" style={{ color: settings.brand_color }}>{language === "en" ? "Your Nagad Number (from which you paid) *" : "আপনার Nagad নম্বর (যার মাধ্যমে পেমেন্ট করেছেন) *"}</Label>
                      <Input
                        className="mt-1 focus-visible:ring-[var(--ring-color)]"
                        style={{ borderColor: `${settings.brand_color}60` }}
                        placeholder="01XXXXXXXXX"
                        value={paymentSenderNumber}
                        onChange={(e) => setPaymentSenderNumber(e.target.value)}
                      />
                    </div>
                    <div style={{ '--ring-color': settings.brand_color } as React.CSSProperties}>
                      <Label className="font-semibold" style={{ color: settings.brand_color }}>{language === "en" ? "Transaction ID *" : "ট্রানজ্যাকশন আইডি (Transaction ID) *"}</Label>
                      <Input
                        className="mt-1 focus-visible:ring-[var(--ring-color)]"
                        style={{ borderColor: `${settings.brand_color}60` }}
                        placeholder="ABCD12345678"
                        value={paymentTransactionId}
                        onChange={(e) => setPaymentTransactionId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full rounded-md h-12 text-base" 
                onClick={handleOrder} 
                disabled={loading || items.some(item => !item.product.inStock)}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {language === "en" ? "Placing Order..." : "অর্ডার হচ্ছে..."}</> : items.some(item => !item.product.inStock) ? (language === "en" ? "Remove out of stock items" : "স্টক শেষ পণ্য সরিয়ে নিন") : t("buy_now")}
              </Button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <h2 className="text-xl font-bold mb-4 bg-primary text-primary-foreground p-3 rounded-t-lg">{language === "en" ? "Order Information" : "অর্ডারের তথ্য"}</h2>
            <div className="border rounded-b-lg overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_auto_auto] gap-2 p-3 bg-muted font-semibold text-sm border-b">
                <span>{language === "en" ? "Delete" : "ডিলিট"}</span>
                <span>{language === "en" ? "Product" : "প্রোডাক্ট"}</span>
                <span>{language === "en" ? "Qty" : "পরিমাণ"}</span>
                <span className="text-right">{language === "en" ? "Price" : "মূল্য"}</span>
              </div>
              {items.map((item) => (
                <div key={item.product.id} className={`grid grid-cols-[40px_1fr_auto_auto] gap-2 p-3 items-center border-b text-sm ${!item.product.inStock ? 'bg-red-50' : ''}`}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <img src={item.product.image} alt={getLocalizedName(item.product, language)} className={`w-10 h-10 object-cover rounded bg-muted ${!item.product.inStock ? 'opacity-50' : ''}`} />
                    <div>
                      <span className="line-clamp-1">{getLocalizedName(item.product, language)}</span>
                      {!item.product.inStock && (
                        <p className="text-xs text-red-600 font-semibold">{t("stock_out")}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center border rounded">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={!item.product.inStock}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={!item.product.inStock}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <span className="text-right font-medium">৳ {item.product.price * item.quantity}</span>
                </div>
              ))}
              {/* কুপন — কোড লিখে প্রয়োগ, ছাড়ের হিসাব সার্ভার থেকে আসে */}
              <div className="mx-3 my-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-green-600/40 bg-green-50 p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm flex items-center gap-1.5 text-green-800">
                        <Ticket className="w-4 h-4" />
                        {appliedCoupon.code.toUpperCase()}
                      </p>
                      <p className="text-xs text-green-700 mt-0.5">
                        {appliedCoupon.discount_type === "percentage"
                          ? (language === "en"
                              ? `${appliedCoupon.discount_value}% off — ৳${appliedCoupon.discount} saved`
                              : `${appliedCoupon.discount_value}% ছাড় — ৳${appliedCoupon.discount} সাশ্রয়`)
                          : (language === "en"
                              ? `৳${appliedCoupon.discount} off applied`
                              : `৳${appliedCoupon.discount} ছাড় প্রয়োগ হয়েছে`)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-green-800 hover:bg-green-100 shrink-0"
                      onClick={handleRemoveCoupon}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {language === "en" ? "Remove" : "বাতিল"}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-primary" />
                      {language === "en" ? "Have a coupon code?" : "কুপন কোড আছে?"}
                    </Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        placeholder={language === "en" ? "Enter coupon code" : "কুপন কোড লিখুন"}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                        className="uppercase"
                      />
                      <Button
                        variant="outline"
                        className="shrink-0"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : (language === "en" ? "Apply" : "প্রয়োগ করুন")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* কয়েন — এক ট্যাপে ব্যবহার, কোনো হিসাব কাস্টমারকে করতে হয় না */}
              {canRedeem && (
                <div className="mx-3 mb-1 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-primary" />
                        {language === "en" ? "Use your coins" : "কয়েন ব্যবহার করুন"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {language === "en"
                          ? `${coinQuote!.max_coins} coins = ৳${coinQuote!.max_discount} off`
                          : `${coinQuote!.max_coins} কয়েন = ৳${coinQuote!.max_discount} ছাড়`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === "en"
                          ? `You have ${coinQuote!.available} coins`
                          : `আপনার আছে ${coinQuote!.available} কয়েন`}
                      </p>
                    </div>
                    <Switch checked={useCoins} onCheckedChange={setUseCoins} />
                  </div>
                </div>
              )}

              {/* ব্যালেন্স আছে কিন্তু সীমার নিচে — কেন ব্যবহার করা যাচ্ছে না সেটা বলা হয় */}
              {coinConfig?.is_enabled && coinConfig?.allow_checkout_redeem && coinQuote
                && coinQuote.max_coins <= 0 && coinQuote.available > 0 && (
                <div className="mx-3 mb-1 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                  {language === "en"
                    ? `You have ${coinQuote.available} coins — ${coinQuote.min_balance_to_redeem} needed to redeem.`
                    : `আপনার ${coinQuote.available} কয়েন আছে — ব্যবহার করতে ${coinQuote.min_balance_to_redeem} কয়েন লাগবে।`}
                </div>
              )}

              {/* কয়েন দিয়ে ফ্রি প্রোডাক্ট — কয়েন ছাড়ের সাথে একসাথেও নেওয়া যায় */}
              {availableRewards.length > 0 && (
                <div className="mx-3 mb-1 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="font-semibold text-sm flex items-center gap-1.5 mb-2">
                    <Gift className="w-4 h-4 text-primary" />
                    {language === "en" ? "Get a free product with coins" : "কয়েন দিয়ে ফ্রি প্রোডাক্ট নিন"}
                  </p>

                  <div className="space-y-1.5">
                    {availableRewards.map((r) => {
                      const picked = pickedReward === r.id;
                      return (
                        <button
                          key={r.id} type="button"
                          disabled={!r.affordable}
                          onClick={() => setPickedReward(picked ? null : r.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 rounded-lg border p-2 text-left transition-colors",
                            picked ? "border-primary bg-primary/10" : "bg-background hover:bg-muted/50",
                            !r.affordable && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          {r.image_url
                            ? <img src={r.image_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                            : <div className="w-10 h-10 rounded bg-muted shrink-0" />}

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{r.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.coin_cost} {language === "en" ? "coins" : "কয়েন"}
                              {r.value_taka > 0 && ` · ৳${r.value_taka}`}
                            </p>
                          </div>

                          <span className={cn(
                            "text-xs font-semibold shrink-0 px-2 py-1 rounded-full",
                            picked ? "bg-primary text-primary-foreground" : "bg-muted",
                          )}>
                            {picked
                              ? (language === "en" ? "Selected" : "নেওয়া হয়েছে")
                              : r.affordable
                                ? (language === "en" ? "Take" : "নিন")
                                : (language === "en" ? "Not enough" : "কয়েন কম")}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {!coinQuote?.available && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === "en"
                        ? "Log in to use your coins."
                        : "কয়েন ব্যবহার করতে লগইন করুন।"}
                    </p>
                  )}
                </div>
              )}

              <div className="p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>{language === "en" ? "Subtotal:" : "মোটঃ"}</span><span className="font-medium">৳ {totalPrice}</span></div>
                <div className="flex justify-between"><span>{language === "en" ? "Delivery Charge:" : "ডেলিভারি চার্জঃ"}</span><span className="font-medium">৳ {deliveryCharge}</span></div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>{language === "en" ? `Coupon (${appliedCoupon!.code.toUpperCase()}):` : `কুপন (${appliedCoupon!.code.toUpperCase()})ঃ`}</span>
                    <span className="font-medium">− ৳ {couponDiscount}</span>
                  </div>
                )}
                {coinDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>{language === "en" ? "Coin Discount:" : "কয়েন ছাড়ঃ"}</span>
                    <span className="font-medium">− ৳ {coinDiscount}</span>
                  </div>
                )}
                {pickedRewardItem && (
                  <div className="flex justify-between text-primary gap-3">
                    <span className="shrink-0">{language === "en" ? "Free product:" : "ফ্রি প্রোডাক্টঃ"}</span>
                    <span className="font-medium text-right truncate">
                      {pickedRewardItem.name} ({pickedRewardItem.coin_cost} {language === "en" ? "coins" : "কয়েন"})
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>{language === "en" ? "Total:" : "সর্বমোটঃ"}</span><span className="text-[#1B3A5F]">৳ {payableTotal}</span></div>
                {coinConfig?.is_enabled && willEarn > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    {language === "en"
                      ? `You'll earn ${willEarn} coins after delivery`
                      : `ডেলিভারির পর ${willEarn} কয়েন পাবেন`}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-accent/10 border border-accent rounded-lg text-sm">
              <p>{language === "en" ? "N.B.- Please order with 100% certainty. Pay courier charges to receive items." : "বিঃদ্রঃ- দয়া করে ১০০% নিশ্চিত হয়ে অর্ডার করবেন। কুরিয়ার চার্জ দিয়ে পণ্য রিসিভ করুন।"}</p>
              <Link to="/" className="text-[#1B3A5F] font-semibold mt-1 block hover:underline">
                {language === "en" ? "Click to add more products under the same delivery charge" : "একই ডেলিভারি চার্জে আরো প্রোডাক্ট নিতে ক্লিক করুন"}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer /><WhatsAppButton /><MobileBottomNav />
    </div>
  );
};

export default CartPage;

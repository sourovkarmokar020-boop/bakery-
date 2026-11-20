import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, CreditCard, Phone, Star, Plus, Minus, Clock, Truck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackViewContent } from "@/components/TrackingManager";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { products as mockProducts, categories as mockCategories } from "@/data/mockData";
import { getProductImage, resolveLocalImageUrl } from "@/lib/productImages";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { waLink } from "@/lib/whatsapp";
import { useLanguage, getLocalizedName, getLocalizedDescription, getLocalizedField } from "@/context/LanguageContext";

const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("countdown_end");
    if (saved) {
      const diff = parseInt(saved) - Date.now();
      if (diff > 0) return diff;
    }
    const end = Date.now() + 4 * 60 * 60 * 1000;
    localStorage.setItem("countdown_end", end.toString());
    return 4 * 60 * 60 * 1000;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("countdown_end");
      if (saved) {
        const diff = parseInt(saved) - Date.now();
        if (diff <= 0) {
          const end = Date.now() + 4 * 60 * 60 * 1000;
          localStorage.setItem("countdown_end", end.toString());
          setTimeLeft(4 * 60 * 60 * 1000);
        } else {
          setTimeLeft(diff);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
};

interface DBVariant {
  id: string;
  price: number | null;
  stock_quantity: number | null;
  image_url: string | null;
  sizes: { name: string; value: string | null } | null;
  colors: { name: string; hex_code: string | null } | null;
}

interface DBReview {
  id: string;
  customer_name: string;
  avatar_url: string | null;
  rating: number;
  review_text: string;
  created_at: string;
}

const ProductDetail = () => {
  const { settings } = useSiteSettings();
  const { language, t, tCategory } = useLanguage();
  const { slug } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const { hours, minutes, seconds } = useCountdown();

  // DB product
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [variants, setVariants] = useState<DBVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<DBVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<DBVariant | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  // Fallback to mock
  const mockProduct = mockProducts.find((p) => p.slug === slug);
  const mockCategory = mockProduct ? mockCategories.find(c => c.slug === mockProduct.category) : null;

  // Review form
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  // অনুমোদিত (approved) রিভিউগুলো — DB থেকে আসা
  const [reviews, setReviews] = useState<DBReview[]>([]);

  // এই product-এর অনুমোদিত রিভিউ আনা
  const fetchReviews = async (productId: string) => {
    const { data } = await supabase
      .from("reviews")
      .select("id, customer_name, avatar_url, rating, review_text, created_at")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    setReviews((data as DBReview[]) || []);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoadingDb(true);
      const { data: p } = await supabase
        .from("products")
        .select("*, categories(name, name_en, name_bn, slug)")
        .eq("slug", slug || "")
        .eq("is_active", true)
        .maybeSingle();

      if (p) {
        setDbProduct(p);
        // Fetch variants
        const { data: v } = await supabase
          .from("product_variants")
          .select("id, price, stock_quantity, image_url, sizes(name, value), colors(name, hex_code)")
          .eq("product_id", p.id)
          .eq("is_active", true)
          .order("created_at");

        const variantList = ((v || []) as unknown as DBVariant[]).map(item => ({
          ...item,
          image_url: item.image_url ? resolveLocalImageUrl(item.image_url) : null
        }));
        setVariants(variantList);
        // Don't auto-select, let user choose
        fetchReviews(p.id);
      } else {
        setReviews([]);
      }
      setLoadingDb(false);
    };
    if (slug) fetchProduct();
  }, [slug]);

  // রিভিউ থেকে গড় রেটিং ও সংখ্যা (পণ্যের নামের পাশে দেখানোর জন্য)
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
    : 0;

  // Use DB product if available, else fallback to mock
  const product = dbProduct || mockProduct;
  const productName = getLocalizedName(product, language);
  const productImage = dbProduct ? getProductImage(dbProduct.slug, dbProduct.image_url) : (mockProduct ? getProductImage(mockProduct.slug, mockProduct.image) : '/placeholder.svg');
  const productBasePrice = dbProduct ? dbProduct.base_price : mockProduct?.originalPrice;
  const productSalePrice = dbProduct ? dbProduct.sale_price : mockProduct?.price;
  const productDescription = getLocalizedDescription(product, language);
  const categoryName = dbProduct && dbProduct.categories ? getLocalizedName(dbProduct.categories, language) : mockCategory?.name;
  const categorySlug = dbProduct ? dbProduct.categories?.slug : mockCategory?.slug;
  
  // সাইজ (size_id যুক্ত) আর রঙ (color_id যুক্ত) variant আলাদা — রঙে ছবি থাকতে পারে
  const sizeVariants = variants.filter((v) => v.sizes);
  const colorVariants = variants.filter((v) => v.colors);

  const currentPrice = selectedVariant?.price ?? selectedColor?.price ?? productSalePrice ?? productBasePrice;
  const displayOriginalPrice = (selectedVariant?.price || selectedColor?.price) ? productBasePrice : (productSalePrice && productSalePrice < productBasePrice ? productBasePrice : null);

  // Check if product is in stock
  const isProductInStock = (() => {
    if (dbProduct) {
      if (sizeVariants.length > 0) {
        if (!selectedVariant) return true; // Not selected yet, don't block
        return (selectedVariant.stock_quantity ?? 0) > 0;
      }
      return (dbProduct.stock_quantity ?? 0) > 0;
    }
    return mockProduct?.inStock ?? true;
  })();

  const productId = dbProduct ? String(dbProduct.id) : slug || '';

  // Track product view after product data is loaded.
  useEffect(() => {
    if (!loadingDb && product && productName) {
      trackViewContent({
        product_id: productId,
        product_name: productName || '',
        price: currentPrice,
        currency: "BDT",
        category: categoryName || '',
        brand: mockProduct?.brand || 'Dream Bakery',
      });
    }
  }, [loadingDb, product, productId, productName, currentPrice, categoryName, mockProduct?.brand]);

  if (loadingDb) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner /><Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
        <Footer /><MobileBottomNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner /><Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">{language === "en" ? "Product not found" : "পণ্য খুঁজে পাওয়া যায়নি"}</h2>
          <Link to="/"><Button>{language === "en" ? "Go Home" : "হোমে ফিরুন"}</Button></Link>
        </div>
        <Footer /><MobileBottomNav />
      </div>
    );
  }

  const variantLabel = () => {
    const parts = [selectedVariant?.sizes?.name, selectedColor?.colors?.name].filter(Boolean);
    return parts.length ? ` (${parts.join(", ")})` : "";
  };

  // প্রতিটা রঙ/সাইজ combination আলাদা কার্ট লাইন হয় — আগে সব DB প্রোডাক্টের id 0 থাকায় এক লাইনে মিশে যেত
  const cartItemId = () =>
    `${productId}${selectedVariant ? `::${selectedVariant.id}` : ""}${selectedColor ? `::${selectedColor.id}` : ""}`;

  const handleAdd = () => {
    if (sizeVariants.length > 0 && !selectedVariant) {
      toast.error("অনুগ্রহ করে সাইজ সিলেক্ট করুন!");
      return;
    }
    if (colorVariants.length > 0 && !selectedColor) {
      toast.error(language === "en" ? "Please select an option!" : "অনুগ্রহ করে রঙ সিলেক্ট করুন!");
      return;
    }
    if (!isProductInStock) {
      toast.error(language === "en" ? `${productName} is out of stock!` : `${productName} স্টক শেষ!`);
      return;
    }
    const cartProduct = {
      id: dbProduct ? cartItemId() : mockProduct!.id,
      name: `${productName}${variantLabel()}`,
      slug: slug || '',
      price: currentPrice,
      originalPrice: productBasePrice,
      discount: displayOriginalPrice ? Math.round(((displayOriginalPrice - currentPrice) / displayOriginalPrice) * 100) : 0,
      image: selectedColor?.image_url || productImage || '',
      category: categorySlug || '',
      rating: mockProduct?.rating || 4.8,
      brand: mockProduct?.brand || 'Dream Bakery',
      code: mockProduct?.code || '',
      description: productDescription || '',
      inStock: isProductInStock,
    };
    addToCart(cartProduct, qty);
    toast.success(language === "en" ? `${productName} added to cart!` : `${productName} কার্টে যোগ হয়েছে!`);
  };

  const handleOrder = () => {
    if (sizeVariants.length > 0 && !selectedVariant) {
      toast.error(language === "en" ? "Please select a size!" : "অনুগ্রহ করে সাইজ সিলেক্ট করুন!");
      return;
    }
    if (colorVariants.length > 0 && !selectedColor) {
      toast.error(language === "en" ? "Please select an option!" : "অনুগ্রহ করে রঙ সিলেক্ট করুন!");
      return;
    }
    if (!isProductInStock) {
      toast.error(language === "en" ? `${productName} is out of stock!` : `${productName} স্টক শেষ!`);
      return;
    }
    const cartProduct = {
      id: dbProduct ? cartItemId() : mockProduct!.id,
      name: `${productName}${variantLabel()}`,
      slug: slug || '',
      price: currentPrice,
      originalPrice: productBasePrice,
      discount: 0,
      image: selectedColor?.image_url || productImage || '',
      category: categorySlug || '',
      rating: 4.8,
      brand: 'Dream Bakery',
      code: '',
      description: productDescription || '',
      inStock: isProductInStock,
    };
    addToCart(cartProduct, qty);
    navigate("/cart");
  };

  const handleReviewSubmit = async () => {
    if (!reviewName.trim() || !reviewText.trim()) { toast.error(language === "en" ? "Please write your name and review!" : "নাম ও রিভিউ লিখুন!"); return; }
    if (!dbProduct?.id) { toast.error(language === "en" ? "Reviews cannot be submitted for this product now." : "এই পণ্যে এখন রিভিউ দেওয়া যাচ্ছে না।"); return; }
    setSubmittingReview(true);
    // is_approved=false — admin অনুমোদন করলে তবেই সাইটে দেখাবে
    const { error } = await supabase.from("reviews").insert({
      product_id: dbProduct.id,
      customer_name: reviewName.trim(),
      review_text: reviewText.trim(),
      rating: reviewRating,
      is_approved: false,
      is_featured: false,
    });
    setSubmittingReview(false);
    if (error) {
      toast.error(language === "en" ? "Could not submit review, please try again." : "রিভিউ জমা দেওয়া যায়নি, আবার চেষ্টা করুন।");
      return;
    }
    setReviewName(""); setReviewText(""); setReviewRating(5);
    toast.success(language === "en" ? "Thank you! Your review has been submitted - it will be visible after approval. ✅" : "ধন্যবাদ! আপনার রিভিউ জমা হয়েছে — অনুমোদনের পর সাইটে দেখানো হবে। ✅");
  };

  const discount = displayOriginalPrice ? Math.round(((displayOriginalPrice - currentPrice) / displayOriginalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-[#1B3A5F]">Home</Link>
          {" / "}
          {categorySlug && <><Link to={`/category/${categorySlug}`} className="hover:text-[#1B3A5F]">{tCategory(categorySlug, categoryName)}</Link>{" / "}</>}
          <span className="text-foreground">{productName}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            {discount > 0 && (
              <Badge className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground text-base px-3 py-1">
                -{discount}% {language === "en" ? "Off" : "ছাড়"}
              </Badge>
            )}
            <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
              <img src={activeImage || productImage} alt={productName} className="w-full h-full object-cover" />
            </div>
            {(() => {
              const allImgs = [...new Set([productImage, ...(dbProduct?.images || []), ...colorVariants.map((v) => v.image_url)])].filter(Boolean) as string[];
              return allImgs.length > 0 ? (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allImgs.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                        (activeImage || productImage) === img ? 'border-[#1B3A5F]' : 'border-border hover:border-[#1B3A5F]/50'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{productName}</h1>
              {!isProductInStock && (
                <Badge className="bg-red-600 text-white">{t("stock_out")}</Badge>
              )}
            </div>

            {/* পণ্যের নামের পরে রেটিং সারাংশ — গড় রেটিং ও কতজন রিভিউ দিয়েছে */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-current" : "text-muted"}`} />
                ))}
              </div>
              {reviewCount > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {language === "en" ? (
                    `${avgRating.toFixed(1)}/5 · ${reviewCount.toLocaleString("en-US")} review${reviewCount !== 1 ? 's' : ''}`
                  ) : (
                    `${avgRating.toFixed(1)}/৫ · ${reviewCount.toLocaleString("bn-BD")} জন রিভিউ দিয়েছেন`
                  )}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{t("no_reviews_yet")}</span>
              )}
            </div>

            {/* Short Description */}
            {getLocalizedField(product, "short_description", language) && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">
                {getLocalizedField(product, "short_description", language)}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-3">
              {displayOriginalPrice && <span className="text-lg text-muted-foreground line-through">৳{displayOriginalPrice}</span>}
              <span className="text-3xl font-bold text-foreground">৳{currentPrice}</span>
              {(product.weight || product.weight_en || product.weight_bn) && (
                <span className="text-sm bg-muted px-2.5 py-1 rounded-md text-muted-foreground ml-2">
                  {getLocalizedField(product, "weight", language)} {getLocalizedField(product, "unit", language)}
                </span>
              )}
            </div>

            {/* Color Selection */}
            {colorVariants.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">{language === "en" ? "Select Weight/Size:" : "কতটুকু নিবেন সিলেক্ট করুন"} <span className="text-destructive">*</span></p>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedColor(v);
                        if (v.image_url) setActiveImage(v.image_url);
                      }}
                      className={`w-24 rounded-xl border-2 overflow-hidden bg-card text-center transition-all ${
                        selectedColor?.id === v.id
                          ? 'border-[#1B3A5F] shadow-md shadow-[#1B3A5F]/20'
                          : 'border-border hover:border-[#1B3A5F]/50'
                      }`}
                      title={v.colors?.name || ""}
                    >
                      <div className="w-full aspect-square bg-muted">
                        {v.image_url ? (
                          <img src={v.image_url} alt={v.colors?.name || ""} className="w-full h-full object-cover" />
                        ) : (
                          <span
                            className="w-full h-full block"
                            style={{ backgroundColor: v.colors?.hex_code || "#ccc" }}
                          />
                        )}
                      </div>
                      <div className={`px-1 py-1.5 text-xs font-medium leading-tight ${selectedColor?.id === v.id ? 'bg-[#1B3A5F] text-white' : ''}`}>
                        {v.colors?.name}
                        {v.price ? <span className="block text-[11px] opacity-80">৳{v.price}</span> : null}
                      </div>
                    </button>
                  ))}
                </div>
                {!selectedColor && (
                  <p className="text-xs text-destructive mt-1">⚠️ {language === "en" ? "Please select an option to order" : "অর্ডার করতে একটি অপশন সিলেক্ট করুন"}</p>
                )}
              </div>
            )}

            {/* Size Selection */}
            {sizeVariants.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">{language === "en" ? "Select Weight/Size:" : "ওজন/সাইজ সিলেক্ট করুন:"} <span className="text-destructive">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {sizeVariants.map((v) => {
                  const variantInStock = (v.stock_quantity ?? 0) > 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => variantInStock && setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-[#1B3A5F] bg-[#1B3A5F] text-white'
                          : !variantInStock
                            ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-60'
                            : 'border-border hover:border-[#1B3A5F]/50'
                      }`}
                      disabled={!variantInStock}
                    >
                      {v.sizes?.name}
                      {v.price && <span className="ml-1">- ৳{v.price}</span>}
                      {!variantInStock && <span className="ml-1 text-xs">({language === "en" ? "Stock Out" : "স্টক শেষ"})</span>}
                    </button>
                  );
                })}
                </div>
                {!selectedVariant && (
                  <p className="text-xs text-destructive mt-1">⚠️ {language === "en" ? "Please select an option to order" : "অর্ডার করতে একটি অপশন সিলেক্ট করুন"}</p>
                )}
              </div>
            )}

            {/* Countdown Timer */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">⏰ {language === "en" ? "Limited Time Offer!" : "সীমিত সময়ের অফার!"}</p>
                <div className="flex gap-2 mt-1">
                  <span className="bg-destructive text-white px-2 py-0.5 rounded font-bold text-sm">{String(hours).padStart(2, '0')}h</span>
                  <span className="bg-destructive text-white px-2 py-0.5 rounded font-bold text-sm">{String(minutes).padStart(2, '0')}m</span>
                  <span className="bg-destructive text-white px-2 py-0.5 rounded font-bold text-sm">{String(seconds).padStart(2, '0')}s</span>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border-2 rounded-md">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-r" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center font-medium text-lg">{qty}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-l" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 rounded-md border-button bg-button text-button-foreground hover:bg-button/90 h-12 text-base" 
                onClick={handleAdd}
                disabled={!isProductInStock}
              >
                <ShoppingCart className="h-5 w-5" /> {!isProductInStock ? t("stock_out") : t("add_to_cart")}
              </Button>
              <Button 
                className="flex-1 gap-2 rounded-md h-12 text-base bg-button text-button-foreground hover:bg-button/90" 
                onClick={handleOrder}
                disabled={!isProductInStock}
              >
                <CreditCard className="h-5 w-5" /> {!isProductInStock ? t("stock_out") : t("buy_now")}
              </Button>
            </div>

            {/* Contact */}
            <div className="flex gap-3 mb-5">
              <a href={`tel:${settings.site_phone || "09647132995"}`} className="flex-1 flex items-center justify-center gap-2 border-2 border-[#1B3A5F] rounded-lg py-2.5 text-[#1B3A5F] font-medium hover:bg-[#1B3A5F]/5 transition-colors">
                <Phone className="h-4 w-4" /> {settings.site_phone || "09647132995"}
              </a>
              <a href={waLink(settings.whatsapp_number, settings.whatsapp_template)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 border-2 border-[hsl(142,70%,45%)] rounded-lg py-2.5 text-[hsl(142,70%,38%)] font-medium hover:bg-[hsl(142,70%,45%)]/5 transition-colors">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {settings.whatsapp_number || "01721132995"}
              </a>
            </div>

            {/* Delivery Table */}
            <div className="border-2 border-[#1B3A5F]/30 rounded-xl overflow-hidden">
              <div className="bg-[#1B3A5F]/10 p-3 font-semibold text-center flex items-center justify-center gap-2">
                <Truck className="h-5 w-5 text-[#1B3A5F]" />
                <span>{t("delivery_cost")}</span>
              </div>
              <div className="divide-y">
                <div className="p-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2">{language === "en" ? "🏙️ Inside Dhaka" : "🏙️ ঢাকার ভিতরে"}</span>
                  <span className="font-bold text-[#1B3A5F]">৳ 70</span>
                </div>
                <div className="p-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-2">{language === "en" ? "🚚 Outside Dhaka" : "🚚 ঢাকার বাইরে"}</span>
                  <span className="font-bold text-[#1B3A5F]">৳ 150</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="description">{language === "en" ? "Description" : "বিস্তারিত"}</TabsTrigger>
            <TabsTrigger value="policy">{language === "en" ? "Order Policy" : "অর্ডার পলিসি"}</TabsTrigger>
            <TabsTrigger value="reviews">{language === "en" ? "Reviews" : "রিভিউ"} ({reviewCount})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 p-4 border rounded-lg">
            <h3 className="font-bold text-lg mb-3">{language === "en" ? "Description" : "বিস্তারিত"}</h3>
            <p className="mb-4">{productDescription}</p>
          </TabsContent>
          <TabsContent value="policy" className="mt-4 p-4 border rounded-lg">
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>{language === "en" ? "Delivery within 2-3 days after order confirmation" : "অর্ডার কনফার্ম হলে ২-৩ দিনের মধ্যে ডেলিভারি"}</li>
              <li>{language === "en" ? "Cash on Delivery (COD) Available" : "Cash on Delivery (COD) সুবিধা"}</li>
              <li>{language === "en" ? "Return/Refund if there is a product issue" : "পণ্যে সমস্যা থাকলে রিটার্ন/রিফান্ড"}</li>
              <li>{language === "en" ? "Delivery charge: Dhaka 70 TK, Outside Dhaka 150 TK" : "ঢাকায় ৭০ টাকা, ঢাকার বাইরে ১৫০ টাকা ডেলিভারি চার্জ"}</li>
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4 p-4 border rounded-lg space-y-6">
            {/* রেটিং সারাংশ */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
                  <div className="flex text-accent justify-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-current" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    {language === "en" ? `${reviewCount} verified review(s)` : `${reviewCount.toLocaleString("bn-BD")} জন রিভিউ দিয়েছেন`}
                  </p>
                  <p>{language === "en" ? "Verified Customer Reviews" : "ভেরিফায়েড কাস্টমার রিভিউ"}</p>
                </div>
              </div>
            )}

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt={r.customer_name} className="w-9 h-9 rounded-full object-cover border" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1B3A5F]/10 text-[#1B3A5F] flex items-center justify-center text-sm font-bold shrink-0">
                          {(r.customer_name?.charAt(0) || "?").toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-sm block">{r.customer_name}</span>
                        <div className="flex text-accent">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`h-3 w-3 ${j < r.rating ? "fill-current" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString(language === "en" ? "en-US" : "bn-BD") : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.review_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">{language === "en" ? "No reviews yet. Be the first to review!" : "এখনও কোনো রিভিউ নেই। প্রথম রিভিউটি আপনিই দিন!"}</p>
            )}

            {/* Review Form */}
            <div className="border-t pt-4">
              <h4 className="font-bold mb-1">{language === "en" ? "Write a Review" : "আপনার রিভিউ দিন"}</h4>
              <p className="text-xs text-muted-foreground mb-3">{language === "en" ? "Your review will be shown after admin approval." : "আপনার রিভিউ অ্যাডমিন অনুমোদনের পর সাইটে দেখানো হবে।"}</p>
              <div className="space-y-3">
                <Input placeholder={language === "en" ? "Your Name" : "আপনার নাম"} value={reviewName} onChange={(e) => setReviewName(e.target.value)} />
                <div className="flex items-center gap-2">
                  <span className="text-sm">{language === "en" ? "Rating:" : "রেটিং:"}</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setReviewRating(n)} className="focus:outline-none">
                        <Star className={`h-5 w-5 ${n <= reviewRating ? "fill-accent text-accent" : "text-muted"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea placeholder={language === "en" ? "Write your review..." : "আপনার রিভিউ লিখুন..."} value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} />
                <Button onClick={handleReviewSubmit} disabled={submittingReview} className="rounded-full">
                  {submittingReview && <Loader2 className="h-4 w-4 animate-spin mr-1" />} {submittingReview ? (language === "en" ? "Submitting..." : "জমা হচ্ছে...") : (language === "en" ? "Submit Review" : "রিভিউ জমা দিন")}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer /><WhatsAppButton /><MobileBottomNav />
    </div>
  );
};

export default ProductDetail;

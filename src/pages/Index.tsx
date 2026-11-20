import { useMemo } from "react";
import { useHomeData } from "@/hooks/useHomeData";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import TopCategories from "@/components/TopCategories";
import FashionSaleSlider from "@/components/FashionSaleSlider";
import ProductCard from "@/components/ProductCard";
import CustomerReviews from "@/components/CustomerReviews";
import BlogSection from "@/components/BlogSection";
import VideoGallery from "@/components/VideoGallery";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import MobileBottomNav from "@/components/MobileBottomNav";
import CountdownTimer from "@/components/CountdownTimer";
import SalesNotification from "@/components/SalesNotification";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getProductImage } from "@/lib/productImages";
import type { Product } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useLanguage, getLocalizedName } from "@/context/LanguageContext";

// Map a DB product row to the Product shape used by ProductCard
const mapDbProduct = (p: any): Product => {
  const salePrice = p.sale_price ?? null;
  const basePrice = p.base_price ?? 0;
  const price = salePrice ?? basePrice;
  const originalPrice = salePrice ? basePrice : basePrice;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const fallbackImage = getProductImage(p.slug, p.image_url);
  return {
    id: p.id,
    name: p.name,
    name_en: p.name_en,
    name_bn: p.name_bn,
    slug: p.slug,
    price,
    originalPrice,
    discount,
    image: fallbackImage,
    category: p.categories?.slug || p.category_slug || "",
    rating: 4.5 + Math.random() * 0.5,
    brand: p.brands?.name || "Dream Bakery",
    code: p.sku || "",
    description: p.description || "",
    description_en: p.description_en,
    description_bn: p.description_bn,
    short_description: p.short_description,
    short_description_en: p.short_description_en,
    short_description_bn: p.short_description_bn,
    weight: p.weight,
    weight_en: p.weight_en,
    weight_bn: p.weight_bn,
    unit: p.unit,
    unit_en: p.unit_en,
    unit_bn: p.unit_bn,
    inStock: (p.stock_quantity ?? 0) > 0 && p.is_active !== false,
  };
};

const Index = () => {
  const { settings } = useSiteSettings();
  const { language, t, tCategory } = useLanguage();
  const showSection = (key: string) => settings[key] !== "false";

  const { data, isLoading } = useHomeData();

  const { featuredProducts, categoryProducts } = useMemo(() => {
    if (!data) return { featuredProducts: [] as Product[], categoryProducts: [] as { id: string; name: string; slug: string; products: Product[] }[] };

    const { products: dbProducts, categories, allCategories } = data;

    // Build a map of parent_id -> [direct child category ids]
    const directChildren = new Map<string, string[]>();
    allCategories.forEach((c: any) => {
      if (c.parent_id) {
        const existing = directChildren.get(c.parent_id) || [];
        existing.push(c.id);
        directChildren.set(c.parent_id, existing);
      }
    });

    // Collect a category's full descendant subtree (any depth), so a homepage
    // section for a main category also includes grand-child products.
    const subtreeIds = (rootId: string): string[] => {
      const ids: string[] = [];
      const stack = [...(directChildren.get(rootId) || [])];
      while (stack.length) {
        const id = stack.pop() as string;
        ids.push(id);
        (directChildren.get(id) || []).forEach((cid) => stack.push(cid));
      }
      return ids;
    };

    // Featured / অফারে কিনুন
    const featured = dbProducts
      .filter((p: any) => p.is_featured)
      .map((p: any) => mapDbProduct(p));

    // Category-wise (include products from subcategories)
    const catSections = categories.map((cat: any) => {
      const validIds = [cat.id, ...subtreeIds(cat.id)];
      const catProds = dbProducts
        .filter((p: any) => validIds.includes(p.category_id))
        .slice(0, 4)
        .map((p: any) => mapDbProduct(p));
      return { id: cat.id, name: cat.name, slug: cat.slug, products: catProds, categoryObj: cat };
    }).filter((s) => s.products.length > 0);

    return { featuredProducts: featured, categoryProducts: catSections };
  }, [data]);

  const loading = isLoading && !data;

  // While initial data is loading, show a clean, minimal spinner and text.
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner />
        <Header />
        <main className="container mx-auto px-4 py-32 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {language === "en" ? "Loading..." : "লোড হচ্ছে..."}
          </p>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />

      <main className="container mx-auto px-4">
        {/* Hero Slider */}
        <section className="pt-2 pb-4 md:pt-3 md:pb-6">
          <HeroSlider />
        </section>

        {/* Artisan Bakery Highlights Strip */}
        <section className="py-3 md:py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-card border border-primary/15 rounded-xl p-3.5 md:p-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl md:text-3xl shrink-0">🥐</span>
              <div>
                <h3 className="font-bold text-sm md:text-base text-primary">
                  {language === "en" ? "100% Freshly Baked" : "১০০% তাজা ওভেন-বেকড"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Baked fresh every morning" : "প্রতিদিন সকালে তাজা বেক করা"}
                </p>
              </div>
            </div>
            <div className="bg-card border border-primary/15 rounded-xl p-3.5 md:p-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl md:text-3xl shrink-0">🎂</span>
              <div>
                <h3 className="font-bold text-sm md:text-base text-primary">
                  {language === "en" ? "Custom Celebration Cakes" : "কাস্টম সেলিব্রেশন কেক"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "For birthdays & weddings" : "জন্মদিন ও যেকোনো অনুষ্ঠানের জন্য"}
                </p>
              </div>
            </div>
            <div className="bg-card border border-primary/15 rounded-xl p-3.5 md:p-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl md:text-3xl shrink-0">🍫</span>
              <div>
                <h3 className="font-bold text-sm md:text-base text-primary">
                  {language === "en" ? "Pure Butter & Chocolate" : "খাঁটি বাটার ও চকলেট"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Belgian cocoa & diary butter" : "বেলজিয়ান কোকো ও প্রিমিয়াম বাটার"}
                </p>
              </div>
            </div>
            <div className="bg-card border border-primary/15 rounded-xl p-3.5 md:p-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl md:text-3xl shrink-0">🚚</span>
              <div>
                <h3 className="font-bold text-sm md:text-base text-primary">
                  {language === "en" ? "Express Home Delivery" : "দ্রুত হোম ডেলিভারি"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Safe box & Cash on Delivery" : "নিরাপদ প্যাকেজিং ও ক্যাশ অন ডেলিভারি"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Categories */}
        {showSection("show_category_section") && <TopCategories />}

        {/* Fashion Sale Slider */}
        <FashionSaleSlider />

        {/* অফারে কিনুন Section - shows is_featured products */}
        {showSection("show_offer_section") && featuredProducts.length > 0 && (
          <section className="py-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-2xl font-bold">🔥 {t("special_offers")}</h2>
              {showSection("show_flashsale_section") && <CountdownTimer />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showUrgency />
              ))}
            </div>
          </section>
        )}

        {/* Category-wise Sections (trending) */}
        {showSection("show_trending_section") && categoryProducts.map((cat) => (
          <section key={cat.id} className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{getLocalizedName(cat.categoryObj, language)}</h2>
              <Link to={`/category/${cat.slug}`}>
                <Button variant="outline" size="sm" className="rounded-full">
                  {t("see_more")} →
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {cat.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}

        {/* Customer Reviews */}
        <CustomerReviews />

        {/* Blog Section */}
        <BlogSection />

        {/* Video Gallery */}
        <VideoGallery />
      </main>

      <Footer />
      <AIChatWidget />
      <SalesNotification />
      <MobileBottomNav />
    </div>
  );
};

export default Index;

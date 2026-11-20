import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/productImages";
import ProductCard from "@/components/ProductCard";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import type { Product } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

// ম্যাপিং CategoryPage-এর মতোই — দুই পেজে কার্ড হুবহু একই রকম দেখায়
const mapDbProduct = (p: any): Product => {
  const salePrice = p.sale_price ?? null;
  const basePrice = p.base_price ?? 0;
  const price = salePrice ?? basePrice;
  const originalPrice = basePrice;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  return {
    id: p.id,
    name: p.name,
    name_en: p.name_en,
    name_bn: p.name_bn,
    slug: p.slug,
    price,
    originalPrice,
    discount,
    image: getProductImage(p.slug, p.image_url),
    category: p.categories?.slug || "",
    rating: 4.5 + Math.random() * 0.5,
    brand: p.brands?.name || "",
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

// একবারে সব কার্ড রেন্ডার না করে ধাপে ধাপে — মোবাইলে প্রথম স্ক্রল দ্রুত থাকে
const PAGE_SIZE = 24;

const AllProductsPage = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*, categories(name, name_en, name_bn, slug), brands(name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setProducts((data || []).map((p: any) => mapDbProduct(p)));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">
            {language === "en" ? "All Products" : "সকল পণ্য"}
          </h1>
          {!loading && products.length > 0 && (
            <span className="text-sm text-muted-foreground shrink-0">
              {products.length} {language === "en" ? "products" : "পণ্য"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "en" ? "Loading..." : "লোড হচ্ছে..."}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {visible < products.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="border-2 border-primary text-primary font-bold px-8 py-2.5 rounded-full hover:bg-primary hover:text-white transition-colors"
                >
                  {language === "en" ? "Load More" : "আরও দেখুন"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              {language === "en" ? "No products found." : "কোনো পণ্য পাওয়া যায়নি।"}
            </p>
            <Link to="/"><button className="text-primary underline">{language === "en" ? "Go Home" : "হোমে ফিরুন"}</button></Link>
          </div>
        )}
      </main>
      <Footer /><MobileBottomNav />
    </div>
  );
};

export default AllProductsPage;

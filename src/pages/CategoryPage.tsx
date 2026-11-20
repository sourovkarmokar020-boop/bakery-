import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/productImages";
import ProductCard from "@/components/ProductCard";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import type { Product } from "@/context/CartContext";
import { useLanguage, getLocalizedName } from "@/context/LanguageContext";

const mapDbProduct = (p: any): Product => {
  const salePrice = p.sale_price ?? null;
  const basePrice = p.base_price ?? 0;
  const price = salePrice ?? basePrice;
  const originalPrice = salePrice ? basePrice : basePrice;
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

const CategoryPage = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [category, setCategory] = useState<any>(null);
  const [catProducts, setCatProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    // Load the whole active category tree once (small table) so we can resolve
    // the current category plus its full descendant subtree (any depth).
    const { data: allCats } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true);

    const cats = allCats || [];
    const cat = cats.find((c: any) => c.slug === slug);

    if (cat) {
      setCategory(cat);

      // Direct children only, for the quick-filter chips.
      const directSubs = cats.filter((c: any) => c.parent_id === cat.id);
      setSubCategories(directSubs);

      // Walk the tree to collect this category + every descendant id, so a
      // parent page also shows products stored on grand-child categories.
      const descendantIds: string[] = [];
      const stack: string[] = [cat.id];
      while (stack.length) {
        const id = stack.pop() as string;
        descendantIds.push(id);
        cats.filter((c: any) => c.parent_id === id).forEach((c: any) => stack.push(c.id));
      }

      // Fetch products from this category and all of its descendants.
      const { data: prods } = await supabase
        .from("products")
        .select("*, categories(name, name_en, name_bn, slug), brands(name)")
        .in("category_id", descendantIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setCatProducts(
        (prods || []).map((p: any) => mapDbProduct(p))
      );
    } else {
      setCategory(null);
      setSubCategories([]);
      setCatProducts([]);
    }
    setLoading(false);
  };

  const categoryName = category ? getLocalizedName(category, language) : "";

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">
          {categoryName || (language === "en" ? "Category" : "ক্যাটাগরি")}
        </h1>

        {subCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {subCategories.map((sub: any) => (
              <Link
                key={sub.id}
                to={`/category/${sub.slug}`}
                className="px-4 py-2 rounded-full border border-primary/30 bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {getLocalizedName(sub, language)}
              </Link>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "en" ? "Loading..." : "লোড হচ্ছে..."}
          </div>
        ) : catProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {catProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              {language === "en" ? "No products found in this category." : "এই ক্যাটাগরিতে কোনো পণ্য নেই।"}
            </p>
            <Link to="/"><button className="text-primary underline">{language === "en" ? "Go Home" : "হোমে ফিরুন"}</button></Link>
          </div>
        )}
      </main>
      <Footer /><MobileBottomNav />
    </div>
  );
};

export default CategoryPage;

import { useEffect, useState } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryImage } from "@/lib/categoryImages";
import { useLanguage, getLocalizedName } from "@/context/LanguageContext";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetch = async () => {
      const [catRes, prodRes, subRes] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).is("parent_id", null).order("sort_order"),
        supabase.from("products").select("id, category_id").eq("is_active", true),
        supabase.from("categories").select("*").eq("is_active", true).not("parent_id", "is", null),
      ]);

      const cats = catRes.data || [];
      const products = prodRes.data || [];
      const subs = subRes.data || [];

      const enriched = cats.map((cat: any) => {
        const childIds = subs.filter((s: any) => s.parent_id === cat.id).map((s: any) => s.id);
        const allIds = [cat.id, ...childIds];
        const productCount = products.filter((p: any) => allIds.includes(p.category_id)).length;
        const subCategories = subs.filter((s: any) => s.parent_id === cat.id);
        return { ...cat, productCount, subCategories };
      });

      setCategories(enriched);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{language === "en" ? "All Categories" : "সকল ক্যাটাগরি"}</h1>
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">{language === "en" ? "Loading..." : "লোড হচ্ছে..."}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="border rounded-xl hover:shadow-md hover:border-primary transition-all group">
                <Link to={`/category/${cat.slug}`} className="flex flex-col items-center gap-3 p-6">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors overflow-hidden">
                    {(getCategoryImage(cat.slug, cat.image_url)) ? (
                      <img src={getCategoryImage(cat.slug, cat.image_url)} alt={getLocalizedName(cat, language)} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <span className="font-medium text-center">{getLocalizedName(cat, language)}</span>
                  <span className="text-sm text-muted-foreground">{cat.productCount} {language === "en" ? "products" : "পণ্য"}</span>
                </Link>
                {cat.subCategories && cat.subCategories.length > 0 && (
                  <div className="border-t px-4 py-3 flex flex-wrap gap-1.5">
                    {cat.subCategories.map((sub: any) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {getLocalizedName(sub, language)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer /><MobileBottomNav />
    </div>
  );
};

export default CategoriesPage;

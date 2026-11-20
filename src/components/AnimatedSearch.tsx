import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/productImages";
import { useLanguage } from "@/context/LanguageContext";

// DB থেকে আসল product নাম না এলে এই fallback গুলো দেখাবে
const fallbackPlaceholdersBn = [
  "প্রোডাক্টের নাম লিখুন",
  "পছন্দের পণ্য খুঁজুন",
];

const fallbackPlaceholdersEn = [
  "Search products...",
  "Find your favorite items..."
];

const AnimatedSearch = () => {
  const { language } = useLanguage();
  const currentFallback = language === "en" ? fallbackPlaceholdersEn : fallbackPlaceholdersBn;

  const [placeholder, setPlaceholder] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // সাইটের আসল product নাম এনে সেগুলো দিয়েই placeholder-এ টাইপিং অ্যানিমেশন দেখানো হয়
  const { data: placeholderTexts = currentFallback } = useQuery({
    queryKey: ["search-placeholder-names", language],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("name, name_en, name_bn")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12);
      const names = (data || [])
        .map((p: any) => {
          const localizedName = language === "en" 
            ? (p.name_en || p.name_bn || p.name || "").trim()
            : (p.name_bn || p.name_en || p.name || "").trim();
          return localizedName;
        })
        .filter(Boolean);
      return names.length > 0 ? names : currentFallback;
    },
  });

  // Typing animation
  useEffect(() => {
    if (query) return; // Don't animate when user is typing
    const activePlaceholders = placeholderTexts === currentFallback ? currentFallback : placeholderTexts;
    if (!activePlaceholders.length) return;
    let textIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      const currentText = activePlaceholders[textIdx];
      if (!isDeleting) {
        setPlaceholder(currentText.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentText.length) {
          isDeleting = true;
          timeout = setTimeout(type, 1500);
          return;
        }
        timeout = setTimeout(type, 80);
      } else {
        setPlaceholder(currentText.slice(0, charIdx));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          textIdx = (textIdx + 1) % activePlaceholders.length;
          timeout = setTimeout(type, 300);
          return;
        }
        timeout = setTimeout(type, 40);
      }
    };
    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, [query, placeholderTexts, currentFallback]);

  // Debounce the query so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch the active product list once (cached), then filter client-side —
  // the query API has no text-search filter
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["search-products-all", language],
    enabled: debouncedQuery.length > 0,
    staleTime: 30 * 1000, // ৩০ সেকেন্ড পর পুরনো সার্চ ডেটা আবার ফেচ হবে
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, name_en, name_bn, slug, image_url, base_price, sale_price, sku")
        .eq("is_active", true);
      return (data || []).map((p: any) => ({
        id: p.id,
        name: (language === "en" ? (p.name_en || p.name_bn || p.name || "") : (p.name_bn || p.name_en || p.name || "")) as string,
        name_en: (p.name_en || "") as string,
        name_bn: (p.name_bn || "") as string,
        original_name: (p.name || "") as string,
        slug: p.slug as string,
        sku: (p.sku || "") as string,
        image: getProductImage(p.slug, p.image_url),
        price: p.sale_price ?? p.base_price ?? 0,
      }));
    },
  });

  const q = debouncedQuery.toLowerCase();
  const filtered = q.length > 0
    ? allProducts
        .filter((p) => 
          p.name.toLowerCase().includes(q) || 
          p.name_en.toLowerCase().includes(q) || 
          p.name_bn.toLowerCase().includes(q) || 
          p.original_name.toLowerCase().includes(q) || 
          p.sku.toLowerCase().includes(q)
        )
        .slice(0, 10)
    : [];

  const searching = query.length > 0 && (isLoading || debouncedQuery !== query.trim());

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Input
          placeholder={query ? (language === "en" ? "Search products..." : "পণ্য খুঁজুন...") : placeholder || (language === "en" ? "Search products..." : "পণ্য খুঁজুন...")}
          className="pr-10 rounded-full border-primary/20 bg-background/60 backdrop-blur-md shadow-sm transition-colors focus-visible:ring-primary focus-visible:bg-background"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => query && setShowResults(true)}
        />
        {query ? (
          <Button size="icon" variant="ghost" className="absolute right-0 top-0 rounded-full h-full" onClick={() => { setQuery(""); setShowResults(false); }}>
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" className="absolute right-0 top-0 rounded-full h-full">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>
      {showResults && filtered.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-xl z-[60] max-h-80 overflow-y-auto">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-0"
              onClick={() => { setQuery(""); setShowResults(false); }}
            >
              <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-primary font-bold">৳{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {showResults && query.length > 0 && filtered.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-xl z-[60] p-4 text-center text-muted-foreground text-sm">
          {searching ? (language === "en" ? "Searching..." : "খোঁজা হচ্ছে...") : (language === "en" ? "No products found" : "কোনো পণ্য খুঁজে পাওয়া যায়নি")}
        </div>
      )}
    </div>
  );
};

export default AnimatedSearch;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/productImages";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useLanguage } from "@/context/LanguageContext";

const buyersBn = [
  { name: "রাহেলা খাতুন", location: "ঢাকা, মিরপুর" },
  { name: "মো. কামরুল হাসান", location: "চট্টগ্রাম, পাহাড়তলী" },
  { name: "ফাতেমা বেগম", location: "রাজশাহী, বোয়ালিয়া" },
  { name: "আব্দুল কারিম", location: "খুলনা, সোনাডাঙ্গা" },
  { name: "নাসরিন আক্তার", location: "সিলেট, জিন্দাবাজার" },
  { name: "মোস্তফা কামাল", location: "বরিশাল, নথুল্লাবাদ" },
  { name: "সুমাইয়া ইসলাম", location: "কুমিল্লা, কান্দিরপাড়" },
  { name: "তানভীর আহমেদ", location: "গাজীপুর, টঙ্গী" },
  { name: "রুবিনা পারভীন", location: "নারায়ণগঞ্জ, সিদ্ধিরগঞ্জ" },
  { name: "জাহিদ হোসেন", location: "ময়মনসিংহ, গঙ্গানগর" },
  { name: "শামীমা সুলতানা", location: "রংপুর, শাপলা চত্বর" },
  { name: "আরিফুল ইসলাম", location: "দিনাজপুর, বালুবাড়ী" },
  { name: "মারিয়া আক্তার", location: "ঢাকা, উত্তরা" },
  { name: "হাসান মাহমুদ", location: "ঢাকা, ধানমন্ডি" },
  { name: "তাসলিমা নাসরিন", location: "যশোর, চুড়ামণকাঠি" },
  { name: "সাইফুল ইসলাম", location: "ফریدপুর, গোয়ালচামট" },
  { name: "নুসরাত জাহান", location: "পাবনা, শালগাড়িয়া" },
  { name: "রাশেদুল ইসলাম", location: "টাঙ্গাইল, করটিয়া" },
  { name: "আফরোজা বেগম", location: "নোয়াখালী, মাইজদী" },
  { name: "ইমরান হোসেন", location: "কক্সবাজার, কলাতলী" },
];

const buyersEn = [
  { name: "Rahela Khatun", location: "Dhaka, Mirpur" },
  { name: "Md. Kamrul Hasan", location: "Chittagong, Pahartali" },
  { name: "Fatema Begum", location: "Rajshahi, Boalia" },
  { name: "Abdul Karim", location: "Khulna, Sonadanga" },
  { name: "Nasrin Akter", location: "Sylhet, Zindabazar" },
  { name: "Mustafa Kamal", location: "Barisal, Nathullabad" },
  { name: "Sumaiya Islam", location: "Comilla, Kandirpar" },
  { name: "Tanvir Ahmed", location: "Gazipur, Tongi" },
  { name: "Rubina Parveen", location: "Narayanganj, Siddhirganj" },
  { name: "Zahid Hossain", location: "Mymensingh, Ganganagar" },
  { name: "Shamima Sultana", location: "Rungpur, Shapla Chattar" },
  { name: "Ariful Islam", location: "Dinajpur, Balubari" },
  { name: "Maria Akter", location: "Dhaka, Uttara" },
  { name: "Hasan Mahmud", location: "Dhaka, Dhanmondi" },
  { name: "Taslima Nasrin", location: "Jessore, Churamankati" },
  { name: "Saiful Islam", location: "Faridpur, Goalchamot" },
  { name: "Nusrat Jahan", location: "Pabna, Shalgaria" },
  { name: "Rashedul Islam", location: "Tangail, Karatia" },
  { name: "Afroza Begum", location: "Noakhali, Maijdee" },
  { name: "Imran Hossain", location: "Cox's Bazar, Kolatoli" },
];

type NotifProduct = { slug: string; name: string; name_en?: string; name_bn?: string; image: string };

const timeAgoOptionsBn = ["২ মিনিট আগে", "৫ মিনিট আগে", "৮ মিনিট আগে", "১২ মিনিট আগে", "১৫ মিনিট আগে", "২০ মিনিট আগে", "৩০ মিনিট আগে"];
const timeAgoOptionsEn = ["2 minutes ago", "5 minutes ago", "8 minutes ago", "12 minutes ago", "15 minutes ago", "20 minutes ago", "30 minutes ago"];

export default function SalesNotification() {
  const { settings } = useSiteSettings();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<{ buyer: { name: string; location: string }; product: NotifProduct; timeAgo: string } | null>(null);

  // সাইটের আসল active products এনে সেগুলো থেকেই নোটিফিকেশন দেখানো হয়
  const { data: products = [] } = useQuery({
    queryKey: ["sales-notif-products"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<NotifProduct[]> => {
      const { data } = await supabase
        .from("products")
        .select("name, name_en, name_bn, slug, image_url")
        .eq("is_active", true)
        .limit(50);
      return (data || [])
        .filter((p: any) => p.name && p.slug)
        .map((p: any) => ({
          slug: p.slug,
          name: p.name,
          name_en: p.name_en,
          name_bn: p.name_bn,
          image: getProductImage(p.slug, p.image_url)
        }));
    },
  });

  const enabled = settings.sales_notification_enabled !== "false";

  useEffect(() => {
    if (!enabled || products.length === 0) return;

    const showNext = () => {
      const activeBuyers = language === "en" ? buyersEn : buyersBn;
      const activeTimeAgos = language === "en" ? timeAgoOptionsEn : timeAgoOptionsBn;
      
      const buyer = activeBuyers[Math.floor(Math.random() * activeBuyers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const timeAgo = activeTimeAgos[Math.floor(Math.random() * activeTimeAgos.length)];
      
      setCurrent({ buyer, product, timeAgo });
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    // First show after 8 seconds
    const initialTimer = setTimeout(showNext, 8000);
    // Then every 15-25 seconds
    const interval = setInterval(showNext, 15000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [enabled, products, language]);

  if (!enabled || !visible || !current) return null;

  const productImage = current.product.image;
  const productName = language === "en"
    ? (current.product.name_en || current.product.name_bn || current.product.name || "")
    : (current.product.name_bn || current.product.name_en || current.product.name || "");

  return (
    <Link
      to={`/product/${current.product.slug}`}
      className="mobile-menu-hide fixed bottom-20 left-4 z-50 w-[calc(100vw-2rem)] max-w-xs animate-in slide-in-from-left-full duration-500"
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl p-3 pr-8 flex items-start gap-3 hover:shadow-primary/10 transition-shadow cursor-pointer">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted mt-0.5">
          <img
            src={productImage}
            alt={productName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">
            <span className="text-primary font-bold">{current.buyer.name}</span>
            {language === "en" ? " purchased" : " কিনেছেন"}
          </p>
          <p className="text-sm text-primary font-semibold truncate">
            {productName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            📍 {current.buyer.location} • {current.timeAgo}
          </p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVisible(false); }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </Link>
  );
}

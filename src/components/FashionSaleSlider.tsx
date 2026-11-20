import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveLocalImageUrl } from "@/lib/productImages";
import { useLanguage, getLocalizedTitle } from "@/context/LanguageContext";

type FashionBanner = {
  id: number | string;
  title: string;
  title_en?: string;
  title_bn?: string;
  image: string;
  link: string;
};

// ডাটাবেজে কোনো ব্যানার না থাকলে এই বেকারি প্রমোশনাল ব্যানারগুলো দেখানো হয়
const fallbackBanners: FashionBanner[] = [
  {
    id: 1,
    title: "সিগনেচার সেলিব্রেশন কেক",
    title_en: "Signature Celebration Cakes",
    title_bn: "সিগনেচার সেলিব্রেশন কেক",
    image: "/assets/uploads/banners/bakery-promo-1.png",
    link: "/category/celebration-cakes",
  },
  {
    id: 2,
    title: "ফ্রেশ ওভেন ক্রসাঁ ও পেস্ট্রি",
    title_en: "Fresh Oven Croissants & Pastries",
    title_bn: "ফ্রেশ ওভেন ক্রসাঁ ও পেস্ট্রি",
    image: "/assets/uploads/banners/bakery-promo-2.png",
    link: "/category/pastries-slices",
  },
  {
    id: 3,
    title: "আর্টিজান কুকিজ ও ব্রাউনি বক্স",
    title_en: "Artisan Cookies & Brownie Boxes",
    title_bn: "আর্টিজান কুকিজ ও ব্রাউনি বক্স",
    image: "/assets/uploads/banners/bakery-promo-3.png",
    link: "/category/brownies-desserts",
  },
];

const FashionBannerItem = ({ banner }: { banner: FashionBanner }) => {
  const { language } = useLanguage();
  const alt = getLocalizedTitle(banner, language) || banner.title;
  const content = (
    <div className="relative rounded-xl overflow-hidden aspect-[16/9] md:aspect-[16/8] bg-muted">
      <img
        src={banner.image}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
      />
    </div>
  );

  return /^https?:\/\//.test(banner.link) ? (
    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    <Link to={banner.link} className="block">
      {content}
    </Link>
  );
};

const FashionBannerSkeleton = () => (
  <div className="relative rounded-xl overflow-hidden aspect-[16/9] md:aspect-[16/8] bg-muted animate-pulse" />
);

const FashionSaleSlider = () => {
  const { data: dbBanners, isLoading } = useQuery({
    queryKey: ["fashion-banners"],
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<FashionBanner[]> => {
      const { data } = await supabase
        .from("banners")
        .select("id, title, title_en, title_bn, image_url, redirect_url")
        .eq("is_active", true)
        .eq("placement", "fashion")
        .order("sort_order");
      return (data || [])
        .filter((b: any) => b.image_url)
        .map((b: any) => ({
          id: b.id,
          title: b.title || "",
          title_en: b.title_en || "",
          title_bn: b.title_bn || "",
          image: resolveLocalImageUrl(b.image_url),
          link: b.redirect_url || "/categories",
        }));
    },
  });

  // লোডিং শেষ না হওয়া পর্যন্ত fallback/demo দেখানো হয় না, তাই আসল ছবি আসার আগে
  // demo ব্যানার flash করে না। লোডিং অবস্থায় skeleton দেখানো হয়।
  const banners = dbBanners && dbBanners.length > 0 ? dbBanners : fallbackBanners;

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <FashionBannerSkeleton key={i} />)
            : banners.map((banner) => (
                <FashionBannerItem key={banner.id} banner={banner} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default FashionSaleSlider;

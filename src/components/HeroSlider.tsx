import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveLocalImageUrl } from "@/lib/productImages";
import { useLanguage, getLocalizedTitle } from "@/context/LanguageContext";

type Slide = { id: number | string; title: string; title_en?: string; title_bn?: string; image: string; link: string };

const fallbackSlides: Slide[] = [
  {
    id: 1,
    title: "প্রতিদিন তাজা বেক করা আর্টিজান কেক ও পেস্ট্রি",
    title_en: "Freshly Baked Artisan Cakes & Pastries",
    title_bn: "প্রতিদিন তাজা বেক করা আর্টিজান কেক ও পেস্ট্রি",
    image: "/assets/uploads/banners/bakery-hero-1.webp",
    link: "/category/celebration-cakes",
  },
  {
    id: 2,
    title: "ফ্রেঞ্চ বাটার ক্রসাঁ, সাওয়ারডো ব্রেড ও মর্নিং পেস্ট্রি",
    title_en: "Warm French Croissants, Sourdough & Morning Pastries",
    title_bn: "ফ্রেঞ্চ বাটার ক্রসাঁ, সাওয়ারডো ব্রেড ও মর্নিং পেস্ট্রি",
    image: "/assets/uploads/banners/bakery-hero-2.webp",
    link: "/category/artisan-breads",
  },
  {
    id: 3,
    title: "গুরমেট কাপকেক, কুকিজ ও বেকারি গিফট বক্স",
    title_en: "Gourmet Cupcakes, Cookies & Bakery Gift Boxes",
    title_bn: "গুরমেট কাপকেক, কুকিজ ও বেকারি গিফট বক্স",
    image: "/assets/uploads/banners/bakery-hero-3.webp",
    link: "/category/bakery-gift-boxes",
  },
];

const SlideImage = ({ slide, index = 0 }: { slide: Slide; index?: number }) => {
  const { language } = useLanguage();
  return (
    <div className="relative rounded-xl overflow-hidden aspect-[16/7] md:aspect-[16/6] bg-muted">
      <img
        src={slide.image}
        alt={getLocalizedTitle(slide, language)}
        decoding="async"
        fetchPriority={index === 0 ? "high" : "low"}
        loading={index === 0 ? "eager" : "lazy"}
        className="w-full h-full object-cover absolute inset-0"
      />
    </div>
  );
};

const HeroSlider = () => {
  const { language } = useLanguage();
  const { data: dbSlides, isLoading } = useQuery({
    queryKey: ["hero-banners"],
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<Slide[]> => {
      const { data } = await supabase
        .from("banners")
        .select("id, title, title_en, title_bn, image_url, redirect_url")
        .eq("is_active", true)
        .eq("placement", "hero")
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

  if (isLoading) {
    return <div className="w-full aspect-[16/7] md:aspect-[16/6] bg-muted animate-pulse rounded-xl"></div>;
  }

  const slides = dbSlides && dbSlides.length > 0 ? dbSlides : fallbackSlides;

  return (
    <Carousel
      opts={{ loop: true, align: "start" }}
      plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
      className="w-full [&_.embla\_\_dots]:hidden"
    >
      <CarouselContent className="-ml-0">
        {slides.map((slide, idx) => (
          <CarouselItem key={slide.id} className="pl-0">
            {/^https?:\/\//.test(slide.link) ? (
              <a href={slide.link} target="_blank" rel="noopener noreferrer">
                <SlideImage slide={slide} index={idx} />
              </a>
            ) : (
              <Link to={slide.link}>
                <SlideImage slide={slide} index={idx} />
              </Link>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 hidden md:flex" />
      <CarouselNext className="right-2 hidden md:flex" />
    </Carousel>
  );
};

export default HeroSlider;

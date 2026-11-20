import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getCategoryImage } from "@/lib/categoryImages";
import { useHomeData } from "@/hooks/useHomeData";
import { useLanguage, getLocalizedName } from "@/context/LanguageContext";

type TopCategory = {
  id: number | string;
  name: string;
  name_en?: string;
  name_bn?: string;
  slug: string;
  image: string;
  showOnHome?: boolean;
};

const CategoryItem = ({ cat }: { cat: TopCategory }) => {
  const { language } = useLanguage();
  return (
    <Link
      to={`/category/${cat.slug}`}
      className="group flex flex-col items-center gap-3 w-full"
    >
      <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border-4 border-white">
        <img
          src={cat.image || "/placeholder.svg"}
          alt={getLocalizedName(cat, language)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeholder.svg";
          }}
        />
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <span className="text-sm md:text-base text-center font-semibold leading-tight text-foreground transition-colors group-hover:text-primary px-2">
        {getLocalizedName(cat, language)}
      </span>
    </Link>
  );
};

// লোডিং-এর সময় দেখানো ঝাপসা placeholder — পুরনো mock ক্যাটাগরির বদলে
const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-3 w-full">
    <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-gray-200 animate-pulse shadow-md" />
    <div className="w-20 h-4 rounded bg-gray-200 animate-pulse" />
  </div>
);

const TopCategories = () => {
  const { t } = useLanguage();
  const autoplay = useMemo(
    () => Autoplay({ delay: 2800, stopOnInteraction: false, stopOnMouseEnter: true }),
    []
  );
  const [desktopViewportRef, desktopCarousel] = useEmblaCarousel(
    { align: "start", loop: true, skipSnaps: false },
    [autoplay]
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateCarouselControls = useCallback(() => {
    if (!desktopCarousel) return;
    setCanScrollPrev(desktopCarousel.canScrollPrev());
    setCanScrollNext(desktopCarousel.canScrollNext());
  }, [desktopCarousel]);

  useEffect(() => {
    if (!desktopCarousel) return;
    updateCarouselControls();
    desktopCarousel.on("select", updateCarouselControls);
    desktopCarousel.on("reInit", updateCarouselControls);

    return () => {
      desktopCarousel.off("select", updateCarouselControls);
      desktopCarousel.off("reInit", updateCarouselControls);
    };
  }, [desktopCarousel, updateCarouselControls]);

  // আলাদা রিকোয়েস্ট নয় — শেয়ার্ড /home ডেটা থেকেই টপ-লেভেল ক্যাটাগরি নেওয়া হয়।
  const { data: homeData, isLoading } = useHomeData();
  const dbCategories = useMemo<TopCategory[]>(
    () =>
      (homeData?.allCategories || [])
        .filter((c) => !c.parent_id)
        .map((c) => ({
          id: c.id,
          name: c.name,
          name_en: c.name_en,
          name_bn: c.name_bn,
          slug: c.slug,
          image: getCategoryImage(c.slug, c.image_url),
          showOnHome: c.show_on_home,
        })),
    [homeData]
  );

  // মোবাইল marquee-তে সব ক্যাটাগরি
  const mobileCategories = useMemo(
    () => (dbCategories || []).filter((category) => category.showOnHome),
    [dbCategories]
  );

  // ডেস্কটপে শুধু navbar-এ দেখানোর জন্য সিলেক্ট করা ক্যাটাগরি
  const desktopCategories = mobileCategories;

  // ডেটা লোড শেষ কিন্তু কোনো ক্যাটাগরি নেই — পুরো সেকশন লুকিয়ে দাও (খালি বক্স নয়)
  if (!isLoading && mobileCategories.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("top_categories")}
          </h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mt-3" />
        </div>

        {isLoading ? (
          // লোডিং — পুরনো mock ক্যাটাগরির বদলে skeleton
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-6 md:gap-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile & Desktop: Responsive Grid */}
            <div className="md:hidden">
              {/* Mobile: scrollable horizontal */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex gap-6 min-w-max">
                  {mobileCategories.map((cat) => (
                    <div key={cat.id} className="w-24">
                      <CategoryItem cat={cat} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop: Grid with carousel */}
            <div className="hidden md:block">
              <div className="relative group/carousel">
                <div
                  ref={desktopViewportRef}
                  className="overflow-hidden"
                  aria-label={t("top_categories")}
                >
                  <div className="flex gap-6 lg:gap-8">
                    {desktopCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex-shrink-0 w-32 lg:w-36"
                      >
                        <CategoryItem cat={cat} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gradient overlays for carousel effect */}
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-gray-50 to-transparent transition-opacity duration-500 ${canScrollPrev ? "opacity-100" : "opacity-0"}`}
                />
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent transition-opacity duration-500 ${canScrollNext ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TopCategories;

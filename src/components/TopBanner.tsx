import { Phone } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useLanguage } from "@/context/LanguageContext";

const TopBanner = () => {
  const { settings } = useSiteSettings();
  const { language } = useLanguage();
  const phone = settings.topbar_phone || settings.site_phone || "01985403218";

  // সেটিংসে marquee না থাকলে ব্র্যান্ড নাম দিয়েই ডিফল্ট লেখা তৈরি হয়, যাতে কোনো নাম হার্ডকোড না থাকে
  const brandName =
    (language === "en" ? settings.brand_name_en : settings.brand_name_bn)?.trim() ||
    settings.brand_name?.trim() ||
    (language === "en" ? "Dream Bakery" : "ড্রিম বেকারি");

  const defaultMarquee = language === "en"
    ? `${brandName}  |  100% Freshly Baked Every Morning  |  Custom Celebration & Birthday Cakes  |  Express Home Delivery`
    : `${brandName}  |  প্রতিদিন সকালে তাজা বেক করা কেক ও পেস্ট্রি  |  কাস্টম বার্থডে ও ওয়েডিং কেক অর্ডার  |  ফ্রেশ হোম ডেলিভারি`;

  const marquee = language === "en"
    ? (settings.topbar_marquee_en || defaultMarquee)
    : (settings.topbar_marquee_bn || settings.topbar_marquee || defaultMarquee);
  
  const rightText = language === "en"
    ? (settings.topbar_right_text_en || "🎂 Freshly Baked Daily")
    : (settings.topbar_right_text_bn || settings.topbar_right_text || "🎂 প্রতিদিন তাজা বেকড");

  return (
    <div
      className="bg-primary text-primary-foreground py-2 text-sm transition-colors duration-300"
      style={settings.gradient_mode === "gradient" ? { background: "var(--brand-gradient)" } : undefined}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <Phone className="h-3.5 w-3.5" />
          <a href={`tel:${phone}`} className="font-medium hover:underline">{phone}</a>
        </div>
        {marquee && (
          <div className="hidden md:block overflow-hidden flex-1 mx-8">
            <p className="animate-marquee whitespace-nowrap text-center font-medium tracking-wide">
              {marquee}
            </p>
          </div>
        )}
        {rightText && (
          <div className="text-xs font-medium shrink truncate max-w-[45%] md:max-w-none">
            {rightText}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBanner;

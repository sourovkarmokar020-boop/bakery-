import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { waLink } from "@/lib/whatsapp";
import { useHomeData, type HomeCategory } from "@/hooks/useHomeData";
import { useLanguage, getLocalizedName } from "@/context/LanguageContext";
import { DEFAULT_FOOTER_HIDDEN_CATEGORIES, parseSlugList } from "@/lib/footer";

// পুরনো (অ্যাডমিনে ইংরেজি লেবেল বসানোর সুযোগ আসার আগের) লিংকগুলোর অনুবাদ। এখন প্রতিটি
// ফুটার লিংকের ইংরেজি লেবেল অ্যাডমিন প্যানেল থেকেই দেওয়া যায় — না দিলে এই ম্যাপ কাজে লাগে।
// ক্যাটাগরির নাম DB-র name_en / name_bn থেকেই আসে, এখানে রাখার দরকার নেই
const footerLabelTranslations: Record<string, Record<"en" | "bn", string>> = {
  "Track Order": { en: "Track Order", bn: "অর্ডার ট্র্যাক" },
  "অর্ডার ট্র্যাক": { en: "Track Order", bn: "অর্ডার ট্র্যাক" },
  "Login": { en: "Login", bn: "লগইন" },
  "লগইন": { en: "Login", bn: "লগইন" },
  "Cart": { en: "Cart", bn: "কার্ট" },
  "কার্ট": { en: "Cart", bn: "কার্ট" },
  "About Us": { en: "About Us", bn: "আমাদের সম্পর্কে" },
  "আমাদের সম্পর্কে": { en: "About Us", bn: "আমাদের সম্পর্কে" },
  "Contact": { en: "Contact", bn: "যোগাযোগ" },
  "যোগাযোগ": { en: "Contact", bn: "যোগাযোগ" },
  "All Products": { en: "All Products", bn: "সকল পণ্য" },
  "সকল পণ্য": { en: "All Products", bn: "সকল পণ্য" },
  "Delivery Rules": { en: "Delivery Rules", bn: "ডেলিভারি নিয়ম" },
  "ডেলিভারি নিয়ম": { en: "Delivery Rules", bn: "ডেলিভারি নিয়ম" },
  "Return Policy": { en: "Return Policy", bn: "রিটার্ন পলিসি" },
  "রিটার্ন পলিসি": { en: "Return Policy", bn: "রিটার্ন পলিসি" },
  "Terms & Conditions": { en: "Terms & Conditions", bn: "শর্তাবলী" },
  "শর্তাবলী": { en: "Terms & Conditions", bn: "শর্তাবলী" },
  "Privacy Policy": { en: "Privacy Policy", bn: "প্রাইভেসি পলিসি" },
  "প্রাইভেসি পলিসি": { en: "Privacy Policy", bn: "প্রাইভেসি পলিসি" },
};

// অ্যাডমিন প্যানেল → সেটিংস → ফুটার লোগো না দিলে এই ডিফল্ট লোগোটি বসে
// (ট্যাগলাইনসহ ফুল ভার্সন, স্বচ্ছ ব্যাকগ্রাউন্ড)
const DEFAULT_FOOTER_LOGO = "/assets/uploads/site-settings/bakery-logo.webp";

// ফুটারের লোগো/লেখার নিচে যে ঠিকানা ও ফোন নম্বর বসে। অ্যাডমিন প্যানেল → সেটিংস →
// ফুটার সেটিংস → "ঠিকানা ও ফোন" থেকে বদলানো যায়; খালি রাখলে এই ডিফল্ট দুটোই দেখাবে।
// দোকানের অন্য জায়গার নম্বর (টপ বার, প্রোডাক্ট পেজের কল বাটন) site_phone থেকেই আসে,
// তাই ফুটারের জন্য আলাদা কী রাখা হয়েছে — একটার বদল অন্যটাকে টানে না
const DEFAULT_FOOTER_ADDRESS = "House-26, Road-2, Adabor, Dhaka-1207 (Dream Bakery Studio)";
const DEFAULT_FOOTER_PHONE = "01680310063";

interface FooterLink {
  label: string;
  label_en?: string;
  url: string;
}

// পলিসি লিংকগুলো CMS পেজ (/page/:slug) — অ্যাডমিন প্যানেলের "পেজ ম্যানেজ" থেকেই
// লেখা বদলানো যায়, তাই আলাদা React পেজ বানানো হয়নি
const defaultImportantLinks: FooterLink[] = [
  { label: "সকল পণ্য", label_en: "All Products", url: "/products" },
  { label: "ডেলিভারি নিয়ম", label_en: "Delivery Rules", url: "/page/delivery-rules" },
  { label: "রিটার্ন পলিসি", label_en: "Return Policy", url: "/page/return-policy" },
  { label: "শর্তাবলী", label_en: "Terms & Conditions", url: "/page/terms-and-conditions" },
  { label: "প্রাইভেসি পলিসি", label_en: "Privacy Policy", url: "/page/privacy-policy" },
];

// অ্যাডমিনে সোশ্যাল লিংক না দিলে ফুটারের আইকনগুলো এই ডিফল্ট প্রোফাইলে যাবে —
// আসল প্রোফাইল লিংক অ্যাডমিন প্যানেল → সেটিংস → সোশ্যাল লিংক থেকে বসালেই সেটা প্রাধান্য পাবে
const DEFAULT_SOCIAL_LINKS = {
  facebook: "https://facebook.com/dreambakery",
  twitter: "https://twitter.com/dreambakery",
  youtube: "https://youtube.com/@dreambakery",
  instagram: "https://instagram.com/dreambakery",
  tiktok: "https://tiktok.com/@dreambakery",
};

const parseLinks = (value: string | undefined, fallback: FooterLink[]): FooterLink[] => {
  if (!value || value.includes("???")) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    if (parsed.some((item: any) => typeof item?.label === "string" && item.label.includes("???"))) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
};

const Footer = () => {
  const { settings } = useSiteSettings();
  const { language, t } = useLanguage();

  // অ্যাডমিনের সাজানো একটিই তালিকা — প্রতিটি আইটেমে বাংলা ও ইংরেজি লেবেল থাকে।
  // পুরনো সাইটে ভাষা-ভিত্তিক আলাদা তালিকা থাকলে সেটাই ফলব্যাক হিসেবে কাজ করে
  const importantLinks = parseLinks(
    settings.footer_important_links ||
      (language === "en" ? settings.footer_important_links_en : settings.footer_important_links_bn),
    defaultImportantLinks
  );

  // ফুটারের ক্যাটাগরি তালিকার দুটি মোড (অ্যাডমিন প্যানেল থেকে বেছে নেওয়া যায়):
  //   auto   — ন্যাভবারের ক্যাটাগরি থেকেই আসে, অ্যাডমিনে বন্ধ করা কয়টা বাদ যায়
  //   manual — অ্যাডমিনের নিজের হাতে সাজানো লিংক তালিকা
  const { data: homeData } = useHomeData();
  const hiddenCategorySlugs = parseSlugList(
    settings.footer_hidden_categories ?? DEFAULT_FOOTER_HIDDEN_CATEGORIES
  );
  const navCategories = ((homeData?.allCategories || []) as HomeCategory[]).filter(
    (c) => !c.parent_id && !!c.show_in_navbar && !hiddenCategorySlugs.has(c.slug)
  );
  const manualCategoryLinks = parseLinks(settings.footer_category_links, []);
  const useManualCategories =
    settings.footer_category_mode === "manual" && manualCategoryLinks.length > 0;

  const getFooterLinkLabel = (link: FooterLink) => {
    if (language === "en" && link.label_en?.trim()) return link.label_en.trim();
    const trimmed = link.label.trim();
    if (footerLabelTranslations[trimmed]) {
      return language === "en" ? footerLabelTranslations[trimmed].en : footerLabelTranslations[trimmed].bn;
    }
    return link.label;
  };

  // কলামের শিরোনাম — অ্যাডমিনে না দিলে বিল্ট-ইন অনুবাদ (t) ব্যবহার হয়
  const columnTitle = (enKey: string, bnKey: string, fallbackKey: string) => {
    const custom = language === "en" ? settings[enKey] : settings[bnKey];
    return custom?.trim() || t(fallbackKey);
  };

  const resolvedCtaTitle = language === "en"
    ? (settings.footer_cta_title_en || "Freshly Baked Cakes, Pastries & Artisan Breads — Every Day")
    : (settings.footer_cta_title_bn || settings.footer_cta_title || "প্রতিদিন তাজা বেক করা কেক, পেস্ট্রি ও আর্টিজান ব্রেড");

  const resolvedCtaSubtitle = language === "en"
    ? (settings.footer_cta_subtitle_en || "100% premium butter & Belgian chocolate, custom cake orders and express delivery")
    : (settings.footer_cta_subtitle_bn || settings.footer_cta_subtitle || "১০০% প্রিমিয়াম বাটার ও বেলজিয়ান চকলেট, কাস্টম কেক অর্ডার এবং দ্রুত হোম ডেলিভারি");

  const showCta = settings.footer_show_cta !== "false";
  const ctaButtonLabel = language === "en"
    ? (settings.footer_cta_button_en?.trim() || "Contact Us ☎")
    : (settings.footer_cta_button_bn?.trim() || "যোগাযোগ করুন ☎");

  const footerLogo = settings.footer_logo?.trim() || DEFAULT_FOOTER_LOGO;
  const showFooterLogo = settings.footer_show_logo !== "false";

  const whatsapp = settings.whatsapp_number || "01680310063";

  // অ্যাডমিন প্যানেল → সেটিংস → ফুটার সেটিংস → ঠিকানা ও ফোন। লোগো/লেখার ঠিক নিচে
  // মোবাইল ও ডেস্কটপ দুই জায়গাতেই দেখানো হয়
  const shopAddress = (language === "en"
    ? settings.footer_address_en || settings.footer_address
    : settings.footer_address_bn || settings.footer_address
  )?.trim() || DEFAULT_FOOTER_ADDRESS;
  const shopPhone = settings.footer_phone?.trim() || DEFAULT_FOOTER_PHONE;

  const resolvedCopyrightText = language === "en"
    ? (settings.copyright_text_en?.trim() || settings.copyright_text?.trim() || "© 2026 Dream Bakery. All rights reserved.")
    : (settings.copyright_text_bn?.trim() || settings.copyright_text?.trim() || settings.copyright_text_en?.trim() || "© ২০২৬ ড্রিম বেকারি। সকল অধিকার সংরক্ষিত।");

  // ডেভেলপার ক্রেডিট
  const showCredit = false;
  const creditText = "";
  const creditName = "";
  const creditUrl = "";

  // "ফলো আস" কলামের আইকন — অ্যাডমিনে লিংক দেওয়া থাকলে সেটাই যাবে, না থাকলে ডিফল্ট
  // প্রোফাইল লিংকে যাবে। প্রতিটি আইকন আলাদাভাবে বন্ধ করা যায় (সেটিংস → ফুটার সেটিংস)
  const followLinks = [
    { key: "facebook", label: "Facebook", href: settings.social_facebook?.trim() || DEFAULT_SOCIAL_LINKS.facebook, Icon: FaFacebookF, className: "bg-[#3B5998]" },
    { key: "twitter", label: "Twitter", href: settings.social_twitter?.trim() || DEFAULT_SOCIAL_LINKS.twitter, Icon: FaTwitter, className: "bg-[#1DA1F2]" },
    { key: "whatsapp", label: "WhatsApp", href: waLink(whatsapp, settings.whatsapp_template), Icon: FaWhatsapp, className: "bg-[#25D366]" },
    { key: "youtube", label: "YouTube", href: settings.social_youtube?.trim() || DEFAULT_SOCIAL_LINKS.youtube, Icon: FaYoutube, className: "bg-[#FF0000]" },
    { key: "instagram", label: "Instagram", href: settings.social_instagram?.trim() || DEFAULT_SOCIAL_LINKS.instagram, Icon: FaInstagram, className: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
    { key: "tiktok", label: "TikTok", href: settings.social_tiktok?.trim() || DEFAULT_SOCIAL_LINKS.tiktok, Icon: FaTiktok, className: "bg-black" },
  ].filter((item) => settings[`footer_show_${item.key}`] !== "false");

  const showCategoryColumn =
    settings.footer_show_categories !== "false" &&
    (useManualCategories ? manualCategoryLinks.length > 0 : navCategories.length > 0);
  const showLinksColumn = settings.footer_show_links !== "false" && importantLinks.length > 0;
  const showFollowColumn = settings.footer_show_follow !== "false" && followLinks.length > 0;

  // মোবাইলে প্রতিটি পেজ র‍্যাপারে `pb-16` (৬৪px) থাকে ফিক্সড বটম-ন্যাভের জন্য।
  // ন্যাভ ~৫৫px, তাই ফুটারের নিচে ৯px সাদা ফাঁক দেখা যেত। `-mb-16` ওই সাদা
  // প্যাডিংটা বাতিল করে — নীল অংশ সরাসরি ন্যাভ পর্যন্ত নামে, ফাঁক থাকে না
  return (
    <footer className="mt-12 -mb-16 md:mb-0">
      {/* Bakery banner above the main footer */}
      {showCta && (
        <div className="bg-muted border-t border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 py-4">
            <img
              src="/assets/uploads/site-settings/bakery-footer-banner.webp"
              alt="Dream Bakery Artisanal Collection"
              width={896}
              height={500}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full max-h-[340px] object-cover rounded-2xl shadow-md"
            />
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="bg-background border-t">
        <div className="container mx-auto px-4 py-8 sm:py-10">
          {/* মোবাইলে ২ কলাম — ক্যাটাগরি ও লিংক পাশাপাশি বসে, ফুটার অনেক ছোট হয়।
              `items-start` — চারটা কলামই একই লাইন থেকে শুরু হয় (কলামের উচ্চতা আলাদা
              হলেও কনটেন্ট নিচে/মাঝে সরে যায় না), আর ডেস্কটপে কলামের ফাঁক সমান */}
          <div className="grid grid-cols-2 lg:grid-cols-4 items-start gap-x-6 lg:gap-x-8 gap-y-8">
            {/* About */}
            <div className="col-span-2 lg:col-span-1 text-center md:text-left">
              {showFooterLogo && (
                <img
                  src={footerLogo}
                  alt={settings.brand_name?.trim() || "Dream Bakery"}
                  width={640}
                  height={542}
                  loading="lazy"
                  className="w-52 sm:w-60 lg:w-64 max-w-full h-auto object-contain mx-auto md:mx-0 object-center md:object-left mb-3 md:mb-4 rounded-lg mix-blend-multiply"
                />
              )}
              {(shopAddress || shopPhone) && (
                <div className="space-y-1">
                  {shopAddress && (
                    <p className="text-sm text-muted-foreground">{shopAddress}</p>
                  )}
                  {shopPhone && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold">
                        {language === "en" ? "Bakery Hotline:" : "বেকারি হটলাইনঃ"}
                      </span>{" "}
                      <a
                        href={`tel:${shopPhone.replace(/\s+/g, "")}`}
                        className="font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {shopPhone}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ক্যাটাগরি ও লিংক — মোবাইলেও পাশাপাশি (৫০/৫০) */}
            <div className="col-span-2 flex gap-x-6 lg:contents">
              {/* Categories */}
              {showCategoryColumn && (
                <div className="w-1/2 min-w-0 lg:w-auto text-left">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                    {columnTitle("footer_categories_title_en", "footer_categories_title_bn", "footer_category")}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {useManualCategories
                      ? manualCategoryLinks.map((link) => (
                          <li key={link.url}>
                            <Link to={link.url} className="hover:text-primary transition-colors">
                              {getFooterLinkLabel(link)}
                            </Link>
                          </li>
                        ))
                      : navCategories.map((cat) => (
                          <li key={cat.id}>
                            <Link to={`/category/${cat.slug}`} className="hover:text-primary transition-colors">
                              {getLocalizedName(cat, language)}
                            </Link>
                          </li>
                        ))}
                  </ul>
                </div>
              )}

              {/* Links */}
              {showLinksColumn && (
                <div className="w-1/2 min-w-0 lg:w-auto text-left">
                  <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                    {columnTitle("footer_links_title_en", "footer_links_title_bn", "footer_important_links")}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {importantLinks.map((link) => (
                      <li key={link.url}>
                        <Link to={link.url} className="hover:text-primary transition-colors">
                          {getFooterLinkLabel(link)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Follow Us */}
            {showFollowColumn && (
              <div className="col-span-2 lg:col-span-1 text-center md:text-left">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                  {columnTitle("footer_follow_title_en", "footer_follow_title_bn", "footer_follow_us")}
                </h3>
                {/* মোবাইল/বড় ডেস্কটপে ছয়টা আইকন এক লাইনে বসে। lg (≈১০২৪px) সাইজে
                    কলাম সরু হওয়ায় এক লাইনে ছয়টা ধরে না — ওখানে ৩টা করে দুই সারিতে
                    গোছানো থাকে, নাহলে ৫+১ ভেঙে অ্যালাইনমেন্ট নষ্ট দেখায় */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 lg:grid lg:grid-cols-3 lg:w-max xl:flex xl:w-auto">
                  {followLinks.map(({ key, label, href, Icon, className }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className={`w-10 h-10 shrink-0 rounded-md text-white flex items-center justify-center hover:scale-110 transition-transform ${className}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-primary text-primary-foreground border-t border-white/10">
        {/* মোবাইলে নিচের padding = ন্যাভের উচ্চতা (~৫৫px) + ন্যাভের উপরে উঠে থাকা গোল হোম
            বাটনের অংশ (~২৮px) + শ্বাস নেওয়ার জায়গা + নচওয়ালা ফোনের safe-area। ফলে নীল অংশ
            ন্যাভের নিচ পর্যন্ত পৌঁছায়, কোথাও সাদা ফাঁক থাকে না আর কপিরাইট লেখাটা গোল
            বাটনের নিচে চাপা পড়ে না। ডেস্কটপে ন্যাভ নেই, তাই দুই পাশে সমান কমপ্যাক্ট padding */}
        <div className="container mx-auto px-4 pt-3 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pt-3.5 md:py-3.5 md:pb-3.5">
          {/* ডেস্কটপে দুই পাশে (কপিরাইট বাঁয়ে, ক্রেডিট ডানে), মোবাইলে সেন্টারে স্ট্যাক */}
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-1 md:gap-4 text-center text-xs sm:text-sm">
            <p className="text-white/80">{resolvedCopyrightText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

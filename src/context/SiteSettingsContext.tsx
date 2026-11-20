import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hexToHslTriplet } from "@/lib/color";

type Settings = Record<string, string>;

const SiteSettingsContext = createContext<{ settings: Settings; loading: boolean; refreshSettings: () => Promise<void> }>({
  settings: {},
  loading: true,
  refreshSettings: async () => {},
});

const setMetaTag = (attr: "name" | "property", key: string, content: string) => {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

// ব্র্যান্ড বদলালে key-এর version বাড়ানো হয় — তাহলে একই origin-এ থাকা আগের সাইটের
// ক্যাশ করা লোগো/নাম আর দেখায় না, ইউজারকে হাতে ব্রাউজার ক্যাশ ক্লিয়ার করতে হয় না
const SETTINGS_CACHE_KEY = "site_settings_cache_v4";

declare global {
  interface Window {
    // index.html-এর blocking <script>-টি (backend/api/boot-settings.js) সার্ভার থেকে
    // সেভ করা সেটিংস এখানে বসিয়ে দেয়, React চালু হওয়ার আগেই
    __SITE_SETTINGS__?: Settings;
  }
}

const readBootSettings = (): Settings | null => {
  const boot = typeof window !== "undefined" ? window.__SITE_SETTINGS__ : undefined;
  if (boot && typeof boot === "object" && Object.keys(boot).length > 0) return boot;
  return null;
};

// প্রথম রেন্ডারেই আসল সেটিংস দরকার, তাই অগ্রাধিকার: সার্ভার থেকে আসা boot ডেটা →
// আগের ভিজিটের ক্যাশ → ফাঁকা। ফাঁকা হলে হার্ডকোড করা ডিফল্ট নাম/রঙ ফ্ল্যাশ করত।
const initialSettings = (): Settings => {
  try {
    localStorage.removeItem("site_settings_cache");
    localStorage.removeItem("site_settings_cache_v2");
    localStorage.removeItem("site_settings_cache_v3");
    const boot = readBootSettings();
    if (boot) {
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(boot));
      return boot;
    }
    return JSON.parse(localStorage.getItem(SETTINGS_CACHE_KEY) || "{}");
  } catch {
    return readBootSettings() || {};
  }
};

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(() => Object.keys(settings).length === 0);
  const [blocked, setBlocked] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if ((error as any)?.blocked) {
      setBlocked(true);
      setLoading(false);
      return;
    }
    setBlocked(false);

    // API ব্যর্থ হলে (নেটওয়ার্ক/সার্ভার সমস্যা) আগের সেটিংসই ধরে রাখি — নাহলে সেভ করা
    // ব্র্যান্ড নাম/রঙ মুছে গিয়ে কোডে হার্ডকোড করা ডিফল্ট ভেসে উঠত
    if (error || !Array.isArray(data) || data.length === 0) {
      setLoading(false);
      return;
    }

    const map: Settings = {};
    (data || []).forEach((row: any) => { map[row.key] = row.value ?? ""; });
    setSettings(map);
    try {
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(map));
    } catch {
      // localStorage ভরা থাকলে বা বন্ধ থাকলে ক্যাশ ছাড়াই চলবে
    }
    setLoading(false);
  };

  // ব্লক উঠে গেলে যেন নিজে থেকেই সাইট ফিরে আসে — ২০ সেকেন্ড পরপর আবার চেষ্টা করে
  useEffect(() => {
    if (!blocked) return;
    const timer = setInterval(fetchSettings, 20000);
    return () => clearInterval(timer);
  }, [blocked]);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // ক্যাশ থেকে আসা সেটিংসও সাথে সাথে apply হয় — API রেসপন্সের জন্য অপেক্ষা করি না
    if (Object.keys(settings).length === 0) return;

    if (settings.seo_title) document.title = settings.seo_title;
    if (settings.seo_description) setMetaTag("name", "description", settings.seo_description);
    if (settings.seo_og_image) {
      setMetaTag("property", "og:image", settings.seo_og_image);
      setMetaTag("name", "twitter:image", settings.seo_og_image);
    }

    if (settings.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }

    let styleTag = document.getElementById("brand-theme") as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "brand-theme";
      document.head.appendChild(styleTag);
    }

    const rules: string[] = [];
    if (settings.brand_color) {
      rules.push(`--primary: ${hexToHslTriplet(settings.brand_color)};`);
      rules.push(`--ring: ${hexToHslTriplet(settings.brand_color)};`);
    }
    if (settings.button_color) rules.push(`--button: ${hexToHslTriplet(settings.button_color)};`);
    if (settings.accent_color) rules.push(`--accent: ${hexToHslTriplet(settings.accent_color)};`);
    if (settings.gradient_mode === "gradient" && settings.brand_color && settings.accent_color) {
      rules.push(`--brand-gradient: linear-gradient(135deg, ${settings.brand_color}, ${settings.accent_color});`);
    }
    styleTag.textContent = rules.length ? `:root{${rules.join(" ")}}` : "";

    // boot স্ক্রিপ্টের অস্থায়ী স্টাইল সরিয়ে দিই — এখন এই ট্যাগটাই একমাত্র উৎস, তাই
    // অ্যাডমিনে কোনো রঙ মুছে ফেললে পুরনো রঙ আটকে থাকে না
    document.getElementById("brand-theme-boot")?.remove();
  }, [settings, loading]);

  // ব্লকড IP — পুরো সাইটের বদলে শুধু বার্তা দেখানো হয়
  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md space-y-3">
          <p className="text-5xl">🚫</p>
          <h1 className="text-xl font-bold">এক্সেস সীমিত করা হয়েছে</h1>
          <p className="text-muted-foreground text-sm">
            আপনার এক্সেস সাময়িকভাবে বন্ধ রাখা হয়েছে। এটি ভুল মনে হলে আমাদের সাথে যোগাযোগ করুন।
          </p>
          <button
            onClick={() => fetchSettings()}
            className="mt-2 px-5 py-2 rounded-full border text-sm hover:bg-muted transition-colors"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

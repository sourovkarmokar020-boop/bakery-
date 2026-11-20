import { useEffect, useRef, useCallback } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function TrackingManager() {
  const { settings } = useSiteSettings();
  const location = useLocation();
  const initialized = useRef<Set<string>>(new Set());
  const prevPathRef = useRef<string>("");

  // Google Search Console - Add meta tag verification
  useEffect(() => {
    if (!settings.google_search_console || initialized.current.has("gsc")) return;
    initialized.current.add("gsc");

    const meta = document.createElement("meta");
    meta.name = "google-site-verification";
    meta.content = settings.google_search_console;
    document.head.appendChild(meta);
  }, [settings.google_search_console]);

  // Google Analytics (GA4)
  useEffect(() => {
    if (!settings.google_analytics || initialized.current.has("ga")) return;
    initialized.current.add("ga");

    const scriptId = "gtag-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement("script");
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.google_analytics}');
      `;
      document.head.appendChild(inlineScript);
    }
  }, [settings.google_analytics]);

  // Google Tag Manager (GTM)
  useEffect(() => {
    if (!settings.google_tag_manager || initialized.current.has("gtm")) return;
    initialized.current.add("gtm");

    const scriptId = "gtm-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.google_tag_manager}');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement("noscript");
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${settings.google_tag_manager}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.insertBefore(noscript, document.body.firstChild);
    }
  }, [settings.google_tag_manager]);

  // Facebook Pixel
  useEffect(() => {
    if (!settings.facebook_pixel || initialized.current.has("fb")) return;
    initialized.current.add("fb");

    const scriptId = "fb-pixel";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.facebook_pixel}'); 
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement("noscript");
      noscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${settings.facebook_pixel}&ev=PageView&noscript=1"
        />
      `;
      document.body.insertBefore(noscript, document.body.firstChild);
    }
  }, [settings.facebook_pixel]);

  // TikTok Pixel
  useEffect(() => {
    if (!settings.tiktok_pixel || initialized.current.has("tiktok")) return;
    initialized.current.add("tiktok");

    const scriptId = "tiktok-pixel";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.innerHTML = `
        !function(w,d,t,u,n,o,m){w['TiktokAnalyticsObject']=n;w[n]=w[n]||function(){
        (w[n].q=w[n].q||[]).push(arguments)},w[n].l=1*new Date();o=d.createElement(t),
        m=d.getElementsByTagName(t)[0];o.async=1;o.src=u;m.parentNode.insertBefore(o,m)
        }(window,document,'script','https://analytics.tiktok.com/i18n/pixel/sdk.js','ttq');
        ttq('init', '${settings.tiktok_pixel}');
        ttq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }, [settings.tiktok_pixel]);

  // Google Ads - Initialize conversion tracking
  useEffect(() => {
    if (!settings.google_ads || initialized.current.has("google_ads")) return;
    initialized.current.add("google_ads");

    const script = document.createElement("script");
    script.innerHTML = `
      window.gtag = window.gtag || function(){dataLayer.push(arguments);};
      gtag('config', '${settings.google_ads}');
    `;
    document.head.appendChild(script);
  }, [settings.google_ads]);

  // Track page views when location changes - send to all platforms + server-side
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (prevPathRef.current === currentPath) return;
    prevPathRef.current = currentPath;

    const pageUrl = window.location.href;
    const referrerUrl = document.referrer || "";

    // Google Analytics page view
    if (window.gtag && settings.google_analytics) {
      window.gtag("event", "page_view", {
        page_path: currentPath,
        page_title: document.title,
        page_location: pageUrl,
      });
    }

    // Google Ads page view
    if (window.gtag && settings.google_ads) {
      window.gtag("config", settings.google_ads, {
        page_path: currentPath,
      });
    }

    // Facebook Pixel page view
    if (window.fbq) {
      window.fbq("track", "PageView");
    }

    // TikTok Pixel page view
    if (window.ttq) {
      window.ttq("track", "PageView");
    }

    // Send server-side tracking event
    sendServerSideEvent("PageView", {
      page_url: pageUrl,
      page_title: document.title,
      referrer_url: referrerUrl,
    });
  }, [location, settings.google_analytics, settings.google_ads]);

  return null;
}

// Server-side tracking function - sends events to Laravel Backend API
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";
let serverTrackingUnavailable = false;

async function sendServerSideEvent(
  eventName: string,
  eventData: Record<string, any> = {}
) {
  if (serverTrackingUnavailable) return;
  try {
    // Call the Laravel tracking endpoint
    const response = await fetch(`${API_URL}/tracking/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_data: eventData,
        platform: "web",
        page_url: eventData.page_url || window.location.href,
        referrer_url: eventData.referrer_url || document.referrer || "",
      }),
    });

    const ct = response.headers.get("content-type") || "";
    if (response.status === 404 || response.status === 405 || !ct.includes("application/json")) {
      serverTrackingUnavailable = true;
      return;
    }
  } catch {
    serverTrackingUnavailable = true;
  }
}

// Extend window to add our pixel globals
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: (...args: any[]) => void;
  }
}

// ========== TRACKING FUNCTIONS ==========

export function trackViewContent(data: {
  product_id: string;
  product_name: string;
  price: number;
  currency?: string;
  category?: string;
  brand?: string;
}) {
  // Facebook Pixel
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_type: "product",
      content_ids: [data.product_id],
      content_name: data.product_name,
      value: data.price,
      currency: data.currency || "BDT",
      content_category: data.category || "",
    });
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag("event", "view_item", {
      currency: data.currency || "BDT",
      value: data.price,
      items: [{
        item_id: data.product_id,
        item_name: data.product_name,
        price: data.price,
        item_category: data.category || "",
        item_brand: data.brand || "",
      }],
    });
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq("track", "ViewContent", {
      content_id: data.product_id,
      content_type: "product",
      content_name: data.product_name,
      value: data.price,
      currency: data.currency || "BDT",
    });
  }

  // Server-side
  sendServerSideEvent("ViewContent", {
    ...data,
    page_url: window.location.href,
  });
}

export function trackAddToCart(data: {
  product_id: string;
  product_name: string;
  price: number;
  currency?: string;
  quantity: number;
  category?: string;
  brand?: string;
}) {
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_type: "product",
      content_ids: [data.product_id],
      content_name: data.product_name,
      value: data.price * data.quantity,
      currency: data.currency || "BDT",
      content_category: data.category || "",
    });
  }
  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: data.currency || "BDT",
      value: data.price * data.quantity,
      items: [{
        item_id: data.product_id,
        item_name: data.product_name,
        price: data.price,
        quantity: data.quantity,
        item_category: data.category || "",
        item_brand: data.brand || "",
      }],
    });
  }
  if (window.ttq) {
    window.ttq("track", "AddToCart", {
      contents: [{
        content_id: data.product_id,
        content_type: "product",
        quantity: data.quantity,
        price: data.price,
      }],
      value: data.price * data.quantity,
      currency: data.currency || "BDT",
    });
  }

  // Server-side
  sendServerSideEvent("AddToCart", {
    ...data,
    page_url: window.location.href,
  });
}

export function trackInitiateCheckout(data: {
  value: number;
  currency?: string;
  num_items: number;
  content_ids: string[];
  content_names?: string[];
}) {
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: data.value,
      currency: data.currency || "BDT",
      num_items: data.num_items,
      content_ids: data.content_ids,
      content_type: "product",
    });
  }
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      value: data.value,
      currency: data.currency || "BDT",
      items: data.content_ids.map((id, i) => ({
        item_id: id,
        item_name: data.content_names?.[i] || "",
        quantity: 1,
      })),
    });
  }
  if (window.ttq) {
    window.ttq("track", "InitiateCheckout", {
      value: data.value,
      currency: data.currency || "BDT",
      contents: data.content_ids.map((id) => ({
        content_id: id,
        content_type: "product",
        quantity: 1,
      })),
    });
  }

  // Server-side
  sendServerSideEvent("InitiateCheckout", {
    ...data,
    page_url: window.location.href,
  });
}

export function trackPurchase(data: {
  transaction_id: string;
  value: number;
  currency?: string;
  content_ids: string[];
  content_names: string[];
  num_items: number;
  email?: string;
  phone?: string;
}) {
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_type: "product",
      content_ids: data.content_ids,
      value: data.value,
      currency: data.currency || "BDT",
      contents: data.content_names.map((name, i) => ({
        id: data.content_ids[i],
        name,
        quantity: 1,
      })),
    });
  }
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: data.transaction_id,
      value: data.value,
      currency: data.currency || "BDT",
      items: data.content_ids.map((id, i) => ({
        item_id: id,
        item_name: data.content_names[i] || "",
        quantity: 1,
        price: data.value / data.num_items,
      })),
    });

    // Google Ads conversion
    window.gtag("event", "conversion", {
      send_to: undefined, // Will be set via config
      value: data.value,
      currency: data.currency || "BDT",
      transaction_id: data.transaction_id,
    });
  }
  if (window.ttq) {
    window.ttq("track", "CompletePayment", {
      value: data.value,
      currency: data.currency || "BDT",
      contents: data.content_ids.map((id) => ({
        content_id: id,
        content_type: "product",
        quantity: 1,
      })),
    });
  }

  // Server-side
  sendServerSideEvent("Purchase", {
    ...data,
    page_url: window.location.href,
  });
}

export function trackSearch(data: {
  search_term: string;
  results_count?: number;
}) {
  if (window.fbq) {
    window.fbq("track", "Search", {
      search_string: data.search_term,
    });
  }
  if (window.gtag) {
    window.gtag("event", "search", {
      search_term: data.search_term,
    });
  }
  if (window.ttq) {
    window.ttq("track", "Search", {
      search_string: data.search_term,
    });
  }

  sendServerSideEvent("Search", {
    ...data,
    page_url: window.location.href,
  });
}

export function trackAddPaymentInfo(data: {
  value?: number;
  currency?: string;
  payment_method?: string;
}) {
  if (window.fbq) {
    window.fbq("track", "AddPaymentInfo", {
      value: data.value,
      currency: data.currency || "BDT",
    });
  }
  if (window.gtag) {
    window.gtag("event", "add_payment_info", {
      value: data.value,
      currency: data.currency || "BDT",
      payment_type: data.payment_method || "",
    });
  }
  if (window.ttq) {
    window.ttq("track", "AddPaymentInfo", {
      value: data.value,
      currency: data.currency || "BDT",
    });
  }

  sendServerSideEvent("AddPaymentInfo", {
    ...data,
    page_url: window.location.href,
  });
}

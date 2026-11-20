import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tCategory: (slug: string, fallbackName: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Header & Navbar
    "search_placeholder": "চকলেট ট্রাফল কেক, ক্রসাঁ, পেস্ট্রি...",
    "track_order": "ট্র্যাক অর্ডার",
    "login": "লগইন",
    "account": "আমার অ্যাকাউন্ট",
    "cart": "কার্ট",
    
    // Product list & categories
    "top_categories": "জনপ্রিয় বেকারি ক্যাটাগরি",
    "special_offers": "বেকারি স্পেশাল অফার",
    "see_more": "আরও দেখুন",
    "trending_products": "তাজা বেকড আইটেম",
    "view_all": "সব দেখুন",
    "add_to_cart": "কার্টে যোগ করুন",
    "buy_now": "অর্ডার করুন",
    "view_details": "বিস্তারিত দেখুন",
    "stock_out": "স্টক শেষ",
    "limited_stock": "ফ্রেশ ব্যাচ, দ্রুত অর্ডার করুন!",
    "original_price": "৳",
    "discount_tag": "ছাড়",
    
    // Video gallery & reviews
    "customer_reviews": "আমাদের গ্রাহকদের অভিজ্ঞতা",
    "customer_reviews_subtitle": "HAPPY BAKERY LOVERS",
    "video_gallery": "বেকিং গ্যালারি",
    "video_gallery_subtitle": "আমাদের লাইভ বেকিং ও কেক ডেকোরেশন",
    
    // Blog section
    "read_new_blogs": "বেকারি ও পেস্ট্রি ব্লগ পড়ুন",
    "health_tips": "বেকিং টিপস",
    "general_tips": "কেক গাইড",
    
    // Footer
    "footer_blurb": "ড্রিম বেকারি প্রতিদিন তাজা বেক করে নিয়ে আসে বেলজিয়ান চকলেট কেক, রেড ভেলভেট কেক, ফ্রেঞ্চ বাটার ক্রসাঁ, আর্টিজান সাওয়ারডো ব্রেড, কুকিজ ও ডেজার্ট বক্স — ১০০% প্রিমিয়াম উপাদানে তৈরি।",
    "footer_category": "বেকারি মেনু",
    "footer_important_links": "লিংক",
    "footer_contact": "যোগাযোগ করুন",
    "footer_follow_us": "আমাদের ফলো করুন",
    "footer_whatsapp": "যোগাযোগ করুন (WhatsApp)",
    "footer_email": "ইমেইল",
    "footer_address": "ঠিকানা",
    "footer_business_hours": "প্রতিদিন সকাল ৮টা - রাত ১১টা",
    "copyright": "© 2026 Dream Bakery. All rights reserved.",
    
    // Cart page / Checkout page / order details
    "order_summary": "অর্ডার সামারি",
    "subtotal": "সাবটোটাল",
    "delivery_charge": "ডেলিভারি চার্জ",
    "total": "সর্বমোট",
    "checkout": "চেকআউট করুন",
    "cart_empty": "আপনার বেকারি কার্ট খালি",
    
    // Product Detail
    "delivery_cost": "হোম ডেলিভারি চার্জ",
    "inside_dhaka": "ঢাকার ভিতরে (ফ্রেশ এক্সপ্রেস)",
    "outside_dhaka": "ঢাকার বাইরে",
    "limited_time_offer": "আজকের তাজা বেকড অফার!",
    "quantity": "পরিমাণ",
    "order_policy": "অর্ডার ও ডেলিভারি পলিসি",
    "reviews": "রিভিউ",
    "no_reviews_yet": "এখনো কোনো রিভিউ নেই — প্রথম রিভিউ দিন",
    "write_review": "আপনার রিভিউ দিন",
    "review_approved_notice": "আপনার রিভিউ অ্যাডমিন অনুমোদনের পর সাইটে দেখানো হবে।",
    "your_name": "আপনার নাম",
    "rating": "রেটিং",
    "write_review_placeholder": "কেক বা পেস্ট্রির স্বাদ কেমন লেগেছে লিখুন...",
    "submit_review": "রিভিউ জমা দিন",
    
    // Track Order Page
    "track_your_order": "আপনার বেকারি অর্ডার ট্র্যাক করুন",
    "enter_order_number": "অর্ডার নম্বর দিন (যেমন: ORD-1709...)",
    "track_button": "ট্র্যাক করুন",
    "order_details": "অর্ডারের বিবরণ",
    "order_date": "অর্ডারের তারিখ",
    "payment_method": "পেমেন্ট পদ্ধতি",
    "payment_status": "পেমেন্ট স্ট্যাটাস",
    "delivery_address": "ডেলিভারি ঠিকানা",
    "customer_notes": "গ্রাহকের নোট",
    "loading": "লোড হচ্ছে...",
    "please_wait": "অনুগ্রহ করে অপেক্ষা করুন...",
    "loading_products": "বেকারি আইটেম লোড হচ্ছে...",
    "loading_categories": "বেকারি ক্যাটাগরি লোড হচ্ছে..."
  },
  en: {
    // Header & Navbar
    "search_placeholder": "Search cakes, croissants, pastries...",
    "track_order": "Track Order",
    "login": "Login",
    "account": "My Account",
    "cart": "Cart",
    
    // Product list & categories
    "top_categories": "Our Bakery Categories",
    "special_offers": "Freshly Baked Specials",
    "see_more": "See More",
    "trending_products": "Fresh From The Oven",
    "view_all": "View All",
    "add_to_cart": "Add to Cart",
    "buy_now": "Order Now",
    "view_details": "View Details",
    "stock_out": "Sold Out",
    "limited_stock": "Fresh batch, order fast!",
    "original_price": "৳",
    "discount_tag": "Off",
    
    // Video gallery & reviews
    "customer_reviews": "What Our Customers Say",
    "customer_reviews_subtitle": "HAPPY BAKERY LOVERS",
    "video_gallery": "BAKING GALLERY",
    "video_gallery_subtitle": "Behind the Scenes in Our Artisan Bakery",
    
    // Blog section
    "read_new_blogs": "From Our Bakery Journal",
    "health_tips": "Baking Tips",
    "general_tips": "Cake Guide",
    
    // Footer
    "footer_blurb": "Dream Bakery crafts freshly baked celebration cakes, French butter croissants, artisan sourdough breads, fudgy brownies, and gourmet cookies daily using 100% premium ingredients.",
    "footer_category": "Bakery Menu",
    "footer_important_links": "Useful Links",
    "footer_contact": "Contact Us",
    "footer_follow_us": "Follow Us",
    "footer_whatsapp": "Contact Us (WhatsApp)",
    "footer_email": "Email",
    "footer_address": "Address",
    "footer_business_hours": "Everyday 8 AM - 11 PM",
    "copyright": "© 2026 Dream Bakery. All rights reserved.",
    
    // Cart page / Checkout page / order details
    "order_summary": "Order Summary",
    "subtotal": "Subtotal",
    "delivery_charge": "Delivery Charge",
    "total": "Total",
    "checkout": "Proceed Checkout",
    "cart_empty": "Your bakery cart is empty",
    
    // Product Detail
    "delivery_cost": "Home Delivery Charge",
    "inside_dhaka": "Inside Dhaka (Fresh Express)",
    "outside_dhaka": "Outside Dhaka",
    "limited_time_offer": "Today's Freshly Baked Offer!",
    "quantity": "Quantity",
    "order_policy": "Order & Delivery Policy",
    "reviews": "Reviews",
    "no_reviews_yet": "No reviews yet — be the first to review",
    "write_review": "Write a Review",
    "review_approved_notice": "Your review will be shown after admin approval.",
    "your_name": "Your Name",
    "rating": "Rating",
    "write_review_placeholder": "Share your experience with our baked treats...",
    "submit_review": "Submit Review",
    
    // Track Order Page
    "track_your_order": "Track Your Bakery Order",
    "enter_order_number": "Enter order number (e.g. ORD-1709...)",
    "track_button": "Track Order",
    "order_details": "Order Details",
    "order_date": "Order Date",
    "payment_method": "Payment Method",
    "payment_status": "Payment Status",
    "delivery_address": "Delivery Address",
    "customer_notes": "Customer Notes",
    "loading": "Loading...",
    "please_wait": "Please wait...",
    "loading_products": "Loading bakery items...",
    "loading_categories": "Loading bakery categories..."
  }
};

const categoryTranslations: Record<string, Record<Language, string>> = {
  "celebration-cakes": { en: "Celebration Cakes", bn: "সেলিব্রেশন কেক" },
  "pastries-slices": { en: "Pastries & Slices", bn: "পেস্ট্রি ও স্লাইস" },
  "artisan-breads": { en: "Artisan Breads & Buns", bn: "আর্টিজান ব্রেড ও বান" },
  "cookies-biscuits": { en: "Cookies & Biscuits", bn: "কুকিজ ও বিস্কুট" },
  "cupcakes-muffins": { en: "Cupcakes & Muffins", bn: "কাপকেক ও মাফিন" },
  "savory-puffs": { en: "Savory & Puffs", bn: "সেভরি ও পাফ" },
  "brownies-desserts": { en: "Brownies & Desserts", bn: "ব্রাউনি ও ডেজার্ট" },
  "bakery-gift-boxes": { en: "Bakery Gift Boxes", bn: "বেকারি গিফট বক্স" }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("dream_mart_lang");
    return (saved === "en" || saved === "bn") ? saved : "bn";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dream_mart_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["bn"][key] || key;
  };

  const tCategory = (slug: string, fallbackName: string): string => {
    const trans = categoryTranslations[slug];
    if (trans && trans[language]) {
      return trans[language];
    }
    return fallbackName;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const getLocalizedField = (item: any, baseField: string, language: Language): string => {
  if (!item) return "";
  const enKey = `${baseField}_en`;
  const bnKey = `${baseField}_bn`;
  if (language === "en") {
    return item[enKey] || item[bnKey] || item[baseField] || "";
  } else {
    return item[bnKey] || item[enKey] || item[baseField] || "";
  }
};

export const getLocalizedName = (item: any, language: Language): string => {
  return getLocalizedField(item, "name", language);
};

export const getLocalizedTitle = (item: any, language: Language): string => {
  return getLocalizedField(item, "title", language);
};

export const getLocalizedDescription = (item: any, language: Language): string => {
  return getLocalizedField(item, "description", language);
};

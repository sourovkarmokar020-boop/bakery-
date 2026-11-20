import { resolveLocalImageUrl } from "./productImages";

export const categoryImageMap: Record<string, string> = {
  "celebration-cakes": "/assets/uploads/category-images/cat-cakes.webp",
  "সেলিব্রেশন কেক": "/assets/uploads/category-images/cat-cakes.webp",

  "pastries-slices": "/assets/uploads/category-images/cat-pastries.webp",
  "পেস্ট্রি ও স্লাইস": "/assets/uploads/category-images/cat-pastries.webp",

  "artisan-breads": "/assets/uploads/category-images/cat-breads.webp",
  "আর্টিজান ব্রেড ও বান": "/assets/uploads/category-images/cat-breads.webp",

  "cookies-biscuits": "/assets/uploads/category-images/cat-cookies.webp",
  "কুকিজ ও বিস্কুট": "/assets/uploads/category-images/cat-cookies.webp",

  "cupcakes-muffins": "/assets/uploads/category-images/cat-cupcakes.webp",
  "কাপকেক ও মাফিন": "/assets/uploads/category-images/cat-cupcakes.webp",

  "savory-puffs": "/assets/uploads/category-images/cat-savory.webp",
  "সেভরি ও পাফ": "/assets/uploads/category-images/cat-savory.webp",

  "brownies-desserts": "/assets/uploads/category-images/cat-desserts.webp",
  "ব্রাউনি ও ডেজার্ট": "/assets/uploads/category-images/cat-desserts.webp",

  "bakery-gift-boxes": "/assets/uploads/category-images/cat-gift-boxes.webp",
  "বেকারি গিফট বক্স": "/assets/uploads/category-images/cat-gift-boxes.webp",
};

export const getCategoryImage = (slug: string, imageUrl?: string | null): string => {
  if (imageUrl === null || imageUrl === "") return "";

  if (imageUrl) {
    const resolved = resolveLocalImageUrl(imageUrl);
    if (resolved && !resolved.startsWith("/src/")) return resolved;
  }

  if (categoryImageMap[slug]) return categoryImageMap[slug];
  return "/assets/uploads/category-images/cat-cakes.webp";
};

import { resolveLocalImageUrl } from "./productImages";

export const categoryImageMap: Record<string, string> = {
  "celebration-cakes": "/assets/uploads/category-images/cat-cakes.png",
  "সেলিব্রেশন কেক": "/assets/uploads/category-images/cat-cakes.png",

  "pastries-slices": "/assets/uploads/category-images/cat-pastries.png",
  "পেস্ট্রি ও স্লাইস": "/assets/uploads/category-images/cat-pastries.png",

  "artisan-breads": "/assets/uploads/category-images/cat-breads.png",
  "আর্টিজান ব্রেড ও বান": "/assets/uploads/category-images/cat-breads.png",

  "cookies-biscuits": "/assets/uploads/category-images/cat-cookies.png",
  "কুকিজ ও বিস্কুট": "/assets/uploads/category-images/cat-cookies.png",

  "cupcakes-muffins": "/assets/uploads/category-images/cat-cupcakes.png",
  "কাপকেক ও মাফিন": "/assets/uploads/category-images/cat-cupcakes.png",

  "savory-puffs": "/assets/uploads/category-images/cat-savory.png",
  "সেভরি ও পাফ": "/assets/uploads/category-images/cat-savory.png",

  "brownies-desserts": "/assets/uploads/category-images/cat-desserts.png",
  "ব্রাউনি ও ডেজার্ট": "/assets/uploads/category-images/cat-desserts.png",

  "bakery-gift-boxes": "/assets/uploads/category-images/cat-gift-boxes.png",
  "বেকারি গিফট বক্স": "/assets/uploads/category-images/cat-gift-boxes.png",
};

export const getCategoryImage = (slug: string, imageUrl?: string | null): string => {
  if (imageUrl === null || imageUrl === "") return "";

  if (imageUrl) {
    if (imageUrl.startsWith("/assets/uploads/")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("assets/uploads/")) {
      return "/" + imageUrl;
    }
    const resolved = resolveLocalImageUrl(imageUrl);
    if (resolved && !resolved.startsWith("/src/")) return resolved;
  }

  if (categoryImageMap[slug]) return categoryImageMap[slug];
  return "/assets/uploads/category-images/cat-cakes.png";
};

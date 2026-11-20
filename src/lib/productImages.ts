// Shared utility to map product slugs to their local bakery images (WebP optimized)
export const mockImageMap: Record<string, string> = {
  // 1. Celebration Cakes (4)
  "belgian-chocolate-truffle-cake": "/assets/uploads/product-images/bakery/belgian-chocolate-truffle-cake.webp",
  "red-velvet-cream-cheese-cake": "/assets/uploads/product-images/bakery/red-velvet-cream-cheese-cake.webp",
  "black-forest-cherry-cake": "/assets/uploads/product-images/bakery/black-forest-cherry-cake.webp",
  "strawberry-vanilla-dream-cake": "/assets/uploads/product-images/bakery/strawberry-vanilla-dream-cake.webp",

  // 2. Pastries & Slices (4)
  "french-butter-croissant": "/assets/uploads/product-images/bakery/french-butter-croissant.webp",
  "classic-tiramisu-pastry": "/assets/uploads/product-images/bakery/classic-tiramisu-pastry.webp",
  "blueberry-danish-pastry": "/assets/uploads/product-images/bakery/blueberry-danish-pastry.webp",
  "new-york-baked-cheesecake-slice": "/assets/uploads/product-images/bakery/new-york-baked-cheesecake-slice.webp",

  // 3. Artisan Breads & Buns (4)
  "artisan-sourdough-bread": "/assets/uploads/product-images/bakery/artisan-sourdough-bread.webp",
  "cinnamon-roll-glaze": "/assets/uploads/product-images/bakery/cinnamon-roll-glaze.webp",
  "soft-hokkaido-milk-buns": "/assets/uploads/product-images/bakery/soft-hokkaido-milk-buns.webp",
  "french-crusty-baguette-loaf": "/assets/uploads/product-images/bakery/french-crusty-baguette-loaf.webp",

  // 4. Cookies & Biscuits (4)
  "choco-chip-chunk-cookies": "/assets/uploads/product-images/bakery/choco-chip-chunk-cookies.webp",
  "butter-almond-shortbread-cookies": "/assets/uploads/product-images/bakery/butter-almond-shortbread-cookies.webp",
  "double-dark-fudge-cookies": "/assets/uploads/product-images/bakery/double-dark-fudge-cookies.webp",
  "oatmeal-raisin-honey-cookies": "/assets/uploads/product-images/bakery/oatmeal-raisin-honey-cookies.webp",

  // 5. Cupcakes & Muffins (4)
  "assorted-gourmet-cupcakes": "/assets/uploads/product-images/bakery/assorted-gourmet-cupcakes.webp",
  "double-chocolate-fudge-cupcakes": "/assets/uploads/product-images/bakery/double-chocolate-fudge-cupcakes.webp",
  "strawberry-swirl-vanilla-cupcakes": "/assets/uploads/product-images/bakery/strawberry-swirl-vanilla-cupcakes.webp",
  "vanilla-confetti-birthday-cupcakes": "/assets/uploads/product-images/bakery/vanilla-confetti-birthday-cupcakes.webp",

  // 6. Savory & Puffs (4)
  "crispy-chicken-puff-pastry": "/assets/uploads/product-images/bakery/crispy-chicken-puff-pastry.webp",
  "butter-cheese-garlic-croissant-roll": "/assets/uploads/product-images/bakery/butter-cheese-garlic-croissant-roll.webp",
  "smoked-chicken-cheese-patty": "/assets/uploads/product-images/bakery/smoked-chicken-cheese-patty.webp",
  "savory-mushroom-spinach-quiche": "/assets/uploads/product-images/bakery/savory-mushroom-spinach-quiche.webp",

  // 7. Brownies & Desserts (4)
  "fudgy-walnut-chocolate-brownie": "/assets/uploads/product-images/bakery/fudgy-walnut-chocolate-brownie.webp",
  "salted-caramel-cream-dessert-cup": "/assets/uploads/product-images/bakery/salted-caramel-cream-dessert-cup.webp",
  "nutella-hazelnut-fudge-brownie": "/assets/uploads/product-images/bakery/nutella-hazelnut-fudge-brownie.webp",
  "espresso-mocha-mousse-dessert": "/assets/uploads/product-images/bakery/espresso-mocha-mousse-dessert.webp",

  // 8. Bakery Gift Boxes (4)
  "royal-bakery-dessert-gift-box": "/assets/uploads/product-images/bakery/royal-bakery-dessert-gift-box.webp",
  "parisian-macaron-pastry-gift-box": "/assets/uploads/product-images/bakery/parisian-macaron-pastry-gift-box.webp",
  "signature-cookie-brownie-hamper": "/assets/uploads/product-images/bakery/signature-cookie-brownie-hamper.webp",
  "celebration-cupcake-truffle-gift-box": "/assets/uploads/product-images/bakery/celebration-cupcake-truffle-gift-box.webp",
};

const toWebpIfBakeryAsset = (p: string): string => {
  if (
    /\/assets\/uploads\/(banners\/bakery-|category-images\/cat-|product-images\/bakery\/|videos\/video-thumb-|site-settings\/bakery-).*\.png$/i.test(
      p
    )
  ) {
    return p.replace(/\.png$/i, ".webp");
  }
  return p;
};

export const resolveLocalImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("/src/")) return url;
  if (url.startsWith("/placeholder.svg")) return url;
  // If it's an /assets/uploads/ path, serve directly from frontend public folder (upgraded to WebP)
  if (url.startsWith("/assets/uploads/")) {
    return toWebpIfBakeryAsset(url);
  }
  if (url.startsWith("assets/uploads/")) {
    return toWebpIfBakeryAsset("/" + url);
  }

  const apiBase = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace("/api", "");

  if (url.startsWith("http")) {
    const uploadIndex = url.indexOf("/storage/");
    if (uploadIndex !== -1) {
      return apiBase + url.substring(uploadIndex);
    }
  }

  if (url.startsWith("/storage/")) {
    return apiBase + url;
  }
  if (url.startsWith("storage/")) {
    return apiBase + "/" + url;
  }

  if (!url.startsWith("http") && !url.startsWith("/")) {
    return `${apiBase}/storage/${url}`;
  }

  return url;
};

export const getProductImage = (slug: string, imageUrl?: string | null): string => {
  if (imageUrl) {
    const resolved = resolveLocalImageUrl(imageUrl);
    if (resolved && !resolved.startsWith("/src/")) return resolved;
  }
  return mockImageMap[slug] || "/assets/uploads/product-images/bakery/belgian-chocolate-truffle-cake.webp";
};

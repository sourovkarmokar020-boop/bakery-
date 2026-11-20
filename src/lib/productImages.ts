// Shared utility to map product slugs to their local bakery images
export const mockImageMap: Record<string, string> = {
  // 1. Celebration Cakes (4)
  "belgian-chocolate-truffle-cake": "/assets/uploads/product-images/bakery/belgian-chocolate-truffle-cake.png",
  "red-velvet-cream-cheese-cake": "/assets/uploads/product-images/bakery/red-velvet-cream-cheese-cake.png",
  "black-forest-cherry-cake": "/assets/uploads/product-images/bakery/black-forest-cherry-cake.png",
  "strawberry-vanilla-dream-cake": "/assets/uploads/product-images/bakery/strawberry-vanilla-dream-cake.png",

  // 2. Pastries & Slices (4)
  "french-butter-croissant": "/assets/uploads/product-images/bakery/french-butter-croissant.png",
  "classic-tiramisu-pastry": "/assets/uploads/product-images/bakery/classic-tiramisu-pastry.png",
  "blueberry-danish-pastry": "/assets/uploads/product-images/bakery/blueberry-danish-pastry.png",
  "new-york-baked-cheesecake-slice": "/assets/uploads/product-images/bakery/new-york-baked-cheesecake-slice.png",

  // 3. Artisan Breads & Buns (4)
  "artisan-sourdough-bread": "/assets/uploads/product-images/bakery/artisan-sourdough-bread.png",
  "cinnamon-roll-glaze": "/assets/uploads/product-images/bakery/cinnamon-roll-glaze.png",
  "soft-hokkaido-milk-buns": "/assets/uploads/product-images/bakery/soft-hokkaido-milk-buns.png",
  "french-crusty-baguette-loaf": "/assets/uploads/product-images/bakery/french-crusty-baguette-loaf.png",

  // 4. Cookies & Biscuits (4)
  "choco-chip-chunk-cookies": "/assets/uploads/product-images/bakery/choco-chip-chunk-cookies.png",
  "butter-almond-shortbread-cookies": "/assets/uploads/product-images/bakery/butter-almond-shortbread-cookies.png",
  "double-dark-fudge-cookies": "/assets/uploads/product-images/bakery/double-dark-fudge-cookies.png",
  "oatmeal-raisin-honey-cookies": "/assets/uploads/product-images/bakery/oatmeal-raisin-honey-cookies.png",

  // 5. Cupcakes & Muffins (4)
  "assorted-gourmet-cupcakes": "/assets/uploads/product-images/bakery/assorted-gourmet-cupcakes.png",
  "double-chocolate-fudge-cupcakes": "/assets/uploads/product-images/bakery/double-chocolate-fudge-cupcakes.png",
  "strawberry-swirl-vanilla-cupcakes": "/assets/uploads/product-images/bakery/strawberry-swirl-vanilla-cupcakes.png",
  "vanilla-confetti-birthday-cupcakes": "/assets/uploads/product-images/bakery/vanilla-confetti-birthday-cupcakes.png",

  // 6. Savory & Puffs (4)
  "crispy-chicken-puff-pastry": "/assets/uploads/product-images/bakery/crispy-chicken-puff-pastry.png",
  "butter-cheese-garlic-croissant-roll": "/assets/uploads/product-images/bakery/butter-cheese-garlic-croissant-roll.png",
  "smoked-chicken-cheese-patty": "/assets/uploads/product-images/bakery/smoked-chicken-cheese-patty.png",
  "savory-mushroom-spinach-quiche": "/assets/uploads/product-images/bakery/savory-mushroom-spinach-quiche.png",

  // 7. Brownies & Desserts (4)
  "fudgy-walnut-chocolate-brownie": "/assets/uploads/product-images/bakery/fudgy-walnut-chocolate-brownie.png",
  "salted-caramel-cream-dessert-cup": "/assets/uploads/product-images/bakery/salted-caramel-cream-dessert-cup.png",
  "nutella-hazelnut-fudge-brownie": "/assets/uploads/product-images/bakery/nutella-hazelnut-fudge-brownie.png",
  "espresso-mocha-mousse-dessert": "/assets/uploads/product-images/bakery/espresso-mocha-mousse-dessert.png",

  // 8. Bakery Gift Boxes (4)
  "royal-bakery-dessert-gift-box": "/assets/uploads/product-images/bakery/royal-bakery-dessert-gift-box.png",
  "parisian-macaron-pastry-gift-box": "/assets/uploads/product-images/bakery/parisian-macaron-pastry-gift-box.png",
  "signature-cookie-brownie-hamper": "/assets/uploads/product-images/bakery/signature-cookie-brownie-hamper.png",
  "celebration-cupcake-truffle-gift-box": "/assets/uploads/product-images/bakery/celebration-cupcake-truffle-gift-box.png",
};

export const resolveLocalImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("/src/")) return url;
  if (url.startsWith("/placeholder.svg")) return url;
  // If it's an /assets/uploads/ path, serve directly from frontend public folder
  if (url.startsWith("/assets/uploads/")) {
    return url;
  }
  if (url.startsWith("assets/uploads/")) {
    return "/" + url;
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
  return mockImageMap[slug] || "/assets/uploads/product-images/bakery/belgian-chocolate-truffle-cake.png";
};

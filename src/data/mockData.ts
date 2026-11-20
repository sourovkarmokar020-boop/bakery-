export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  category: string;
  rating: number;
  brand: string;
  code: string;
  description: string;
  inStock: boolean;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  subCategories?: SubCategory[];
}

export const categories: Category[] = [
  {
    id: 1,
    name: "সেলিব্রেশন কেক",
    slug: "celebration-cakes",
    image: "/assets/uploads/category-images/cat-cakes.png",
    productCount: 4,
  },
  {
    id: 2,
    name: "পেস্ট্রি ও স্লাইস",
    slug: "pastries-slices",
    image: "/assets/uploads/category-images/cat-pastries.png",
    productCount: 3,
  },
  {
    id: 3,
    name: "আর্টিজান ব্রেড ও বান",
    slug: "artisan-breads",
    image: "/assets/uploads/category-images/cat-breads.png",
    productCount: 3,
  },
  {
    id: 4,
    name: "কুকিজ ও বিস্কুট",
    slug: "cookies-biscuits",
    image: "/assets/uploads/category-images/cat-cookies.png",
    productCount: 2,
  },
  {
    id: 5,
    name: "কাপকেক ও মাফিন",
    slug: "cupcakes-muffins",
    image: "/assets/uploads/category-images/cat-cupcakes.png",
    productCount: 1,
  },
  {
    id: 6,
    name: "সেভরি ও পাফ",
    slug: "savory-puffs",
    image: "/assets/uploads/category-images/cat-savory.png",
    productCount: 1,
  },
  {
    id: 7,
    name: "ব্রাউনি ও ডেজার্ট",
    slug: "brownies-desserts",
    image: "/assets/uploads/category-images/cat-desserts.png",
    productCount: 1,
  },
  {
    id: 8,
    name: "বেকারি গিফট বক্স",
    slug: "bakery-gift-boxes",
    image: "/assets/uploads/category-images/cat-gift-boxes.png",
    productCount: 1,
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "বেলজিয়ান চকলেট ট্রাফল কেক (১ পাউন্ড)",
    slug: "belgian-chocolate-truffle-cake",
    price: 1250,
    originalPrice: 1500,
    discount: 17,
    image: "/assets/uploads/product-images/bakery/belgian-chocolate-truffle-cake.png",
    category: "celebration-cakes",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-CK01",
    description: "১০০% খাঁটি বেলজিয়ান ডার্ক চকলেট গানাশ এবং নরম চকলেট স্পঞ্জ লেয়ার দিয়ে তৈরি সিগনেচার সেলিব্রেশন কেক।",
    inStock: true,
  },
  {
    id: 2,
    name: "রেড ভেলভেট ক্রিম চিজ কেক (১ পাউন্ড)",
    slug: "red-velvet-cream-cheese-cake",
    price: 1350,
    originalPrice: 1600,
    discount: 16,
    image: "/assets/uploads/product-images/bakery/red-velvet-cream-cheese-cake.png",
    category: "celebration-cakes",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-CK02",
    description: "মখমলের মতো নরম রেড ভেলভেট স্পঞ্জ এবং আসল ফিলাডেলফিয়া স্টাইল ক্রিম চিজ ফ্রস্টিংয়ে সাজানো প্রিমিয়াম কেক।",
    inStock: true,
  },
  {
    id: 3,
    name: "ক্লাসিক ব্ল্যাক ফরেস্ট চেরি কেক (১ পাউন্ড)",
    slug: "black-forest-cherry-cake",
    price: 1100,
    originalPrice: 1350,
    discount: 19,
    image: "/assets/uploads/product-images/bakery/black-forest-cherry-cake.png",
    category: "celebration-cakes",
    rating: 4.8,
    brand: "Dream Bakery",
    code: "DB-CK03",
    description: "জার্মান স্টাইল চকলেট স্পঞ্জ, তাজা হুইপড ক্রিম, ডার্ক চকলেট শেভিংস এবং সুইট রেড চেরি টপিং।",
    inStock: true,
  },
  {
    id: 4,
    name: "স্ট্রবেরি ভ্যানিলা ড্রিম কেক (১ পাউন্ড)",
    slug: "strawberry-vanilla-dream-cake",
    price: 1150,
    originalPrice: 1400,
    discount: 18,
    image: "/assets/uploads/product-images/bakery/strawberry-vanilla-dream-cake.png",
    category: "celebration-cakes",
    rating: 4.8,
    brand: "Dream Bakery",
    code: "DB-CK04",
    description: "মাদাগাস্কার ভ্যানিলা স্পঞ্জ, ফ্রেশ স্ট্রবেরি কম্পোট এবং হালকা বাটারক্রিম ফ্রস্টিংয়ে তৈরি।",
    inStock: true,
  },
  {
    id: 5,
    name: "ফ্রেঞ্চ বাটার ক্রসাঁ (২ পিস প্যাক)",
    slug: "french-butter-croissant",
    price: 320,
    originalPrice: 380,
    discount: 16,
    image: "/assets/uploads/product-images/bakery/french-butter-croissant.png",
    category: "pastries-slices",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-PS01",
    description: "খাঁটি ইউরোপিয়ান বাটার দিয়ে দীর্ঘ ল্যামিনেশনে তৈরি সোনালি, খাস্তা ও সুগন্ধি ফ্রেঞ্চ ক্রসাঁ।",
    inStock: true,
  },
  {
    id: 6,
    name: "ক্লাসিক ইতালিয়ান তিরামিসু পেস্ট্রি",
    slug: "classic-tiramisu-pastry",
    price: 380,
    originalPrice: 450,
    discount: 16,
    image: "/assets/uploads/product-images/bakery/classic-tiramisu-pastry.png",
    category: "pastries-slices",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-PS02",
    description: "এসপ্রেসো ভেজানো লেডিফিঙ্গার, মাসকারপোনে চিজ ক্রিম এবং ডাচ কোকো পাউডারের নিখুঁত লেয়ার।",
    inStock: true,
  },
  {
    id: 7,
    name: "আর্টিজান কান্ট্রি সাওয়ারডো ব্রেড লোফ",
    slug: "artisan-sourdough-bread",
    price: 420,
    originalPrice: 500,
    discount: 16,
    image: "/assets/uploads/product-images/bakery/artisan-sourdough-bread.png",
    category: "artisan-breads",
    rating: 4.8,
    brand: "Dream Bakery",
    code: "DB-BR01",
    description: "২৪ ঘণ্টা প্রাকৃতিক ফার্মেন্টেশনে বেক করা ক্রাস্টি ও স্বাস্থ্যকর প্রিজারভেটিভ-মুক্ত সাওয়ারডো ব্রেড।",
    inStock: true,
  },
  {
    id: 8,
    name: "ক্রিম চিজ গ্লেজড সিনামন রোল (২ পিস)",
    slug: "cinnamon-roll-glaze",
    price: 340,
    originalPrice: 400,
    discount: 15,
    image: "/assets/uploads/product-images/bakery/cinnamon-roll-glaze.png",
    category: "artisan-breads",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-BR02",
    description: "সিলন দারুচিনি ও ব্রাউন সুগার রোল করে বেক করা নরম বান, উপরে উষ্ণ ক্রিম চিজ গ্লেজ।",
    inStock: true,
  },
  {
    id: 9,
    name: "বেলজিয়ান চকলেট চিপ চাঙ্ক কুকিজ (৬ পিস জারে)",
    slug: "choco-chip-chunk-cookies",
    price: 450,
    originalPrice: 550,
    discount: 18,
    image: "/assets/uploads/product-images/bakery/choco-chip-chunk-cookies.png",
    category: "cookies-biscuits",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-CKI01",
    description: "বাইরে থেকে মচমচে এবং ভেতরে গলানো ডার্ক চকলেট চাঙ্কে ভরপুর গুরমেট বেকড কুকিজ।",
    inStock: true,
  },
  {
    id: 10,
    name: "অ্যাসোর্টেড গুরমেট কাপকেক বক্স (৬ পিস)",
    slug: "assorted-gourmet-cupcakes",
    price: 680,
    originalPrice: 800,
    discount: 15,
    image: "/assets/uploads/product-images/bakery/assorted-gourmet-cupcakes.png",
    category: "cupcakes-muffins",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-CP01",
    description: "চকলেট ফাজ, ভ্যানিলা বেরি, সল্টেড ক্যারামেল ও রেড ভেলভেট ফ্লেভারের ৬টি প্রিমিয়াম ফ্রস্টেড কাপকেক।",
    inStock: true,
  },
  {
    id: 11,
    name: "ক্রিস্পি বেকড চিকেন পাফ পেস্ট্রি (৪ পিস)",
    slug: "crispy-chicken-puff-pastry",
    price: 360,
    originalPrice: 420,
    discount: 14,
    image: "/assets/uploads/product-images/bakery/crispy-chicken-puff-pastry.png",
    category: "savory-puffs",
    rating: 4.8,
    brand: "Dream Bakery",
    code: "DB-SV01",
    description: "মশলাদার জুসি চিকেন কিমা ও হার্বস ভরা খাস্তা গোল্ডেন পাফ পেস্ট্রি।",
    inStock: true,
  },
  {
    id: 12,
    name: "ফাজি ওয়ালনাট চকলেট ব্রাউনি বক্স (৪ পিস)",
    slug: "fudgy-walnut-chocolate-brownie",
    price: 520,
    originalPrice: 620,
    discount: 16,
    image: "/assets/uploads/product-images/bakery/fudgy-walnut-chocolate-brownie.png",
    category: "brownies-desserts",
    rating: 4.9,
    brand: "Dream Bakery",
    code: "DB-DS01",
    description: "রোস্টেড আখরোট এবং রিচ বেলজিয়ান কোকো দিয়ে বেক করা ঘন ফাজি চকলেট ব্রাউনি।",
    inStock: true,
  },
];

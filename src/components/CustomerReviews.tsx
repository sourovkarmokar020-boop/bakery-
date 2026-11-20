import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/reviews-marquee.css";
import { useLanguage } from "@/context/LanguageContext";

type Review = {
  name: string;
  rating: number;
  text: string;
  avatar: string;
};

// DB-তে কোনো featured রিভিউ না থাকলে এই বেকারি রিভিউগুলো দেখাবে (fallback)
const fallbackReviewsBn: Review[] = [
  { name: "রহিমা আক্তার", rating: 5, text: "বেলজিয়ান চকলেট ট্রাফল কেকটা মেয়ের জন্মদিনের জন্য অর্ডার করেছিলাম। এত সফট আর ক্রিমি চকলেট গানাশ আগে কখনো খাইনি! ধন্যবাদ ড্রিম বেকারি!", avatar: "https://i.pravatar.cc/150?img=47" },
  { name: "আব্দুল মালেক", rating: 5, text: "সকালের নাস্তার জন্য ফ্রেঞ্চ বাটার ক্রসাঁ আর আর্টিজান সাওয়ারডো ব্রেড নিয়েছিলাম। একদম ওভেন-ফ্রেশ আর খাঁটি বাটারের ঘ্রাণ!", avatar: "https://i.pravatar.cc/150?img=12" },
  { name: "তানভীর হাসান", rating: 5, text: "রেড ভেলভেট ক্রিম চিজ কেকটা সময়মতো ডেলিভারি পেয়েছি। চিজ ফ্রস্টিংয়ের স্বাদ এক কথায় অসাধারণ। পরিবারের সবাই খুব প্রশংসা করেছে।", avatar: "https://i.pravatar.cc/150?img=15" },
  { name: "ফাতেমা বেগম", rating: 5, text: "তাদের সিনামন রোল আর ফাজি ওয়ালনাট ব্রাউনি দুটোই মুখে দিলেই মিলিয়ে যায়! বাচ্চাদের টিফিন ও বিকেলের চায়ের জন্য সেরা।", avatar: "https://i.pravatar.cc/150?img=49" },
  { name: "করিম উদ্দিন", rating: 5, text: "ইতালিয়ান তিরামিসু পেস্ট্রি আর চকলেট চিপ কুকিজগুলো একদম ফাইভ-স্টার বেকারির মানের। প্যাকেজিংও খুব প্রিমিয়াম ছিল।", avatar: "https://i.pravatar.cc/150?img=57" },
  { name: "সাবিনা ইয়াসমিন", rating: 5, text: "অ্যাসোর্টেড গুরমেট কাপকেক বক্স গিফট হিসেবে পাঠিয়েছিলাম। দেখতে যেমন সুন্দর, খেতেও ঠিক তেমনই সুস্বাদু!", avatar: "https://i.pravatar.cc/150?img=44" },
  { name: "মোঃ রাসেল মিয়া", rating: 5, text: "ক্রিস্পি চিকেন পাফ পেস্ট্রিগুলো গরম গরম পেয়েছি। ভেতরের চিকেন ফিলিং অনেক জুসি আর বাইরের লেয়ার একদম খাস্তা।", avatar: "https://i.pravatar.cc/150?img=59" },
  { name: "নাসরিন সুলতানা", rating: 5, text: "ব্ল্যাক ফরেস্ট চেরি কেকের হুইপড ক্রিম একদম হালকা ও পরিমিত মিষ্টি। এখন থেকে সব অনুষ্ঠানের কেক ড্রিম বেকারি থেকেই নিব।", avatar: "https://i.pravatar.cc/150?img=45" },
];

const fallbackReviewsEn: Review[] = [
  { name: "Rahima Akter", rating: 5, text: "Ordered the Belgian Chocolate Truffle Cake for my daughter's birthday. Moist sponge and rich dark chocolate ganache — best cake in town! Thank you Dream Bakery!", avatar: "https://i.pravatar.cc/150?img=47" },
  { name: "Abdul Malek", rating: 5, text: "Got the French Butter Croissants and Artisan Sourdough Bread for breakfast. Truly flaky, golden, and smelled like pure French butter!", avatar: "https://i.pravatar.cc/150?img=12" },
  { name: "Tanvir Hasan", rating: 5, text: "Received the Red Velvet Cream Cheese Cake right on time. The cream cheese frosting is authentic and perfectly balanced.", avatar: "https://i.pravatar.cc/150?img=15" },
  { name: "Fatema Begum", rating: 5, text: "Their glazed Cinnamon Rolls and Fudgy Walnut Brownies melt in the mouth! My kids absolutely love them.", avatar: "https://i.pravatar.cc/150?img=49" },
  { name: "Karim Uddin", rating: 5, text: "The Classic Tiramisu Pastry and Belgian Choco Chip Cookies taste like a luxury European patisserie. Packaging was super neat.", avatar: "https://i.pravatar.cc/150?img=57" },
  { name: "Sabina Yasmin", rating: 5, text: "Sent the Assorted Gourmet Cupcakes Box as a gift. Gorgeous buttercream swirls and every flavor was delicious!", avatar: "https://i.pravatar.cc/150?img=44" },
  { name: "Md Rasel Mia", rating: 5, text: "The Crispy Chicken Puff Pastries arrived warm and flaky with generous savory chicken filling. Highly recommended!", avatar: "https://i.pravatar.cc/150?img=59" },
  { name: "Nasrin Sultana", rating: 5, text: "The Black Forest Cherry Cake had light, fresh whipped cream and real cherries. Dream Bakery is now our go-to cake shop.", avatar: "https://i.pravatar.cc/150?img=45" },
];

const initialFrom = (name: string) => (name?.trim()?.charAt(0) || "?").toUpperCase();

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="flex-shrink-0 w-[280px] md:w-[320px]">
    <div className="bg-card border rounded-xl p-6 text-center hover:shadow-md transition-shadow h-full">
      <div className="flex justify-center mb-3">
        {review.avatar ? (
          <img
            src={review.avatar}
            alt={review.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
            {initialFrom(review.name)}
          </div>
        )}
      </div>
      <div className="flex justify-center gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} className={`h-4 w-4 ${j < review.rating ? "fill-accent text-accent" : "text-muted"}`} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{review.text}</p>
      <p className="font-semibold text-sm">{review.name}</p>
    </div>
  </div>
);

const CustomerReviews = () => {
  const { language, t } = useLanguage();
  const { data } = useQuery({
    queryKey: ["home-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("customer_name, rating, review_text, avatar_url")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      return (data as any[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const reviews: Review[] = (data && data.length > 0)
    ? data.map((r) => ({ name: r.customer_name, rating: r.rating, text: r.review_text, avatar: r.avatar_url || "" }))
    : (language === "en" ? fallbackReviewsEn : fallbackReviewsBn);

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-2">{t("customer_reviews")}</h2>
      <p className="text-center text-muted-foreground mb-6">{t("customer_reviews_subtitle")}</p>
      <div className="overflow-hidden">
        <div className="reviews-marquee">
          {reviews.map((review, i) => (
            <ReviewCard key={`a-${i}`} review={review} />
          ))}
          {reviews.map((review, i) => (
            <ReviewCard key={`b-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;

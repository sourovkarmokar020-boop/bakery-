import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveLocalImageUrl } from "@/lib/productImages";
import { useLanguage } from "@/context/LanguageContext";
const blog1 = "/assets/uploads/banners/bakery-promo-1.webp";
const blog2 = "/assets/uploads/banners/bakery-promo-2.webp";
const blog3 = "/assets/uploads/banners/bakery-promo-3.webp";

export const blogs = [
  {
    title: "জন্মদিন বা বিশেষ অনুষ্ঠানের জন্য সেরা কেক কীভাবে বেছে নেবেন?",
    slug: "how-to-choose-perfect-celebration-cake",
    excerpt: "যেকোনো আনন্দ উদযাপনের মূল আকর্ষণ থাকে একটি সুস্বাদু কেক। ফ্লেভার, ওজন ও ফ্রস্টিং বাছাইয়ের সহজ গাইড...",
    content: `যেকোনো জন্মদিন, অ্যানিভার্সারি বা বিশেষ উদযাপনের মূল আকর্ষণ থাকে একটি সুন্দর ও সুস্বাদু কেক। সঠিক কেক বেছে নেওয়ার সময় কিছু বিষয় মাথায় রাখা জরুরি।

১. ফ্লেভার নির্বাচন: চকলেট প্রেমীদের জন্য বেলজিয়ান ডার্ক চকলেট ট্রাফল বা ফাজ কেক সেরা। আর যারা হালকা ক্রিমি স্বাদ পছন্দ করেন, তাদের জন্য রেড ভেলভেট ক্রিম চিজ অথবা ফ্রেশ স্ট্রবেরি ভ্যানিলা কেক আদর্শ।

২. সঠিক ওজন নির্ধারণ: ১০-১২ জন অতিথির জন্য ১ পাউন্ড থেকে ১.৫ পাউন্ড কেক যথেষ্ট, আর ২০-২৫ জনের পার্টির জন্য ২ থেকে ৩ পাউন্ড লেয়ার্ড কেক নেওয়া ভালো।

Dream Bakery-তে আমরা ১০০% খাঁটি বাটার, বেলজিয়ান কভারচার চকলেট এবং প্রতিদিন তাজা বেক করা স্পঞ্জ দিয়ে প্রতিটি কেক তৈরি করি।`,
    category: "HEALTH TIPS",
    date: "20 নভে",
    image: blog1,
  },
  {
    title: "খাঁটি ফ্রেঞ্চ বাটার ক্রসাঁ এত খাস্তা ও সুস্বাদু কেন হয়?",
    slug: "secret-behind-flaky-french-butter-croissants",
    excerpt: "সকালের কফির সাথে একটি গরম, সোনালি ও খাস্তা ফ্রেঞ্চ ক্রসাঁ অনেকেরই প্রিয়। জেনে নিন ল্যামিনেশন বেকিংয়ের রহস্য...",
    content: `ফ্রেঞ্চ পেস্ট্রির মুকুট বলা হয় বাটার ক্রসাঁকে। বাইরে থেকে মচমচে সোনালি লেয়ার আর ভেতরে মৌচাকের মতো নরম জালি—এর পেছনে রয়েছে বিশেষ 'ল্যামিনেশন' প্রক্রিয়া।

উন্নত মানের ইউরোপিয়ান কালচারড বাটার এবং ঠান্ডা ডো বারবার ভাঁজ করে ২৭ থেকে ৫৫টি সূক্ষ্ম স্তর তৈরি করা হয়। ওভেনের উত্তাপে বাটারের জলীয় বাষ্প প্রতিটি স্তরকে ফুলিয়ে তোলে।

ড্রিম বেকারিতে প্রতিদিন ভোরে আমাদের শেফরা তাজা ক্রসাঁ, ড্যানিশ পেস্ট্রি ও সিনামন রোল বেক করেন, যা সরাসরি আপনার টেবিলে পৌঁছে যায়।`,
    category: "HEALTH TIPS",
    image: blog2,
    date: "18 নভে",
  },
  {
    title: "আর্টিজান সাওয়ারডো ব্রেড: কেন এটি সাধারণ পাউরুটির চেয়ে বেশি স্বাস্থ্যকর?",
    slug: "artisan-sourdough-bread-health-benefits",
    excerpt: "প্রাকৃতিক ফার্মেন্টেশনে তৈরি সাওয়ারডো ব্রেড হজমে সহায়ক এবং পুষ্টিগুণে ভরপুর। জানুন কেন এটি প্রতিদিনের নাস্তায় রাখা উচিত...",
    content: `সাওয়ারডো (Sourdough) ব্রেড হলো প্রাচীনতম ও সবচেয়ে স্বাস্থ্যকর ব্রেড তৈরির পদ্ধতি। এতে বাণিজ্যিক ইস্টের বদলে প্রাকৃতিক ওয়াইল্ড ইস্ট ও ল্যাকটিক অ্যাসিড ব্যাকটেরিয়া ব্যবহার করে দীর্ঘ ২৪-৩৬ ঘণ্টা ফার্মেন্টেশন করা হয়।

দীর্ঘ ফার্মেন্টেশনের কারণে গমের গ্লুটেন ভেঙে সহজপাচ্য হয়ে ওঠে এবং ব্রেডের গ্লাইসেমিক ইনডেক্স কমে যায়। ফলে এটি রক্তে শর্করার মাত্রা হঠাৎ বাড়ায় না এবং অন্তরের সুস্বাস্থ্য বজায় রাখে।

Dream Bakery-র আর্টিজান সাওয়ারডো লোফ সম্পূর্ণ প্রিজারভেটিভ-মুক্ত এবং প্রতিদিন তাজা বেক করা হয়।`,
    category: "GENERAL TIPS",
    image: blog3,
    date: "15 নভে",
  },
];

import { getLocalizedField, getLocalizedTitle } from "@/context/LanguageContext";

// DB-র ব্লগকে hardcoded ব্লগের আকারে ম্যাপ করা হয়
export const mapDbBlog = (b: any, language: "en" | "bn") => {
  const title = getLocalizedTitle(b, language);
  const excerpt = getLocalizedField(b, "excerpt", language);
  const content = getLocalizedField(b, "content", language);
  const dbCategory = getLocalizedField(b, "category", language);
  const category = dbCategory === "HEALTH TIPS" 
    ? (language === "en" ? "HEALTH TIPS" : "হেলথ টিপস") 
    : (dbCategory === "GENERAL TIPS" ? (language === "en" ? "GENERAL TIPS" : "সাধারণ টিপস") : dbCategory);

  return {
    title,
    slug: b.slug,
    excerpt: excerpt || "",
    content: content || "",
    category,
    date: b.created_at ? new Date(b.created_at).toLocaleDateString(language === "en" ? "en-US" : "bn-BD", { day: "numeric", month: "short" }) : "",
    image: resolveLocalImageUrl(b.image_url) || blog1,
  };
};

export const useDbBlogs = () => {
  const { language } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await supabase.from("blogs").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return (data || []) as any[];
    },
    staleTime: 30 * 1000, // ৩০ সেকেন্ড পর পুরনো ব্লগ আবার ফেচ হবে
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const localizedFallback = blogs.map(b => ({
    ...b,
    category: b.category === "HEALTH TIPS" && language === "bn" ? "হেলথ টিপস" : (b.category === "GENERAL TIPS" && language === "bn" ? "সাধারণ টিপস" : b.category),
    date: b.date === "26 ফেব্রু" && language === "en" ? "Feb 26" : (b.date === "21 ফেব্রু" && language === "en" ? "Feb 21" : (b.date === "14 ফেব্রু" && language === "en" ? "Feb 14" : b.date))
  }));

  // DB তে ব্লগ থাকলে সেগুলোই, নাহলে আগের hardcoded গুলো
  return { list: data && data.length > 0 ? data.map(b => mapDbBlog(b, language)) : localizedFallback, loading: isLoading };
};

const BlogSection = () => {
  const { list: blogList } = useDbBlogs();
  const { t } = useLanguage();
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">{t("read_new_blogs")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogList.slice(0, 3).map((blog, i) => (
          <Link to={`/blog/${blog.slug}`} key={i}>
            <div className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer h-full">
              <div className="aspect-video overflow-hidden">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground text-[10px]">{blog.category}</Badge>
                  <span className="text-xs text-muted-foreground">{blog.date}</span>
                </div>
                <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;

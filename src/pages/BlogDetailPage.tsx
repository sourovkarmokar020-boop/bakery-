import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useDbBlogs } from "@/components/BlogSection";
import { useLanguage } from "@/context/LanguageContext";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const { list: blogList, loading } = useDbBlogs();
  const blog = blogList.find((b) => b.slug === slug);

  // SEO: ব্লগ পেজে গেলে টাইটেল আর মেটা ডেসক্রিপশন ব্লগেরটা হয়
  useEffect(() => {
    if (!blog) return;
    const prevTitle = document.title;
    document.title = blog.title;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") || "";
    if (meta && blog.excerpt) meta.setAttribute("content", blog.excerpt);
    return () => {
      document.title = prevTitle;
      if (meta) meta.setAttribute("content", prevDesc);
    };
  }, [blog]);

  if (!blog && loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          {language === "en" ? "Loading..." : "লোড হচ্ছে..."}
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === "en" ? "Blog not found" : "ব্লগ পাওয়া যায়নি"}
          </h1>
          <Link to="/"><Button>{language === "en" ? "Back to Home" : "হোমে ফিরে যান"}</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> {language === "en" ? "Back to Home" : "হোমে ফিরে যান"}
        </Link>
        <img src={blog.image} alt={blog.title} className="w-full rounded-xl mb-6 aspect-video object-cover" />
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-primary text-primary-foreground text-xs">{blog.category}</Badge>
          <span className="text-sm text-muted-foreground">{blog.date}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{blog.title}</h1>
        {/<[a-z][\s\S]*>/i.test(blog.content) ? (
          // রিচ এডিটরে লেখা ব্লগ (HTML) — heading/bold/list সহ দেখায়
          <div
            className="prose max-w-none text-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_img]:rounded-lg [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        ) : (
          <div className="prose prose-sm max-w-none text-foreground">
            {blog.content.split("\n\n").map((para, i) => (
              <p key={i} className="mb-4 leading-relaxed text-muted-foreground">{para}</p>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default BlogDetailPage;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import TopBanner from '@/components/TopBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Loader2 } from 'lucide-react';
import { useLanguage, getLocalizedTitle, getLocalizedField } from '@/context/LanguageContext';

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    setLoading(true);
    const { data } = await supabase.from('pages').select('*').eq('slug', slug).single();
    setPage(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <TopBanner />
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {language === 'en' ? 'Page not found' : 'পেজ পাওয়া যায়নি'}
          </h1>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBanner />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{getLocalizedTitle(page, language)}</h1>
          <div
            className="prose prose-lg prose-stone mx-auto"
            dangerouslySetInnerHTML={{ __html: getLocalizedField(page, 'content', language) || '' }}
          />
        </article>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

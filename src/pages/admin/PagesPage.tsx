import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface Page {
  id: string;
  title: string;
  title_en?: string;
  title_bn?: string;
  slug: string;
  content: string;
  content_en?: string;
  content_bn?: string;
  created_at: string;
  updated_at: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [editPage, setEditPage] = useState<Partial<Page> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data } = await supabase.from('pages').select('*').order('updated_at', { ascending: false });
    setPages(data || []);
    setLoading(false);
  };

  const newPage = () => {
    setEditPage({
      title: '',
      title_en: '',
      title_bn: '',
      slug: '',
      content: '',
      content_en: '',
      content_bn: ''
    });
    setDialogOpen(true);
  };

  const editPageBtn = (page: Page) => {
    setEditPage({
      ...page,
      title_en: page.title_en || page.title || '',
      title_bn: page.title_bn || page.title || '',
      content_en: page.content_en || page.content || '',
      content_bn: page.content_bn || page.content || '',
    });
    setDialogOpen(true);
  };

  const savePage = async () => {
    if (!editPage?.title_en?.trim() || !editPage?.title_bn?.trim()) {
      toast({ title: 'ইংরেজি ও বাংলা উভয় ভাষার পেজ টাইটেল দিন', variant: 'destructive' });
      return;
    }
    if (!editPage?.slug?.trim()) {
      toast({ title: 'Slug দিন', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const title = editPage.title_bn || editPage.title_en;
      const content = editPage.content_bn || editPage.content_en || '';
      const payload = {
        title,
        title_en: editPage.title_en,
        title_bn: editPage.title_bn,
        slug: editPage.slug,
        content,
        content_en: editPage.content_en || '',
        content_bn: editPage.content_bn || ''
      };
      if (editPage?.id) {
        await supabase
          .from('pages')
          .update(payload)
          .eq('id', editPage.id);
        toast({ title: 'পেজ আপডেট হয়েছে ✅' });
      } else {
        await supabase
          .from('pages')
          .insert(payload);
        toast({ title: 'পেজ তৈরি হয়েছে ✅' });
      }
      setDialogOpen(false);
      fetchPages();
    } catch (error: any) {
      toast({ title: 'সেভ করতে পারছি না', description: error?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    try {
      await supabase.from('pages').delete().eq('id', id);
      toast({ title: 'পেজ মুছে ফেলা হয়েছে ✅' });
      fetchPages();
    } catch (error: any) {
      toast({ title: 'মুছতে পারছি না', description: error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">পেজ ম্যানেজ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {pages.length}টি পেজ</p>
        </div>
        <Button className="rounded-full" onClick={newPage}><Plus className="w-4 h-4 mr-1" /> নতুন পেজ</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">টাইটেল</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Slug</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">আপডেট</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">কোনো পেজ নেই</td></tr>
                  ) : (
                    pages.map((page) => (
                      <tr key={page.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-medium">{page.title}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{page.slug}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs">
                          {new Date(page.updated_at).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => editPageBtn(page)}
                              className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors"
                              title="এডিট"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePage(page.id)}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                              title="ডিলিট"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editPage?.id ? 'এডিট পেজ' : 'নতুন পেজ'}</DialogTitle>
          </DialogHeader>
          {editPage && (
            <div className="flex-1 flex flex-col overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title_en">টাইটেল (English) *</Label>
                  <Input
                    id="title_en"
                    value={editPage.title_en || ''}
                    onChange={(e) => {
                      const newTitleEn = e.target.value;
                      const newSlug = newTitleEn.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                      setEditPage({ ...editPage, title_en: newTitleEn, slug: editPage.id ? editPage.slug : newSlug });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title_bn">টাইটেল (বাংলা) *</Label>
                  <Input
                    id="title_bn"
                    value={editPage.title_bn || ''}
                    onChange={(e) => setEditPage({ ...editPage, title_bn: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={editPage.slug || ''}
                  onChange={(e) => setEditPage({ ...editPage, slug: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[500px]">
                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="content_en">কন্টেন্ট (English)</Label>
                  <div className="flex-1 min-h-[450px]">
                    <RichTextEditor
                      value={editPage.content_en || ''}
                      onChange={(content) => setEditPage({ ...editPage, content_en: content })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="content_bn">কন্টেন্ট (বাংলা)</Label>
                  <div className="flex-1 min-h-[450px]">
                    <RichTextEditor
                      value={editPage.content_bn || ''}
                      onChange={(content) => setEditPage({ ...editPage, content_bn: content })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t mt-4 shrink-0">
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                  বাতিল
                </Button>
                <Button onClick={savePage} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

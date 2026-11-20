import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import SettingsImageUpload from "@/components/admin/SettingsImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface Blog {
  id?: string;
  title: string;
  title_en?: string;
  title_bn?: string;
  slug: string;
  excerpt: string;
  excerpt_en?: string;
  excerpt_bn?: string;
  content: string;
  content_en?: string;
  content_bn?: string;
  category: string;
  category_en?: string;
  category_bn?: string;
  image_url: string;
  focus_keyword: string;
  is_active: boolean;
  created_at?: string;
}

const emptyBlog: Blog = {
  title: "",
  title_en: "",
  title_bn: "",
  slug: "",
  excerpt: "",
  excerpt_en: "",
  excerpt_bn: "",
  content: "",
  content_en: "",
  content_bn: "",
  category: "HEALTH TIPS",
  category_en: "HEALTH TIPS",
  category_bn: "স্বাস্থ্য টিপস",
  image_url: "",
  focus_keyword: "",
  is_active: true
};

const makeSlug = (title: string) =>
  title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "").slice(0, 80);

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// লিস্টের row (DB থেকে আসা, null থাকতে পারে) থেকে স্কোর হিসাব
const seoScoreOf = (b: any) => {
  const checks = seoChecks({
    ...b,
    title: b.title_en || b.title || "",
    slug: b.slug || "",
    excerpt: b.excerpt_en || b.excerpt || "",
    content: b.content_en || b.content || "",
    category: b.category_en || b.category || "",
    image_url: b.image_url || "",
    focus_keyword: b.focus_keyword || "",
    is_active: b.is_active ?? true,
  });
  return Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
};

const scoreBadgeClass = (score: number) =>
  score >= 80
    ? "bg-green-100 text-green-700 border-green-300"
    : score >= 50
      ? "bg-amber-100 text-amber-700 border-amber-300"
      : "bg-red-100 text-red-700 border-red-300";

// Yoast-এর মতো SEO স্কোর: প্রতিটা check pass/fail, শতাংশ = pass/মোট
const seoChecks = (blog: Blog) => {
  const kw = blog.focus_keyword.trim().toLowerCase();
  const title = (blog.title_en || blog.title || "").trim();
  const text = stripHtml(blog.content_en || blog.content || "").toLowerCase();
  const words = text ? text.split(/\s+/) : [];
  const excerpt = (blog.excerpt_en || blog.excerpt || "").trim();
  const kwCount = kw ? text.split(kw).length - 1 : 0;
  const density = words.length > 0 && kw ? (kwCount / words.length) * 100 : 0;
  const first100 = words.slice(0, 100).join(" ");

  return [
    { label: "ফোকাস কীওয়ার্ড দেওয়া হয়েছে", pass: kw.length > 0 },
    { label: "টাইটেলে ফোকাস কীওয়ার্ড আছে", pass: !!kw && title.toLowerCase().includes(kw) },
    { label: "টাইটেল ২০–৭০ অক্ষরের মধ্যে", pass: title.length >= 20 && title.length <= 70 },
    { label: "মেটা ডেসক্রিপশন ৫০–১৬০ অক্ষর", pass: excerpt.length >= 50 && excerpt.length <= 160 },
    { label: "মেটা ডেসক্রিপশনে কীওয়ার্ড আছে", pass: !!kw && excerpt.toLowerCase().includes(kw) },
    { label: "লেখার শুরুতে (প্রথম ১০০ শব্দে) কীওয়ার্ড আছে", pass: !!kw && first100.includes(kw) },
    { label: `লেখা কমপক্ষে ৩০০ শব্দ (এখন ${words.length})`, pass: words.length >= 300 },
    { label: "কীওয়ার্ড ডেনসিটি ঠিক আছে (০.৩%–৩%)", pass: density >= 0.3 && density <= 3 },
    { label: "লেখায় সাবহেডিং (H2/H3) আছে", pass: /<h[23][\s>]/i.test(blog.content_en || blog.content || "") },
    { label: "কভার ছবি দেওয়া হয়েছে", pass: !!blog.image_url },
  ];
};

export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editItem, setEditItem] = useState<Blog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setBlogs((data as any[]) || []);
    setLoading(false);
  };

  const save = async () => {
    if (!editItem) return;
    if (!editItem.title_en?.trim() || !editItem.title_bn?.trim() || !editItem.content_en?.trim() || !editItem.content_bn?.trim()) {
      toast({ title: "ইংরেজি ও বাংলা উভয় ভাষার টাইটেল ও লেখা দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const title = editItem.title_bn || editItem.title_en;
    const slugSource = editItem.title_en || title;
    const slug = editItem.slug.trim() || makeSlug(slugSource);
    const excerpt_en = editItem.excerpt_en?.trim() || stripHtml(editItem.content_en).slice(0, 120) + "...";
    const excerpt_bn = editItem.excerpt_bn?.trim() || stripHtml(editItem.content_bn).slice(0, 120) + "...";
    const excerpt = excerpt_bn || excerpt_en;
    const category = editItem.category_bn || editItem.category_en;
    const payload = {
      title,
      title_en: editItem.title_en.trim(),
      title_bn: editItem.title_bn.trim(),
      slug,
      excerpt,
      excerpt_en,
      excerpt_bn,
      content: editItem.content_bn || editItem.content_en,
      content_en: editItem.content_en,
      content_bn: editItem.content_bn,
      category,
      category_en: editItem.category_en?.trim() || null,
      category_bn: editItem.category_bn?.trim() || null,
      image_url: editItem.image_url || null,
      focus_keyword: editItem.focus_keyword.trim() || null,
      is_active: editItem.is_active,
    };
    const { error } = editItem.id
      ? await supabase.from("blogs").update(payload).eq("id", editItem.id)
      : await supabase.from("blogs").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "সেভ ব্যর্থ", description: (error as any)?.message, variant: "destructive" });
      return;
    }
    toast({ title: "ব্লগ সেভ হয়েছে ✅" });
    setDialogOpen(false);
    fetchBlogs();
  };

  const remove = async (id: string) => {
    if (!confirm("ব্লগটি মুছে ফেলবেন?")) return;
    await supabase.from("blogs").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchBlogs();
  };

  const toggleActive = async (blog: Blog) => {
    await supabase.from("blogs").update({ is_active: !blog.is_active }).eq("id", blog.id!);
    fetchBlogs();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ব্লগ ম্যানেজ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">হোমপেজের "নতুন ব্লগ পড়ুন" সেকশনের লেখাগুলো এখান থেকে ম্যানেজ করুন</p>
        </div>
        <Button className="rounded-full" onClick={() => { setEditItem({ ...emptyBlog }); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> নতুন ব্লগ
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="text-left py-3 px-4">ছবি</th>
                  <th className="text-left py-3 px-4">টাইটেল</th>
                  <th className="text-left py-3 px-4">ক্যাটাগরি</th>
                  <th className="text-left py-3 px-4">তারিখ</th>
                  <th className="text-center py-3 px-4">SEO</th>
                  <th className="text-center py-3 px-4">দেখাবে</th>
                  <th className="text-left py-3 px-4">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
                ) : blogs.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">কোনো ব্লগ নেই — "নতুন ব্লগ" চাপুন</td></tr>
                ) : blogs.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 px-4">
                      {b.image_url ? <img src={b.image_url} alt="" className="w-16 h-10 rounded object-cover border" /> : "-"}
                    </td>
                    <td className="py-2 px-4 font-medium max-w-[320px]"><p className="truncate">{b.title}</p></td>
                    <td className="py-2 px-4 text-muted-foreground">{b.category || "-"}</td>
                    <td className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString("bn-BD") : "-"}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {(() => {
                        const score = seoScoreOf(b);
                        return (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold ${scoreBadgeClass(score)}`}
                            title="এডিট খুললে বিস্তারিত SEO চেকলিস্ট দেখা যাবে"
                          >
                            {score}%
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} />
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditItem({ 
                          ...emptyBlog, 
                          ...b, 
                          title_en: b.title_en || b.title || "",
                          title_bn: b.title_bn || b.title || "",
                          excerpt_en: b.excerpt_en || b.excerpt || "",
                          excerpt_bn: b.excerpt_bn || b.excerpt || "",
                          content_en: b.content_en || b.content || "",
                          content_bn: b.content_bn || b.content || "",
                          category_en: b.category_en || b.category || "",
                          category_bn: b.category_bn || b.category || "",
                          image_url: b.image_url || "", 
                          focus_keyword: b.focus_keyword || "" 
                        }); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600" title="এডিট">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(b.id!)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="ডিলিট">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "ব্লগ এডিট" : "নতুন ব্লগ"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>টাইটেল (English) *</Label>
                  <Input value={editItem.title_en || ""} onChange={(e) => setEditItem({ ...editItem, title_en: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>টাইটেল (বাংলা) *</Label>
                  <Input value={editItem.title_bn || ""} onChange={(e) => setEditItem({ ...editItem, title_bn: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ক্যাটাগরি (English)</Label>
                  <Input placeholder="HEALTH TIPS" value={editItem.category_en || ""} onChange={(e) => setEditItem({ ...editItem, category_en: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>ক্যাটাগরি (বাংলা)</Label>
                  <Input placeholder="স্বাস্থ্য টিপস" value={editItem.category_bn || ""} onChange={(e) => setEditItem({ ...editItem, category_bn: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL) — খালি রাখলে টাইটেল (English) থেকে হবে</Label>
                <Input placeholder="blog-url" value={editItem.slug} onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>মেটা ডেসক্রিপশন (English)</Label>
                  <Textarea rows={2} value={editItem.excerpt_en || ""} onChange={(e) => setEditItem({ ...editItem, excerpt_en: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>মেটা ডেসক্রিপশন (বাংলা)</Label>
                  <Textarea rows={2} value={editItem.excerpt_bn || ""} onChange={(e) => setEditItem({ ...editItem, excerpt_bn: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>লেখা (English) *</Label>
                  <RichTextEditor value={editItem.content_en || ""} onChange={(content) => setEditItem({ ...editItem, content_en: content })} />
                </div>
                <div className="space-y-1.5">
                  <Label>লেখা (বাংলা) *</Label>
                  <RichTextEditor value={editItem.content_bn || ""} onChange={(content) => setEditItem({ ...editItem, content_bn: content })} />
                </div>
              </div>

              {/* SEO প্যানেল */}
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="space-y-1.5">
                  <Label>ফোকাস কীওয়ার্ড (SEO) — যে শব্দে Google-এ র‍্যাংক করতে চান</Label>
                  <Input
                    placeholder="যেমন: সরিষা ফুলের মধু"
                    value={editItem.focus_keyword}
                    onChange={(e) => setEditItem({ ...editItem, focus_keyword: e.target.value })}
                  />
                </div>
                {(() => {
                  const checks = seoChecks(editItem);
                  const passed = checks.filter((c) => c.pass).length;
                  const score = Math.round((passed / checks.length) * 100);
                  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
                  const textColor = score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">SEO স্কোর</p>
                        <p className={`text-lg font-bold ${textColor}`}>{score}%</p>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${score}%` }} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                        {checks.map((c) => (
                          <div key={c.label} className="flex items-start gap-1.5 text-xs">
                            {c.pass ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            )}
                            <span className={c.pass ? "text-muted-foreground" : "text-foreground"}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="space-y-1.5">
                <Label>কভার ছবি</Label>
                <SettingsImageUpload imageUrl={editItem.image_url} onChange={(url) => setEditItem({ ...editItem, image_url: url })} folder="blog" label="ছবি আপলোড করুন" />
              </div>
              <div className="flex items-center gap-2">
                <Label>সাইটে দেখাবে</Label>
                <Switch checked={editItem.is_active} onCheckedChange={(v) => setEditItem({ ...editItem, is_active: v })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />} সেভ করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

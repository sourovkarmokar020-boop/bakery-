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
import { Plus, Pencil, Trash2, Loader2, Star, Check, Clock, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id?: string;
  product_id: string | null;
  customer_name: string;
  avatar_url: string | null;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
  products?: { name: string; slug: string } | null;
}

const emptyReview: Review = {
  product_id: null,
  customer_name: "",
  avatar_url: "",
  rating: 5,
  review_text: "",
  is_approved: true,
  is_featured: false,
  sort_order: 0,
};

type FilterKey = "pending" | "all" | "approved" | "featured";

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex text-accent">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={cn("w-3.5 h-3.5", i < rating ? "fill-current" : "text-muted")} />
    ))}
  </div>
);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editItem, setEditItem] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("pending");
  const { toast } = useToast();

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*, products(name, slug)")
      .order("created_at", { ascending: false });
    setReviews((data as any[]) || []);
    setLoading(false);
  };

  const counts = useMemo(() => ({
    pending: reviews.filter((r) => !r.is_approved).length,
    all: reviews.length,
    approved: reviews.filter((r) => r.is_approved).length,
    featured: reviews.filter((r) => r.is_featured).length,
  }), [reviews]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending": return reviews.filter((r) => !r.is_approved);
      case "approved": return reviews.filter((r) => r.is_approved);
      case "featured": return reviews.filter((r) => r.is_featured);
      default: return reviews;
    }
  }, [reviews, filter]);

  const save = async () => {
    if (!editItem) return;
    if (!editItem.customer_name.trim() || !editItem.review_text.trim()) {
      toast({ title: "নাম ও রিভিউ দুটোই দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      product_id: editItem.product_id || null,
      customer_name: editItem.customer_name.trim(),
      avatar_url: editItem.avatar_url || null,
      rating: editItem.rating,
      review_text: editItem.review_text.trim(),
      is_approved: editItem.is_approved,
      is_featured: editItem.is_featured,
      sort_order: Number(editItem.sort_order) || 0,
    };
    const { error } = editItem.id
      ? await supabase.from("reviews").update(payload).eq("id", editItem.id)
      : await supabase.from("reviews").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "সেভ ব্যর্থ", description: (error as any)?.message, variant: "destructive" });
      return;
    }
    toast({ title: "রিভিউ সেভ হয়েছে ✅" });
    setDialogOpen(false);
    fetchReviews();
  };

  const remove = async (id: string) => {
    if (!confirm("রিভিউটি মুছে ফেলবেন?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchReviews();
  };

  const patch = async (r: Review, changes: Partial<Review>) => {
    // Optimistic — সঙ্গে সঙ্গে UI আপডেট, তারপর DB
    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...changes } : x)));
    await supabase.from("reviews").update(changes).eq("id", r.id!);
  };

  const filterTabs: { key: FilterKey; label: string }[] = [
    { key: "pending", label: `অনুমোদনের অপেক্ষায় (${counts.pending})` },
    { key: "approved", label: `অনুমোদিত (${counts.approved})` },
    { key: "featured", label: `হোমপেজে (${counts.featured})` },
    { key: "all", label: `সব (${counts.all})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">রিভিউ ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            কাস্টমারের রিভিউ অনুমোদন করুন, এডিট করুন। "হোমপেজে দেখাবে" চালু করলে হোমের গ্রাহক অভিজ্ঞতা সেকশনে যোগ হবে।
          </p>
        </div>
        <Button className="rounded-full" onClick={() => { setEditItem({ ...emptyReview }); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> নতুন রিভিউ
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
              filter === t.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="text-left py-3 px-4">গ্রাহক</th>
                  <th className="text-left py-3 px-4">রিভিউ</th>
                  <th className="text-left py-3 px-4">পণ্য</th>
                  <th className="text-center py-3 px-4">অনুমোদন</th>
                  <th className="text-center py-3 px-4">হোমপেজে</th>
                  <th className="text-left py-3 px-4">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">লোড হচ্ছে...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">এই ফিল্টারে কোনো রিভিউ নেই</td></tr>
                ) : filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 align-top">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 min-w-[150px]">
                        {r.avatar_url ? (
                          <img src={r.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                            {(r.customer_name?.charAt(0) || "?").toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium leading-tight">{r.customer_name}</p>
                          <StarRow rating={r.rating} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[340px]">
                      <p className="text-muted-foreground line-clamp-2">{r.review_text}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {r.products?.name ? (
                        <span className="text-foreground">{r.products.name}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Home className="w-3.5 h-3.5" /> হোম / সাধারণ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Switch checked={r.is_approved} onCheckedChange={(v) => patch(r, { is_approved: v })} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Switch checked={r.is_featured} onCheckedChange={(v) => patch(r, { is_featured: v })} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {!r.is_approved && (
                          <button onClick={() => patch(r, { is_approved: true })} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600" title="অনুমোদন করুন">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => { setEditItem({ ...emptyReview, ...r, avatar_url: r.avatar_url || "" }); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600" title="এডিট">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(r.id!)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="ডিলিট">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "রিভিউ এডিট" : "নতুন রিভিউ"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>গ্রাহকের নাম *</Label>
                <Input value={editItem.customer_name} onChange={(e) => setEditItem({ ...editItem, customer_name: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>রেটিং</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setEditItem({ ...editItem, rating: n })} className="focus:outline-none">
                      <Star className={cn("w-7 h-7", n <= editItem.rating ? "fill-accent text-accent" : "text-muted")} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>রিভিউ *</Label>
                <Textarea rows={3} value={editItem.review_text} onChange={(e) => setEditItem({ ...editItem, review_text: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label>গ্রাহকের ছবি (ঐচ্ছিক — না দিলে নামের প্রথম অক্ষর দেখাবে)</Label>
                <SettingsImageUpload imageUrl={editItem.avatar_url || ""} onChange={(url) => setEditItem({ ...editItem, avatar_url: url })} folder="reviews" label="ছবি আপলোড করুন" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <Label className="cursor-pointer">অনুমোদিত</Label>
                  </div>
                  <Switch checked={editItem.is_approved} onCheckedChange={(v) => setEditItem({ ...editItem, is_approved: v })} />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    <Label className="cursor-pointer">হোমপেজে</Label>
                  </div>
                  <Switch checked={editItem.is_featured} onCheckedChange={(v) => setEditItem({ ...editItem, is_featured: v })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>সর্ট অর্ডার (হোমপেজে কম নম্বর আগে দেখাবে)</Label>
                <Input type="number" value={editItem.sort_order} onChange={(e) => setEditItem({ ...editItem, sort_order: Number(e.target.value) })} />
              </div>

              {editItem.products?.name && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> এই রিভিউটি "{editItem.products.name}" পণ্যের জন্য দেওয়া হয়েছে।
                </p>
              )}

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

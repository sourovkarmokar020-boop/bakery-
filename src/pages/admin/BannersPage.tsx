import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import BannerImageUpload from "@/components/admin/BannerImageUpload";
import { resolveLocalImageUrl } from "@/lib/productImages";

const PLACEMENTS: Record<string, string> = {
  hero: "হিরো স্লাইডার (উপরের বড় ব্যানার)",
  fashion: "ফ্যাশন সেল সেকশন (৩টি ব্যানার)",
};

const getBannerPreviewUrl = (banner: any): string => {
  const url = resolveLocalImageUrl(banner.image_url);
  if (!url || !banner.updated_at) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(banner.updated_at)}`;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetch = async () => { const { data } = await supabase.from("banners").select("*").order("sort_order"); setBanners(data || []); };

  useEffect(() => {
    fetch();

    const refresh = () => fetch();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const save = async () => {
    const title = editItem.title_bn || editItem.title_en || editItem.title || "";
    const payload = {
      ...editItem,
      title,
      title_en: editItem.title_en || editItem.title || "",
      title_bn: editItem.title_bn || editItem.title || "",
    };
    if (editItem.id) { await supabase.from("banners").update(payload).eq("id", editItem.id); }
    else { await supabase.from("banners").insert(payload); }
    toast({ title: "সেভ হয়েছে" });
    setDialogOpen(false); fetch();
  };

  const newBanner = () => {
    setEditItem({
      title: "",
      title_en: "",
      title_bn: "",
      image_url: "",
      redirect_url: "",
      placement: "hero",
      is_active: true,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const editBanner = (b: any) => {
    setEditItem({
      ...b,
      title_en: b.title_en || b.title || "",
      title_bn: b.title_bn || b.title || "",
      placement: b.placement || "hero",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ব্যানার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {banners.length}টি ব্যানার</p>
        </div>
        <Button className="rounded-full" onClick={newBanner}><Plus className="w-4 h-4 mr-1" /> নতুন</Button>
      </div>
      <Card className="border-none shadow-sm"><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ছবি</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">টাইটেল</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">সেকশন</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">স্ট্যাটাস</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
            </tr></thead>
            <tbody>
              {banners.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">কোনো ব্যানার পাওয়া যায়নি</td></tr>
              ) : banners.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4"><img src={getBannerPreviewUrl(b)} alt={b.title || "Banner"} className="w-24 h-12 rounded-lg object-cover" /></td>
                  <td className="py-2.5 px-4">{b.title || '-'}</td>
                  <td className="py-2.5 px-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${(b.placement || 'hero') === 'fashion' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{(b.placement || 'hero') === 'fashion' ? 'ফ্যাশন সেল' : 'হিরো স্লাইডার'}</span></td>
                  <td className="py-2.5 px-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${b.is_active ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => editBanner(b)} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors" title="এডিট"><Pencil className="w-4 h-4" /></button>
                      <button onClick={async () => { await supabase.from("banners").delete().eq("id", b.id); fetch(); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="ডিলিট"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? "এডিট" : "নতুন ব্যানার"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>টাইটেল (English)</Label>
                  <Input value={editItem.title_en || ''} onChange={(e) => setEditItem({ ...editItem, title_en: e.target.value })} />
                </div>
                <div>
                  <Label>টাইটেল (বাংলা)</Label>
                  <Input value={editItem.title_bn || ''} onChange={(e) => setEditItem({ ...editItem, title_bn: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>কোন সেকশনে দেখাবে *</Label>
                <Select value={editItem.placement || "hero"} onValueChange={(v) => setEditItem({ ...editItem, placement: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLACEMENTS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ব্যানার ইমেজ *</Label>
                <BannerImageUpload imageUrl={resolveLocalImageUrl(editItem.image_url) || ''} onChange={(url) => setEditItem({ ...editItem, image_url: url })} />
              </div>
              <div><Label>ইমেজ URL (নিজে লিখতে চাইলে)</Label><Input value={editItem.image_url} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} /></div>
              <div><Label>রিডাইরেক্ট URL (ক্লিক করলে যেখানে যাবে)</Label><Input placeholder="/categories বা /product/xyz" value={editItem.redirect_url || ''} onChange={(e) => setEditItem({ ...editItem, redirect_url: e.target.value })} /></div>
              <div><Label>সিরিয়াল</Label><Input type="number" value={editItem.sort_order ?? 0} onChange={(e) => setEditItem({ ...editItem, sort_order: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editItem.is_active} onCheckedChange={(v) => setEditItem({ ...editItem, is_active: v })} /><Label>Active</Label></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button><Button onClick={save} disabled={!editItem.image_url}>সেভ</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

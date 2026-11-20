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
import CategoryImageUpload from "@/components/admin/CategoryImageUpload";
import { getCategoryImage } from "@/lib/categoryImages";
import { getCategoryPath, categoryLevelLabel } from "@/lib/categoryPath";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => { fetchCats(); }, []);

  const fetchCats = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  };

  // Collect every descendant id of a category (any depth) — used to stop a
  // category from being set as its own child/grandchild (which would loop).
  const collectDescendants = (id: string): string[] => {
    const ids: string[] = [];
    const stack = categories.filter(c => c.parent_id === id).map(c => c.id);
    while (stack.length) {
      const cur = stack.pop() as string;
      ids.push(cur);
      categories.filter(c => c.parent_id === cur).forEach(c => stack.push(c.id));
    }
    return ids;
  };

  const save = async () => {
    if (!editItem.name_en?.trim() || !editItem.name_bn?.trim()) {
      toast({ title: "ইংরেজি ও বাংলা নাম উভয়ই দিন", variant: "destructive" });
      return;
    }
    const name = editItem.name_bn || editItem.name_en;
    const slugSource = editItem.name_en || name;
    const slug = editItem.slug || slugSource.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const payload = {
      ...editItem,
      name,
      slug,
      image_url: imageRemoved ? null : (editItem.image_url || null),
    };
    let error: any = null;
    if (editItem.id) {
      ({ error } = await supabase.from("categories").update(payload).eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("categories").insert(payload));
    }
    if (error) {
      toast({
        title: "ক্যাটাগরি সেভ করা যায়নি",
        description: error?.message || "আবার চেষ্টা করুন",
        variant: "destructive",
      });
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["nav-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["home-top-categories"] }),
    ]);
    toast({ title: "সেভ হয়েছে" });
    setDialogOpen(false);
    await fetchCats();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchCats();
  };

  const toggleField = async (id: string, field: string, current: boolean) => {
    const nextValue = !current;
    setCategories((items) => items.map((item) => item.id === id ? { ...item, [field]: nextValue } : item));
    const { error } = await supabase.from("categories").update({ [field]: nextValue }).eq("id", id);
    if (error) {
      setCategories((items) => items.map((item) => item.id === id ? { ...item, [field]: current } : item));
      toast({
        title: "সেটিংস আপডেট করা যায়নি",
        description: (error as any)?.message || "আবার চেষ্টা করুন",
        variant: "destructive",
      });
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["nav-categories"] }),
      queryClient.invalidateQueries({ queryKey: ["home-top-categories"] }),
    ]);
    const labels: Record<string, [string, string]> = {
      show_in_navbar: ["নেভবারে যোগ হয়েছে", "নেভবার থেকে সরানো হয়েছে"],
      show_on_home: ["হোম পেজে যোগ হয়েছে", "হোম পেজ থেকে সরানো হয়েছে"],
      is_active: ["মেনুতে যোগ হয়েছে", "মেনু থেকে সরানো হয়েছে"],
    };
    const [on, off] = labels[field] || ["চালু", "বন্ধ"];
    toast({ title: !current ? on : off });
    await fetchCats();
  };

  const updateSortOrder = async (id: string, value: number) => {
    await supabase.from("categories").update({ sort_order: value }).eq("id", id);
    fetchCats();
  };

  const navbarCount = categories.filter(c => c.show_in_navbar).length;
  const homeCount = categories.filter(c => c.show_on_home).length;

  // Depth-ordered flat list (parent → child → grand-child) for the table.
  const orderedCategories = (() => {
    const bySort = (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0);
    const result: { cat: any; depth: number }[] = [];
    const walk = (parentId: string | null, depth: number) => {
      categories
        .filter(c => (c.parent_id || null) === parentId)
        .sort(bySort)
        .forEach(c => {
          result.push({ cat: c, depth });
          walk(c.id, depth + 1);
        });
    };
    walk(null, 0);
    return result;
  })();

  const newCategory = () => {
    setImageRemoved(false);
    setEditItem({
      name: "",
      name_en: "",
      name_bn: "",
      slug: "",
      image_url: "",
      parent_id: null,
      sort_order: 0,
      is_active: true,
      show_in_navbar: false,
      show_on_home: false,
    });
    setDialogOpen(true);
  };

  const editCategory = (c: any) => {
    setImageRemoved(false);
    setEditItem({
      ...c,
      name_en: c.name_en || c.name || "",
      name_bn: c.name_bn || c.name || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ক্যাটাগরি ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground mt-1">
            নেভবার: {navbarCount}টি | হোম পেজ: {homeCount}টি
          </p>
        </div>
        <Button onClick={newCategory}>
          <Plus className="w-4 h-4 mr-1" /> নতুন
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ইমেজ</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">নাম</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Slug</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">সিরিয়াল</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">হোম এ দেখাবো</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">নেভবার</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">মেনু</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
            </tr></thead>
            <tbody>
              {orderedCategories.map(({ cat: c, depth }) => (
                <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${depth > 0 ? 'bg-muted/10' : ''}`}>
                  <td className="py-2 px-4">
                    {(getCategoryImage(c.slug, c.image_url)) ? (
                      <img src={getCategoryImage(c.slug, c.image_url)} alt={c.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">—</div>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <div style={{ paddingLeft: `${depth * 20}px` }}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          depth === 0 ? 'bg-primary/10 text-primary'
                          : depth === 1 ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {categoryLevelLabel(depth)}
                        </span>
                        <span className="font-medium">{depth > 0 ? '↳ ' : ''}{c.name}</span>
                      </div>
                      {depth > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {getCategoryPath(categories, c.id).join(' → ')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4 text-muted-foreground">{c.slug}</td>
                  <td className="py-2 px-3 text-center">
                    <Input
                      type="number"
                      className="w-16 h-8 text-center mx-auto"
                      defaultValue={c.sort_order || 0}
                      onBlur={(e) => updateSortOrder(c.id, Number(e.target.value) || 0)}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    {!c.parent_id && (
                      <Switch
                        checked={!!c.show_on_home}
                        onCheckedChange={() => toggleField(c.id, "show_on_home", !!c.show_on_home)}
                      />
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Switch
                      checked={!!c.show_in_navbar}
                      onCheckedChange={() => toggleField(c.id, "show_in_navbar", !!c.show_in_navbar)}
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Switch
                      checked={!!c.is_active}
                      onCheckedChange={() => toggleField(c.id, "is_active", !!c.is_active)}
                    />
                  </td>
                  <td className="py-2 px-4 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => editCategory(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? "এডিট" : "নতুন ক্যাটাগরি"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>নাম (English) *</Label>
                  <Input value={editItem.name_en || ""} onChange={(e) => setEditItem({ ...editItem, name_en: e.target.value })} />
                </div>
                <div>
                  <Label>নাম (বাংলা) *</Label>
                  <Input value={editItem.name_bn || ""} onChange={(e) => setEditItem({ ...editItem, name_bn: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Parent ক্যাটাগরি</Label>
                <Select value={editItem.parent_id || "none"} onValueChange={(v) => setEditItem({ ...editItem, parent_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— কোনোটি নয় (মেইন ক্যাটাগরি) —</SelectItem>
                    {(() => {
                      const blocked = editItem.id ? new Set([editItem.id, ...collectDescendants(editItem.id)]) : new Set();
                      return orderedCategories
                        .filter(({ cat }) => !blocked.has(cat.id))
                        .map(({ cat }) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {getCategoryPath(categories, cat.id).join(' → ')}
                          </SelectItem>
                        ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ক্যাটাগরি ইমেজ</Label>
                <CategoryImageUpload
                  imageUrl={imageRemoved ? "" : getCategoryImage(editItem.slug, editItem.image_url)}
                  onChange={(url) => {
                    const removed = url === "";
                    setImageRemoved(removed);
                    setEditItem((current: any) => ({
                      ...current,
                      image_url: removed ? null : url,
                    }));
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>নেভবারে দেখান</Label>
                <Switch checked={!!editItem.show_in_navbar} onCheckedChange={(v) => setEditItem({ ...editItem, show_in_navbar: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>হোম পেজে দেখান</Label>
                <Switch checked={!!editItem.show_on_home} onCheckedChange={(v) => setEditItem({ ...editItem, show_on_home: v })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
                <Button onClick={save}>সেভ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

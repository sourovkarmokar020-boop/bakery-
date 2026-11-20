import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ShippingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { const { data } = await supabase.from("shipping_charges").select("*").order("created_at"); setItems(data || []); };

  const save = async () => {
    const area_name = editItem.area_name_bn || editItem.area_name_en || editItem.area_name || "";
    const payload = {
      ...editItem,
      area_name,
      area_name_en: editItem.area_name_en || editItem.area_name || "",
      area_name_bn: editItem.area_name_bn || editItem.area_name || "",
    };
    if (editItem.id) { await supabase.from("shipping_charges").update(payload).eq("id", editItem.id); }
    else { await supabase.from("shipping_charges").insert(payload); }
    toast({ title: "সেভ হয়েছে" });
    setDialogOpen(false); fetch();
  };

  const newShipping = () => {
    setEditItem({
      area_name: "",
      area_name_en: "",
      area_name_bn: "",
      charge: 0,
      is_active: true
    });
    setDialogOpen(true);
  };

  const editShipping = (i: any) => {
    setEditItem({
      ...i,
      area_name_en: i.area_name_en || i.area_name || "",
      area_name_bn: i.area_name_bn || i.area_name || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">শিপিং চার্জ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {items.length}টি এলাকা</p>
        </div>
        <Button className="rounded-full" onClick={newShipping}><Plus className="w-4 h-4 mr-1" /> নতুন</Button>
      </div>
      <Card className="border-none shadow-sm"><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">এলাকা</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">চার্জ</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">কোনো এলাকা যোগ করা হয়নি</td></tr>
            ) : items.map((i) => (
              <tr key={i.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-4 font-medium">{i.area_name}</td>
                <td className="py-2.5 px-4 font-semibold text-primary">৳{i.charge}</td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => editShipping(i)} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors" title="এডিট"><Pencil className="w-4 h-4" /></button>
                    <button onClick={async () => { await supabase.from("shipping_charges").delete().eq("id", i.id); fetch(); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="ডিলিট"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? "এডিট" : "নতুন"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>এলাকা (English)</Label>
                  <Input value={editItem.area_name_en || ""} onChange={(e) => setEditItem({ ...editItem, area_name_en: e.target.value })} />
                </div>
                <div>
                  <Label>এলাকা (বাংলা)</Label>
                  <Input value={editItem.area_name_bn || ""} onChange={(e) => setEditItem({ ...editItem, area_name_bn: e.target.value })} />
                </div>
              </div>
              <div><Label>চার্জ (৳)</Label><Input type="number" value={editItem.charge} onChange={(e) => setEditItem({ ...editItem, charge: Number(e.target.value) })} /></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button><Button onClick={save}>সেভ</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

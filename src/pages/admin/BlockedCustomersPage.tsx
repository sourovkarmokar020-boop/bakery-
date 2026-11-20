import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, ShieldOff, Loader2, Plus } from "lucide-react";

interface BlockedCustomer {
  id: string;
  customer_name: string | null;
  phone: string | null;
  ip_address: string | null;
  reason: string | null;
  created_at: string;
}

export default function BlockedCustomersPage() {
  const [blocked, setBlocked] = useState<BlockedCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", ip: "", reason: "" });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlocked();
  }, []);

  const fetchBlocked = async () => {
    setLoading(true);
    const { data } = await supabase.from("blocked_customers").select("*").order("created_at", { ascending: false });
    setBlocked((data as any[]) || []);
    setLoading(false);
  };

  const filtered = blocked.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (b.customer_name || "").toLowerCase().includes(s) || (b.phone || "").includes(s) || (b.ip_address || "").includes(s);
  });

  const addBlock = async () => {
    if (!form.phone.trim() && !form.ip.trim()) {
      toast({ title: "ফোন নাম্বার অথবা IP অ্যাড্রেস দিন", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      await supabase.from("blocked_customers").insert({
        customer_name: form.name || null,
        phone: form.phone || null,
        ip_address: form.ip || null,
        reason: form.reason || null,
      });
      toast({ title: "ব্লক লিস্টে যোগ হয়েছে" });
      setForm({ name: "", phone: "", ip: "", reason: "" });
      fetchBlocked();
    } finally {
      setAdding(false);
    }
  };

  const unblock = async (id: string) => {
    await supabase.from("blocked_customers").delete().eq("id", id);
    toast({ title: "আনব্লক করা হয়েছে" });
    setBlocked((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">ব্লকড কাস্টমার</h1>
        <p className="text-sm text-muted-foreground mt-0.5">মোট {filtered.length}টি ব্লক করা ফোন/IP — এদের থেকে নতুন অর্ডার গ্রহণ করা হবে না</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">নতুন ব্লক যোগ করুন</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input placeholder="কাস্টমারের নাম (ঐচ্ছিক)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="ফোন নাম্বার" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Input placeholder="IP অ্যাড্রেস (ঐচ্ছিক)" value={form.ip} onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value }))} />
            <Input placeholder="কারণ (ঐচ্ছিক)" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </div>
          <Button size="sm" className="mt-3" onClick={addBlock} disabled={adding}>
            {adding ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />} ব্লক করুন
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="নাম, ফোন বা IP দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">কোনো ব্লকড কাস্টমার নেই</p>
          ) : (
            <div className="overflow-x-auto -mx-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">নাম</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ফোন</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">IP অ্যাড্রেস</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">কারণ</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">তারিখ</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4">{b.customer_name || "অজানা"}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{b.phone || "-"}</td>
                      <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">{b.ip_address || "-"}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{b.reason || "-"}</td>
                      <td className="py-2.5 px-4 text-muted-foreground text-xs">{new Date(b.created_at).toLocaleDateString("bn-BD")}</td>
                      <td className="py-2.5 px-4">
                        <Button size="sm" variant="outline" onClick={() => unblock(b.id)}>
                          <ShieldOff className="w-3.5 h-3.5 mr-1" /> আনব্লক
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

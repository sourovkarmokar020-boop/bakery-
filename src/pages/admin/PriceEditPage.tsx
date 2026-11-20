import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/productImages";

export default function PriceEditPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, image_url, base_price, sale_price, purchase_price, stock_quantity")
      .order("name");
    setProducts(data || []);
  };

  const updateField = (id: string, field: string, value: string) => {
    setChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const getValue = (product: any, field: string) => {
    if (changes[product.id]?.[field] !== undefined) return changes[product.id][field];
    return product[field] ?? "";
  };

  const saveAll = async () => {
    const ids = Object.keys(changes);
    if (ids.length === 0) {
      toast({ title: "কোনো পরিবর্তন নেই" });
      return;
    }
    setSaving(true);
    let errorCount = 0;
    for (const id of ids) {
      const c = changes[id];
      const payload: any = {};
      if (c.base_price !== undefined) payload.base_price = Number(c.base_price) || 0;
      if (c.sale_price !== undefined) payload.sale_price = c.sale_price ? Number(c.sale_price) : null;
      if (c.purchase_price !== undefined) payload.purchase_price = c.purchase_price ? Number(c.purchase_price) : null;
      if (c.stock_quantity !== undefined) payload.stock_quantity = Number(c.stock_quantity) || 0;
      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) errorCount++;
      }
    }
    setSaving(false);
    setChanges({});
    fetchProducts();
    toast({ title: errorCount ? `${errorCount}টি আপডেট ব্যর্থ` : "সব আপডেট হয়েছে ✅" });
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const changedCount = Object.keys(changes).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">প্রাইস এডিট</h1>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {filtered.length}টি প্রোডাক্ট</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="সার্চ করুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {changedCount > 0 && (
            <Button onClick={saveAll} disabled={saving} className="rounded-full bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-1" />
              {saving ? "সেভ হচ্ছে..." : `সেভ করুন (${changedCount})`}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-3 w-10 text-muted-foreground font-semibold text-xs uppercase tracking-wider">SL</th>
                  <th className="text-left py-3 px-3 w-14 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ছবি</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">প্রোডাক্ট</th>
                  <th className="text-left py-3 px-3 w-28 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ক্রয় মূল্য (৳)</th>
                  <th className="text-left py-3 px-3 w-28 text-muted-foreground font-semibold text-xs uppercase tracking-wider">রেগুলার মূল্য (৳)</th>
                  <th className="text-left py-3 px-3 w-28 text-muted-foreground font-semibold text-xs uppercase tracking-wider">সেল মূল্য (৳)</th>
                  <th className="text-left py-3 px-3 w-24 text-muted-foreground font-semibold text-xs uppercase tracking-wider">স্টক</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const hasChange = !!changes[p.id];
                  return (
                    <tr key={p.id} className={`border-b transition-colors ${hasChange ? 'bg-yellow-50 dark:bg-yellow-950/20' : 'hover:bg-muted/30'}`}>
                      <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 px-3">
                        <img
                          src={getProductImage(p.slug, p.image_url)}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      </td>
                      <td className="py-2 px-3 font-medium">{p.name}</td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 w-full"
                          value={getValue(p, "purchase_price")}
                          onChange={(e) => updateField(p.id, "purchase_price", e.target.value)}
                          placeholder="—"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 w-full"
                          value={getValue(p, "base_price")}
                          onChange={(e) => updateField(p.id, "base_price", e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 w-full"
                          value={getValue(p, "sale_price")}
                          onChange={(e) => updateField(p.id, "sale_price", e.target.value)}
                          placeholder="—"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 w-full"
                          value={getValue(p, "stock_quantity")}
                          onChange={(e) => updateField(p.id, "stock_quantity", e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      কোনো প্রোডাক্ট পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">মোট: {filtered.length}টি প্রোডাক্ট</p>
    </div>
  );
}

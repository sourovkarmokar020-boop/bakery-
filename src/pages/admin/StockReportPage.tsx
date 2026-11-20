import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, AlertTriangle, Package, PackageX, PackageCheck } from "lucide-react";
import { getProductImage } from "@/lib/productImages";

export default function StockReportPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "in" | "out" | "low">("all");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, image_url, sku, stock_quantity, base_price, sale_price, purchase_price, is_active, categories(name)")
      .order("name");
    setProducts(data || []);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase());
    if (filter === "in") return matchSearch && p.stock_quantity > 0 && p.is_active;
    if (filter === "out") return matchSearch && (p.stock_quantity <= 0 || !p.is_active);
    if (filter === "low") return matchSearch && p.stock_quantity > 0 && p.stock_quantity <= 10;
    return matchSearch;
  });

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.stock_quantity > 0 && p.is_active).length;
  const outStockCount = products.filter((p) => p.stock_quantity <= 0 || !p.is_active).length;
  const lowStockCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.purchase_price || p.base_price) * (p.stock_quantity || 0), 0);

  const handleExport = () => {
    const headers = ["Name,SKU,Category,Stock,Purchase Price,Sale Price,Status,Stock Value"];
    const rows = filtered.map((p) => {
      const status = p.stock_quantity <= 0 || !p.is_active ? "Stock Out" : p.stock_quantity <= 10 ? "Low Stock" : "Stock In";
      const value = (p.purchase_price || p.base_price) * (p.stock_quantity || 0);
      return `"${p.name}",${p.sku || ""},${p.categories?.name || ""},${p.stock_quantity},${p.purchase_price || 0},${p.base_price},${status},${value}`;
    });
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filterButtons = [
    { key: "all", label: `সব (${totalProducts})`, icon: <Package className="w-4 h-4" /> },
    { key: "in", label: `Stock In (${inStockCount})`, icon: <PackageCheck className="w-4 h-4" /> },
    { key: "out", label: `Stock Out (${outStockCount})`, icon: <PackageX className="w-4 h-4" /> },
    { key: "low", label: `Low Stock (${lowStockCount})`, icon: <AlertTriangle className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">স্টক রিপোর্ট</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center shadow-md">
          <p className="text-xs opacity-80">মোট প্রোডাক্ট</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center shadow-md">
          <p className="text-xs opacity-80">Stock In</p>
          <p className="text-2xl font-bold">{inStockCount}</p>
        </div>
        <div className="rounded-xl p-4 bg-gradient-to-br from-red-500 to-red-600 text-white text-center shadow-md">
          <p className="text-xs opacity-80">Stock Out</p>
          <p className="text-2xl font-bold">{outStockCount}</p>
        </div>
        <div className="rounded-xl p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-center shadow-md">
          <p className="text-xs opacity-80">মোট স্টক মূল্য</p>
          <p className="text-2xl font-bold">৳{totalStockValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="সার্চ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9" />
          </div>
          <Button size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-700" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="text-left py-3 px-3 w-10">SL</th>
                  <th className="text-left py-3 px-3 w-14">ছবি</th>
                  <th className="text-left py-3 px-3">প্রোডাক্ট</th>
                  <th className="text-left py-3 px-3">SKU</th>
                  <th className="text-left py-3 px-3">ক্যাটাগরি</th>
                  <th className="text-right py-3 px-3">ক্রয় মূল্য</th>
                  <th className="text-right py-3 px-3">বিক্রয় মূল্য</th>
                  <th className="text-center py-3 px-3">স্টক</th>
                  <th className="text-right py-3 px-3">স্টক মূল্য</th>
                  <th className="text-center py-3 px-3">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const isOut = p.stock_quantity <= 0 || !p.is_active;
                  const isLow = !isOut && p.stock_quantity <= 10;
                  const stockValue = (p.purchase_price || p.base_price) * (p.stock_quantity || 0);
                  return (
                    <tr key={p.id} className={`border-b transition-colors ${isOut ? 'bg-red-50 dark:bg-red-950/20' : isLow ? 'bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-muted/30'}`}>
                      <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 px-3">
                        <img src={getProductImage(p.slug, p.image_url)} alt={p.name} className="w-10 h-10 rounded object-cover border" />
                      </td>
                      <td className="py-2 px-3 font-medium">{p.name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{p.sku || "-"}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">{p.categories?.name || "-"}</td>
                      <td className="py-2 px-3 text-right">৳{p.purchase_price || 0}</td>
                      <td className="py-2 px-3 text-right">৳{p.sale_price || p.base_price}</td>
                      <td className="py-2 px-3 text-center font-bold">{p.stock_quantity}</td>
                      <td className="py-2 px-3 text-right">৳{stockValue.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center">
                        {isOut ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Stock Out</Badge>
                        ) : isLow ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Stock In</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="py-12 text-center text-muted-foreground">কোনো ডেটা পাওয়া যায়নি</td></tr>
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

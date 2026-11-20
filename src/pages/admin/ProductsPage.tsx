import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProductImage } from "@/lib/productImages";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "featured">("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name, parent_id), brands(name)")
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, parent_id");
    setCategories(data || []);
  };

  const getCategoryDisplay = (product: any) => {
    const cat = product.categories;
    if (!cat) return "-";
    if (cat.parent_id) {
      const parent = categories.find((c: any) => c.id === cat.parent_id);
      return parent ? `${parent.name} › ${cat.name}` : cat.name;
    }
    return cat.name;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই প্রোডাক্ট মুছে ফেলবেন?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchProducts();
  };

  const handleDuplicate = async (product: any) => {
    const { id, created_at, updated_at, categories, brands, ...rest } = product;
    const newSlug = rest.slug + "-copy-" + Date.now();
    await supabase.from("products").insert({ ...rest, slug: newSlug, name: rest.name + " (Copy)" });
    toast({ title: "ডুপ্লিকেট তৈরি হয়েছে" });
    fetchProducts();
  };

  const filtered = products.filter((p) => {
    const query = search.trim().toLocaleLowerCase();
    const searchableText = [p.name, p.name_en, p.name_bn, p.sku, p.slug]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    const matchSearch = query === "" || searchableText.includes(query);
    if (filter === "active") return matchSearch && p.is_active;
    if (filter === "inactive") return matchSearch && !p.is_active;
    if (filter === "featured") return matchSearch && p.is_featured;
    return matchSearch;
  });

  const filterButtons = [
    { key: "all", label: "সব", color: "bg-primary" },
    { key: "active", label: "✅ Active", color: "bg-blue-500" },
    { key: "inactive", label: "❌ Inactive", color: "bg-red-500" },
    { key: "featured", label: "🔥 অফারে কিনুন", color: "bg-amber-500" },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {filtered.length}টি প্রোডাক্ট</p>
        </div>
        <Button
          onClick={() => navigate("/admin/products/create")}
          className="rounded-full bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f.key
                  ? `${f.color} text-white shadow-md`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 w-12 text-muted-foreground font-semibold text-xs uppercase tracking-wider">SL</th>
                  <th className="text-left py-3 px-4 w-28 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 w-16 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Image</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অফারে কিনুন</th>
                  <th className="text-left py-3 px-4 w-20 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 w-24 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, index) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                          title="ডুপ্লিকেট"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                          className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                          title="এডিট"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded hover:bg-red-100 text-destructive transition-colors"
                          title="ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-primary">
                      <div>{p.name}</div>
                      {p.name_en && p.name_en !== p.name && (
                        <div className="mt-0.5 text-xs font-normal text-muted-foreground">{p.name_en}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{getCategoryDisplay(p)}</td>
                    <td className="py-3 px-4">
                      <img
                        src={getProductImage(p.slug, p.image_url)}
                        alt={p.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                    </td>
                    <td className="py-3 px-4">
                      {p.sale_price ? (
                        <div>
                          <span className="line-through text-muted-foreground text-xs">৳{p.base_price}</span>
                          <br />
                          <span className="text-primary font-semibold">৳{p.sale_price}</span>
                        </div>
                      ) : (
                        <span className="font-semibold">৳{p.base_price}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{p.stock_quantity}</td>
                    <td className="py-3 px-4">
                      <div className="text-xs space-y-0.5">
                        <div>
                          অফারে কিনুন :{" "}
                          <span className={p.is_featured ? "text-accent font-medium" : "text-muted-foreground"}>
                            {p.is_featured ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={p.is_active ? "default" : "destructive"}
                        className={
                          p.is_active
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {p.stock_quantity <= 0 || !p.is_active ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Stock Out</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Stock In</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      কোনো প্রোডাক্ট পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">মোট প্রোডাক্ট: {filtered.length}</p>
    </div>
  );
}

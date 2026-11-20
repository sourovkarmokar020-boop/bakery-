import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import VariantManager, { type VariantManagerHandle } from "@/components/admin/VariantManager";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCategoryPath } from "@/lib/categoryPath";
import { getProductImage } from "@/lib/productImages";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const variantRef = useRef<VariantManagerHandle>(null);

  const [form, setForm] = useState({
    name: "",
    name_en: "",
    name_bn: "",
    slug: "",
    category_id: "",
    sub_category_id: "",
    sub_sub_category_id: "",
    brand_id: "",
    purchase_price: "",
    base_price: "",
    sale_price: "",
    stock_quantity: "",
    sku: "",
    image_url: "",
    images: [] as string[],
    weight: "",
    weight_en: "",
    weight_bn: "",
    unit: "",
    unit_en: "",
    unit_bn: "",
    description: "",
    description_en: "",
    description_bn: "",
    short_description: "",
    short_description_en: "",
    short_description_bn: "",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const [productRes, catRes, brandRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id!).single(),
      supabase.from("categories").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
    ]);

    const allCats = catRes.data || [];
    const parentCats = allCats.filter((c: any) => !c.parent_id);
    const subCats = allCats.filter((c: any) => c.parent_id);
    setCategories(parentCats);
    setSubCategories(subCats);
    setBrands(brandRes.data || []);

    if (productRes.data) {
      const p = productRes.data;
      // Resolve the stored (deepest) category up to its top-level ancestor so
      // each cascading select is pre-filled correctly (supports 3 levels).
      let catId = p.category_id || "";
      let subCatId = "";
      let subSubCatId = "";
      const byId = (id: string) => allCats.find((c: any) => c.id === id);
      let node = catId ? byId(catId) : null;
      if (node && node.parent_id) {
        const parent = byId(node.parent_id);
        if (parent && parent.parent_id) {
          // stored category is a 3rd-level (grand-child)
          subSubCatId = node.id;
          subCatId = parent.id;
          catId = parent.parent_id;
        } else {
          // stored category is a 2nd-level (sub-category)
          subCatId = node.id;
          catId = node.parent_id;
        }
      }
      setForm({
        name: p.name || "",
        name_en: p.name_en || p.name || "",
        name_bn: p.name_bn || p.name || "",
        slug: p.slug || "",
        category_id: catId,
        sub_category_id: subCatId,
        sub_sub_category_id: subSubCatId,
        brand_id: p.brand_id || "",
        purchase_price: p.purchase_price ? String(p.purchase_price) : "",
        base_price: String(p.base_price || ""),
        sale_price: p.sale_price ? String(p.sale_price) : "",
        stock_quantity: String(p.stock_quantity || ""),
        sku: p.sku || "",
        image_url: p.image_url || getProductImage(p.slug),
        images: (p.images as string[]) || [],
        weight: p.weight || "",
        weight_en: p.weight_en || p.weight || "",
        weight_bn: p.weight_bn || p.weight || "",
        unit: p.unit || "",
        unit_en: p.unit_en || p.unit || "",
        unit_bn: p.unit_bn || p.unit || "",
        description: p.description || "",
        description_en: p.description_en || p.description || "",
        description_bn: p.description_bn || p.description || "",
        short_description: p.short_description || "",
        short_description_en: p.short_description_en || p.short_description || "",
        short_description_bn: p.short_description_bn || p.short_description || "",
        is_active: p.is_active ?? true,
        is_featured: p.is_featured ?? false,
      });
    }
    setLoading(false);
  };

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_bn.trim()) {
      toast({ title: "প্রোডাক্টের ইংরেজি ও বাংলা নাম উভয়ই দিন", variant: "destructive" });
      return;
    }
    if ((form.description_en.trim() && !form.description_bn.trim()) || (form.description_bn.trim() && !form.description_en.trim())) {
      toast({ title: "প্রোডাক্টের বিবরণ ইংরেজি ও বাংলা উভয় ভাষায় দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const name = form.name_bn || form.name_en;
    const slugSource = form.name_en || name;
    const slug = form.slug || slugSource.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const payload = {
      name,
      name_en: form.name_en,
      name_bn: form.name_bn,
      slug,
      category_id: form.sub_sub_category_id || form.sub_category_id || form.category_id || null,
      brand_id: form.brand_id || null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      base_price: Number(form.base_price) || 0,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      sku: form.sku || null,
      image_url: form.image_url || null,
      images: form.images,
      weight: form.weight_bn || form.weight_en || null,
      weight_en: form.weight_en || null,
      weight_bn: form.weight_bn || null,
      unit: form.unit_bn || form.unit_en || null,
      unit_en: form.unit_en || null,
      unit_bn: form.unit_bn || null,
      description: form.description_bn || form.description_en || null,
      description_en: form.description_en || null,
      description_bn: form.description_bn || null,
      short_description: form.short_description_bn || form.short_description_en || null,
      short_description_en: form.short_description_en || null,
      short_description_bn: form.short_description_bn || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
    };
    const { error } = await supabase.from("products").update(payload).eq("id", id!);
    if (error) {
      setSaving(false);
      toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    // Submit চাপলে ভ্যারিয়েন্টগুলোও সেভ হয় — আলাদা বাটন চাপতে ভুলে গেলে হারাত
    await variantRef.current?.save();
    setSaving(false);
    toast({ title: "প্রোডাক্ট আপডেট হয়েছে ✅" });
    navigate("/admin/products");
  };

  const childCats = subCategories.filter((sc: any) => sc.parent_id === form.category_id);
  const grandCats = subCategories.filter((sc: any) => sc.parent_id === form.sub_category_id);

  // Full list (mains + children) so we can show the whole path, e.g. Clothing → Men → T-Shirt.
  const allCats = [...categories, ...subCategories];
  const selectedCatId = form.sub_sub_category_id || form.sub_category_id || form.category_id;
  const selectedPath = getCategoryPath(allCats, selectedCatId).join(" → ");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-bold">Product Edit</h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          Manage
        </Button>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl shadow-sm p-6 space-y-6">
        {/* Product Names (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Product Name (English) *</Label>
            <Input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Product Name (বাংলা) *</Label>
            <Input value={form.name_bn} onChange={(e) => update("name_bn", e.target.value)} />
          </div>
        </div>

        {/* Categories (cascading up to 3 levels) + Brand */}
        {selectedPath && (
          <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
            <span className="text-muted-foreground">এই প্রোডাক্ট যাবে: </span>
            <span className="font-semibold text-primary">{selectedPath}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>মেইন ক্যাটাগরি *</Label>
            <Select value={form.category_id} onValueChange={(val) => { update("category_id", val); update("sub_category_id", ""); update("sub_sub_category_id", ""); }}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {childCats.length > 0 && (
            <div className="space-y-2">
              <Label>সাব-ক্যাটাগরি</Label>
              <Select value={form.sub_category_id} onValueChange={(val) => { update("sub_category_id", val); update("sub_sub_category_id", ""); }}>
                <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                  {childCats.map((sc: any) => <SelectItem key={sc.id} value={sc.id}>{getCategoryPath(allCats, sc.id).join(" → ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {grandCats.length > 0 && (
            <div className="space-y-2">
              <Label>সাব-সাব ক্যাটাগরি</Label>
              <Select value={form.sub_sub_category_id} onValueChange={(val) => update("sub_sub_category_id", val)}>
                <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                  {grandCats.map((gc: any) => <SelectItem key={gc.id} value={gc.id}>{getCategoryPath(allCats, gc.id).join(" → ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Brands</Label>
            <Select value={form.brand_id} onValueChange={(val) => update("brand_id", val)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>ক্রয় মূল্য (৳)</Label>
            <Input type="number" value={form.purchase_price} onChange={(e) => update("purchase_price", e.target.value)} placeholder="ঐচ্ছিক" />
          </div>
          <div className="space-y-2">
            <Label>Old Price (৳)</Label>
            <Input type="number" value={form.base_price} onChange={(e) => update("base_price", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New Price * (৳)</Label>
            <Input type="number" value={form.sale_price} onChange={(e) => update("sale_price", e.target.value)} />
          </div>
        </div>

        {/* Stock, SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Stock *</Label>
            <Input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Product Code</Label>
            <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} />
          </div>
        </div>

        {/* Weight (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Weight (English)</Label>
            <Input value={form.weight_en} onChange={(e) => update("weight_en", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Weight (বাংলা)</Label>
            <Input value={form.weight_bn} onChange={(e) => update("weight_bn", e.target.value)} />
          </div>
        </div>

        {/* Unit (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unit (English)</Label>
            <Input value={form.unit_en} onChange={(e) => update("unit_en", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Unit (বাংলা)</Label>
            <Input value={form.unit_bn} onChange={(e) => update("unit_bn", e.target.value)} />
          </div>
        </div>

        {/* Short Description (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Short Description (English)</Label>
            <Textarea rows={2} value={form.short_description_en} onChange={(e) => update("short_description_en", e.target.value)} placeholder="English short description..." />
          </div>
          <div className="space-y-2">
            <Label>Short Description (বাংলা)</Label>
            <Textarea rows={2} value={form.short_description_bn} onChange={(e) => update("short_description_bn", e.target.value)} placeholder="বাংলা সংক্ষিপ্ত বর্ণনা..." />
          </div>
        </div>

        {/* Description (English & Bangla side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Description (English) *</Label>
            <Textarea rows={5} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} placeholder="English details description..." />
          </div>
          <div className="space-y-2">
            <Label>Description (বাংলা) *</Label>
            <Textarea rows={5} value={form.description_bn} onChange={(e) => update("description_bn", e.target.value)} placeholder="বাংলা বিস্তারিত বিবরণ..." />
          </div>
        </div>

        {/* Product Images */}
        <div className="space-y-3 border-t pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Images</p>
          <ImageUpload
            mainImage={form.image_url}
            images={form.images}
            onMainChange={(url) => update("image_url", url)}
            onImagesChange={(urls) => update("images", urls)}
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Label>Status</Label>
            <Switch checked={form.is_active} onCheckedChange={(v) => update("is_active", v)} />
          </div>
          <div className="flex items-center gap-2">
            <Label>অফারে কিনুন</Label>
            <Switch checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
          </div>
        </div>

        {/* Variants */}
        {id && <VariantManager ref={variantRef} productId={id} />}

        {/* Submit */}
        <Button onClick={handleSave} disabled={saving} className="rounded-full px-8 bg-primary hover:bg-primary/90">
          {saving ? "আপডেট হচ্ছে..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

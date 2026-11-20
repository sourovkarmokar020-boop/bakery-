import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveLocalImageUrl } from "@/lib/productImages";

interface SizeVariant {
  id?: string;
  size_name: string;
  size_value: string;
  price: number | null;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
}

interface ColorVariant {
  id?: string;
  color_name: string;
  hex_code: string;
  image_url: string;
  price: number | null;
  stock_quantity: number;
  is_active: boolean;
}

interface VariantManagerProps {
  productId: string;
}

const convertToWebP = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject("Conversion failed")), "image/webp", 0.9);
    };
    img.onerror = () => reject("Image load failed");
    img.src = URL.createObjectURL(file);
  });

export interface VariantManagerHandle {
  save: () => Promise<void>;
}

const VariantManager = forwardRef<VariantManagerHandle, VariantManagerProps>(function VariantManager({ productId }, ref) {
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_variants")
      .select("*, sizes(name, value), colors(name, hex_code)")
      .eq("product_id", productId)
      .order("created_at");

    const rows = (data || []) as any[];
    setSizeVariants(
      rows
        .filter((v) => v.size_id)
        .map((v) => ({
          id: v.id,
          size_name: v.sizes?.name || "",
          size_value: v.sizes?.value || "",
          price: v.price,
          stock_quantity: v.stock_quantity || 0,
          sku: v.sku || "",
          is_active: v.is_active ?? true,
        }))
    );
    setColorVariants(
      rows
        .filter((v) => v.color_id)
        .map((v) => ({
          id: v.id,
          color_name: v.colors?.name || "",
          hex_code: v.colors?.hex_code || "#cccccc",
          image_url: v.image_url ? resolveLocalImageUrl(v.image_url) : "",
          price: v.price,
          stock_quantity: v.stock_quantity || 0,
          is_active: v.is_active ?? true,
        }))
    );
    setLoading(false);
  };

  // ---- Color variants ----

  const addColor = () => {
    setColorVariants([...colorVariants, { color_name: "", hex_code: "#cccccc", image_url: "", price: null, stock_quantity: 0, is_active: true }]);
  };

  const updateColor = (index: number, patch: Partial<ColorVariant>) => {
    setColorVariants(colorVariants.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const removeColor = async (index: number) => {
    const c = colorVariants[index];
    if (c.id) await supabase.from("product_variants").delete().eq("id", c.id);
    setColorVariants(colorVariants.filter((_, i) => i !== index));
  };

  const pickImage = (index: number) => {
    uploadTargetRef.current = index;
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = uploadTargetRef.current;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধু ইমেজ ফাইল আপলোড করুন", variant: "destructive" });
      return;
    }
    setUploadingIndex(index);
    try {
      const webp = await convertToWebP(file);
      const name = `variants/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const { data, error } = await supabase.storage.from("products").upload(name, webp as File);
      if (error) throw error;
      updateColor(index, { image_url: data.public_url });
    } catch (err: any) {
      toast({ title: "আপলোড ব্যর্থ", description: err?.message, variant: "destructive" });
    } finally {
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---- Size variants ----

  const addSize = () => {
    setSizeVariants([...sizeVariants, { size_name: "", size_value: "", price: null, stock_quantity: 0, sku: "", is_active: true }]);
  };

  const updateSize = (index: number, field: keyof SizeVariant, value: any) => {
    setSizeVariants(sizeVariants.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeSize = async (index: number) => {
    const v = sizeVariants[index];
    if (v.id) await supabase.from("product_variants").delete().eq("id", v.id);
    setSizeVariants(sizeVariants.filter((_, i) => i !== index));
  };

  // ---- Save ----

  const findOrCreate = async (table: "sizes" | "colors", match: Record<string, string>, insert: Record<string, any>) => {
    let query = supabase.from(table).select("id");
    Object.entries(match).forEach(([k, v]) => { query = query.eq(k, v); });
    const { data: existing } = await query.maybeSingle();
    if (existing) return existing.id as string;
    const { data: created, error } = await supabase.from(table).insert(insert).select("id").single();
    if (error || !created) throw new Error((error as any)?.message || `${table} তৈরি করা যায়নি`);
    return created.id as string;
  };

  const saveVariants = async () => {
    setSaving(true);
    try {
      // Colors
      for (const c of colorVariants) {
        if (!c.color_name.trim()) continue;
        const colorId = await findOrCreate(
          "colors",
          { name: c.color_name.trim() },
          { name: c.color_name.trim(), hex_code: c.hex_code }
        );
        await supabase.from("colors").update({ hex_code: c.hex_code }).eq("id", colorId);

        const payload = {
          color_id: colorId,
          image_url: c.image_url || null,
          price: c.price,
          stock_quantity: c.stock_quantity,
          is_active: c.is_active,
        };
        if (c.id) {
          const { error } = await supabase.from("product_variants").update(payload).eq("id", c.id);
          if (error) throw new Error((error as any)?.message);
        } else {
          const { data: inserted, error } = await supabase
            .from("product_variants")
            .insert({ product_id: productId, ...payload })
            .select("id")
            .single();
          if (error) throw new Error((error as any)?.message);
          if (inserted) c.id = inserted.id;
        }
      }

      // Sizes
      for (const v of sizeVariants) {
        if (!v.size_name.trim()) continue;
        const sizeId = await findOrCreate(
          "sizes",
          { name: v.size_name.trim() },
          { name: v.size_name.trim(), value: v.size_value.trim() || null }
        );

        const payload = {
          size_id: sizeId,
          price: v.price,
          stock_quantity: v.stock_quantity,
          sku: v.sku || null,
          is_active: v.is_active,
        };
        if (v.id) {
          const { error } = await supabase.from("product_variants").update(payload).eq("id", v.id);
          if (error) throw new Error((error as any)?.message);
        } else {
          const { data: inserted, error } = await supabase
            .from("product_variants")
            .insert({ product_id: productId, ...payload })
            .select("id")
            .single();
          if (error) throw new Error((error as any)?.message);
          if (inserted) v.id = inserted.id;
        }
      }

      toast({ title: "ভ্যারিয়েন্ট সেভ হয়েছে ✅" });
      fetchVariants();
    } catch (err: any) {
      toast({ title: "সেভ ব্যর্থ", description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // প্রোডাক্ট ফর্মের Submit থেকেও ডাকা যায় — আলাদা করে "ভ্যারিয়েন্ট সেভ করুন" চাপতে ভুলে গেলেও হারাবে না
  useImperativeHandle(ref, () => ({ save: saveVariants }));

  if (loading) return <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-5 border-t pt-4 mt-4">
      <Label className="text-base font-semibold">ভ্যারিয়েশন (Color &amp; Size)</Label>

      {/* hidden shared file input for color photos */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />

      {/* ---- Colors ---- */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">রঙ (Color)</Label>
        {colorVariants.map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 border rounded-lg bg-muted/30">
            <input
              type="color"
              className="w-10 h-10 rounded-md border cursor-pointer shrink-0"
              value={c.hex_code}
              onChange={(e) => updateColor(i, { hex_code: e.target.value })}
              title="রঙ বাছাই করুন"
            />
            <Input
              className="flex-1"
              placeholder="রঙের নাম (যেমন: লাল কালার)"
              value={c.color_name}
              onChange={(e) => updateColor(i, { color_name: e.target.value })}
            />
            <Input
              type="number"
              className="w-24 shrink-0"
              placeholder="দাম"
              title="আলাদা দাম (ঐচ্ছিক)"
              value={c.price ?? ""}
              onChange={(e) => updateColor(i, { price: e.target.value ? Number(e.target.value) : null })}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 h-10 flex-col gap-0 px-2 text-[10px]"
              disabled={uploadingIndex === i}
              onClick={() => pickImage(i)}
            >
              {uploadingIndex === i ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              + ছবি যোগ
            </Button>
            {c.image_url && (
              <div className="relative shrink-0">
                <img src={c.image_url} alt="" className="w-10 h-10 rounded-md object-cover border" />
                <button
                  type="button"
                  onClick={() => updateColor(i, { image_url: "" })}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5"
                  title="ছবি সরান"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            <button type="button" onClick={() => removeColor(i)} className="text-destructive p-1.5 shrink-0" title="মুছুন">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addColor}
          className="w-full border-2 border-dashed rounded-lg py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + রঙ যোগ করুন
        </button>
      </div>

      {/* ---- Sizes ---- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">সাইজ / ওজন (Size)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSize}>
            <Plus className="w-4 h-4 mr-1" /> যোগ
          </Button>
        </div>
        {sizeVariants.map((v, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 border rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label className="text-xs">নাম *</Label>
              <Input placeholder="যেমন: ২৫০ গ্রাম" value={v.size_name} onChange={(e) => updateSize(i, "size_name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ভ্যালু</Label>
              <Input placeholder="250g" value={v.size_value} onChange={(e) => updateSize(i, "size_value", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">দাম (৳)</Label>
              <Input
                type="number"
                placeholder="আলাদা দাম"
                value={v.price ?? ""}
                onChange={(e) => updateSize(i, "price", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">স্টক</Label>
              <Input type="number" value={v.stock_quantity} onChange={(e) => updateSize(i, "stock_quantity", Number(e.target.value))} />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeSize(i)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(sizeVariants.length > 0 || colorVariants.length > 0) && (
        <Button type="button" onClick={saveVariants} size="sm" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
          ভ্যারিয়েন্ট সেভ করুন
        </Button>
      )}
    </div>
  );
});

export default VariantManager;

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, SearchX } from "lucide-react";
import { getProductImage } from "@/lib/productImages";
import type { Product } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MatchedProduct = Product & { confidence: "exact" | "similar" };

// Map a DB product row (+ confidence from the visual-search endpoint) to the Product shape used by ProductCard
const mapMatch = (p: any): MatchedProduct => {
  const salePrice = p.sale_price ?? null;
  const basePrice = p.base_price ?? 0;
  const price = salePrice ?? basePrice;
  const originalPrice = basePrice;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price,
    originalPrice,
    discount,
    image: getProductImage(p.slug, p.image_url),
    category: "",
    rating: 4.7,
    brand: "Dream Bakery",
    code: p.sku || "",
    description: p.description || "",
    inStock: (p.stock_quantity ?? 0) > 0,
    confidence: p.confidence === "exact" ? "exact" : "similar",
  };
};

export default function VisualSearchModal({ open, onOpenChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchedProduct[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setFile(null);
    setResults(null);
    setNote(null);
    setError(null);
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setResults(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  };

  const runSearch = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`${API_URL}/visual-search`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "খুঁজতে সমস্যা হয়েছে");
      setResults((data.matches || []).map(mapMatch));
      setNote(data.note || null);
    } catch (e: any) {
      setError(e.message || "খুঁজতে সমস্যা হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ছবি দিয়ে প্রোডাক্ট খুঁজুন</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-sm text-muted-foreground text-center">
              প্রোডাক্টের ছবি তুলুন অথবা আপলোড করুন, আমরা খুঁজে বের করার চেষ্টা করব
            </p>
            <Button className="gap-2" onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-4 h-4" /> ছবি তুলুন
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => galleryInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> গ্যালারি থেকে বাছাই করুন
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={preview} alt="preview" className="w-20 h-20 rounded-lg object-cover border shrink-0" />
              <div className="flex-1 space-y-2">
                {!results && (
                  <Button size="sm" className="w-full gap-2" onClick={runSearch} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {loading ? "খোঁজা হচ্ছে..." : "এই ছবি দিয়ে খুঁজুন"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="w-full" onClick={reset} disabled={loading}>
                  অন্য ছবি বাছাই করুন
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            {results && (
              <div className="space-y-3">
                {results.length === 0 ? (
                  <div className="text-center py-6 space-y-1">
                    <SearchX className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="font-medium">দুঃখিত, এই ছবির সাথে মিলে এমন কোনো প্রোডাক্ট আমাদের কাছে নেই</p>
                    {note && <p className="text-sm text-muted-foreground">{note}</p>}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground text-center">
                      {results.some((r) => r.confidence === "exact")
                        ? "এই প্রোডাক্টগুলো পাওয়া গেছে:"
                        : "হুবহু মিল পাইনি, তবে কাছাকাছি এই প্রোডাক্টগুলো দেখতে পারেন:"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {results.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

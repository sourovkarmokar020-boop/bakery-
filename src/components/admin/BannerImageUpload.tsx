import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BannerImageUploadProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject("Conversion failed")),
        "image/webp",
        0.85
      );
    };
    img.onerror = () => reject("Image load failed");
    img.src = URL.createObjectURL(file);
  });
};

export default function BannerImageUpload({ imageUrl, onChange }: BannerImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধু ইমেজ ফাইল আপলোড করুন", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const webpBlob = await convertToWebP(file);
      const fileName = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

      const { data, error } = await supabase.storage
        .from("banner-images")
        .upload(fileName, webpBlob as unknown as File);
      if (error) throw error;

      onChange((data as any).public_url);
      toast({ title: "ব্যানার আপলোড হয়েছে ✅" });
    } catch (err: any) {
      toast({ title: "আপলোড ব্যর্থ", description: err?.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {imageUrl && (
        <div className="relative inline-block">
          <img src={imageUrl} alt="" className="w-full max-w-xs aspect-[16/6] rounded-lg object-cover border" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
        {uploading ? "আপলোড হচ্ছে..." : "ব্যানার ইমেজ আপলোড"}
      </Button>
      <p className="text-xs text-muted-foreground">সেরা মাপ: ১৬০০×৬০০ পিক্সেল (16:6)</p>
    </div>
  );
}

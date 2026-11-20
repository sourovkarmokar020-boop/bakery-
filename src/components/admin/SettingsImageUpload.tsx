import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  imageUrl: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder: string;
  label?: string;
  fallbackImageUrl?: string;
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
        0.9
      );
    };
    img.onerror = () => reject("Image load failed");
    img.src = URL.createObjectURL(file);
  });
};

export default function SettingsImageUpload({
  imageUrl,
  onChange,
  onRemove,
  folder,
  label = "ইমেজ আপলোড করুন",
  fallbackImageUrl,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const previewUrl = imageUrl?.trim() || fallbackImageUrl?.trim() || "";

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
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

      const { data, error } = await supabase.storage
        .from("site-settings")
        .upload(fileName, webpBlob as File);
      if (error) throw error;

      onChange(data.public_url);
      toast({ title: "ইমেজ আপলোড হয়েছে ✅" });
    } catch (err: any) {
      toast({ title: "আপলোড ব্যর্থ", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {previewUrl && (
        <div className="relative inline-block">
          <img src={previewUrl} alt="" className="w-20 h-20 rounded-lg object-contain border bg-muted" />
          {(imageUrl?.trim() || onRemove) && (
            <button
              type="button"
              onClick={() => (onRemove ? onRemove() : onChange(""))}
              aria-label="ইমেজ সরান"
              title="ইমেজ সরান"
              className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
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
      >
        {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
        {uploading ? "আপলোড হচ্ছে..." : label}
      </Button>
    </div>
  );
}

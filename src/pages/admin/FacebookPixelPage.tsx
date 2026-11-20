import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const fields = [
  { key: "facebook_pixel", label: "Facebook Pixel ID" },
  { key: "google_tag_manager", label: "Google Tag Manager ID" },
];

export default function FacebookPixelPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("group_name", "pixels").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((s: any) => { map[s.key] = s.value || ""; });
      setSettings(map);
    });
  }, []);

  const save = async () => {
    setLoading(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("site_settings").update({ value }).eq("key", key);
    }
    toast({ title: "সেটিংস সেভ হয়েছে" });
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Facebook Pixel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ট্র্যাকিং ও এনালাইটিক্স আইডি সেটআপ করুন</p>
      </div>
      <Card className="border-none shadow-sm max-w-xl">
        <CardContent className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input value={settings[f.key] || ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} />
            </div>
          ))}
          <Button className="rounded-full" onClick={save} disabled={loading}>{loading ? "সেভ হচ্ছে..." : "সেভ করুন"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

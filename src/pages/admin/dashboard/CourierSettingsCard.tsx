import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function CourierSettingsCard() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value || ""; });
      setShopName(map.site_name || "");
      setPhone(map.site_phone || "");
    });
  }, []);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">কুরিয়ার সেটিংস</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">শপ নাম</span>
            <span className="font-medium">{shopName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ফোন</span>
            <span className="font-medium">{phone || "-"}</span>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Pathao</span>
            <Badge variant="outline" className="text-destructive border-destructive">✕ বন্ধ</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Steadfast</span>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ চালু</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate("/admin/courier-api")}>
            কুরিয়ার এপিআই
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate("/admin/settings/shipping")}>
            শিপিং চার্জ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

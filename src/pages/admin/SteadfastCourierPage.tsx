import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Eye, EyeOff, Loader2, RefreshCw, Save, Truck } from "lucide-react";

const defaultForm = {
  enabled: false,
  api_key: "",
  secret_key: "",
  base_url: "https://portal.packzy.com/api/v1",
};

function errorText(error: any) {
  return error?.message || error?.errors?.base_url?.[0] || "কাজটি সম্পন্ন করা যায়নি";
}

export default function SteadfastCourierPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.courier.getSteadfast();
    if (error) {
      toast({ title: "কুরিয়ার সেটিংস লোড হয়নি", description: errorText(error), variant: "destructive" });
    } else {
      setSettings(data);
      setForm((prev) => ({
        ...prev,
        enabled: !!data?.enabled,
        base_url: data?.base_url || defaultForm.base_url,
        api_key: "",
        secret_key: "",
      }));
    }
    setLoading(false);
  };

  const saveSettings = async (silent = false) => {
    setSaving(true);
    const { data, error } = await supabase.courier.saveSteadfast(form);
    setSaving(false);

    if (error) {
      toast({ title: "সেটিংস সেভ হয়নি", description: errorText(error), variant: "destructive" });
      return false;
    }

    setSettings(data);
    setForm((prev) => ({ ...prev, api_key: "", secret_key: "" }));
    if (!silent) toast({ title: "Steadfast সেটিংস সেভ হয়েছে" });
    return true;
  };

  const checkBalance = async () => {
    const saved = await saveSettings(true);
    if (!saved) return;

    setChecking(true);
    const { data, error } = await supabase.courier.checkSteadfastBalance();
    setChecking(false);

    if (error) {
      toast({ title: "সংযোগ পরীক্ষা ব্যর্থ", description: errorText(error), variant: "destructive" });
      return;
    }

    setSettings(data?.settings || settings);
    toast({ title: "Steadfast সংযোগ সফল", description: `বর্তমান ব্যালেন্স ৳${Number(data?.current_balance || 0).toLocaleString("bn-BD")}` });
  };

  const connected = !!settings?.connected;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Steadfast Courier API
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">কুরিয়ার সেটিংস এবং ব্যালেন্স যাচাই করুন</p>
        </div>
        <Button onClick={() => saveSettings()} disabled={saving || loading}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          সেভ করুন
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-5 space-y-5">
          {loading ? (
            <div className="py-14 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-semibold">Steadfast কুরিয়ার সক্রিয় করুন</p>
                  <p className="text-xs text-muted-foreground mt-0.5">অর্ডার ম্যানেজমেন্ট থেকে Steadfast-এ অর্ডার পাঠানোর সুবিধা চালু হবে</p>
                </div>
                <div className="flex items-center gap-3">
                  {connected ? (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not connected</Badge>
                  )}
                  <Switch checked={form.enabled} onCheckedChange={(enabled) => setForm((prev) => ({ ...prev, enabled }))} />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label>API Base URL</Label>
                  <Input
                    value={form.base_url}
                    onChange={(e) => setForm((prev) => ({ ...prev, base_url: e.target.value }))}
                    placeholder="https://portal.packzy.com/api/v1"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={form.api_key}
                      onChange={(e) => setForm((prev) => ({ ...prev, api_key: e.target.value }))}
                      placeholder={settings?.api_key_masked || "Steadfast API key দিন"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowApiKey((value) => !value)}
                      title={showApiKey ? "লুকান" : "দেখুন"}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">ফাঁকা রাখলে আগের API key অপরিবর্তিত থাকবে</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Secret Key</Label>
                  <div className="relative">
                    <Input
                      type={showSecretKey ? "text" : "password"}
                      value={form.secret_key}
                      onChange={(e) => setForm((prev) => ({ ...prev, secret_key: e.target.value }))}
                      placeholder={settings?.secret_key_masked || "Steadfast secret key দিন"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowSecretKey((value) => !value)}
                      title={showSecretKey ? "লুকান" : "দেখুন"}
                    >
                      {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">API key এবং secret key encrypted অবস্থায় server-side save হবে</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <Button variant="outline" onClick={checkBalance} disabled={saving || checking}>
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  সংযোগ পরীক্ষা করুন
                </Button>
                <div className="text-sm text-muted-foreground">
                  {settings?.last_balance !== null && settings?.last_balance !== undefined ? (
                    <span className="font-semibold text-foreground">বর্তমান ব্যালেন্স: ৳{Number(settings.last_balance).toLocaleString("bn-BD")}</span>
                  ) : (
                    "এখনো ব্যালেন্স চেক করা হয়নি"
                  )}
                  {settings?.last_checked_at && (
                    <span className="ml-2 text-xs">শেষ চেক: {new Date(settings.last_checked_at).toLocaleString("bn-BD")}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

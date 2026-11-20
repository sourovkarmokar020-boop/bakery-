import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Settings, MailWarning, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

interface SmtpConfig {
  id?: number;
  mailer: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
  from_address: string;
  from_name: string;
  is_active: boolean;
}

const defaultConfig: SmtpConfig = {
  mailer: "smtp",
  host: "",
  port: 587,
  username: "",
  password: "",
  encryption: "tls",
  from_address: "",
  from_name: "Dream Mart",
  is_active: true,
};

export default function SmtpSettingsPage() {
  const [config, setConfig] = useState<SmtpConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("organic_api_token");
    if (token) return { Authorization: `Bearer ${token}` };

    return {};
  };

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/admin/smtp`, {
        headers: { ...getAuthHeaders() },
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setConfig({
          mailer: json.data.mailer || "smtp",
          host: json.data.host || "",
          port: json.data.port || 587,
          username: json.data.username || "",
          password: json.data.password || "",
          encryption: json.data.encryption || "tls",
          from_address: json.data.from_address || "",
          from_name: json.data.from_name || "Dream Mart",
          is_active: json.data.is_active ?? true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch SMTP settings:", err);
    } finally {
      setFetching(false);
    }
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/smtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "SMTP সেটিংস সেভ হয়েছে ✅" });
        fetchSettings();
      } else {
        toast({ title: "সেভ করতে সমস্যা", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "সেভ করতে সমস্যা", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendTest = async () => {
    if (!testEmail) {
      toast({ title: "টেস্ট ইমেইল ঠিকানা দিন", variant: "destructive" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/smtp/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ test_email: testEmail }),
      });
      const json = await res.json();
      setTestResult(json);
      if (json.ok) {
        toast({ title: "টেস্ট ইমেইল পাঠানো হয়েছে ✅", description: json.message });
      } else {
        toast({ title: "টেস্ট ব্যর্থ", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message });
      toast({ title: "টেস্ট ব্যর্থ", description: err.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">SMTP সেটিংস</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ইমেইল পাঠানোর জন্য SMTP সার্ভার কনফিগার করুন</p>
        </div>
        <Button className="rounded-full" onClick={save} disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> সেভ হচ্ছে...</> : "সেভ করুন"}
        </Button>
      </div>

      {/* SMTP কনফিগারেশন */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SMTP সার্ভার কনফিগারেশন
          </CardTitle>
          <CardDescription>
            আপনার ইমেইল সার্ভারের তথ্য দিন। সাধারণত Gmail, SendGrid, Mailgun, অথবা আপনার নিজস্ব SMTP সার্ভার ব্যবহার করতে পারেন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>মেইলার টাইপ</Label>
              <Select
                value={config.mailer}
                onValueChange={(v) => setConfig({ ...config, mailer: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="sendmail">Sendmail</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                  <SelectItem value="ses">Amazon SES</SelectItem>
                  <SelectItem value="postmark">Postmark</SelectItem>
                  <SelectItem value="log">Log (শুধু ডিবাগ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>এনক্রিপশন</Label>
              <Select
                value={config.encryption}
                onValueChange={(v) => setConfig({ ...config, encryption: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS (পোর্ট 587)</SelectItem>
                  <SelectItem value="ssl">SSL (পোর্ট 465)</SelectItem>
                  <SelectItem value="null">কোনোটিই নয় (পোর্ট 25)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>SMTP হোস্ট</Label>
              <Input
                placeholder="smtp.gmail.com"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-0.5">যেমন: smtp.gmail.com, smtp.sendgrid.net</p>
            </div>
            <div className="space-y-1">
              <Label>SMTP পোর্ট</Label>
              <Input
                type="number"
                placeholder="587"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 587 })}
              />
              <p className="text-xs text-muted-foreground mt-0.5">TLS: 587, SSL: 465, নন-এনক্রিপ্টেড: 25</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>ইউজারনেম</Label>
              <Input
                placeholder="your-email@gmail.com"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>পাসওয়ার্ড / অ্যাপ পাসওয়ার্ড</Label>
              <Input
                type="password"
                placeholder="********"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-0.5">Gmail-এর জন্য অ্যাপ পাসওয়ার্ড ব্যবহার করুন</p>
            </div>
          </div>

          <div className="border-t pt-5">
            <p className="text-sm font-semibold mb-3">প্রেরকের তথ্য (From Address)</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>From ইমেইল</Label>
                <Input
                  type="email"
                  placeholder="info@dreammart.com"
                  value={config.from_address}
                  onChange={(e) => setConfig({ ...config, from_address: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>From নাম</Label>
                <Input
                  placeholder="Dream Mart"
                  value={config.from_name}
                  onChange={(e) => setConfig({ ...config, from_name: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              checked={config.is_active}
              onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
            />
            <div>
              <Label className="font-medium">সক্রিয় করুন</Label>
              <p className="text-xs text-muted-foreground">এই সেটিংস সক্রিয় থাকলে ইমেইল এই কনফিগারেশন ব্যবহার করবে</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* টেস্ট ইমেইল */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" />
            টেস্ট ইমেইল পাঠান
          </CardTitle>
          <CardDescription>
            আপনার SMTP কনফিগারেশন সঠিকভাবে কাজ করছে কিনা পরীক্ষা করতে একটি টেস্ট ইমেইল পাঠান।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label>টেস্ট ইমেইল ঠিকানা</Label>
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={sendTest}
              disabled={testing}
              className="shrink-0"
            >
              {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> পাঠানো হচ্ছে...</> : "টেস্ট ইমেইল পাঠান"}
            </Button>
          </div>

          {testResult && (
            <Alert variant={testResult.ok ? "default" : "destructive"}>
              {testResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <MailWarning className="h-4 w-4" />}
              <AlertTitle>{testResult.ok ? "সফল!" : "ব্যর্থ!"}</AlertTitle>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* হেল্প কার্ড */}
      <Card className="border-none shadow-sm bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MailWarning className="h-4 w-4" />
            সাহায্য
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Gmail ব্যবহার করলে:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>হোস্ট: smtp.gmail.com</li>
            <li>পোর্ট: 587 (TLS) অথবা 465 (SSL)</li>
            <li>ইউজারনেম: আপনার Gmail ইমেইল</li>
            <li>পাসওয়ার্ড: Gmail অ্যাপ পাসওয়ার্ড (2-Step Verification চালু করে নিন)</li>
          </ul>
          <p className="mt-2">
            <strong>নিজস্ব SMTP থাকলে:</strong> আপনার হোস্টিং প্রদানকারীর SMTP credentials ব্যবহার করুন।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

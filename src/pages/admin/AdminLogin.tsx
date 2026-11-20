import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Leaf } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("mohivislam2@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .in("role", ["admin", "super_admin"])
          .maybeSingle();

        if (roleData) {
          navigate("/admin", { replace: true });
        }
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const isInvalid = error.message?.toLowerCase().includes("invalid login credentials") || error.message?.toLowerCase().includes("invalid credentials");
      toast({
        title: "লগইন ব্যর্থ",
        description: isInvalid ? "Invalid email or password" : (error.message || "Invalid email or password"),
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .in("role", ["admin", "super_admin"])
      .maybeSingle();

    if (!roleData) {
      await supabase.auth.signOut();
      toast({ title: "অ্যাক্সেস নেই", description: "আপনার অ্যাডমিন অ্যাক্সেস নেই।", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "সফল!", description: "অ্যাডমিন প্যানেলে স্বাগতম" });
    navigate("/admin", { replace: true });
    setLoading(false);
  };

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/50">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/40 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">অ্যাডমিন লগইন</CardTitle>
          <p className="text-muted-foreground text-sm">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "লগইন হচ্ছে..." : "লগইন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

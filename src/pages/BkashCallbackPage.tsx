import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// bKash পেমেন্ট শেষে এই পেজে redirect হয়: /bkash/callback?paymentID=...&status=success|failure|cancel
export default function BkashCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const executedRef = useRef(false);

  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status");

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const finish = async () => {
      if (!paymentID || status !== "success") {
        setError(
          status === "cancel"
            ? "আপনি পেমেন্টটি বাতিল করেছেন। অর্ডারটি পেমেন্টের অপেক্ষায় থাকবে।"
            : "পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন।"
        );
        return;
      }

      const { data, error: execError } = await supabase.bkash.executePayment(paymentID);
      if (execError || !data?.ok) {
        setError((execError as any)?.message || "পেমেন্ট যাচাই করা যায়নি। আমাদের সাথে যোগাযোগ করুন।");
        return;
      }

      const orderNumber = data.order_number || sessionStorage.getItem("bkash_order_number");
      sessionStorage.removeItem("bkash_order_number");
      navigate("/thank-you", { state: { orderNumber }, replace: true });
    };

    finish();
  }, [paymentID, status, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-20 text-center">
        {error ? (
          <div className="max-w-md mx-auto space-y-4">
            <XCircle className="w-14 h-14 text-destructive mx-auto" />
            <h1 className="text-xl font-bold">পেমেন্ট সম্পন্ন হয়নি</h1>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex justify-center gap-3">
              <Link to="/track-order"><Button variant="outline" className="rounded-full">অর্ডার ট্র্যাক করুন</Button></Link>
              <Link to="/"><Button className="rounded-full">হোমে ফিরুন</Button></Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">পেমেন্ট যাচাই করা হচ্ছে, অপেক্ষা করুন...</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

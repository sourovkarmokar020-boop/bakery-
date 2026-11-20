import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone, Download, Loader2 } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { openInvoice } from "@/lib/invoiceTemplate";
import { useToast } from "@/hooks/use-toast";
import { trackPurchase } from "@/components/TrackingManager";

const ThankYouPage = () => {
  const location = useLocation();
  const orderNumber = (location.state as { orderNumber?: string } | null)?.orderNumber;
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  // Track purchase on thank you page (backup if not tracked in cart)
  const purchaseTracked = useRef(false);
  useEffect(() => {
    if (orderNumber && !purchaseTracked.current) {
      purchaseTracked.current = true;
      // Fetch order data and track purchase
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("order_number", orderNumber)
        .maybeSingle()
        .then(({ data: order }) => {
          if (order && order.order_items) {
            trackPurchase({
              transaction_id: orderNumber,
              value: Number(order.total),
              currency: "BDT",
              content_ids: order.order_items.map((i: any) => String(i.product_id || i.product_name)),
              content_names: order.order_items.map((i: any) => i.product_name),
              num_items: order.order_items.length,
              phone: order.customer_phone,
            });
          }
        })
        .catch(() => {});
    }
  }, [orderNumber]);

  const downloadInvoice = async () => {
    if (!orderNumber) return;
    setDownloading(true);
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("*, order_statuses(id, name, color)")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (!order) {
        toast({ title: "অর্ডার তথ্য পাওয়া যায়নি", variant: "destructive" });
        return;
      }
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
      openInvoice(order, items || [], settings);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">অর্ডার সফল হয়েছে!</h1>
          <p className="text-muted-foreground mb-2">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।</p>
          <p className="text-muted-foreground mb-6">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
            <p className="font-semibold mb-2">যেকোনো প্রশ্নে কল করুন</p>
            <a href="tel:09647132995" className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:underline">
              <Phone className="h-5 w-5" /> 09647132995
            </a>
          </div>

          {orderNumber && (
            <Button variant="secondary" className="rounded-full px-8 mb-4" onClick={downloadInvoice} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              ইনভয়েস ডাউনলোড করুন
            </Button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="rounded-full px-8">আরও শপিং করুন</Button>
            </Link>
            <Link to="/track-order">
              <Button variant="outline" className="rounded-full px-8">অর্ডার ট্র্যাক করুন</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ThankYouPage;

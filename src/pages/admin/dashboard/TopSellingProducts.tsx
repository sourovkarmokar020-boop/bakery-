import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocalImageUrl } from "@/lib/productImages";

interface TopProduct {
  product_name: string;
  product_image: string | null;
  total_qty: number;
  total_revenue: number;
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    fetchTop();
  }, []);

  const fetchTop = async () => {
    const { data } = await supabase
      .from("order_items")
      .select("product_name, product_image, quantity, price");

    if (!data) return;

    const map: Record<string, TopProduct> = {};
    data.forEach((item) => {
      if (!map[item.product_name]) {
        map[item.product_name] = {
          product_name: item.product_name,
          product_image: item.product_image,
          total_qty: 0,
          total_revenue: 0,
        };
      }
      map[item.product_name].total_qty += item.quantity;
      map[item.product_name].total_revenue += item.quantity * Number(item.price);
    });

    const sorted = Object.values(map)
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5);

    setProducts(sorted);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">টপ সেলিং প্রোডাক্ট</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">কোনো ডেটা নেই</p>
        ) : (
          products.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
              {p.product_image ? (
                <img src={resolveLocalImageUrl(p.product_image)} alt={p.product_name} className="w-10 h-10 rounded object-cover" />
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs">N/A</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.product_name}</p>
                <p className="text-xs text-muted-foreground">{p.total_qty}টি বিক্রি • ৳{p.total_revenue.toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

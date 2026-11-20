import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocalImageUrl } from "@/lib/productImages";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  stock_quantity: number | null;
  image_url: string | null;
}

export default function InventoryAlerts() {
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [outOfStock, setOutOfStock] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, stock_quantity, image_url")
      .eq("is_active", true)
      .lte("stock_quantity", 10)
      .order("stock_quantity", { ascending: true });

    if (!data) return;
    setOutOfStock(data.filter((p) => (p.stock_quantity || 0) === 0));
    setLowStock(data.filter((p) => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 10));
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">ইনভেন্টরি অ্যালার্ট</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {outOfStock.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">স্টক আউট ({outOfStock.length})</span>
            </div>
            <div className="space-y-2">
              {outOfStock.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
                  onClick={() => navigate(`/admin/products`)}
                >
                  {p.image_url ? (
                    <img src={resolveLocalImageUrl(p.image_url)} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted" />
                  )}
                  <span className="text-sm truncate flex-1">{p.name}</span>
                  <Badge variant="destructive" className="text-xs">০</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {lowStock.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-600">লো স্টক ({lowStock.length})</span>
            </div>
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
                  onClick={() => navigate(`/admin/products`)}
                >
                  {p.image_url ? (
                    <img src={resolveLocalImageUrl(p.image_url)} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted" />
                  )}
                  <span className="text-sm truncate flex-1">{p.name}</span>
                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">{p.stock_quantity}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {outOfStock.length === 0 && lowStock.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">সব প্রোডাক্টের স্টক ঠিক আছে ✅</p>
        )}
      </CardContent>
    </Card>
  );
}

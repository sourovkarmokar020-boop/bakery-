import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RecentOrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatuses();
    fetchOrders();
  }, []);

  const fetchStatuses = async () => {
    const { data } = await supabase.from("order_statuses").select("*").order("sort_order");
    setStatuses(data || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_statuses(name, color)")
      .order("created_at", { ascending: false })
      .limit(15);
    setOrders(data || []);
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(s) ||
      o.customer_name?.toLowerCase().includes(s) ||
      o.customer_phone?.includes(s)
    );
  });

  const updateStatus = async (orderId: string, statusId: string) => {
    const { error } = await supabase.from("orders").update({ status_id: statusId }).eq("id", orderId);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
      fetchOrders();
    }
  };

  const viewOrder = async (order: any) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    setOrderItems(data || []);
  };

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">সাম্প্রতিক অর্ডার</CardTitle>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/orders")}>সব দেখুন</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="অর্ডার নং, নাম বা ফোন দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">কোনো অর্ডার নেই</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অর্ডার</th>
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider">কাস্টমার</th>
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider">মোট</th>
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-2">
                        <p className="font-mono text-xs">#{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("bn-BD")}</p>
                      </td>
                      <td className="py-2 px-2">
                        <p className="text-xs font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                      </td>
                      <td className="py-2 px-2 font-semibold text-xs">৳{Number(order.total).toLocaleString()}</td>
                      <td className="py-2 px-2">
                        <Select
                          value={order.status_id}
                          onValueChange={(val) => updateStatus(order.id, val)}
                        >
                          <SelectTrigger className="h-7 text-xs w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <span style={{ color: s.color }}>{s.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => viewOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>অর্ডার #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">{selectedOrder.customer_name}</p>
                <p className="text-muted-foreground">{selectedOrder.customer_phone}</p>
                <p className="text-muted-foreground">{selectedOrder.customer_address}</p>
              </div>
              <div className="border-t pt-2 space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>মোট</span>
                <span>৳{Number(selectedOrder.total).toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

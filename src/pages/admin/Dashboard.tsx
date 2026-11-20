import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingCart, Package, Users, DollarSign, Bell, ExternalLink } from "lucide-react";
import RevenueChart from "./dashboard/RevenueChart";
import TopSellingProducts from "./dashboard/TopSellingProducts";
import InventoryAlerts from "./dashboard/InventoryAlerts";
import CourierSettingsCard from "./dashboard/CourierSettingsCard";
import RecentOrdersSection from "./dashboard/RecentOrdersSection";

interface OrderStatus {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [notifyOn, setNotifyOn] = useState(true);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todayOrders: 0,
    statusCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [orders, customers, statusRows] = await Promise.all([
      supabase.from("orders").select("id, total, status_id, created_at"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("order_statuses").select("*").order("sort_order"),
    ]);

    const orderData = (orders.data as any[]) || [];
    const totalRevenue = orderData.reduce((sum, o) => sum + Number(o.total || 0), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orderData.filter((o) => new Date(o.created_at) >= todayStart).length;

    const statusCounts: Record<string, number> = {};
    orderData.forEach((o) => {
      if (o.status_id) statusCounts[o.status_id] = (statusCounts[o.status_id] || 0) + 1;
    });

    setStatuses((statusRows.data as any[]) || []);
    setStats({
      totalOrders: orderData.length,
      totalCustomers: customers.count || 0,
      totalRevenue,
      todayOrders,
      statusCounts,
    });
  };

  const avgOrder = stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;

  const today = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

  const statCards = [
    { label: "মোট অর্ডার", value: stats.totalOrders, icon: <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />, gradient: "from-blue-500 to-indigo-600", link: "/admin/orders" },
    { label: "মোট সেলস", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, gradient: "from-emerald-500 to-teal-600", link: "/admin/orders" },
    { label: "কাস্টমার", value: stats.totalCustomers, icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, gradient: "from-orange-400 to-rose-500", link: "/admin/customers" },
    { label: "গড় অর্ডার", value: `৳${avgOrder.toLocaleString()}`, icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" />, gradient: "from-violet-500 to-purple-600", link: "/admin/orders" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Colorful welcome header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-emerald-600 to-teal-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">ড্যাশবোর্ড</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-0.5">{today} · আজ {stats.todayOrders}টি অর্ডার এসেছে 🎉</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              className={cn("gap-2 rounded-full bg-white/15 text-white border-0 hover:bg-white/25", notifyOn && "bg-white/25")}
              onClick={() => setNotifyOn((v) => !v)}
            >
              <Bell className="w-4 h-4" /> <span className="hidden sm:inline">নোটিফিকেশন</span> {notifyOn ? "চালু" : "বন্ধ"}
            </Button>
            <Button variant="secondary" size="sm" className="gap-2 rounded-full bg-white/15 text-white border-0 hover:bg-white/25" onClick={() => window.open("/", "_blank")}>
              <ExternalLink className="w-4 h-4" /> সাইট ভিজিট
            </Button>
          </div>
        </div>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className={cn(
              "cursor-pointer border-none shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden text-white bg-gradient-to-br",
              s.gradient
            )}
            onClick={() => navigate(s.link)}
          >
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/20 shrink-0">{s.icon}</div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{s.value}</p>
                <p className="text-[11px] sm:text-xs opacity-90">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order status mini cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">অর্ডার স্ট্যাটাস অনুযায়ী</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {statuses.map((s) => (
            <Card
              key={s.id}
              className="cursor-pointer border-none shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              style={{ background: `linear-gradient(135deg, ${s.color}22, ${s.color}0d)`, borderLeft: `4px solid ${s.color}` }}
              onClick={() => navigate(`/admin/orders?status=${encodeURIComponent(s.name)}`)}
            >
              <CardContent className="p-2.5 sm:p-3">
                <p className="text-lg sm:text-xl font-bold" style={{ color: s.color }}>{stats.statusCounts[s.id] || 0}</p>
                <p className="text-[11px] sm:text-xs text-foreground/70 truncate" title={s.name}>{s.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sales Chart + Top Selling */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <TopSellingProducts />
      </div>

      {/* Inventory + Courier Settings */}
      <div className="grid lg:grid-cols-2 gap-4">
        <InventoryAlerts />
        <CourierSettingsCard />
      </div>

      {/* Recent Orders with filters */}
      <RecentOrdersSection />
    </div>
  );
}

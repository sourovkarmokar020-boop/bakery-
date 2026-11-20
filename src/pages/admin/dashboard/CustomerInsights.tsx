import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Users } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

const chartConfig = {
  new: { label: "নতুন", color: COLORS[0] },
  returning: { label: "পুরাতন", color: COLORS[1] },
};

interface TopCustomer {
  name: string;
  phone: string;
  total_spent: number;
  total_orders: number;
}

export default function CustomerInsights() {
  const [newCount, setNewCount] = useState(0);
  const [returningCount, setReturningCount] = useState(0);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    const { data: customers } = await supabase
      .from("customers")
      .select("name, phone, total_orders, total_spent")
      .order("total_spent", { ascending: false });

    if (!customers) return;

    const newC = customers.filter((c) => (c.total_orders || 0) <= 1).length;
    const retC = customers.filter((c) => (c.total_orders || 0) > 1).length;
    setNewCount(newC);
    setReturningCount(retC);
    setTopCustomers(
      customers
        .filter((c) => (c.total_spent || 0) > 0)
        .slice(0, 5)
        .map((c) => ({
          name: c.name,
          phone: c.phone,
          total_spent: Number(c.total_spent || 0),
          total_orders: c.total_orders || 0,
        }))
    );
  };

  const pieData = [
    { name: "নতুন", value: newCount },
    { name: "পুরাতন", value: returningCount },
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">কাস্টমার ইনসাইট</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pie chart */}
        <div className="flex items-center gap-4">
          <ChartContainer config={chartConfig} className="h-[120px] w-[120px]">
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
              <span>নতুন: {newCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
              <span>পুরাতন: {returningCount}</span>
            </div>
          </div>
        </div>

        {/* Top customers */}
        {topCustomers.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Users className="w-4 h-4" /> টপ কাস্টমার
            </p>
            <div className="space-y-2">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone} • {c.total_orders} অর্ডার</p>
                  </div>
                  <span className="font-semibold">৳{c.total_spent.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

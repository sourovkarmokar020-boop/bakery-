import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

const chartConfig = {
  revenue: { label: "আয়", color: "hsl(var(--primary))" },
};

type RangeMode = "today" | "yesterday" | 7 | 30 | "month" | "custom";

const RANGE_OPTIONS: { mode: RangeMode; label: string }[] = [
  { mode: "today", label: "আজ" },
  { mode: "yesterday", label: "গতকাল" },
  { mode: 7, label: "৭ দিন" },
  { mode: 30, label: "৩০ দিন" },
  { mode: "month", label: "এই মাস" },
];

function getBounds(mode: RangeMode, custom?: DateRange): { from: Date; to: Date; hourly: boolean } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  if (mode === "today") return { from: startOfDay(now), to: endOfDay(now), hourly: true };
  if (mode === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { from: startOfDay(y), to: endOfDay(y), hourly: true };
  }
  if (mode === "month") return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now), hourly: false };
  if (mode === "custom" && custom?.from) {
    return { from: startOfDay(custom.from), to: endOfDay(custom.to || custom.from), hourly: false };
  }
  const from = new Date(now);
  from.setDate(from.getDate() - (mode as number) + 1);
  return { from: startOfDay(from), to: endOfDay(now), hourly: false };
}

export default function RevenueChart() {
  const [mode, setMode] = useState<RangeMode>(7);
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [orders, setOrders] = useState<{ total: number; created_at: string }[]>([]);

  const { from, to, hourly } = useMemo(() => getBounds(mode, customRange), [mode, customRange]);

  useEffect(() => {
    fetchData();
  }, [from.getTime(), to.getTime()]);

  const fetchData = async () => {
    const { data } = await supabase
      .from("orders")
      .select("total, created_at")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());
    setOrders((data as any[]) || []);
  };

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    if (hourly) {
      for (let h = 0; h < 24; h += 2) grouped[String(h).padStart(2, "0") + ":00"] = 0;
      orders.forEach((o) => {
        const d = new Date(o.created_at);
        const bucket = String(Math.floor(d.getHours() / 2) * 2).padStart(2, "0") + ":00";
        grouped[bucket] = (grouped[bucket] || 0) + Number(o.total || 0);
      });
      return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
    }

    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      grouped[d.toISOString().split("T")[0]] = 0;
    }
    orders.forEach((o) => {
      const key = new Date(o.created_at).toISOString().split("T")[0];
      if (grouped[key] !== undefined) grouped[key] += Number(o.total || 0);
    });
    return Object.entries(grouped).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      revenue,
    }));
  }, [orders, hourly, from, to]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalOrders = orders.length;
  const peakRevenue = chartData.reduce((max, d) => Math.max(max, d.revenue), 0);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 flex-wrap gap-2">
        <CardTitle className="text-base">সেলস চার্ট</CardTitle>
        <div className="flex gap-1 flex-wrap">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={String(opt.mode)}
              size="sm"
              variant={mode === opt.mode ? "default" : "outline"}
              onClick={() => setMode(opt.mode)}
            >
              {opt.label}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant={mode === "custom" ? "default" : "outline"} className="gap-1">
                <CalendarIcon className="w-3.5 h-3.5" /> তারিখ
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={(range) => {
                  setCustomRange(range);
                  if (range?.from) setMode("custom");
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} tickFormatter={(v) => `৳${v}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ChartContainer>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t text-center">
          <div>
            <p className="text-xs text-muted-foreground">সর্বোচ্চ বিক্রি</p>
            <p className="font-semibold">৳{peakRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">মোট অর্ডার</p>
            <p className="font-semibold">{totalOrders}টি</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">মোট আয়</p>
            <p className="font-semibold">৳{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

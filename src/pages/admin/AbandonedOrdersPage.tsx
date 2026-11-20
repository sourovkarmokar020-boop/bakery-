import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search, Trash2, CalendarIcon, Download, X, RefreshCw, Eye,
  ChevronLeft, ChevronRight, Phone,
} from "lucide-react";

const ITEMS_PER_PAGE = 20;

interface AbandonedCartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AbandonedCart {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  delivery_area: string | null;
  delivery_charge: number;
  payment_method: string | null;
  items: AbandonedCartItem[];
  total: number;
  created_at: string;
  recovered: boolean;
}

export default function AbandonedOrdersPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [viewCart, setViewCart] = useState<AbandonedCart | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    const { data } = await supabase
      .from("abandoned_carts")
      .select("*")
      .order("created_at", { ascending: false });
    setCarts((data as any[]) || []);
  };

  const filtered = useMemo(() => {
    let result = carts;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.customer_name || "").toLowerCase().includes(s) ||
          (c.customer_phone || "").includes(s) ||
          (c.customer_address || "").toLowerCase().includes(s)
      );
    }
    if (statusFilter === "recovered") result = result.filter((c) => c.recovered);
    if (statusFilter === "pending") result = result.filter((c) => !c.recovered);
    if (startDate) result = result.filter((c) => new Date(c.created_at) >= startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((c) => new Date(c.created_at) <= end);
    }
    return result;
  }, [carts, search, statusFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((c) => c.id)));
    }
  };

  const deleteOne = async (id: string) => {
    await supabase.from("abandoned_carts").delete().eq("id", id);
    toast({ title: "ডিলিট হয়েছে", variant: "destructive" });
    setCarts((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await supabase.from("abandoned_carts").delete().in("id", ids);
    toast({ title: `${ids.length}টি অসম্পূর্ণ অর্ডার ডিলিট হয়েছে`, variant: "destructive" });
    setCarts((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    setDeleteConfirmOpen(false);
  };

  const exportExcel = () => {
    const headers = ["নাম", "ফোন", "ঠিকানা", "এলাকা", "পেমেন্ট", "মোট", "তারিখ", "স্ট্যাটাস"];
    const rows = filtered.map((c) => [
      c.customer_name || "",
      c.customer_phone || "",
      c.customer_address || "",
      c.delivery_area || "",
      c.payment_method || "",
      c.total,
      new Date(c.created_at).toLocaleString("bn-BD"),
      c.recovered ? "উদ্ধার হয়েছে" : "অসম্পূর্ণ",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abandoned-orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">অসম্পূর্ণ অর্ডার</h1>
        <p className="text-sm text-muted-foreground mt-0.5">মোট {filtered.length}টি পরিত্যক্ত কার্ট</p>
      </div>

      {/* Filter Section */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "শুরুর তারিখ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "শেষ তারিখ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="pending">অসম্পূর্ণ</SelectItem>
                <SelectItem value="recovered">উদ্ধার হয়েছে</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="নাম, ফোন, ঠিকানা..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
            <Button size="sm" onClick={() => { fetchCarts(); setPage(1); }}>
              <RefreshCw className="w-4 h-4 mr-1" /> রিফ্রেশ
            </Button>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" /> ক্লিয়ার
            </Button>
            <Button size="sm" variant="secondary" onClick={exportExcel} className="ml-auto">
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <span className="text-sm font-medium text-foreground">{selectedIds.size}টি সিলেক্ট করা হয়েছে</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> বাল্ক ডিলিট
            </Button>
          </div>
        </div>
      )}

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">কোনো অসম্পূর্ণ অর্ডার নেই</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-3 w-10">
                      <Checkbox checked={paginated.length > 0 && selectedIds.size === paginated.length} onCheckedChange={toggleSelectAll} />
                    </th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">কাস্টমার</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ফোন</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider min-w-[160px]">ঠিকানা / এলাকা</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">আইটেম</th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">মোট</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">তারিখ</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id} className={cn("border-b last:border-0 hover:bg-muted/30 transition-colors", selectedIds.has(c.id) && "bg-primary/5")}>
                      <td className="py-2.5 px-3">
                        <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                      </td>
                      <td className="py-2.5 px-3 font-medium">{c.customer_name || "অজানা"}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {c.customer_phone ? (
                          <a href={`tel:${c.customer_phone}`} className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                            <Phone className="w-3.5 h-3.5" /> {c.customer_phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-[220px] truncate" title={c.customer_address || ""}>
                        {c.customer_address || "-"} {c.delivery_area ? `(${c.delivery_area})` : ""}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{(c.items || []).length}টি</td>
                      <td className="py-2.5 px-3 font-semibold text-primary text-right">৳{Number(c.total).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <p className="text-xs">{new Date(c.created_at).toLocaleDateString("bn-BD")}</p>
                        <p className="text-[10px]">{new Date(c.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        {c.recovered ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">উদ্ধার হয়েছে</Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">অসম্পূর্ণ</Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewCart(c)} className="p-1.5 rounded-md hover:bg-muted text-blue-600" title="দেখুন">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteOne(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="ডিলিট">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewCart} onOpenChange={() => setViewCart(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewCart?.customer_name || "অজানা কাস্টমার"}</DialogTitle></DialogHeader>
          {viewCart && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                <div><span className="text-muted-foreground">ফোন:</span> <strong>{viewCart.customer_phone || "-"}</strong></div>
                <div><span className="text-muted-foreground">পেমেন্ট:</span> <strong>{viewCart.payment_method || "-"}</strong></div>
                <div className="col-span-2"><span className="text-muted-foreground">ঠিকানা:</span> <strong>{viewCart.customer_address || "-"}</strong></div>
                <div><span className="text-muted-foreground">এলাকা:</span> <strong>{viewCart.delivery_area || "-"}</strong></div>
                <div><span className="text-muted-foreground">তারিখ:</span> <strong>{new Date(viewCart.created_at).toLocaleString("bn-BD")}</strong></div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50"><th className="py-2 px-3 text-left">প্রোডাক্ট</th><th className="py-2 px-3 text-center">পরিমাণ</th><th className="py-2 px-3 text-right">মূল্য</th></tr></thead>
                  <tbody>
                    {(viewCart.items || []).map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">৳{Number(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right space-y-1 p-3 bg-muted/30 rounded-lg">
                <p>ডেলিভারি চার্জ: ৳{Number(viewCart.delivery_charge || 0).toLocaleString()}</p>
                <p className="text-lg font-bold border-t pt-2">মোট: ৳{Number(viewCart.total).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>ডিলিট কনফার্ম</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">আপনি কি নিশ্চিত যে {selectedIds.size}টি অসম্পূর্ণ অর্ডার ডিলিট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>বাতিল</Button>
            <Button variant="destructive" onClick={bulkDelete}>ডিলিট করুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

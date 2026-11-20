import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { openInvoice } from "@/lib/invoiceTemplate";
import {
  Eye, Search, Trash2, Printer, CalendarIcon, Download, Settings2,
  Pencil, ChevronLeft, ChevronRight, UserCheck, RefreshCw, X,
  Phone, MessageCircle, MapPin, Ban, Plus, Loader2, Save, ShieldAlert,
  Copy, Truck,
} from "lucide-react";

const ITEMS_PER_PAGE = 20;

const STATUS_BADGE_COLORS: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "In Courier": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "On The Way": "bg-teal-100 text-teal-700 border-teal-200",
  "On Hold": "bg-gray-100 text-gray-600 border-gray-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Returned: "bg-rose-100 text-rose-600 border-rose-200",
};

const COURIER_OPTIONS = ["Steadfast", "Pathao", "RedX", "Sundarban", "SA Paribahan"];

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  cod: "bg-amber-100 text-amber-700 border-amber-200",
  bkash: "bg-pink-100 text-pink-700 border-pink-200",
  nagad: "bg-orange-100 text-orange-700 border-orange-200",
};

const whatsappLink = (phone: string) => {
  const digits = (phone || "").replace(/\D/g, "");
  const intl = digits.startsWith("880") ? digits : digits.startsWith("0") ? `880${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
};

const courierName = (order: any) => {
  const provider = (order?.courier_provider || "").toLowerCase();
  if (provider === "steadfast") return "Steadfast";
  return order?.courier_provider || "";
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [orders, setOrders] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedCouriers, setSelectedCouriers] = useState<Set<string>>(new Set());
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [steadfastConnected, setSteadfastConnected] = useState(false);
  const [sendingCourierId, setSendingCourierId] = useState<string | null>(null);
  const { toast } = useToast();
  const { settings } = useSiteSettings();

  // Edit order
  const [editOrder, setEditOrder] = useState<any>(null);
  const [editCustomer, setEditCustomer] = useState({ name: "", phone: "", address: "", area: "" });
  const [editItems, setEditItems] = useState<any[]>([]);
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearching, setProductSearching] = useState(false);

  // Block customer
  const [blockTarget, setBlockTarget] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    fetchStatuses();
    fetchSteadfastSettings();
  }, []);
  useEffect(() => { 
    if (statuses.length > 0) fetchOrders(); 
  }, [statusFilter, statuses]);

  const fetchStatuses = async () => {
    const { data } = await supabase.from("order_statuses").select("*").order("sort_order");
    setStatuses(data || []);
  };

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*, order_statuses(id, name, color)").order("created_at", { ascending: false });
    if (statusFilter) {
      const status = statuses.find(s => s.name === statusFilter);
      if (status) query = query.eq("status_id", status.id);
    }
    const { data } = await query;
    setOrders(data || []);
  };

  const fetchSteadfastSettings = async () => {
    const { data } = await supabase.courier.getSteadfast();
    setSteadfastConnected(!!(data?.enabled && data?.api_key_present && data?.secret_key_present));
  };

  const filtered = useMemo(() => {
    let result = orders;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(o =>
        o.order_number?.toLowerCase().includes(s) ||
        o.customer_name?.toLowerCase().includes(s) ||
        o.customer_phone?.includes(s) ||
        o.customer_address?.toLowerCase().includes(s) ||
        o.courier_tracking_code?.toLowerCase().includes(s) ||
        String(o.courier_consignment_id || o.courier_order_id || "").toLowerCase().includes(s)
      );
    }
    if (selectedCouriers.size > 0) {
      result = result.filter(o => selectedCouriers.has(courierName(o)));
    }
    if (startDate) {
      result = result.filter(o => new Date(o.created_at) >= startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.created_at) <= end);
    }
    return result;
  }, [orders, search, selectedCouriers, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedOrders = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const updateStatus = async (orderId: string, statusId: string) => {
    await supabase.from("orders").update({ status_id: statusId }).eq("id", orderId);
    toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
    fetchOrders();
  };

  const viewOrder = async (order: any) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    setOrderItems(data || []);
  };

  const openEdit = async (order: any) => {
    setEditOrder(order);
    setEditCustomer({
      name: order.customer_name || "",
      phone: order.customer_phone || "",
      address: order.customer_address || "",
      area: order.delivery_area || "",
    });
    setEditDiscount(Number(order.discount) || 0);
    setRemovedItemIds([]);
    setProductQuery("");
    if (allProducts.length === 0) {
      setProductSearching(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, base_price, sale_price, image_url")
        .eq("is_active", true);
      setAllProducts(data || []);
      setProductSearching(false);
    }
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    setEditItems((data || []).map((i: any) => ({ ...i, price: Number(i.price), quantity: Number(i.quantity) })));
  };

  const productResults = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return allProducts.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [productQuery, allProducts]);

  const addProductToEdit = (product: any) => {
    setEditItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url || null,
        price: Number(product.sale_price ?? product.base_price ?? 0),
        quantity: 1,
        variant_info: null,
      },
    ]);
    setProductQuery("");
  };

  const updateEditItem = (index: number, patch: Partial<{ quantity: number; price: number }>) => {
    setEditItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeEditItem = (index: number) => {
    setEditItems((prev) => {
      const item = prev[index];
      if (item.id) setRemovedItemIds((ids) => [...ids, item.id]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const editSubtotal = useMemo(
    () => editItems.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0),
    [editItems]
  );
  const editTotal = Math.max(0, editSubtotal + Number(editOrder?.delivery_charge || 0) - Number(editDiscount || 0));

  const saveEdit = async () => {
    if (!editOrder) return;
    if (editItems.length === 0) {
      toast({ title: "অন্তত একটি পণ্য থাকতে হবে", variant: "destructive" });
      return;
    }
    setEditSaving(true);
    try {
      for (const id of removedItemIds) {
        await supabase.from("order_items").delete().eq("id", id);
      }
      for (const item of editItems) {
        if (item.id) {
          await supabase.from("order_items").update({ price: item.price, quantity: item.quantity }).eq("id", item.id);
        } else {
          await supabase.from("order_items").insert({
            order_id: editOrder.id,
            product_id: item.product_id || null,
            product_name: item.product_name,
            product_image: item.product_image || null,
            price: item.price,
            quantity: item.quantity,
            variant_info: item.variant_info || null,
          });
        }
      }
      await supabase.from("orders").update({
        customer_name: editCustomer.name,
        customer_phone: editCustomer.phone,
        customer_address: editCustomer.address,
        delivery_area: editCustomer.area,
        subtotal: editSubtotal,
        discount: editDiscount,
        total: editTotal,
      }).eq("id", editOrder.id);

      toast({ title: "অর্ডার আপডেট হয়েছে" });
      setEditOrder(null);
      fetchOrders();
    } finally {
      setEditSaving(false);
    }
  };

  const blockCustomer = async () => {
    if (!blockTarget) return;
    setBlocking(true);
    try {
      await supabase.from("blocked_customers").insert({
        customer_name: blockTarget.customer_name || null,
        phone: blockTarget.customer_phone || null,
        ip_address: blockTarget.customer_ip || null,
        reason: blockReason || null,
      });
      toast({ title: "কাস্টমার ব্লক করা হয়েছে", variant: "destructive" });
      setBlockTarget(null);
      setBlockReason("");
    } finally {
      setBlocking(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map(o => o.id)));
    }
  };

  const bulkUpdateStatus = async (statusId: string) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await supabase.from("orders").update({ status_id: statusId }).eq("id", id);
    }
    toast({ title: `${ids.length}টি অর্ডার আপডেট হয়েছে` });
    setSelectedIds(new Set());
    setBulkStatusDialogOpen(false);
    fetchOrders();
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    // Delete order items first, then orders
    for (const id of ids) {
      await supabase.from("order_items").delete().eq("order_id", id);
      await supabase.from("orders").delete().eq("id", id);
    }
    toast({ title: `${ids.length}টি অর্ডার ডিলিট হয়েছে`, variant: "destructive" });
    setSelectedIds(new Set());
    setDeleteConfirmOpen(false);
    fetchOrders();
  };

  const handlePrint = () => {
    window.print();
  };

  const printInvoice = (order: any, items: any[]) => {
    openInvoice(order, items, settings);
  };

  const copyText = async (value?: string | number | null, label = "Value") => {
    if (!value) return;
    const text = String(value);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast({ title: `${label} copied` });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const sendToSteadfast = async (order: any) => {
    if (!steadfastConnected) {
      toast({ title: "Steadfast is not connected", variant: "destructive" });
      return;
    }

    setSendingCourierId(order.id);
    try {
      const { data, error } = await supabase.courier.sendSteadfastOrder(order.id);
      if (error) throw new Error(error.message || "Steadfast order send failed");

      const updatedOrder = data?.order;
      const trackingCode = updatedOrder?.courier_tracking_code || data?.steadfast?.consignment?.tracking_code || data?.steadfast?.tracking_code;
      const nextStatus = updatedOrder
        ? statuses.find((status) => status.id === updatedOrder.status_id) || statuses.find((status) => status.name === "In Courier")
        : null;

      if (updatedOrder) {
        setOrders((prev) => prev.map((row) => (
          row.id === order.id ? { ...row, ...updatedOrder, order_statuses: nextStatus || row.order_statuses } : row
        )));
        setSelectedOrder((prev: any) => (
          prev?.id === order.id ? { ...prev, ...updatedOrder, order_statuses: nextStatus || prev.order_statuses } : prev
        ));
      }

      toast({ title: trackingCode ? `Sent to Steadfast: ${trackingCode}` : "Sent to Steadfast" });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Steadfast send failed",
        description: error?.message || "Please check courier settings and order details.",
        variant: "destructive",
      });
    } finally {
      setSendingCourierId(null);
    }
  };

  const exportExcel = () => {
    const headers = ["অর্ডার নং", "তারিখ", "কাস্টমার", "ফোন", "ঠিকানা", "এলাকা", "মোট", "পেমেন্ট", "স্ট্যাটাস"];
    const rows = filtered.map(o => [
      o.order_number, new Date(o.created_at).toLocaleDateString("bn-BD"),
      o.customer_name, o.customer_phone, o.customer_address, o.delivery_area,
      o.total, `${o.payment_method}/${o.payment_status}`, o.order_statuses?.name || ""
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map((c: any) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedCouriers(new Set());
    setSearchParams({});
    setPage(1);
  };

  const getStatusBadge = (statusName: string) => {
    const colors = STATUS_BADGE_COLORS[statusName] || "bg-muted text-muted-foreground border-border";
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`;
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">অর্ডার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {filtered.length}টি অর্ডার {statusFilter && `(${statusFilter})`}</p>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Start Date */}
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

            {/* End Date */}
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

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => { setSearchParams(val ? { status: val } : {}); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                {statuses.map(s => (
                  <SelectItem key={s.id} value={s.name}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="অর্ডার নং, নাম, ফোন..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Courier Options & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-3">
              {COURIER_OPTIONS.map(c => (
                <label key={c} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox
                    checked={selectedCouriers.has(c)}
                    onCheckedChange={(checked) => {
                      setSelectedCouriers(prev => {
                        const next = new Set(prev);
                        checked ? next.add(c) : next.delete(c);
                        return next;
                      });
                    }}
                  />
                  {c}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" onClick={() => { fetchOrders(); setPage(1); }}>
                <RefreshCw className="w-4 h-4 mr-1" /> ফিল্টার
              </Button>
              <Button size="sm" variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" /> ক্লিয়ার
              </Button>
              <Button size="sm" variant="secondary" onClick={exportExcel}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <span className="text-sm font-medium text-foreground">{selectedIds.size}টি সিলেক্ট করা হয়েছে</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {/* assign user logic */}}>
              <UserCheck className="w-4 h-4 mr-1" /> Assign User
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setBulkStatusDialogOpen(true)}>
              <Settings2 className="w-4 h-4 mr-1" /> Change Status
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete All
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-3 w-10">
                    <Checkbox checked={paginatedOrders.length > 0 && selectedIds.size === paginatedOrders.length} onCheckedChange={toggleSelectAll} />
                  </th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase">SL</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase">অ্যাকশন</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase">ইনভয়েস</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase">তারিখ</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase min-w-[220px]">কাস্টমার</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase">পেমেন্ট</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase">স্ট্যাটাস</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase">ট্র্যাকিং</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি</td></tr>
                ) : paginatedOrders.map((order, idx) => {
                  const statusName = order.order_statuses?.name || "Unknown";
                  const paid = order.payment_status === "paid" ? Number(order.total) : 0;
                  const due = Number(order.total) - paid;
                  const trackingCode = order.courier_tracking_code || "";
                  const steadfastOrderId = order.courier_consignment_id || order.courier_order_id || "";
                  const isSentToSteadfast = Boolean(trackingCode || steadfastOrderId);
                  return (
                    <tr key={order.id} className={cn("border-b transition-colors hover:bg-muted/30", selectedIds.has(order.id) && "bg-primary/5")}>
                      <td className="py-3 px-3">
                        <Checkbox checked={selectedIds.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => viewOrder(order)} className="p-1.5 rounded-md hover:bg-muted text-blue-600" title="দেখুন">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/fraud-checker?phone=${encodeURIComponent(order.customer_phone || "")}`)}
                            className="p-1.5 rounded-md hover:bg-muted text-red-500"
                            title="ফ্রড চেক করুন"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(order)} className="p-1.5 rounded-md hover:bg-muted text-amber-600" title="এডিট">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {steadfastConnected && !isSentToSteadfast && (
                            <button
                              onClick={() => sendToSteadfast(order)}
                              disabled={sendingCourierId === order.id}
                              className="p-1.5 rounded-md hover:bg-cyan-50 text-cyan-600 disabled:opacity-60"
                              title="Send to Steadfast"
                            >
                              {sendingCourierId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Truck className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              await supabase.from("order_items").delete().eq("order_id", order.id);
                              await supabase.from("orders").delete().eq("id", order.id);
                              toast({ title: "অর্ডার ডিলিট হয়েছে", variant: "destructive" });
                              fetchOrders();
                            }}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                            title="ডিলিট"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setBlockTarget(order)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="ব্লক করুন">
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-semibold text-primary cursor-pointer hover:underline" onClick={() => viewOrder(order)}>
                          #{order.order_number}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-xs">{new Date(order.created_at).toLocaleDateString("bn-BD")}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium">{order.customer_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span>{order.customer_phone}</span>
                          <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:text-blue-700" title="কল করুন">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a href={whatsappLink(order.customer_phone)} target="_blank" rel="noreferrer" className="text-[hsl(142,70%,45%)] hover:text-[hsl(142,70%,35%)]" title="হোয়াটসঅ্যাপ">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="flex items-start gap-1 mt-1 text-xs text-muted-foreground max-w-[240px]" title={order.customer_address}>
                          <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.customer_address}{order.delivery_area ? `, ${order.delivery_area}` : ""}</span>
                        </p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-semibold">৳{Number(order.total).toLocaleString()}</p>
                        <p className="text-xs text-blue-600">Paid: ৳{paid.toLocaleString()}</p>
                        {due > 0 && <p className="text-xs text-red-600">Due: ৳{due.toLocaleString()}</p>}
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1", PAYMENT_METHOD_COLORS[order.payment_method] || "bg-muted text-muted-foreground border-border")}>
                          {(order.payment_method || "cod").toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Select value={order.status_id} onValueChange={(val) => updateStatus(order.id, val)}>
                          <SelectTrigger className="h-7 text-xs w-[120px] border-0 p-0 shadow-none focus:ring-0">
                            <span className={getStatusBadge(statusName)}>{statusName}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                  {s.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-3">
                        {isSentToSteadfast ? (
                          <div className="min-w-[140px] space-y-1">
                            {trackingCode && (
                              <button
                                type="button"
                                onClick={() => copyText(trackingCode, "Tracking ID")}
                                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-blue-600 hover:underline"
                                title="Copy tracking ID"
                              >
                                <Copy className="w-3 h-3" />
                                {trackingCode}
                              </button>
                            )}
                            {steadfastOrderId && (
                              <button
                                type="button"
                                onClick={() => copyText(steadfastOrderId, "Steadfast ID")}
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                                title="Copy Steadfast ID"
                              >
                                <Copy className="w-3 h-3" />
                                SF: {steadfastOrderId}
                              </button>
                            )}
                            {order.courier_status && <p className="text-[10px] text-muted-foreground">{order.courier_status}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => setPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>অর্ডার #{selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                <div><span className="text-muted-foreground">নাম:</span> <strong>{selectedOrder.customer_name}</strong></div>
                <div><span className="text-muted-foreground">ফোন:</span> <strong>{selectedOrder.customer_phone}</strong></div>
                <div className="col-span-2"><span className="text-muted-foreground">ঠিকানা:</span> <strong>{selectedOrder.customer_address}</strong></div>
                <div><span className="text-muted-foreground">এলাকা:</span> <strong>{selectedOrder.delivery_area}</strong></div>
                <div><span className="text-muted-foreground">পেমেন্ট:</span> <strong>{selectedOrder.payment_method}</strong></div>
                <div><span className="text-muted-foreground">তারিখ:</span> <strong>{new Date(selectedOrder.created_at).toLocaleDateString("bn-BD")}</strong></div>
                {selectedOrder.payment_sender_number && (
                  <div className="col-span-2"><span className="text-muted-foreground">পেমেন্ট নম্বর:</span> <strong>{selectedOrder.payment_sender_number}</strong></div>
                )}
                {selectedOrder.payment_transaction_id && (
                  <div className="col-span-2"><span className="text-muted-foreground">ট্রানজ্যাকশন আইডি:</span> <strong>{selectedOrder.payment_transaction_id}</strong></div>
                )}
                <div>
                  <span className="text-muted-foreground">স্ট্যাটাস:</span>{" "}
                  <span className={getStatusBadge(selectedOrder.order_statuses?.name || "")}>{selectedOrder.order_statuses?.name}</span>
                </div>
                {(selectedOrder.courier_tracking_code || selectedOrder.courier_consignment_id || selectedOrder.courier_order_id) && (
                  <div className="col-span-2 flex flex-wrap gap-2 pt-2 border-t">
                    {selectedOrder.courier_tracking_code && (
                      <button
                        type="button"
                        onClick={() => copyText(selectedOrder.courier_tracking_code, "Tracking ID")}
                        className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-mono text-blue-600 hover:bg-muted"
                      >
                        <Copy className="w-3 h-3" />
                        Tracking: {selectedOrder.courier_tracking_code}
                      </button>
                    )}
                    {(selectedOrder.courier_consignment_id || selectedOrder.courier_order_id) && (
                      <button
                        type="button"
                        onClick={() => copyText(selectedOrder.courier_consignment_id || selectedOrder.courier_order_id, "Steadfast ID")}
                        className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Copy className="w-3 h-3" />
                        SF: {selectedOrder.courier_consignment_id || selectedOrder.courier_order_id}
                      </button>
                    )}
                    {selectedOrder.courier_status && (
                      <span className="inline-flex items-center rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground">
                        {selectedOrder.courier_status}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50"><th className="py-2 px-3 text-left">প্রোডাক্ট</th><th className="py-2 px-3 text-center">পরিমাণ</th><th className="py-2 px-3 text-right">মূল্য</th></tr></thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-2 px-3">{item.product_name}{item.variant_info ? ` (${item.variant_info})` : ""}</td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">৳{Number(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right space-y-1 p-3 bg-muted/30 rounded-lg">
                <p>সাবটোটাল: ৳{Number(selectedOrder.subtotal).toLocaleString()}</p>
                <p>ডেলিভারি: ৳{Number(selectedOrder.delivery_charge).toLocaleString()}</p>
                {selectedOrder.discount > 0 && <p>ডিসকাউন্ট: -৳{Number(selectedOrder.discount).toLocaleString()}</p>}
                <p className="text-lg font-bold border-t pt-2">মোট: ৳{Number(selectedOrder.total).toLocaleString()}</p>
              </div>
              {selectedOrder.notes && <p className="text-muted-foreground p-3 bg-yellow-50 rounded-lg border border-yellow-200"><strong>নোট:</strong> {selectedOrder.notes}</p>}

              {steadfastConnected && !(selectedOrder.courier_tracking_code || selectedOrder.courier_consignment_id || selectedOrder.courier_order_id) && (
                <Button variant="outline" className="w-full" onClick={() => sendToSteadfast(selectedOrder)} disabled={sendingCourierId === selectedOrder.id}>
                  {sendingCourierId === selectedOrder.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                  Send to Steadfast
                </Button>
              )}
              
              <Button className="w-full" onClick={() => printInvoice(selectedOrder, orderItems)}>
                <Printer className="w-4 h-4 mr-2" /> ইনভয়েস প্রিন্ট করুন
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Status Change Dialog */}
      <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>বাল্ক স্ট্যাটাস পরিবর্তন</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{selectedIds.size}টি অর্ডারের স্ট্যাটাস পরিবর্তন করুন</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {statuses.map(s => (
              <Button key={s.id} variant="outline" size="sm" className="justify-start" onClick={() => bulkUpdateStatus(s.id)}>
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: s.color }} />
                {s.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>ডিলিট কনফার্ম</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">আপনি কি নিশ্চিত যে {selectedIds.size}টি অর্ডার ডিলিট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>বাতিল</Button>
            <Button variant="destructive" onClick={bulkDelete}>ডিলিট করুন</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editOrder} onOpenChange={(open) => !open && setEditOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>অর্ডার এডিট করুন {editOrder && `#${editOrder.order_number}`}</DialogTitle></DialogHeader>
          {editOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">নাম</label>
                  <Input value={editCustomer.name} onChange={(e) => setEditCustomer((c) => ({ ...c, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">ফোন</label>
                  <Input value={editCustomer.phone} onChange={(e) => setEditCustomer((c) => ({ ...c, phone: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">ঠিকানা</label>
                  <Input value={editCustomer.address} onChange={(e) => setEditCustomer((c) => ({ ...c, address: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">এলাকা</label>
                  <Input value={editCustomer.area} onChange={(e) => setEditCustomer((c) => ({ ...c, area: e.target.value }))} />
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">পণ্য তালিকা</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-2 px-3 text-left">প্রোডাক্ট</th>
                        <th className="py-2 px-3 text-center w-24">পরিমাণ</th>
                        <th className="py-2 px-3 text-right w-28">একক মূল্য</th>
                        <th className="py-2 px-3 text-right w-28">মোট</th>
                        <th className="py-2 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editItems.map((item, i) => (
                        <tr key={item.id || `new-${i}`} className="border-t">
                          <td className="py-2 px-3">{item.product_name}{item.variant_info ? ` (${item.variant_info})` : ""}</td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateEditItem(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                              className="h-8 text-center"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) => updateEditItem(i, { price: Math.max(0, Number(e.target.value) || 0) })}
                              className="h-8 text-right"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-medium">৳{(item.price * item.quantity).toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <button onClick={() => removeEditItem(i)} className="p-1 rounded hover:bg-destructive/10 text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="relative">
                <label className="text-xs text-muted-foreground">নতুন পণ্য যোগ করুন</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="প্রোডাক্টের নাম লিখুন..."
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    className="pl-9"
                  />
                  {productSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                {productResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {productResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProductToEdit(p)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="w-3.5 h-3.5 text-primary" />
                          {p.name}
                        </span>
                        <span className="text-muted-foreground text-xs">৳{Number(p.sale_price ?? p.base_price ?? 0).toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">স্পেশাল ডিসকাউন্ট (৳)</label>
                  <Input
                    type="number"
                    min={0}
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div className="text-right space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">সাবটোটাল: ৳{editSubtotal.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">ডেলিভারি: ৳{Number(editOrder.delivery_charge).toLocaleString()}</p>
                  {editDiscount > 0 && <p className="text-xs text-muted-foreground">ডিসকাউন্ট: -৳{Number(editDiscount).toLocaleString()}</p>}
                  <p className="font-bold border-t pt-1">সর্বমোট: ৳{editTotal.toLocaleString()}</p>
                </div>
              </div>

              <Button className="w-full" onClick={saveEdit} disabled={editSaving}>
                {editSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                সংরক্ষণ করুন
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Customer Dialog */}
      <Dialog open={!!blockTarget} onOpenChange={(open) => !open && setBlockTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>কাস্টমার ব্লক করুন</DialogTitle></DialogHeader>
          {blockTarget && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">{blockTarget.customer_name}</strong> ({blockTarget.customer_phone}) থেকে ভবিষ্যতে কোনো অর্ডার গ্রহণ করা হবে না
                {blockTarget.customer_ip ? <> — সাথে IP <span className="font-mono">{blockTarget.customer_ip}</span>-ও ব্লক হবে</> : ""}।
              </p>
              <div>
                <label className="text-xs text-muted-foreground">কারণ (ঐচ্ছিক)</label>
                <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="যেমন: ফেক অর্ডার, বারবার রিটার্ন" />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setBlockTarget(null)}>বাতিল</Button>
                <Button variant="destructive" onClick={blockCustomer} disabled={blocking}>
                  {blocking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
                  ব্লক করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

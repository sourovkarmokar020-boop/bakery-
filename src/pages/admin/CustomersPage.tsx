import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import {
  Download,
  Loader2,
  Search,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type RoleName = "user" | "admin" | "super_admin";

interface UserRow {
  id: string | number;
  name: string;
  email: string;
  phone: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  user_id: string | null;
  total_orders: number | null;
  total_spent: number | null;
  created_at: string;
  updated_at: string;
}

interface OrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  delivery_area: string;
  total: number;
  created_at: string;
  user_id: string | null;
}

interface CustomerView extends CustomerRow {
  delivery_area?: string | null;
  last_order_at?: string | null;
}

interface ManagedUser extends UserRow {
  roles: RoleName[];
  customer?: CustomerView;
}

const ROLE_LABELS: Record<RoleName, string> = {
  user: "ইউজার",
  admin: "এডমিন",
  super_admin: "সুপার এডমিন",
};

const emptyAdminForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "admin" as RoleName,
};

function normalizePhone(phone?: string | null) {
  return (phone || "").replace(/\D/g, "");
}

function primaryRole(roles: string[] = []): RoleName {
  if (roles.includes("super_admin")) return "super_admin";
  if (roles.includes("admin")) return "admin";
  return "user";
}

function roleBadgeClass(role: RoleName) {
  if (role === "super_admin") return "bg-rose-100 text-rose-700 border-rose-200";
  if (role === "admin") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-muted text-muted-foreground border-border";
}

function money(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("bn-BD");
}

function dateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("bn-BD") : "-";
}

function errorText(error: any) {
  return error?.message || error?.errors?.email?.[0] || error?.errors?.phone?.[0] || "কাজটি সম্পন্ন করা যায়নি";
}

function matchSearch(search: string, values: Array<string | number | null | undefined>) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(query));
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin } = useAdmin();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [customers, setCustomers] = useState<CustomerView[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("registered");
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id ? String(data.session.user.id) : null);
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: userRows }, { data: roleRows }, { data: customerRows }, { data: orderRows }] = await Promise.all([
      supabase.from("users").select("id, name, email, phone, address, created_at, updated_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id, customer_name, customer_phone, customer_email, customer_address, delivery_area, total, created_at, user_id")
        .order("created_at", { ascending: false }),
    ]);

    const rolesByUser: Record<string, RoleName[]> = {};
    (roleRows || []).forEach((role: any) => {
      const userId = String(role.user_id);
      rolesByUser[userId] ??= [];
      rolesByUser[userId].push(role.role);
    });

    const orderStats = new Map<string, { count: number; spent: number; last: OrderRow }>();
    ((orderRows as OrderRow[]) || []).forEach((order) => {
      const phone = normalizePhone(order.customer_phone);
      if (!phone) return;
      const existing = orderStats.get(phone);
      const next = {
        count: (existing?.count || 0) + 1,
        spent: (existing?.spent || 0) + Number(order.total || 0),
        last: !existing || new Date(order.created_at) > new Date(existing.last.created_at) ? order : existing.last,
      };
      orderStats.set(phone, next);
    });

    const customerByPhone = new Map<string, CustomerView>();
    ((customerRows as CustomerRow[]) || []).forEach((customer) => {
      const phone = normalizePhone(customer.phone);
      const stats = orderStats.get(phone);
      customerByPhone.set(phone, {
        ...customer,
        total_orders: stats?.count ?? customer.total_orders ?? 0,
        total_spent: stats?.spent ?? customer.total_spent ?? 0,
        last_order_at: stats?.last.created_at || customer.updated_at,
        delivery_area: stats?.last.delivery_area,
        address: customer.address || stats?.last.customer_address || null,
        email: customer.email || stats?.last.customer_email || null,
      });
    });

    orderStats.forEach((stats, phone) => {
      if (customerByPhone.has(phone)) return;
      customerByPhone.set(phone, {
        id: `order-${phone}`,
        name: stats.last.customer_name,
        phone: stats.last.customer_phone,
        email: stats.last.customer_email,
        address: stats.last.customer_address,
        user_id: stats.last.user_id,
        total_orders: stats.count,
        total_spent: stats.spent,
        created_at: stats.last.created_at,
        updated_at: stats.last.created_at,
        last_order_at: stats.last.created_at,
        delivery_area: stats.last.delivery_area,
      });
    });

    const customerList = Array.from(customerByPhone.values()).sort(
      (a, b) => new Date(b.last_order_at || b.created_at).getTime() - new Date(a.last_order_at || a.created_at).getTime(),
    );

    const byUserId = new Map(customerList.filter((c) => c.user_id).map((c) => [String(c.user_id), c]));
    const byPhone = new Map(customerList.map((c) => [normalizePhone(c.phone), c]));
    const byEmail = new Map(customerList.filter((c) => c.email).map((c) => [String(c.email).toLowerCase(), c]));

    setCustomers(customerList);
    setUsers(
      ((userRows as UserRow[]) || []).map((user) => {
        const userId = String(user.id);
        const customer =
          byUserId.get(userId) ||
          byPhone.get(normalizePhone(user.phone)) ||
          byEmail.get(String(user.email || "").toLowerCase());
        return {
          ...user,
          roles: rolesByUser[userId] || ["user"],
          customer,
        };
      }),
    );
    setLoading(false);
  };

  // তারিখ ফিল্টার: রেজিস্টার্ড/এডমিন ট্যাবে রেজিস্ট্রেশনের তারিখ, কাস্টমার ট্যাবে সর্বশেষ অর্ডারের তারিখ ধরে
  const inDateRange = (value?: string | null) => {
    if (!startDate && !endDate) return true;
    if (!value) return false;
    const date = new Date(value);
    if (startDate && date < new Date(startDate)) return false;
    if (endDate && date > new Date(endDate + "T23:59:59")) return false;
    return true;
  };

  const registeredUsers = useMemo(
    () =>
      users
        .filter((user) => inDateRange(user.created_at))
        .filter((user) =>
          matchSearch(search, [
            user.name,
            user.email,
            user.phone,
            user.customer?.phone,
            user.customer?.address,
            ROLE_LABELS[primaryRole(user.roles)],
          ]),
        ),
    [search, users, startDate, endDate],
  );

  const visibleCustomers = useMemo(
    () =>
      customers
        .filter((customer) => inDateRange(customer.last_order_at || customer.created_at))
        .filter((customer) =>
          matchSearch(search, [customer.name, customer.phone, customer.email, customer.address, customer.delivery_area]),
        ),
    [customers, search, startDate, endDate],
  );

  const adminUsers = useMemo(
    () =>
      users
        .filter((user) => ["admin", "super_admin"].includes(primaryRole(user.roles)))
        .filter((user) => inDateRange(user.created_at))
        .filter((user) =>
          matchSearch(search, [user.name, user.email, user.phone, ROLE_LABELS[primaryRole(user.roles)]]),
        ),
    [search, users, startDate, endDate],
  );

  const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const handleExport = () => {
    let headers: string[];
    let rows: string[][];

    if (activeTab === "customers") {
      headers = ["নাম", "ফোন", "ইমেইল", "এলাকা", "ঠিকানা", "অর্ডার", "মোট খরচ", "সর্বশেষ অর্ডার"];
      rows = visibleCustomers.map((c) => [
        c.name, c.phone, c.email || "", c.delivery_area || "", c.address || "",
        String(c.total_orders || 0), String(c.total_spent || 0), dateLabel(c.last_order_at),
      ]);
    } else if (activeTab === "admins") {
      headers = ["ইমেইল", "নাম", "ফোন", "রোল", "যোগদান"];
      rows = adminUsers.map((u) => [
        u.email, u.name || "", u.phone || "", ROLE_LABELS[primaryRole(u.roles)], dateLabel(u.created_at),
      ]);
    } else {
      headers = ["ইমেইল", "নাম", "ফোন", "অর্ডার", "রেজিস্ট্রেশন", "রোল"];
      rows = registeredUsers.map((u) => [
        u.email, u.name || "", u.phone || u.customer?.phone || "", String(u.customer?.total_orders || 0),
        dateLabel(u.created_at), ROLE_LABELS[primaryRole(u.roles)],
      ]);
    }

    // ﻿ (BOM) ছাড়া Excel এ বাংলা ভেঙে যায়
    const csv = "﻿" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeRole = async (user: ManagedUser, role: RoleName) => {
    setBusyUserId(String(user.id));
    const { error } = await supabase.admin.setUserRole(user.id, role);
    setBusyUserId(null);
    if (error) {
      toast({ title: "রোল পরিবর্তন হয়নি", description: errorText(error), variant: "destructive" });
      return;
    }
    toast({ title: role === "user" ? "ইউজার করা হয়েছে" : "এডমিন করা হয়েছে" });
    fetchData();
  };

  const createAdmin = async () => {
    if (!adminForm.email.trim() || !adminForm.password.trim()) {
      toast({ title: "ইমেইল ও পাসওয়ার্ড দিন", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { error } = await supabase.admin.createUser({
      name: adminForm.name.trim() || adminForm.email.trim(),
      email: adminForm.email.trim(),
      phone: adminForm.phone.trim() || undefined,
      password: adminForm.password,
      role: adminForm.role,
    });
    setCreating(false);

    if (error) {
      toast({ title: "নতুন এডমিন তৈরি হয়নি", description: errorText(error), variant: "destructive" });
      return;
    }

    toast({ title: "নতুন এডমিন তৈরি হয়েছে" });
    setAdminForm(emptyAdminForm);
    setCreateOpen(false);
    setActiveTab("admins");
    fetchData();
  };

  const userById = useMemo(() => new Map(users.map((user) => [String(user.id), user])), [users]);
  const userByPhone = useMemo(() => new Map(users.filter((u) => u.phone).map((u) => [normalizePhone(u.phone), u])), [users]);
  const userByEmail = useMemo(
    () => new Map(users.filter((u) => u.email).map((u) => [String(u.email).toLowerCase(), u])),
    [users],
  );

  const renderRoleBadge = (role: RoleName) => (
    <Badge variant="outline" className={cn("whitespace-nowrap", roleBadgeClass(role))}>
      {ROLE_LABELS[role]}
    </Badge>
  );

  const renderRoleAction = (user?: ManagedUser) => {
    if (!user) return <span className="text-muted-foreground">-</span>;
    const role = primaryRole(user.roles);
    const busy = busyUserId === String(user.id);
    const isCurrentUser = currentUserId === String(user.id);

    if (role === "user") {
      return (
        <Button size="sm" onClick={() => changeRole(user, "admin")} disabled={busy}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          এডমিন করুন
        </Button>
      );
    }

    // সুপার এডমিনকে শুধু আরেকজন সুপার এডমিনই ইউজার করতে/রোল বদলাতে পারবেন
    const lockedSuperAdmin = role === "super_admin" && !isSuperAdmin;
    if (lockedSuperAdmin) {
      return <span className="text-xs text-muted-foreground whitespace-nowrap">সুপার এডমিন 🔒</span>;
    }

    return (
      <Button size="sm" variant="outline" onClick={() => changeRole(user, "user")} disabled={busy || isCurrentUser}>
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
        {isCurrentUser ? "নিজে" : "ইউজার করুন"}
      </Button>
    );
  };

  const tableEmpty = (message: string, colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="text-center py-12 text-muted-foreground">
        {message}
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ইউজার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground mt-0.5">রেজিস্টার্ড ইউজার, কাস্টমার ও এডমিন একসাথে দেখুন</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto">
          <UserPlus className="w-4 h-4" />
          নতুন এডমিন তৈরি করুন
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="h-auto justify-start bg-transparent p-0 flex flex-wrap gap-2">
          <TabsTrigger
            value="registered"
            className="h-10 rounded-md border bg-background px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="w-4 h-4 mr-2" />
            রেজিস্টার্ড ইউজার
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground data-[state=active]:bg-primary-foreground/20">
              {users.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="h-10 rounded-md border bg-background px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            কাস্টমার (অর্ডার)
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{customers.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="h-10 rounded-md border bg-background px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            এডমিন / মডারেটর
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{adminUsers.length}</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap items-end gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="সার্চ করুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">📅 শুরুর তারিখ</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 w-40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">📅 শেষ তারিখ</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 w-40" />
          </div>
          {(startDate || endDate || search) && (
            <Button variant="outline" onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); }}>
              <X className="w-4 h-4 mr-1" /> রিসেট
            </Button>
          )}
          <Button variant="outline" className="ml-auto" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="registered" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ইমেইল</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">নাম</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ফোন</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অর্ডার</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">রেজিস্ট্রেশন</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">রোল</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredUsers.length === 0
                          ? tableEmpty("কোনো ইউজার পাওয়া যায়নি", 7)
                          : registeredUsers.map((user) => {
                              const role = primaryRole(user.roles);
                              return (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                  <td className="py-2.5 px-4 font-medium">{user.email}</td>
                                  <td className="py-2.5 px-4">{user.name || "-"}</td>
                                  <td className="py-2.5 px-4 text-muted-foreground">{user.phone || user.customer?.phone || "-"}</td>
                                  <td className="py-2.5 px-4 text-center">
                                    <Badge variant="secondary">{user.customer?.total_orders || 0}</Badge>
                                  </td>
                                  <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">{dateLabel(user.created_at)}</td>
                                  <td className="py-2.5 px-4">{renderRoleBadge(role)}</td>
                                  <td className="py-2.5 px-4 text-right">{renderRoleAction(user)}</td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="customers" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">নাম</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ফোন</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ইমেইল</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider min-w-[220px]">এলাকা / ঠিকানা</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অর্ডার</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">মোট খরচ</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">সর্বশেষ</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleCustomers.length === 0
                          ? tableEmpty("কোনো কাস্টমার পাওয়া যায়নি", 8)
                          : visibleCustomers.map((customer) => {
                              const linkedUser =
                                (customer.user_id && userById.get(String(customer.user_id))) ||
                                userByPhone.get(normalizePhone(customer.phone)) ||
                                userByEmail.get(String(customer.email || "").toLowerCase());
                              const linkedRole = linkedUser ? primaryRole(linkedUser.roles) : null;
                              return (
                                <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                  <td className="py-2.5 px-4 font-medium">{customer.name}</td>
                                  <td className="py-2.5 px-4">{customer.phone}</td>
                                  <td className="py-2.5 px-4 text-muted-foreground">{customer.email || "-"}</td>
                                  <td className="py-2.5 px-4 text-muted-foreground">
                                    <p>{customer.delivery_area || "-"}</p>
                                    <p className="text-xs max-w-[260px] truncate" title={customer.address || ""}>{customer.address || "-"}</p>
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    <Badge variant="secondary">{customer.total_orders || 0}</Badge>
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-semibold text-primary">৳{money(customer.total_spent)}</td>
                                  <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">{dateLabel(customer.last_order_at)}</td>
                                  <td className="py-2.5 px-4">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate(`/admin/fraud-checker?phone=${encodeURIComponent(customer.phone)}`)}
                                      >
                                        চেক
                                      </Button>
                                      {linkedRole && linkedRole !== "user" ? renderRoleBadge(linkedRole) : renderRoleAction(linkedUser)}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="admins" className="m-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ইমেইল</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">রোল</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">পারমিশন</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">যোগদান</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.length === 0
                          ? tableEmpty("কোনো এডমিন পাওয়া যায়নি", 5)
                          : adminUsers.map((user) => {
                              const role = primaryRole(user.roles);
                              return (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                  <td className="py-2.5 px-4">
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">{user.name || user.phone || "-"}</p>
                                  </td>
                                  <td className="py-2.5 px-4">{renderRoleBadge(role)}</td>
                                  <td className="py-2.5 px-4 text-muted-foreground">সম্পূর্ণ এক্সেস</td>
                                  <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">{dateLabel(user.created_at)}</td>
                                  <td className="py-2.5 px-4 text-right">{renderRoleAction(user)}</td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন এডমিন তৈরি করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>নাম</Label>
              <Input value={adminForm.name} onChange={(e) => setAdminForm((form) => ({ ...form, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>ইমেইল</Label>
              <Input
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm((form) => ({ ...form, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ফোন</Label>
              <Input value={adminForm.phone} onChange={(e) => setAdminForm((form) => ({ ...form, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>পাসওয়ার্ড</Label>
              <Input
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm((form) => ({ ...form, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>রোল</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adminForm.role === "admin" ? "default" : "outline"}
                  onClick={() => setAdminForm((form) => ({ ...form, role: "admin" }))}
                >
                  এডমিন
                </Button>
                {/* শুধু সুপার এডমিনই নতুন সুপার এডমিন তৈরি করতে পারবে */}
                {isSuperAdmin && (
                  <Button
                    type="button"
                    variant={adminForm.role === "super_admin" ? "default" : "outline"}
                    onClick={() => setAdminForm((form) => ({ ...form, role: "super_admin" }))}
                  >
                    সুপার এডমিন
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                বাতিল
              </Button>
              <Button onClick={createAdmin} disabled={creating}>
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                তৈরি করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/useAdmin";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Settings, BarChart3,
  Image, Code, ChevronDown, LogOut, Menu, X, Truck,
  Warehouse, ShieldAlert, ClipboardList, FileText, Megaphone, Tag,
  PackageSearch, Wallet, Facebook, Mail, FileEdit, Layers, Leaf, Ban,
  ExternalLink, RefreshCw, Star, Newspaper, Coins,
} from "lucide-react";

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    items: [
      { label: "ড্যাশবোর্ড", icon: <LayoutDashboard className="w-5 h-5" />, path: "/admin" },
    ],
  },
  {
    title: "অর্ডার ও ইনভেন্টরি",
    items: [
      { label: "ইনভেন্টরি ম্যানেজমেন্ট", icon: <Warehouse className="w-5 h-5" />, path: "/admin/reports/stock" },
      { label: "অসম্পূর্ণ অর্ডার", icon: <ShoppingCart className="w-5 h-5" />, path: "/admin/abandoned-orders" },
      { label: "ফ্রড চেকার", icon: <ShieldAlert className="w-5 h-5" />, path: "/admin/fraud-checker" },
      { label: "ব্লকড কাস্টমার", icon: <Ban className="w-5 h-5" />, path: "/admin/blocked-customers" },
      { label: "অর্ডার", icon: <ClipboardList className="w-5 h-5" />, path: "/admin/orders" },
      { label: "ম্যানুয়াল অর্ডার", icon: <FileText className="w-5 h-5" />, path: "/admin/manual-order" },
      { label: "সেলস রিপোর্ট", icon: <BarChart3 className="w-5 h-5" />, path: "/admin/reports/sales" },
    ],
  },
  {
    title: "ইউজার",
    items: [
      {
        label: "ইউজার ম্যানেজমেন্ট", icon: <Users className="w-5 h-5" />,
        children: [
          { label: "কাস্টমার", path: "/admin/customers" },
          { label: "এডমিন ইউজার", path: "/admin/users" },
        ],
      },
    ],
  },
  {
    title: "প্রোডাক্ট",
    items: [
      {
        label: "প্রোডাক্ট", icon: <Package className="w-5 h-5" />,
        children: [
          { label: "প্রোডাক্ট ম্যানেজ", path: "/admin/products" },
          { label: "প্রাইস এডিট", path: "/admin/products/price-edit" },
          { label: "ক্যাটাগরি", path: "/admin/categories" },
          { label: "ব্র্যান্ড", path: "/admin/brands" },
          { label: "কালার", path: "/admin/colors" },
          { label: "সাইজ", path: "/admin/sizes" },
        ],
      },
    ],
  },
  {
    title: "মার্কেটিং ও প্রমোশন",
    items: [
      { label: "মার্কেটিং", icon: <Megaphone className="w-5 h-5" />, path: "/admin/marketing" },
      { label: "কুপন", icon: <Tag className="w-5 h-5" />, path: "/admin/coupons" },
      { label: "কয়েন ম্যানেজমেন্ট", icon: <Coins className="w-5 h-5" />, path: "/admin/coins" },
      { label: "ব্যানার", icon: <Image className="w-5 h-5" />, path: "/admin/banners" },
    ],
  },
  {
    title: "শিপিং ও পেমেন্ট",
    items: [
      { label: "শিপিং চার্জ", icon: <Truck className="w-5 h-5" />, path: "/admin/settings/shipping" },
      { label: "কুরিয়ার এপিআই", icon: <PackageSearch className="w-5 h-5" />, path: "/admin/courier-api" },
      { label: "পেমেন্ট গেটওয়ে", icon: <Wallet className="w-5 h-5" />, path: "/admin/payment-gateway" },
    ],
  },
  {
    title: "ইন্টিগ্রেশন",
    items: [
      { label: "ট্র্যাকিং ও এনালাইটিক্স", icon: <Code className="w-5 h-5" />, path: "/admin/tracking-settings" },
      { label: "SMTP সেটিংস", icon: <Mail className="w-5 h-5" />, path: "/admin/smtp-settings" },
    ],
  },
  {
    title: "কন্টেন্ট",
    items: [
      { label: "পেজ ম্যানেজ", icon: <FileEdit className="w-5 h-5" />, path: "/admin/settings/pages" },
      { label: "রিভিউ ম্যানেজ", icon: <Star className="w-5 h-5" />, path: "/admin/reviews" },
      { label: "ব্লগ ম্যানেজ", icon: <Newspaper className="w-5 h-5" />, path: "/admin/blogs" },
      {
        label: "কন্টেন্ট", icon: <Layers className="w-5 h-5" />,
        children: [
          { label: "সোশ্যাল মিডিয়া", path: "/admin/settings/social" },
          { label: "ভিডিও গ্যালারি", path: "/admin/videos" },
        ],
      },
    ],
  },
  {
    title: "সাইট সেটিংস",
    items: [
      {
        label: "সাইট সেটিংস", icon: <Settings className="w-5 h-5" />,
        children: [
          { label: "জেনারেল সেটিং", path: "/admin/settings/general" },
          { label: "অর্ডার স্ট্যাটাস", path: "/admin/settings/order-status" },
        ],
      },
    ],
  },
];

const allItems = menuSections.flatMap((s) => s.items);

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { settings, refreshSettings } = useSiteSettings();
  const brandName = settings.brand_name_bn?.trim() || settings.brand_name?.trim() || "Dream Mart";
  const [clearingCache, setClearingCache] = useState(false);

  // অ্যাডমিনে কিছু বদলানোর পর সাইটে পুরনো ডেটা যেন না দেখায় — সব query cache মুছে
  // সেটিংস নতুন করে আনা হয়
  const handleClearCache = async () => {
    setClearingCache(true);
    queryClient.clear();
    await refreshSettings();
    setClearingCache(false);
  };
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ "প্রোডাক্ট": true });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // ডেস্কটপে সাইডবার লুকিয়ে রাখা যায় — পছন্দটা localStorage এ মনে থাকে
  const [desktopHidden, setDesktopHidden] = useState(() => localStorage.getItem("admin_sidebar_hidden") === "1");

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setDesktopHidden((v) => {
        localStorage.setItem("admin_sidebar_hidden", v ? "0" : "1");
        return !v;
      });
    } else {
      setSidebarOpen(true);
    }
  };

  const isChildPathActive = (childPath: string) => {
    const [pathPart, queryPart = ""] = childPath.split("?");
    if (location.pathname !== pathPart) return false;

    const currentStatus = new URLSearchParams(location.search).get("status");
    const childStatus = new URLSearchParams(queryPart).get("status");

    if (!childStatus) return !currentStatus;
    return currentStatus === childStatus;
  };

  // Auto-open the group containing the currently active route
  useEffect(() => {
    const activeParent = allItems.find((item) =>
      item.children?.some((c) => isChildPathActive(c.path))
    );
    if (activeParent) {
      setOpenMenus((prev) => ({ ...prev, [activeParent.label]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  const pageTitle = useMemo(() => {
    for (const item of allItems) {
      if (item.path === location.pathname) return item.label;
      const child = item.children?.find((c) => isChildPathActive(c.path));
      if (child) return child.label;
    }
    return "ড্যাশবোর্ড";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // লগইন করা নেই → অ্যাডমিন লগইনে
        navigate("/admin/login");
      } else if (!isAdmin) {
        // কাস্টমার (অ্যাডমিন নয়) → নিজের অ্যাকাউন্টে পাঠিয়ে দিই, /admin এ ঢুকতে পারবে না
        navigate("/my-account", { replace: true });
      }
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // লগইন নেই বা অ্যাডমিন নয় — কিছু দেখানোর আগেই রিডাইরেক্ট হয়ে যাবে
  if (!user || !isAdmin) {
    return null;
  }

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleChildClick = (path: string) => {
    setSidebarOpen(false);
    navigate(path, { replace: false });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const userInitial = (user?.email || "A").charAt(0).toUpperCase();

  return (
    <div className="admin-area flex min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transform transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        desktopHidden ? "lg:hidden" : "lg:translate-x-0 lg:static lg:z-auto"
      )}>
        <div className="flex items-center justify-between gap-2 p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-tight truncate">{brandName}</h1>
              <p className="text-[11px] text-sidebar-foreground/60 leading-tight">ম্যানেজমেন্ট প্যানেল</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {menuSections.map((section, idx) => (
            <div key={section.title || idx}>
              {section.title && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <div key={item.label}>
                    {item.path && !item.children ? (
                      <NavLink
                        to={item.path}
                        end={item.path === "/admin"}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={cn(
                            "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            item.children?.some((c) => isChildPathActive(c.path))
                              ? "text-sidebar-primary bg-sidebar-primary/10"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            {item.icon}
                            {item.label}
                          </span>
                          <ChevronDown className={cn("w-4 h-4 transition-transform", openMenus[item.label] && "rotate-180")} />
                        </button>
                        {openMenus[item.label] && item.children && (
                          <div className="ml-4 mt-1 pl-4 border-l border-sidebar-border space-y-0.5">
                            {item.children.map((child) => {
                              const isChildActive = isChildPathActive(child.path);
                              return (
                                <button
                                  key={child.path}
                                  onClick={() => handleChildClick(child.path)}
                                  className={cn(
                                    "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                    isChildActive
                                      ? "text-sidebar-primary font-semibold bg-sidebar-primary/10"
                                      : "text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                                  )}
                                >
                                  {child.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg bg-sidebar-accent/60">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              {userInitial}
            </div>
            <p className="text-xs text-sidebar-foreground/80 truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" /> লগআউট
          </Button>
        </div>
      </aside>

      {/* Collapsed icon-only rail (desktop) — সাইডবার লুকালে আইকনগুলো থেকে যায় */}
      {desktopHidden && (
        <aside className="hidden lg:flex w-16 shrink-0 flex-col items-center bg-sidebar border-r border-sidebar-border py-3 sticky top-0 h-screen">
          <button
            onClick={toggleSidebar}
            title="সাইডবার খুলুন"
            className="w-10 h-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-sm mb-3 shrink-0"
          >
            <Leaf className="w-5 h-5" />
          </button>
          <nav className="flex-1 overflow-y-auto flex flex-col items-center gap-1 w-full px-2">
            {menuSections.flatMap((s) => s.items).map((item) =>
              item.path && !item.children ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === "/admin"}
                  title={item.label}
                  className={({ isActive }) => cn(
                    "p-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  {item.icon}
                </NavLink>
              ) : (
                <button
                  key={item.label}
                  title={item.label}
                  onClick={() => {
                    setOpenMenus((prev) => ({ ...prev, [item.label]: true }));
                    toggleSidebar();
                  }}
                  className={cn(
                    "p-2.5 rounded-lg transition-colors",
                    item.children?.some((c) => isChildPathActive(c.path))
                      ? "bg-sidebar-primary/10 text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  {item.icon}
                </button>
              )
            )}
          </nav>
          <button
            onClick={handleSignOut}
            title="লগআউট"
            className="p-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-4 py-3.5 flex items-center gap-3">
          <button onClick={toggleSidebar} className="text-foreground/70 hover:text-foreground transition-colors" title="সাইডবার দেখান/লুকান">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-base md:text-lg font-semibold truncate">{pageTitle}</h2>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleClearCache}
              disabled={clearingCache}
              title="সাইটের পুরনো ক্যাশ ডেটা মুছে সর্বশেষ ডেটা আনুন"
            >
              <RefreshCw className={cn("w-4 h-4", clearingCache && "animate-spin")} />
              <span className="hidden md:inline">ক্যাশ ক্লিয়ার</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => window.open("/", "_blank")}
              title="নতুন ট্যাবে ওয়েবসাইট খুলুন"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">সাইট দেখুন</span>
            </Button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {userInitial}
              </div>
              <span className="text-sm text-muted-foreground max-w-[160px] truncate">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

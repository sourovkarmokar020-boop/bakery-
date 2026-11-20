import { Home, ShoppingCart, User, Menu, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCart } from "@/context/CartContext";
import { waLink } from "@/lib/whatsapp";

// মাঝখানের "হোম" আইটেমটি বাকি চারটার মতো নয় — এটি ন্যাভের উপরে উঠে থাকা গোল বাটন।
// তাই আইটেমগুলো দুই ভাগে (বাঁয়ে ২টা, ডানে ২টা) রাখা হয়েছে, মাঝে গোল বাটন
const BRAND = "#6B2D14";

const MobileBottomNav = () => {
  const location = useLocation();
  const { settings } = useSiteSettings();
  const { totalItems } = useCart();

  const leftItems = [
    { icon: Menu, label: "ক্যাটাগরি", path: "/categories" },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      path: waLink(settings.whatsapp_number, settings.whatsapp_template),
      external: true,
    },
  ];

  const rightItems = [
    { icon: ShoppingCart, label: "কার্ট", path: "/cart", count: totalItems },
    { icon: User, label: "লগইন", path: "/login" },
  ];

  const renderItem = (item: {
    icon: typeof Home;
    label: string;
    path: string;
    external?: boolean;
    count?: number;
  }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    const inner = (
      <>
        <Icon className="h-5 w-5" />
        <span className="flex items-center gap-1">
          {item.label}
          {!!item.count && <strong className="font-bold">({item.count})</strong>}
        </span>
      </>
    );

    if (item.external) {
      return (
        <a
          key={item.label}
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-0.5 text-muted-foreground text-xs"
        >
          {inner}
        </a>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path}
        className={`flex flex-1 flex-col items-center gap-0.5 text-xs ${
          isActive ? "text-primary font-medium" : "text-muted-foreground"
        }`}
      >
        {inner}
      </Link>
    );
  };

  return (
    // নচওয়ালা ফোনে ন্যাভের নিচে যেন সাদা ফাঁক না থাকে, তাই safe-area-inset ন্যাভের
    // নিজের padding-এ যোগ করা — ব্যাকগ্রাউন্ড স্ক্রিনের একদম নিচ পর্যন্ত যায়
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">
      <div className="relative flex items-center justify-around py-2">
        {leftItems.map(renderItem)}

        {/* মাঝের খালি জায়গা — গোল হোম বাটনটি absolute, তাই সে ন্যাভের উচ্চতা বাড়ায় না।
            এই ফাঁকা স্লটটা বাকি চারটা আইটেমকে সমান দূরত্বে রাখে */}
        <span className="flex-1" aria-hidden="true" />

        {/* হোম — ন্যাভের উপরে উঠে থাকা গোল বাটন। `-top-7` উপরে তোলে,
            `ring-background` সাদা রিং ফুটারের রঙের উপর আলাদা করে দেখায় */}
        <Link
          to="/"
          aria-label="হোম"
          className="absolute -top-7 left-1/2 -translate-x-1/2"
        >
          <span
            className="w-[62px] h-[62px] rounded-full flex flex-col items-center justify-center gap-0.5 text-white shadow-lg ring-4 ring-background"
            style={{ backgroundColor: BRAND }}
          >
            <Home className="h-5 w-5" />
            <span className="text-[11px] font-medium leading-none">হোম</span>
          </span>
        </Link>

        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

import { Search, ShoppingCart, User, MapPin, Menu, X, ChevronDown, ChevronRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { categories as mockCategories } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import AnimatedSearch from "@/components/AnimatedSearch";
import VisualSearchModal from "@/components/VisualSearchModal";
import { supabase } from "@/integrations/supabase/client";
import { useHomeData } from "@/hooks/useHomeData";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useLanguage, getLocalizedName } from "@/context/LanguageContext";

interface DbCategory {
  id: string;
  name: string;
  name_en?: string;
  name_bn?: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  show_in_navbar: boolean;
}

const Header = () => {
  const { language, setLanguage, t, tCategory } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  const [expandedMobileSub, setExpandedMobileSub] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session?.user));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", menuOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [menuOpen]);

  // নতুন লোগো সেট হলে আগের error state রিসেট — নতুন URL আবার চেষ্টা করার সুযোগ পায়
  useEffect(() => {
    setLogoError(false);
  }, [settings.brand_logo]);

  // ন্যাভবার ক্যাটাগরি আলাদা করে ফেচ না করে শেয়ার্ড /home ডেটা থেকে নেওয়া হয় — হোমপেজে
  // Index/TopCategories-এর সাথে একটিই রিকোয়েস্টে dedupe হয়, ফলে লোড দ্রুত হয়।
  const { data: homeData, isLoading } = useHomeData();
  const dbCategories = (homeData?.allCategories || []) as DbCategory[];

  const parentCats = dbCategories.filter(c => !c.parent_id && !!c.show_in_navbar);
  const getSubCats = (parentId: string) => dbCategories.filter(c => c.parent_id === parentId && !!c.show_in_navbar);
  const navCategories = parentCats;
  const isActiveCategory = (slug: string) => location.pathname === `/category/${slug}`;

  const showDropdown = useCallback((catId: string, el: HTMLElement) => {
    clearTimeout(hideTimeout.current);
    const rect = el.getBoundingClientRect();
    setDropdownStyle({ left: rect.left, top: rect.bottom });
    setHoveredCat(catId);
    setHoveredSub(null);
  }, []);

  const scheduleHide = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSub(null);
    }, 150);
  }, []);

  const cancelHide = useCallback(() => {
    clearTimeout(hideTimeout.current);
  }, []);

  const hoveredSubCats = hoveredCat ? getSubCats(hoveredCat) : [];
  // ভাষা অনুযায়ী ব্র্যান্ড নাম — সেটিংসে ওই ভাষার নাম না থাকলে ডিফল্ট নামে fallback
  const brandName =
    (language === "en" ? settings.brand_name_en : settings.brand_name_bn)?.trim() ||
    settings.brand_name?.trim() ||
    (language === "en" ? "Dream Bakery" : "ড্রিম বেকারি");
  const brandLogo = resolveLocalImageUrl(settings.brand_logo?.trim() || "/assets/uploads/site-settings/bakery-logo.webp");
  // লোগো URL লোড না হলে (ভাঙা লিংক, অন্য পোর্ট/ডোমেইন) নামেই fallback — তাই হেডার কখনো ফাঁকা থাকে না
  const showBrandLogo = settings.brand_display_mode !== "name_only" && brandLogo.length > 0 && !logoError;
  const showBrandName = settings.brand_display_mode !== "logo_only" || !showBrandLogo;
  const logoSize = Number(settings.logo_size) || 48;
  // Phones get a smaller, tighter logo so the header stays compact and balanced.
  const logoSizeMobile = Math.max(26, Math.round(logoSize * 0.65));

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 md:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <header
        className={`sticky top-0 z-[60] w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
            : "bg-background border-b border-border/40"
        }`}
      >
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2 min-w-0 flex-1 md:flex-none md:shrink-0" aria-label={brandName || "Home"}>
              {showBrandLogo ? (
                <img
                  src={brandLogo}
                  alt={brandName || "Brand logo"}
                  onError={() => setLogoError(true)}
                  style={{
                    "--logo-h": `${logoSize}px`,
                    "--logo-h-mobile": `${logoSizeMobile}px`,
                  } as CSSProperties}
                  className="h-[var(--logo-h-mobile)] md:h-[var(--logo-h)] w-auto max-w-[46vw] object-contain object-left shrink-0 mix-blend-multiply"
                />
              ) : null}
              {showBrandName && (
                <h1
                  className="font-bold text-primary truncate max-w-[42vw] md:max-w-none"
                  style={{ fontSize: `${settings.brand_name_size || 24}px` }}
                >
                  {brandName}
                </h1>
              )}
            </Link>
            <div className="hidden md:flex flex-1 max-w-xl">
              <AnimatedSearch />
            </div>
            <div className="flex items-center gap-1 md:gap-3 shrink-0">
              {settings.visual_search_enabled !== "false" && (
                <Button variant="ghost" size="icon" title={language === "en" ? "Find products with image" : "ছবি দিয়ে প্রোডাক্ট খুঁজুন"} onClick={() => setVisualSearchOpen(true)}>
                  <Camera className="h-5 w-5" />
                </Button>
              )}
              <Link to="/track-order">
                <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{t("track_order")}</span>
                </Button>
              </Link>

              <button
                onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
                className="text-xs font-bold px-2.5 py-1 border border-border/60 hover:border-primary/45 rounded-md hover:bg-muted/80 text-foreground transition-all duration-200 active:scale-95 select-none shrink-0 h-8 flex items-center justify-center min-w-[32px] cursor-pointer"
                title={language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
              >
                {language === "bn" ? "BN" : "EN"}
              </button>

              <Button variant="ghost" size="icon" onClick={() => navigate(loggedIn ? "/my-account" : "/login")} title={loggedIn ? t("account") : t("login")}>
                <User className="h-5 w-5" />
              </Button>
              <Link to="/cart" className="relative" title={t("cart")}>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">{totalItems}</Badge>}
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:hidden mt-3">
            <AnimatedSearch />
          </div>
        </div>

        <nav
          className="bg-primary text-primary-foreground min-h-[38px] hidden md:flex items-center transition-colors duration-300"
          style={settings.gradient_mode === "gradient" ? { background: "var(--brand-gradient)" } : undefined}
        >
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="py-2 text-xs text-primary-foreground/70 animate-pulse font-medium">
                {language === "en" ? "Loading categories..." : "ক্যাটাগরি লোড হচ্ছে..."}
              </div>
            ) : (
              <ul className="hidden md:flex flex-wrap items-center justify-center gap-1 py-2 text-sm w-full">
                {navCategories.map((cat) => {
                  const subCats = getSubCats(cat.id as string);
                  const hasSubCats = subCats.length > 0;
                  return (
                    <li
                      key={cat.id}
                      onMouseEnter={(e) => hasSubCats ? showDropdown(cat.id as string, e.currentTarget) : undefined}
                      onMouseLeave={scheduleHide}
                    >
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                          isActiveCategory(cat.slug)
                            ? "bg-accent/30 text-primary-foreground font-semibold"
                            : "hover:bg-primary-foreground/10"
                        }`}
                      >
                        {getLocalizedName(cat, language)}
                        {hasSubCats && <ChevronDown className="h-3 w-3" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </nav>

        {menuOpen && (
          <div className="absolute left-0 right-0 top-full z-[60] md:hidden bg-background border-t shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-muted-foreground animate-pulse">
                {language === "en" ? "Loading categories..." : "ক্যাটাগরি লোড হচ্ছে..."}
              </div>
            ) : (
              <ul className="py-2">
                {navCategories.map((cat) => {
                  const subCats = getSubCats(cat.id as string);
                  const hasSubCats = subCats.length > 0;
                  const isExpanded = expandedMobileCat === (cat.id as string);
                  return (
                    <li key={cat.id}>
                      <div className="flex items-center">
                        <Link
                          to={`/category/${cat.slug}`}
                          className={`flex-1 block px-4 py-2.5 transition-colors ${
                            isActiveCategory(cat.slug)
                              ? "bg-primary/10 text-primary font-semibold"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {getLocalizedName(cat, language)}
                        </Link>
                        {hasSubCats && (
                          <button
                            className="px-3 py-2.5"
                            onClick={() => setExpandedMobileCat(isExpanded ? null : (cat.id as string))}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      {hasSubCats && isExpanded && (
                        <ul className="bg-muted/30">
                          {subCats.map((sub) => {
                            const grandCats = getSubCats(sub.id as string);
                            const hasGrand = grandCats.length > 0;
                            const isSubExpanded = expandedMobileSub === (sub.id as string);
                            return (
                              <li key={sub.id}>
                                <div className="flex items-center">
                                  <Link
                                    to={`/category/${sub.slug}`}
                                    className="flex-1 block px-8 py-2 text-sm hover:bg-muted transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    ↳ {getLocalizedName(sub, language)}
                                  </Link>
                                  {hasGrand && (
                                    <button
                                      className="px-3 py-2"
                                      onClick={() => setExpandedMobileSub(isSubExpanded ? null : (sub.id as string))}
                                    >
                                      <ChevronDown className={`h-4 w-4 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  )}
                                </div>
                                {hasGrand && isSubExpanded && (
                                  <ul className="bg-muted/50">
                                    {grandCats.map((g) => (
                                      <li key={g.id}>
                                        <Link
                                          to={`/category/${g.slug}`}
                                          className="block px-12 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                          onClick={() => setMenuOpen(false)}
                                        >
                                          • {getLocalizedName(g, language)}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </header>

      {/* Sub-category mega dropdown (up to 3 levels) - rendered outside header to avoid overflow clipping */}
      {hoveredCat && hoveredSubCats.length > 0 && (
        <div
          className="fixed z-[100] bg-background text-foreground shadow-xl rounded-b-md border-x border-b py-1 min-w-[210px] animate-scale-in"
          style={dropdownStyle}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {hoveredSubCats.map((sub) => {
            const grandCats = getSubCats(sub.id as string);
            const hasGrand = grandCats.length > 0;
            const isSubOpen = hoveredSub === (sub.id as string);
            return (
              <div
                key={sub.id}
                className="relative"
                onMouseEnter={() => setHoveredSub(sub.id as string)}
              >
                <Link
                  to={`/category/${sub.slug}`}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isSubOpen && hasGrand ? "bg-primary/10 text-primary" : "hover:bg-primary/10 hover:text-primary"
                  }`}
                  onClick={() => { setHoveredCat(null); setHoveredSub(null); }}
                >
                  <span>{getLocalizedName(sub, language)}</span>
                  {hasGrand && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                </Link>
                {/* Third level flyout to the right */}
                {hasGrand && isSubOpen && (
                  <div className="absolute left-full top-0 -mt-1 min-w-[200px] bg-background text-foreground shadow-xl rounded-md border py-1 animate-scale-in">
                    {grandCats.map((g) => (
                      <Link
                        key={g.id}
                        to={`/category/${g.slug}`}
                        className="block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => { setHoveredCat(null); setHoveredSub(null); }}
                      >
                        {getLocalizedName(g, language)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <VisualSearchModal open={visualSearchOpen} onOpenChange={setVisualSearchOpen} />
    </>
  );
};

export default Header;

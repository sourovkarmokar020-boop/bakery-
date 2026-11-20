import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import { TrackingManager } from "@/components/TrackingManager";

// Retry wrapper for lazy imports to handle chunk load failures
function lazyRetry(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() =>
    factory().catch(() => {
      // Force reload on chunk failure
      window.location.reload();
      return factory();
    })
  );
}

// Lazy load all pages to reduce initial bundle
const Index = lazyRetry(() => import("./pages/Index"));
const NotFound = lazyRetry(() => import("./pages/NotFound"));
const ProductDetail = lazyRetry(() => import("./pages/ProductDetail"));
const CategoryPage = lazyRetry(() => import("./pages/CategoryPage"));
const CategoriesPage = lazyRetry(() => import("./pages/CategoriesPage"));
const AllProductsPage = lazyRetry(() => import("./pages/AllProductsPage"));
const CartPage = lazyRetry(() => import("./pages/CartPage"));
const LoginPage = lazyRetry(() => import("./pages/LoginPage"));
const TrackOrder = lazyRetry(() => import("./pages/TrackOrder"));
const ResetPasswordPage = lazyRetry(() => import("./pages/ResetPasswordPage"));
const ThankYouPage = lazyRetry(() => import("./pages/ThankYouPage"));
const BkashCallbackPage = lazyRetry(() => import("./pages/BkashCallbackPage"));
const BlogsAdminPage = lazyRetry(() => import("./pages/admin/BlogsAdminPage"));
const ReviewsPage = lazyRetry(() => import("./pages/admin/ReviewsPage"));
const BlogDetailPage = lazyRetry(() => import("./pages/BlogDetailPage"));
const MyAccountPage = lazyRetry(() => import("./pages/MyAccountPage"));
const PageDetail = lazyRetry(() => import("./pages/PageDetail"));

// Admin pages
const AdminLogin = lazyRetry(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazyRetry(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazyRetry(() => import("./pages/admin/Dashboard"));
const OrdersPage = lazyRetry(() => import("./pages/admin/OrdersPage"));
const ProductsPage = lazyRetry(() => import("./pages/admin/ProductsPage"));
const ProductCreatePage = lazyRetry(() => import("./pages/admin/ProductCreatePage"));
const ProductEditPage = lazyRetry(() => import("./pages/admin/ProductEditPage"));
const AdminCategoriesPage = lazyRetry(() => import("./pages/admin/CategoriesPage"));
const CustomersPage = lazyRetry(() => import("./pages/admin/CustomersPage"));
const SettingsPage = lazyRetry(() => import("./pages/admin/SettingsPage"));
const ShippingPage = lazyRetry(() => import("./pages/admin/ShippingPage"));
const BannersPage = lazyRetry(() => import("./pages/admin/BannersPage"));
const SimpleCrudPage = lazyRetry(() => import("./pages/admin/SimpleCrudPage"));
const PriceEditPage = lazyRetry(() => import("./pages/admin/PriceEditPage"));
const SalesReportPage = lazyRetry(() => import("./pages/admin/SalesReportPage"));
const StockReportPage = lazyRetry(() => import("./pages/admin/StockReportPage"));
const ComingSoonPage = lazyRetry(() => import("./pages/admin/ComingSoonPage"));
const AbandonedOrdersPage = lazyRetry(() => import("./pages/admin/AbandonedOrdersPage"));
const FraudCheckerPage = lazyRetry(() => import("./pages/admin/FraudCheckerPage"));
const BlockedCustomersPage = lazyRetry(() => import("./pages/admin/BlockedCustomersPage"));
const ManualOrderPage = lazyRetry(() => import("./pages/admin/ManualOrderPage"));
const UserManagementPage = lazyRetry(() => import("./pages/admin/UserManagementPage"));
const MarketingPage = lazyRetry(() => import("./pages/admin/MarketingPage"));
const FacebookPixelPage = lazyRetry(() => import("./pages/admin/FacebookPixelPage"));
const SteadfastCourierPage = lazyRetry(() => import("./pages/admin/SteadfastCourierPage"));
const PagesPage = lazyRetry(() => import("./pages/admin/PagesPage"));
const PaymentGatewayPage = lazyRetry(() => import("./pages/admin/PaymentGatewayPage"));
const TrackingSettingsPage = lazyRetry(() => import("./pages/admin/TrackingSettingsPage"));
const SmtpSettingsPage = lazyRetry(() => import("./pages/admin/SmtpSettingsPage"));
const CoinsPage = lazyRetry(() => import("./pages/admin/CoinsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ডেটা ৫ মিনিট "fresh" ধরা হয় — এর মধ্যে পেজ বদলালে/ফিরলে আবার API কল হয় না
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // ট্যাব ফোকাস করলেই বারবার রিফেচ বন্ধ (আগে ডিফল্ট true ছিল)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => null;

// অ্যাডমিন প্যানেলে স্টোরফ্রন্টের স্প্ল্যাশ স্ক্রিন দেখানোর দরকার নেই —
// AdminLayout এর নিজের লোডিং স্টেট আছে, দুটো মিলে লোডিং অযথা লম্বা লাগে
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SiteSettingsProvider>
        <LanguageProvider>
        <CartProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <TrackingManager />
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Frontend */}
                <Route path="/" element={<Index />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/bkash/callback" element={<BkashCallbackPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/my-account" element={<MyAccountPage />} />
                <Route path="/page/:slug" element={<PageDetail />} />

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/create" element={<ProductCreatePage />} />
                  <Route path="products/edit/:id" element={<ProductEditPage />} />
                  <Route path="products/price-edit" element={<PriceEditPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="brands" element={
                    <SimpleCrudPage title="ব্র্যান্ড" table="brands"
                      fields={[{ key: "name", label: "নাম" }, { key: "logo_url", label: "লোগো URL" }]}
                      columns={[{ key: "name", label: "নাম" }, { key: "logo_url", label: "লোগো" }]}
                    />
                  } />
                  <Route path="colors" element={
                    <SimpleCrudPage title="কালার" table="colors"
                      fields={[{ key: "name", label: "নাম" }, { key: "hex_code", label: "HEX কোড", type: "color" }]}
                      columns={[{ key: "name", label: "নাম" }, { key: "hex_code", label: "HEX কোড", type: "color" }]}
                    />
                  } />
                  <Route path="sizes" element={
                    <SimpleCrudPage title="সাইজ" table="sizes"
                      fields={[{ key: "name", label: "নাম" }, { key: "value", label: "ভ্যালু" }]}
                      columns={[{ key: "name", label: "নাম" }, { key: "value", label: "ভ্যালু" }]}
                    />
                  } />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="coins" element={<CoinsPage />} />
                  <Route path="settings/general" element={<SettingsPage />} />
                  <Route path="settings/shipping" element={<ShippingPage />} />
                  <Route path="settings/social" element={
                    <SimpleCrudPage title="সোশ্যাল মিডিয়া" table="social_media"
                      fields={[{ key: "platform", label: "প্ল্যাটফর্ম" }, { key: "url", label: "URL" }, { key: "icon", label: "আইকন" }]}
                      columns={[{ key: "platform", label: "প্ল্যাটফর্ম" }, { key: "url", label: "URL" }]}
                    />
                  } />
                  <Route path="settings/pages" element={<PagesPage />} />
                  <Route path="blogs" element={<BlogsAdminPage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="videos" element={
                    <SimpleCrudPage title="ভিডিও গ্যালারি" table="videos"
                      fields={[
                        { key: "title", label: "টাইটেল (বাংলা)" },
                        { key: "title_en", label: "টাইটেল (English)" },
                        { key: "video_url", label: "YouTube লিংক" },
                        { key: "thumbnail_url", label: "থাম্বনেইল (ঐচ্ছিক — না দিলে YouTube থেকে আসবে)", type: "image" },
                        { key: "sort_order", label: "সর্ট অর্ডার", type: "number" },
                      ]}
                      columns={[
                        { key: "thumbnail_url", label: "থাম্বনেইল", type: "image" },
                        { key: "title", label: "টাইটেল (BN)" },
                        { key: "title_en", label: "টাইটেল (EN)" },
                        { key: "video_url", label: "YouTube লিংক" },
                        { key: "sort_order", label: "সর্ট" },
                      ]}
                    />
                  } />
                  <Route path="settings/order-status" element={
                    <SimpleCrudPage title="অর্ডার স্ট্যাটাস" table="order_statuses"
                      fields={[{ key: "name", label: "নাম" }, { key: "color", label: "কালার", type: "color" }, { key: "sort_order", label: "সর্ট অর্ডার", type: "number" }]}
                      columns={[{ key: "name", label: "নাম" }, { key: "color", label: "কালার", type: "color" }, { key: "sort_order", label: "সর্ট" }]}
                    />
                  } />
                  <Route path="banners" element={<BannersPage />} />
                  <Route path="pixels" element={
                    <SimpleCrudPage title="ট্র্যাকিং পিক্সেল" table="tracking_pixels"
                      fields={[{ key: "name", label: "নাম" }, { key: "type", label: "টাইপ (facebook/google)" }, { key: "pixel_id", label: "পিক্সেল ID" }]}
                      columns={[{ key: "name", label: "নাম" }, { key: "type", label: "টাইপ" }, { key: "pixel_id", label: "পিক্সেল ID" }]}
                    />
                  } />
                  <Route path="reports/sales" element={<SalesReportPage />} />
                  <Route path="reports/stock" element={<StockReportPage />} />
                  <Route path="abandoned-orders" element={<AbandonedOrdersPage />} />
                  <Route path="fraud-checker" element={<FraudCheckerPage />} />
                  <Route path="blocked-customers" element={<BlockedCustomersPage />} />
                  <Route path="manual-order" element={<ManualOrderPage />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="marketing" element={<MarketingPage />} />
                  <Route path="coupons" element={
                    <SimpleCrudPage title="কুপন" table="coupons"
                      fields={[
                        { key: "code", label: "কোড (কাস্টমার এটাই লিখবে)" },
                        { key: "discount_type", label: "ছাড়ের ধরন", type: "select", options: [
                          { value: "percentage", label: "শতকরা (%)" },
                          { value: "fixed", label: "নির্দিষ্ট টাকা (৳)" },
                        ] },
                        { key: "discount_value", label: "ছাড়ের পরিমাণ (% অথবা ৳)", type: "number" },
                        { key: "min_order_amount", label: "ন্যূনতম অর্ডার (৳) — ০ দিলে শর্ত নেই", type: "number" },
                        { key: "max_uses", label: "সর্বোচ্চ ব্যবহার (খালি রাখলে সীমাহীন)", type: "number" },
                        { key: "expires_at", label: "মেয়াদ শেষ", type: "datetime" },
                        { key: "is_active", label: "কুপনটি চালু আছে", type: "boolean" },
                      ]}
                      columns={[
                        { key: "code", label: "কোড" },
                        { key: "discount_type", label: "ধরন" },
                        { key: "discount_value", label: "ছাড়" },
                        { key: "min_order_amount", label: "ন্যূনতম অর্ডার" },
                        { key: "used_count", label: "ব্যবহৃত" },
                        { key: "is_active", label: "স্ট্যাটাস", type: "boolean" },
                      ]}
                    />
                  } />
                  <Route path="flash-sale" element={<ComingSoonPage title="ফ্ল্যাশ সেল" />} />
                  <Route path="courier-api" element={<SteadfastCourierPage />} />
                  <Route path="payment-gateway" element={<PaymentGatewayPage />} />
                  <Route path="tracking-settings" element={<TrackingSettingsPage />} />
                  <Route path="smtp-settings" element={<SmtpSettingsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
        </LanguageProvider>
        </SiteSettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

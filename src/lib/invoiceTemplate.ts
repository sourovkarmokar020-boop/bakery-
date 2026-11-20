type SiteSettings = Record<string, string>;

const hexToRgba = (hex: string, alpha: number) => {
  const clean = (hex || "").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full || "16a34a", 16);
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function buildInvoiceHtml(order: any, items: any[], settings: SiteSettings): string {
  const brandColor = /^#[0-9a-f]{6}$/i.test(settings.brand_color || "") ? settings.brand_color : "#6B2D14";
  const accentColor = /^#[0-9a-f]{6}$/i.test(settings.accent_color || "") ? settings.accent_color : brandColor;
  const brandName = settings.brand_name?.trim() || "Dream Bakery";
  const brandLogo = settings.brand_logo;
  // ইনভয়েস নতুন ট্যাবে (about:blank) খোলে — favicon সেখানে দেখাতে হলে সম্পূর্ণ URL দরকার
  const rawFavicon = settings.favicon_url || settings.brand_logo || "";
  const faviconUrl = rawFavicon && !/^https?:\/\//i.test(rawFavicon)
    ? `${window.location.origin}${rawFavicon.startsWith("/") ? "" : "/"}${rawFavicon}`
    : rawFavicon;
  const statusName = order.order_statuses?.name || "";
  const statusColor = order.order_statuses?.color || brandColor;
  const trackingCode = String(order.courier_tracking_code || "").trim();
  const steadfastId = String(order.courier_consignment_id || order.courier_order_id || "").trim();
  const hasCourierInfo = Boolean(trackingCode || steadfastId);

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice #${order.order_number}</title>
${faviconUrl ? `<link rel="icon" type="image/png" href="${faviconUrl}" />` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif; color: #1f2937; background: #eef0f2; }
  .sheet { max-width: 800px; margin: 0 auto; background: #fff; }
  .topbar { height: 8px; background: linear-gradient(90deg, ${brandColor}, ${accentColor}); }
  .content { padding: 36px 40px 30px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 30px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-mark { width: 48px; height: 48px; border-radius: 12px; object-fit: contain; }
  .brand-mark.mono { display: flex; align-items: center; justify-content: center; background: ${brandColor}; color: #fff; font-size: 20px; font-weight: 700; }
  .brand-name { font-size: 20px; font-weight: 700; color: #111827; }
  .brand-sub { font-size: 11px; color: #9ca3af; margin-top: 1px; letter-spacing: 0.3px; }
  .invoice-meta { text-align: right; }
  .invoice-title { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: ${brandColor}; text-transform: uppercase; }
  .invoice-id { font-size: 17px; font-weight: 700; color: #111827; margin-top: 4px; }
  .invoice-meta p { font-size: 12.5px; color: #6b7280; margin-top: 3px; }
  .status-pill { display: inline-block; margin-top: 6px; padding: 3px 11px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
  .info-card { background: ${hexToRgba(brandColor, 0.045)}; border-left: 3px solid ${brandColor}; border-radius: 8px; padding: 14px 16px; }
  .info-label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px; color: ${brandColor}; font-weight: 700; margin-bottom: 7px; }
  .info-card p { font-size: 13.5px; color: #374151; line-height: 1.6; }
  .info-card strong { color: #111827; font-size: 14.5px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
  thead th { background: ${hexToRgba(brandColor, 0.08)}; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #4b5563; font-weight: 700; }
  thead th:first-child { border-radius: 8px 0 0 8px; }
  thead th:last-child { border-radius: 0 8px 8px 0; }
  tbody td { padding: 11px 14px; border-bottom: 1px solid #f1f2f4; font-size: 13.5px; color: #374151; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:nth-child(even) { background: #fafafa; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .totals-box { width: 280px; }
  .totals-box .row { display: flex; justify-content: space-between; padding: 6px 2px; font-size: 13.5px; color: #4b5563; }
  .totals-box .row.grand { margin-top: 8px; padding: 12px 14px; border-radius: 8px; background: ${brandColor}; color: #fff; font-size: 16px; font-weight: 700; }
  .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #78350f; margin-bottom: 24px; }
  .notes strong { display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #92400e; }
  .footer { text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 18px; }
  .footer .thanks { font-size: 14px; font-weight: 600; color: ${brandColor}; }
  .no-print { text-align: center; padding: 20px 0 34px; }
  .no-print button { padding: 11px 34px; background: ${brandColor}; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .no-print button:hover { filter: brightness(0.94); }
  @media print {
    body { background: #fff; }
    .sheet { max-width: 100%; }
    .content { padding: 10px 6px 0; }
    .no-print { display: none; }
  }
</style>
</head><body>
  <div class="sheet">
    <div class="topbar"></div>
    <div class="content">
      <div class="header">
        <div class="brand">
          ${brandLogo
            ? `<img class="brand-mark" src="${brandLogo}" alt="${brandName}" />`
            : `<div class="brand-mark mono">${brandName.charAt(0) || "O"}</div>`}
          <div>
            <div class="brand-name">${brandName}</div>
            ${settings.site_address ? `<div class="brand-sub">${settings.site_address}</div>` : ""}
          </div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-title">ইনভয়েস</div>
          <div class="invoice-id">#${order.order_number}</div>
          <p>তারিখ: ${new Date(order.created_at).toLocaleDateString("bn-BD")}</p>
          <p>সময়: ${new Date(order.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}</p>
          <p>পেমেন্ট: ${(order.payment_method || "COD").toUpperCase()}</p>
          ${trackingCode ? `<p>Tracking ID: ${trackingCode}</p>` : ""}
          ${statusName ? `<span class="status-pill" style="background:${hexToRgba(statusColor, 0.15)};color:${statusColor}">${statusName}</span>` : ""}
        </div>
      </div>

      <div class="grid2">
        <div class="info-card">
          <div class="info-label">বিল করা হয়েছে</div>
          <p><strong>${order.customer_name}</strong></p>
          <p>📞 ${order.customer_phone}</p>
          <p>📍 ${order.customer_address}</p>
        </div>
        <div class="info-card">
          <div class="info-label">ডেলিভারি তথ্য</div>
          <p>🚚 এলাকা: ${order.delivery_area || "-"}</p>
          <p>💳 পেমেন্ট: ${(order.payment_method || "COD").toUpperCase()} (${order.payment_status === "paid" ? "পরিশোধিত" : "অপরিশোধিত"})</p>
          ${statusName ? `<p>📦 স্ট্যাটাস: ${statusName}</p>` : ""}
          ${hasCourierInfo ? `<p>Courier: Steadfast</p>` : ""}
          ${trackingCode ? `<p>Tracking ID: ${trackingCode}</p>` : ""}
          ${steadfastId ? `<p>Steadfast ID: ${steadfastId}</p>` : ""}
        </div>
      </div>

      <table>
        <thead><tr><th>পণ্য</th><th class="text-center">পরিমাণ</th><th class="text-right">একক মূল্য</th><th class="text-right">মোট</th></tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.product_name}${item.variant_info ? ` (${item.variant_info})` : ""}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">৳${Number(item.price).toLocaleString()}</td>
              <td class="text-right">৳${Number(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-box">
          <div class="row"><span>সাবটোটাল</span><span>৳${Number(order.subtotal).toLocaleString()}</span></div>
          <div class="row"><span>ডেলিভারি চার্জ</span><span>৳${Number(order.delivery_charge).toLocaleString()}</span></div>
          ${order.discount > 0 ? `<div class="row"><span>ডিসকাউন্ট</span><span>-৳${Number(order.discount).toLocaleString()}</span></div>` : ""}
          <div class="row grand"><span>সর্বমোট</span><span>৳${Number(order.total).toLocaleString()}</span></div>
        </div>
      </div>

      ${order.notes ? `<div class="notes"><strong>নোট</strong>${order.notes}</div>` : ""}

      <div class="footer">
        <p class="thanks">ধন্যবাদ আপনার অর্ডারের জন্য!</p>
      </div>
    </div>
  </div>

  <div class="no-print">
    <button onclick="window.print()">🖨️ প্রিন্ট করুন</button>
  </div>
</body></html>`;
}

export function openInvoice(order: any, items: any[], settings: SiteSettings) {
  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) return;
  invoiceWindow.document.write(buildInvoiceHtml(order, items, settings));
  invoiceWindow.document.close();
}

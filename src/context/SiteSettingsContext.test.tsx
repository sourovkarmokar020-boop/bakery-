import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hexToHslTriplet } from "@/lib/color";

const { selectMock } = vi.hoisted(() => ({ selectMock: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: (...args: unknown[]) => selectMock(...args) }),
  },
}));

import { SiteSettingsProvider, useSiteSettings } from "./SiteSettingsContext";

const SETTINGS_CACHE_KEY = "site_settings_cache_v4";

let renderedSettings: Record<string, string>[] = [];

const Probe = () => {
  const { settings } = useSiteSettings();
  renderedSettings.push(settings);
  return <span data-testid="brand">{settings.brand_name_en || "(hardcoded default)"}</span>;
};

const renderProvider = () =>
  render(
    <SiteSettingsProvider>
      <Probe />
    </SiteSettingsProvider>
  );

// মাইক্রোটাস্ক ফ্লাশ — fetch শেষ হওয়ার পরের state update গুলো বসতে দেয়
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

beforeEach(() => {
  renderedSettings = [];
  selectMock.mockReset();
  localStorage.clear();
  delete window.__SITE_SETTINGS__;
  document.getElementById("brand-theme")?.remove();
  document.getElementById("brand-theme-boot")?.remove();
});

describe("SiteSettingsProvider — সেভ করা সেটিংসই দেখাতে হবে", () => {
  it("প্রথম রেন্ডারেই সার্ভার থেকে আসা boot সেটিংস ব্যবহার করে", () => {
    window.__SITE_SETTINGS__ = { brand_name_en: "Boot Mart", brand_color: "#f59e0b" };
    selectMock.mockReturnValue(new Promise(() => {})); // API রেসপন্স কখনো আসে না

    renderProvider();

    // প্রথম রেন্ডারেই — কোনো await ছাড়া
    expect(renderedSettings[0].brand_name_en).toBe("Boot Mart");
    expect(screen.getByTestId("brand")).toHaveTextContent("Boot Mart");
  });

  it("boot সেটিংস থেকে ব্র্যান্ড কালার CSS ভেরিয়েবলে বসায় ও boot স্টাইল সরিয়ে দেয়", async () => {
    const bootStyle = document.createElement("style");
    bootStyle.id = "brand-theme-boot";
    document.head.appendChild(bootStyle);

    window.__SITE_SETTINGS__ = { brand_color: "#f59e0b", button_color: "#036cc7" };
    selectMock.mockReturnValue(new Promise(() => {}));

    renderProvider();

    const style = document.getElementById("brand-theme");
    expect(style?.textContent).toContain(`--primary: ${hexToHslTriplet("#f59e0b")};`);
    expect(style?.textContent).toContain(`--button: ${hexToHslTriplet("#036cc7")};`);
    // একটাই উৎস থাকে, নাহলে অ্যাডমিনে রঙ মুছলে পুরনোটা আটকে থাকত
    expect(document.getElementById("brand-theme-boot")).toBeNull();
  });

  it("API ফেল করলেও সেভ করা সেটিংস ধরে রাখে (ডিফল্টে ফিরে যায় না)", async () => {
    window.__SITE_SETTINGS__ = { brand_name_en: "Boot Mart", brand_color: "#f59e0b" };
    selectMock.mockResolvedValue({ data: null, error: { message: "backend down" } });

    renderProvider();
    await waitFor(() => expect(selectMock).toHaveBeenCalled());
    await flush();

    expect(screen.getByTestId("brand")).toHaveTextContent("Boot Mart");
    expect(document.getElementById("brand-theme")?.textContent).toContain("--primary:");
  });

  it("API খালি লিস্ট দিলেও সেভ করা সেটিংস ধরে রাখে", async () => {
    window.__SITE_SETTINGS__ = { brand_name_en: "Boot Mart" };
    selectMock.mockResolvedValue({ data: [], error: null });

    renderProvider();
    await waitFor(() => expect(selectMock).toHaveBeenCalled());
    await flush();

    expect(screen.getByTestId("brand")).toHaveTextContent("Boot Mart");
  });

  it("API ডেটা এলে সেটিংস আপডেট হয় ও ক্যাশে জমা হয়", async () => {
    window.__SITE_SETTINGS__ = { brand_name_en: "Boot Mart" };
    selectMock.mockResolvedValue({
      data: [
        { key: "brand_name_en", value: "Live Mart" },
        { key: "site_email", value: null },
      ],
      error: null,
    });

    renderProvider();

    await waitFor(() => expect(screen.getByTestId("brand")).toHaveTextContent("Live Mart"));
    const cached = JSON.parse(localStorage.getItem(SETTINGS_CACHE_KEY) || "{}");
    expect(cached.brand_name_en).toBe("Live Mart");
    expect(cached.site_email).toBe(""); // null → খালি স্ট্রিং
  });

  it("boot ডেটা না থাকলে আগের ভিজিটের ক্যাশ থেকে শুরু করে", () => {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ brand_name_en: "Cached Mart" }));
    selectMock.mockReturnValue(new Promise(() => {}));

    renderProvider();

    expect(renderedSettings[0].brand_name_en).toBe("Cached Mart");
  });

  it("ব্লকড ইউজারকে সাইটের বদলে বার্তা দেখায়", async () => {
    selectMock.mockResolvedValue({ data: null, error: { blocked: true } });

    renderProvider();

    await waitFor(() => expect(screen.queryByTestId("brand")).toBeNull());
  });
});

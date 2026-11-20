import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * index.html-এর boot স্ক্রিপ্টটাই ঠিক করে দেয় প্রথম paint-এ অ্যাডমিনের সেটিংস দেখা যাবে
 * কি না। async/defer বসিয়ে দিলে React আগে রেন্ডার হয়ে হার্ডকোড করা ডিফল্ট নাম/রঙ
 * ফ্ল্যাশ করে — তাই সেটা এখানে আটকানো হলো।
 */
describe("index.html boot script", () => {
  const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");
  const scriptTag = html.match(/<script[^>]*boot-settings\.js[^>]*>/)?.[0];

  it("boot-settings.js লোড করে", () => {
    expect(scriptTag).toBeDefined();
    expect(scriptTag).toContain("%VITE_API_URL%/boot-settings.js");
  });

  it("render-blocking থাকে — async/defer দেওয়া যাবে না", () => {
    expect(scriptTag).not.toMatch(/\basync\b/);
    expect(scriptTag).not.toMatch(/\bdefer\b/);
    expect(scriptTag).not.toContain('type="module"');
  });

  it("অ্যাপ বান্ডলের আগেই থাকে", () => {
    expect(html.indexOf("boot-settings.js")).toBeLessThan(html.indexOf("/src/main.tsx"));
  });
});

// অ্যাডমিন সেটিংসের WhatsApp নম্বর থেকে wa.me লিংক বানায়।
// নম্বর 01..., 880... বা +880... যেভাবেই সেভ থাকুক, সঠিক আন্তর্জাতিক ফরম্যাটে নেয়।
export const waLink = (number?: string, message?: string) => {
  const digits = (number || "01985403218").replace(/\D/g, "");
  const intl = digits.startsWith("880")
    ? digits
    : digits.startsWith("0")
      ? `88${digits}`
      : `880${digits}`;
  const text = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${intl}${text}`;
};

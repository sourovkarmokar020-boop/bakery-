import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import agentPhoto from "@/assets/support-agent.jpg";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { waLink } from "@/lib/whatsapp";
import { useLanguage } from "@/context/LanguageContext";

// welcome: true হলে বার্তাটি ব্র্যান্ড নাম থেকে বানানো — এটি সেভ হয় না, প্রতিবার নতুন করে তৈরি হয়
type Msg = { role: "user" | "assistant"; content: string; welcome?: boolean };

// লাইভ চ্যাট এখন সম্পূর্ণ Laravel-এর মাধ্যমে চলে (external API ছাড়া)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001/api";

// চ্যাট হিস্ট্রি ব্রাউজারে সেভ থাকে — রিলোডে হারায় না, ২৪ ঘণ্টা নিষ্ক্রিয় থাকলে মুছে যায়
const STORAGE_KEY = "dreammart_chat_history_v1";
const CHAT_TTL_MS = 24 * 60 * 60 * 1000;

const welcomeMsg = (brand: string, language: string): Msg => ({
  role: "assistant",
  welcome: true,
  content: language === "en"
    ? `Welcome to ${brand}! How can I help you find products, check prices, or place an order today?`
    : `আসসালামু আলাইকুম! 👋 ${brand}-এ স্বাগতম। আমি আপনাকে পণ্য খুঁজতে, দাম জানতে, অর্ডার করতে বা যেকোনো প্রশ্নে সাহায্য করতে পারি!`,
});

const isOldEnglishWelcome = (message: Msg) =>
  message.role === "assistant" &&
  /^Welcome to .+! How can I help you find products, check prices, or place an order today\?$/.test(message.content);

const loadHistory = (): Msg[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { messages, lastActivity } = JSON.parse(raw);
    if (!Array.isArray(messages) || !lastActivity) return null;
    // ২৪ ঘণ্টার বেশি পুরনো হলে মুছে ফেলি
    if (Date.now() - lastActivity > CHAT_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const cleanedMessages = messages.filter((message: Msg) => !isOldEnglishWelcome(message));
    return cleanedMessages.length > 0 ? cleanedMessages : null;
  } catch {
    return null;
  }
};

const QUICK_QUESTIONS_EN = [
  "How to order?",
  "How much is delivery charge?",
  "Show popular products",
];

const QUICK_QUESTIONS_BN = [
  "কিভাবে অর্ডার করবো?",
  "ডেলিভারি চার্জ কত?",
  "জনপ্রিয় পণ্য দেখান",
];

// Parse markdown links [text](url) into clickable elements
const renderMessage = (content: string) => {
  const parts = content.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/\[(.*?)\]\((.*?)\)/);
    if (match) {
      const url = match[2];
      // If it's a same-origin full URL or relative path, use React Router Link
      const isInternal = url.startsWith("/") || url.startsWith(window.location.origin);
      const to = isInternal ? url.replace(window.location.origin, "") : url;
      if (isInternal) {
        return (
          <Link key={i} to={to} className="text-primary underline font-medium hover:text-primary/80">
            {match[1]}
          </Link>
        );
      }
      return (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium hover:text-primary/80">
          {match[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const AIChatWidget = () => {
  const { settings } = useSiteSettings();
  const brand = settings.brand_name || "আমাদের শপ";
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const { language } = useLanguage();
  // রিলোডে হারায় না — আগের চ্যাট থাকলে সেটাই দেখায়, নাহলে স্বাগত বার্তা
  const [messages, setMessages] = useState<Msg[]>(() => loadHistory() || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const welcomeShownRef = useRef(false);

  // স্বাগত বার্তা সবসময় বর্তমান ব্র্যান্ড নাম ও ভাষা থেকে নতুন করে বানানো হয় —
  // পুরনো নাম যেন কখনো ক্যাশ থেকে ফিরে না আসে
  useEffect(() => {
    setMessages((prev) => [
      welcomeMsg(brand, language),
      ...prev.filter((m) => !m.welcome && !isOldEnglishWelcome(m)),
    ]);
  }, [brand, language]);

  // চ্যাটের প্রতিটা পরিবর্তন ব্রাউজারে সেভ (সময়সহ, যাতে ২৪ ঘণ্টা পর মুছে যায়)
  // স্বাগত বার্তা বাদ — ওটা প্রতিবার নতুন করে তৈরি হয়
  useEffect(() => {
    try {
      const persisted = messages.filter((m) => !m.welcome);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: persisted, lastActivity: Date.now() }));
    } catch {
      // localStorage বন্ধ/ভরা থাকলে সেভ ছাড়াই চলবে
    }
  }, [messages]);

  // নতুন চ্যাট শুরু — পুরনো হিস্ট্রি মুছে স্বাগত বার্তায় ফিরে যায়
  const startNewChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([welcomeMsg(brand, language)]);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show welcome bubble once after the page loads.
  useEffect(() => {
    if (open || welcomeShownRef.current) return;
    welcomeShownRef.current = true;
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [open]);

  // Keep the welcome bubble visible for 3 seconds.
  useEffect(() => {
    if (!showWelcome) return;
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showWelcome]);

  // Hide welcome when chat opens
  useEffect(() => {
    if (open) setShowWelcome(false);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      const reply = (data as any)?.reply || (language === "en" ? "Sorry, please try again later." : "দুঃখিত, একটু পরে আবার চেষ্টা করুন।");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: language === "en" ? "Sorry, there was a connection issue. Please try again later." : "দুঃখিত, সংযোগে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।" }]);
    }
    setLoading(false);
  };

  // admin প্যানেল থেকে লাইভ চ্যাট বন্ধ থাকলে উইজেট দেখাবে না (সব hook-এর পরে গার্ড)
  if (settings.live_chat_enabled === "false") return null;

  return (
    <>
      {/* Floating button - right side with agent photo */}
      {!open && (
        <div className="mobile-menu-hide fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-2">
          {/* Welcome bubble */}
          {showWelcome && (
            <div className="relative bg-card border rounded-2xl rounded-br-md shadow-lg px-4 py-3 max-w-[220px] animate-scale-in">
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute -top-2 -right-2 bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
              <p className="text-sm font-medium">{language === "en" ? "Hello! 👋" : "আসসালামু আলাইকুম! 👋"}</p>
              <p className="text-xs text-muted-foreground mt-1">{language === "en" ? "Ask me anything!" : "কিছু জানতে চাইলে আমাকে জিজ্ঞেস করুন"}</p>
            </div>
          )}

          {/* Agent circle button */}
          <button
            onClick={() => setOpen(true)}
            className="group relative"
          >
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden border-3 border-primary shadow-xl hover:shadow-2xl transition-all hover:scale-110 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
              <img src={agentPhoto} alt={language === "en" ? "Live Support" : "লাইভ সাপোর্ট"} className="w-full h-full object-cover" />
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-background"></span>
            </span>
            {/* Label */}
            <div className="absolute -left-[100px] top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
              <Sparkles className="h-3 w-3 inline mr-1" />
              {language === "en" ? "Live Support" : "লাইভ সাপোর্ট"}
            </div>
          </button>
        </div>
      )}

      {/* Chat window */}
      {open && (
        <div className="mobile-menu-hide fixed bottom-16 md:bottom-6 right-3 md:right-6 z-[60] w-[calc(100%-1.5rem)] md:w-[380px] h-[70vh] md:h-[500px] max-h-[550px] bg-card rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-foreground/30">
                <img src={agentPhoto} alt="Support Agent" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-sm">{brand}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-300 animate-pulse"></span>
                  <p className="text-xs opacity-90">{language === "en" ? "Support • Online" : "সাপোর্ট • অনলাইন"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={startNewChat}
                className="p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                title={language === "en" ? "Start new chat" : "নতুন চ্যাট শুরু করুন"}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <a
                href={waLink(settings.whatsapp_number, settings.whatsapp_template)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
                title={language === "en" ? "Contact on WhatsApp" : "WhatsApp এ যোগাযোগ করুন"}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start gap-2"}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 mt-1">
                    <img src={agentPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? renderMessage(msg.content) : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 mt-1">
                  <img src={agentPhoto} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-2 flex-wrap border-t bg-card shrink-0">
              {(language === "en" ? QUICK_QUESTIONS_EN : QUICK_QUESTIONS_BN).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs border rounded-full px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-card shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === "en" ? "Type your question..." : "আপনার প্রশ্ন লিখুন..."}
                className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;

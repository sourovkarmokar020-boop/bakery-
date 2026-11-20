import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Laravel ব্যাকএন্ড থেকে আসা ইউজার অবজেক্টের ন্যূনতম টাইপ
type User = {
  id: string | number;
  email?: string;
  name?: string;
  phone?: string;
  user_metadata?: { full_name?: string; phone?: string };
  [key: string]: unknown;
};

// আগের সেশনের ইউজার+রোল ক্যাশ — যাতে রিলোডে স্পিনার না দেখিয়ে সাথে সাথে UI দেখানো যায়।
// এটা শুধু লোডিং দ্রুত করার জন্য; আসল পারমিশন সবসময় সার্ভারেই চেক হয় এবং নিচে রিভ্যালিডেট হয়।
const CACHE_KEY = "organic_admin_session";

type CachedSession = { user: User; role: string | null };

function readCache(): CachedSession | null {
  try {
    if (!localStorage.getItem("organic_api_token")) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedSession) : null;
  } catch {
    return null;
  }
}

function writeCache(value: CachedSession | null) {
  try {
    if (value) localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function useAdmin() {
  const cached = useRef(readCache()).current;
  const [user, setUser] = useState<User | null>(cached?.user ?? null);
  const [isAdmin, setIsAdmin] = useState(!!cached?.role);
  const [isSuperAdmin, setIsSuperAdmin] = useState(cached?.role === "super_admin");
  // টোকেন না থাকলে কিছু ফেচ করার নেই, আর ক্যাশ থাকলে আগের ডেটা দিয়েই শুরু — দুই ক্ষেত্রেই লোডিং false
  const [loading, setLoading] = useState(!cached && !!localStorage.getItem("organic_api_token"));

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;

      const currentUser = (session?.user ?? null) as User | null;
      const role = (session as any)?.role ?? null;

      setUser(currentUser);
      setIsAdmin(!!role);
      setIsSuperAdmin(role === "super_admin");
      setLoading(false);
      writeCache(currentUser ? { user: currentUser, role } : null);
    });

    // Safety timeout - never stay loading forever
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    writeCache(null);
    await supabase.auth.signOut();
  };

  return { user, isAdmin, isSuperAdmin, loading, signOut };
}

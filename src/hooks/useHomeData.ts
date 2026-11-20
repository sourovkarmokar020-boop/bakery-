import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// হোমপেজের সব প্রধান ডেটা একটি এন্ডপয়েন্ট (/home) থেকেই আসে। আগে Index, Header ও
// TopCategories আলাদা আলাদা করে categories ফেচ করত — একই ডেটার জন্য একাধিক
// সমান্তরাল রিকোয়েস্ট। ব্যাকএন্ড ডেভ সার্ভার single-threaded হওয়ায় এই রিকোয়েস্টগুলো
// একটার পর একটা সিরিয়ালি চলত, ফলে পেজ অনেক ধীরে লোড হতো। এই hook একটিই
// react-query key (["home-data"]) ব্যবহার করে, তাই সব কম্পোনেন্ট একটিই নেটওয়ার্ক
// কলে dedupe হয়।

export type HomeCategory = {
  id: string;
  parent_id: string | null;
  name: string;
  name_en?: string;
  name_bn?: string;
  slug: string;
  image_url?: string | null;
  sort_order?: number;
  show_on_home?: boolean;
  show_in_navbar?: boolean;
};

export type HomeData = {
  products: any[];
  categories: any[];
  allCategories: HomeCategory[];
};

const HOME_CACHE_KEY = "dream_bakery_home_data_v3";

const fetchHomeData = async (): Promise<HomeData> => {
  const { data, error } = await supabase.home.getData();
  if (error) throw error;

  return {
    products: data?.products || [],
    categories: data?.categories || [],
    allCategories: data?.allCategories || [],
  };
};

const readCachedHomeData = (): HomeData | undefined => {
  try {
    // আগের ব্র্যান্ডের key-তে জমে থাকা পুরনো হোম ডেটা সরিয়ে দিই
    localStorage.removeItem("favorite_mart_home_data_v1");
    localStorage.removeItem("dream_mart_home_data_v1");
    localStorage.removeItem("dream_bakery_home_data_v2");
    const cached = JSON.parse(localStorage.getItem(HOME_CACHE_KEY) || "null");
    if (
      cached?.data &&
      Array.isArray(cached.data.products) &&
      Array.isArray(cached.data.categories) &&
      Array.isArray(cached.data.allCategories)
    ) {
      return cached.data;
    }
  } catch {
    // Use the API normally when browser storage is unavailable or invalid.
  }
  return undefined;
};

export const useHomeData = () => {
  const query = useQuery({
    queryKey: ["home-data"],
    queryFn: fetchHomeData,
    staleTime: 30 * 1000, // ৩০ সেকেন্ড পর পুরনো ডেটা আবার ফেচ হবে — নতুন পণ্য/ক্যাটাগরি দ্রুত দেখায়
    gcTime: 5 * 60 * 1000, // গার্বেজ কালেকশন ৫ মিনিট — দেখার পর আরেকবার গেলে ক্যাশ থেকে দেখায়
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 0,
    initialData: readCachedHomeData,
    initialDataUpdatedAt: () => {
      try {
        return JSON.parse(localStorage.getItem(HOME_CACHE_KEY) || "null")?.savedAt || 0;
      } catch {
        return 0;
      }
    },
  });

  const { data, dataUpdatedAt } = query;
  useEffect(() => {
    if (!data) return;
    try {
      localStorage.setItem(HOME_CACHE_KEY, JSON.stringify({ data, savedAt: dataUpdatedAt }));
    } catch {
      // The storefront remains usable if storage is disabled or full.
    }
  }, [data, dataUpdatedAt]);

  return query;
};

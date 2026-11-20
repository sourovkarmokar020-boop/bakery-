import { Play } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedTitle } from "@/context/LanguageContext";
import { resolveLocalImageUrl } from "@/lib/productImages";

const getYoutubeId = (url: string) => {
  try {
    const normalized = url.trim();
    if (!normalized) return null;

    const plainIdRegex = /^[A-Za-z0-9_-]{11}$/;
    if (plainIdRegex.test(normalized)) return normalized;

    const youtubeRegex = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = normalized.match(youtubeRegex);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

const getVideoEmbedSrc = (video: { videoId?: string; videoUrl?: string }) => {
  const source = video.videoUrl ?? video.videoId;
  if (!source) return "";

  const id = getYoutubeId(source);
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  return source;
};

const getVideoThumbnailFromSource = (video: { videoId?: string; videoUrl?: string }) => {
  const source = video.videoUrl ?? video.videoId ?? "";
  const id = getYoutubeId(source);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const VideoGallery = () => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const { language, t } = useLanguage();

  const { data: dbVideos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return (data || []) as any[];
    },
    staleTime: 30 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const videoList = (dbVideos || []).map((v: any) => ({
    id: v.id,
    title: getLocalizedTitle(v, language),
    videoUrl: (v.video_url || "") as string,
    thumbnail: v.thumbnail_url ? resolveLocalImageUrl(v.thumbnail_url) : undefined,
  }));

  if (!isLoading && videoList.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-2">{t("video_gallery")}</h2>
      <p className="text-center text-muted-foreground mb-6">{t("video_gallery_subtitle")}</p>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-video bg-muted animate-pulse rounded-xl border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videoList.map((video, i) => {
            const src = getVideoEmbedSrc(video);
            const fallbackThumbnail = getVideoThumbnailFromSource(video);
            const thumbnail = video.thumbnail || fallbackThumbnail;

            return (
              <div key={video.id || i} className="relative aspect-video bg-muted rounded-xl overflow-hidden border hover:shadow-md transition-shadow">
                {playingIndex === i ? (
                  <iframe
                    src={src}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="cursor-pointer group w-full h-full" onClick={() => setPlayingIndex(i)}>
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget as HTMLImageElement;
                        if (fallbackThumbnail && target.src !== fallbackThumbnail) {
                          target.src = fallbackThumbnail;
                        } else if (!fallbackThumbnail) {
                          target.style.display = "none";
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                      <div className="bg-primary text-primary-foreground rounded-full p-3.5 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-7 w-7 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5">
                      <p className="text-white text-sm md:text-base font-medium line-clamp-1">{video.title}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default VideoGallery;

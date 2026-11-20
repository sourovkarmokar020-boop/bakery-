import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = prev < 30 ? 3 : prev < 70 ? 5 : prev < 90 ? 3 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 15);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !fadeOut) {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 150);
    }
  }, [progress, fadeOut, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-150"
      style={{
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      <p className="text-muted-foreground mb-6 font-[Hind_Siliguri]">
        {language === "en" ? "Please wait, loading..." : "অপেক্ষা করুন, লোড হচ্ছে..."}
      </p>
      <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-semibold text-primary font-[Hind_Siliguri]">
        {progress}%
      </p>
    </div>
  );
}

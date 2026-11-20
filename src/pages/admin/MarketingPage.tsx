import MarketingSection from "./dashboard/MarketingSection";

export default function MarketingPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">মার্কেটিং</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ক্যাম্পেইন ও প্রমোশন ম্যানেজ করুন</p>
      </div>
      <MarketingSection />
    </div>
  );
}

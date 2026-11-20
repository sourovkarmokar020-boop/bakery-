import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function ComingSoonPage({ title, description }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card className="border-none shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Construction className="w-8 h-8 text-primary" />
          </div>
          <p className="font-medium">শীঘ্রই আসছে</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {description || `${title} ফিচারটি এখনো তৈরি হচ্ছে। শীঘ্রই এখানে কাজ করা যাবে।`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

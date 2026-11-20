import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

export interface LinkItem {
  label: string;
  label_en?: string;
  url: string;
}

interface Props {
  value: LinkItem[];
  onChange: (value: LinkItem[]) => void;
  // দ্বিভাষিক মোডে প্রতিটি লিংকের বাংলা ও ইংরেজি লেবেল আলাদা করে দেওয়া যায়
  bilingual?: boolean;
  labelPlaceholder?: string;
  labelEnPlaceholder?: string;
  urlPlaceholder?: string;
  addLabel?: string;
}

export default function LinkListEditor({
  value,
  onChange,
  bilingual = false,
  labelPlaceholder = "গিফট আইটেম",
  labelEnPlaceholder = "Gift Item",
  urlPlaceholder = "/category/gift-item",
  addLabel = "লিংক যোগ করুন",
}: Props) {
  const update = (index: number, field: keyof LinkItem, val: string) => {
    onChange(value.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => {
    onChange([...value, bilingual ? { label: "", label_en: "", url: "" } : { label: "", url: "" }]);
  };

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className={`flex-1 grid gap-2 ${bilingual ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <Input placeholder={labelPlaceholder} value={item.label} onChange={(e) => update(i, "label", e.target.value)} />
            {bilingual && (
              <Input placeholder={labelEnPlaceholder} value={item.label_en || ""} onChange={(e) => update(i, "label_en", e.target.value)} />
            )}
            <Input placeholder={urlPlaceholder} value={item.url} onChange={(e) => update(i, "url", e.target.value)} />
          </div>
          <div className="flex shrink-0">
            <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, -1)} title="উপরে নিন">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={i === value.length - 1} onClick={() => move(i, 1)} title="নিচে নামান">
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(i)} title="মুছুন">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={add}>
        <Plus className="w-4 h-4" /> {addLabel}
      </Button>
    </div>
  );
}

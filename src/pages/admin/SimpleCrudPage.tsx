import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import SettingsImageUpload from "@/components/admin/SettingsImageUpload";
import { CalendarIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { resolveLocalImageUrl } from "@/lib/productImages";

interface Field {
  key: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
}

interface Props {
  title: string;
  table: string;
  fields: Field[];
  columns: Field[];
}

const dateFieldTypes = new Set(["date", "datetime", "datetime-local"]);

const isDateField = (field: Field) => dateFieldTypes.has(field.type || "");

const pad = (value: number) => String(value).padStart(2, "0");

const parseDateValue = (value: unknown) => {
  if (!value) return undefined;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

const formatDateLabel = (value: unknown) => {
  const date = parseDateValue(value);
  if (!date) return "তারিখ নির্বাচন করুন";
  return `${date.toLocaleDateString("bn-BD")} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const timeValue = (value: unknown) => {
  const date = parseDateValue(value);
  return date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : "23:59";
};

export default function SimpleCrudPage({ title, table, fields, columns }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const localFields = useEffect || (() => {}) ? (
    table === "brands" || table === "sizes" || table === "colors" ? [
      { key: "name_en", label: "নাম (English)" },
      { key: "name_bn", label: "নাম (বাংলা)" },
      ...fields.filter(f => f.key !== "name")
    ] : table === "videos" ? [
      { key: "title_en", label: "টাইটেল (English)" },
      { key: "title_bn", label: "টাইটেল (বাংলা)" },
      ...fields.filter(f => f.key !== "title")
    ] : fields
  ) : fields;

  const localColumns = useEffect || (() => {}) ? (
    table === "brands" || table === "sizes" || table === "colors" ? [
      { key: "name_en", label: "নাম (English)" },
      { key: "name_bn", label: "নাম (বাংলা)" },
      ...columns.filter(c => c.key !== "name")
    ] : table === "videos" ? [
      { key: "title_en", label: "টাইটেল (English)" },
      { key: "title_bn", label: "টাইটেল (বাংলা)" },
      ...columns.filter(c => c.key !== "title")
    ] : columns
  ) : columns;

  useEffect(() => { fetchData(); }, [table]);

  const fetchData = async () => {
    const { data } = await supabase.from(table as any).select("*").order("created_at", { ascending: false });
    setItems(data || []);
  };

  const save = async () => {
    const payload = { ...editItem };
    
    // Save old fallbacks
    if (table === "brands" || table === "sizes" || table === "colors") {
      const name = payload.name_bn || payload.name_en || payload.name || "";
      payload.name = name;
      payload.name_en = payload.name_en || payload.name || "";
      payload.name_bn = payload.name_bn || payload.name || "";
    } else if (table === "videos") {
      const title = payload.title_bn || payload.title_en || payload.title || "";
      payload.title = title;
      payload.title_en = payload.title_en || payload.title || "";
      payload.title_bn = payload.title_bn || payload.title || "";
    }

    localFields.forEach((field) => {
      if (isDateField(field) && !payload[field.key]) {
        payload[field.key] = null;
      }
    });

    if (editItem.id) {
      await supabase.from(table as any).update(payload).eq("id", editItem.id);
    } else {
      delete payload.id;
      await supabase.from(table as any).insert(payload);
    }
    toast({ title: "সেভ হয়েছে" });
    setDialogOpen(false);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    await supabase.from(table as any).delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
    fetchData();
  };

  const newItem = () => {
    const empty: any = {};
    localFields.forEach(f => {
      if (f.type === "number") empty[f.key] = 0;
      else if (f.type === "boolean") empty[f.key] = true;
      else if (f.type === "select") empty[f.key] = f.options?.[0]?.value ?? "";
      else empty[f.key] = "";
    });
    setEditItem(empty);
    setDialogOpen(true);
  };

  const startEdit = (item: any) => {
    const prepared = { ...item };
    if (table === "brands" || table === "sizes" || table === "colors") {
      prepared.name_en = item.name_en || item.name || "";
      prepared.name_bn = item.name_bn || item.name || "";
    } else if (table === "videos") {
      prepared.title_en = item.title_en || item.title || "";
      prepared.title_bn = item.title_bn || item.title || "";
    }

    // পুরনো রেকর্ডে ড্রপডাউনের বাইরের মান থাকতে পারে (আগে ফিল্ডটা হাতে লেখা ছিল) —
    // সেটা প্রথম অপশনে নামিয়ে আনা হয়, নাহলে সিলেক্টটা ফাঁকা দেখাত
    localFields.forEach((field) => {
      if (field.type !== "select" || !field.options?.length) return;
      const known = field.options.some((option) => option.value === prepared[field.key]);
      if (!known) prepared[field.key] = field.options[0].value;
    });

    setEditItem(prepared);
    setDialogOpen(true);
  };

  const updateDate = (key: string, selectedDate?: Date) => {
    if (!selectedDate) return;
    const current = parseDateValue(editItem[key]);
    const next = new Date(selectedDate);
    next.setHours(current?.getHours() ?? 23, current?.getMinutes() ?? 59, 0, 0);
    setEditItem({ ...editItem, [key]: formatDateValue(next) });
  };

  const updateTime = (key: string, value: string) => {
    const base = parseDateValue(editItem[key]) || new Date();
    const [hours = "23", minutes = "59"] = value.split(":");
    base.setHours(Number(hours), Number(minutes), 0, 0);
    setEditItem({ ...editItem, [key]: formatDateValue(base) });
  };

  const renderField = (field: Field) => {
    if (isDateField(field)) {
      const selectedDate = parseDateValue(editItem[field.key]);

      return (
        <div key={field.key} className="space-y-1.5">
          <Label>{field.label}</Label>
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {formatDateLabel(editItem[field.key])}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => updateDate(field.key, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={timeValue(editItem[field.key])}
              onChange={(e) => updateTime(field.key, e.target.value)}
            />
          </div>
          {editItem[field.key] && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => setEditItem({ ...editItem, [field.key]: "" })}
            >
              তারিখ মুছুন
            </button>
          )}
        </div>
      );
    }

    if (field.type === "image") {
      return (
        <div key={field.key} className="space-y-1.5">
          <Label>{field.label}</Label>
          <SettingsImageUpload
            imageUrl={editItem[field.key] || ""}
            onChange={(url) => setEditItem({ ...editItem, [field.key]: url })}
            folder={table}
            label="ছবি আপলোড করুন"
          />
        </div>
      );
    }

    if (field.type === "color") {
      return (
        <div key={field.key} className="space-y-1.5">
          <Label>{field.label}</Label>
          <div className="flex gap-2">
            <input
              type="color"
              className="h-10 w-14 rounded border cursor-pointer shrink-0"
              value={/^#[0-9a-fA-F]{6}$/.test(editItem[field.key] || "") ? editItem[field.key] : "#000000"}
              onChange={(e) => setEditItem({ ...editItem, [field.key]: e.target.value })}
            />
            <Input
              value={editItem[field.key] || ""}
              placeholder="#3b82f6"
              onChange={(e) => setEditItem({ ...editItem, [field.key]: e.target.value })}
            />
          </div>
        </div>
      );
    }

    // ড্রপডাউন — হাতে লিখলে ভুল বানান ডাটাবেসে চলে যায়, তাই নির্দিষ্ট মানের
    // ফিল্ডগুলো (যেমন কুপনের ধরন) বেছে নেওয়ার ব্যবস্থা
    if (field.type === "select") {
      return (
        <div key={field.key} className="space-y-1.5">
          <Label>{field.label}</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={editItem[field.key] ?? field.options?.[0]?.value ?? ""}
            onChange={(e) => setEditItem({ ...editItem, [field.key]: e.target.value })}
          >
            {(field.options || []).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "boolean") {
      const checked = editItem[field.key] === undefined ? true : !!Number(editItem[field.key]);
      return (
        <div key={field.key} className="flex items-center justify-between rounded-md border px-3 py-2.5">
          <Label className="cursor-pointer" htmlFor={`switch-${field.key}`}>{field.label}</Label>
          <Switch
            id={`switch-${field.key}`}
            checked={checked}
            onCheckedChange={(value) => setEditItem({ ...editItem, [field.key]: value })}
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-1.5">
        <Label>{field.label}</Label>
        <Input
          type={field.type || "text"}
          value={editItem[field.key] || ""}
          onChange={(e) => setEditItem({ ...editItem, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">মোট {items.length}টি</p>
        </div>
        <Button className="rounded-full" onClick={newItem}><Plus className="w-4 h-4 mr-1" /> নতুন</Button>
      </div>
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {localColumns.map(c => <th key={c.key} className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">{c.label}</th>)}
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={localColumns.length + 1} className="text-center py-12 text-muted-foreground">কোনো ডেটা পাওয়া যায়নি</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    {localColumns.map(c => (
                      <td key={c.key} className="py-2.5 px-4">
                        {c.type === "image" && item[c.key] ? (
                          <img src={resolveLocalImageUrl(item[c.key])} alt="" className="w-16 h-10 rounded object-cover border" />
                        ) : c.type === "color" && item[c.key] ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: item[c.key] }} />
                            <span className="font-mono text-xs text-muted-foreground">{item[c.key]}</span>
                          </span>
                        ) : c.type === "boolean" ? (
                          <span className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                            Number(item[c.key]) ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground",
                          )}>
                            {Number(item[c.key]) ? "চালু" : "বন্ধ"}
                          </span>
                        ) : (item[c.key] === 0 || item[c.key] ? item[c.key] : '-')}
                      </td>
                    ))}
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(item)} className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600 transition-colors" title="এডিট">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(item.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="ডিলিট">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem?.id ? "এডিট" : "নতুন"} {title}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              {localFields.map(renderField)}
              <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button><Button onClick={save}>সেভ</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

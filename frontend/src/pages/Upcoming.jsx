import React, { useState, useMemo } from "react";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY, fmtDate, daysBetween, todayISO } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Check, Trash2, Clock } from "lucide-react";
import { SettleDialog } from "@/components/FinanceDialogs";
import { toast } from "sonner";

export default function Upcoming() {
  const { upcoming, cari, addUpcoming, deleteUpcoming } = useFinance();
  const [tab, setTab] = useState("pending");
  const [open, setOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    type: "collection",
    due_date: todayISO(),
    amount: "",
    cari_id: "",
    description: "",
    method: "Havale/EFT",
  });

  const findCari = (id) => cari.find((c) => c.id === id);

  const filtered = useMemo(() => {
    const data = tab === "settled" ? upcoming.filter((u) => u.status === "settled") : upcoming.filter((u) => u.status !== "settled");
    return [...data].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [upcoming, tab]);

  const submit = () => {
    if (!form.amount || Number(form.amount) <= 0) return toast.error("Geçerli tutar girin");
    addUpcoming({ ...form, cari_id: form.cari_id || null });
    toast.success("Yaklaşan kayıt eklendi");
    setForm({ type: "collection", due_date: todayISO(), amount: "", cari_id: "", description: "", method: "Havale/EFT" });
    setOpen(false);
  };

  const openSettle = (u) => {
    setSelected(u);
    setSettleOpen(true);
  };

  return (
    <div className="space-y-6" data-testid="upcoming-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Yaklaşan Ödeme & Tahsilat</h1>
          <p className="text-sm text-slate-400 mt-1">Vade takvimi ve tahsilat planı</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" data-testid="upcoming-add-button">
          <Plus className="h-4 w-4" /> Yeni Vade
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#131C2E] border border-slate-800">
          <TabsTrigger value="pending" data-testid="upcoming-tab-pending">Bekleyen</TabsTrigger>
          <TabsTrigger value="settled" data-testid="upcoming-tab-settled">Tamamlanan</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-2.5">
          {filtered.map((u, idx) => {
            const d = daysBetween(u.due_date);
            const isOverdue = u.status === "overdue" || (u.status === "pending" && d < 0);
            const isSettled = u.status === "settled";
            return (
              <Card key={u.id} className="bg-[#131C2E] border-slate-800 p-4" data-testid={`upcoming-row-${idx}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${u.type === "collection" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100 truncate">{u.description}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {findCari(u.cari_id)?.company_name || "Genel"} · {u.method}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-mono-data font-bold ${u.type === "collection" ? "text-emerald-400" : "text-rose-400"}`}>
                        {u.type === "collection" ? "+" : "−"}{fmtTRY(u.amount)}
                      </div>
                      <div className="text-[11px] text-slate-500">{fmtDate(u.due_date)}</div>
                    </div>
                    {isSettled ? (
                      <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">Tamamlandı</Badge>
                    ) : isOverdue ? (
                      <Badge variant="outline" className="bg-rose-500/10 border-rose-500/20 text-rose-400">{Math.abs(d)} gün gecikti</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400">
                        {d === 0 ? "Bugün" : `${d} gün sonra`}
                      </Badge>
                    )}
                    {!isSettled && (
                      <>
                        <Button size="sm" onClick={() => openSettle(u)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" data-testid={`mark-paid-button-${idx}`}>
                          <Check className="h-3.5 w-3.5" /> {u.type === "collection" ? "Tahsil Et" : "Öde"}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-400" onClick={() => { deleteUpcoming(u.id); toast.success("Silindi"); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && <div className="text-sm text-slate-500 text-center py-10">Kayıt bulunamadı</div>}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Yeni Vade Kaydı</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Tip</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="upcoming-form-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collection">Tahsilat (Alacak)</SelectItem>
                    <SelectItem value="payment">Ödeme (Borç)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Vade Tarihi</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="upcoming-form-date-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Tutar (₺)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono-data" data-testid="upcoming-form-amount-input" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Yöntem</Label>
                <Input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="bg-[#0E1522] border-slate-700" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Cari (opsiyonel)</Label>
              <Select value={form.cari_id || "none"} onValueChange={(v) => setForm({ ...form, cari_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-[#0E1522] border-slate-700"><SelectValue placeholder="Cari seç" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {cari.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Açıklama</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="upcoming-form-description-input" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={submit} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="upcoming-form-submit-button">Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SettleDialog open={settleOpen} onOpenChange={setSettleOpen} upcoming={selected} />
    </div>
  );
}

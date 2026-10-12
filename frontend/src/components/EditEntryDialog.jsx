import React, { useEffect, useState } from "react";
import { useFinance } from "@/lib/finance-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/**
 * EditEntryDialog - edits an existing income or expense row.
 * Props:
 *  - open, onOpenChange
 *  - kind: "income" | "expense"
 *  - entry: the existing record (required when open=true)
 */
export default function EditEntryDialog({ open, onOpenChange, kind, entry }) {
  const { accounts, cari, categories, updateIncome, updateExpense } = useFinance();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (open && entry) {
      setForm({
        date: entry.date,
        amount: entry.amount,
        category: entry.category,
        account_id: entry.account_id,
        cari_id: entry.cari_id || "",
        description: entry.description || "",
      });
    }
  }, [open, entry]);

  if (!form || !entry) return null;

  const isIncome = kind === "income";
  const cats = isIncome ? categories.income : categories.expense;
  const title = isIncome ? "Gelir Kaydını Düzenle" : "Gider Kaydını Düzenle";
  const btnColor = isIncome ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600";

  const submit = () => {
    if (!form.amount || Number(form.amount) <= 0) return toast.error("Geçerli bir tutar girin");
    if (!form.account_id) return toast.error("Hesap seçin");
    const payload = { ...form, cari_id: form.cari_id || null };
    if (isIncome) updateIncome(entry.id, payload);
    else updateExpense(entry.id, payload);
    toast.success("Kayıt güncellendi", {
      description: `${Number(form.amount).toLocaleString("tr-TR")} ₺ olarak kaydedildi`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[520px]" data-testid="edit-entry-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tutar, hesap veya cari değiştirilince ilgili bakiyeler otomatik güncellenir.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Tarih</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="edit-entry-date-input" />
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Tutar (₺)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono-data" data-testid="edit-entry-amount-input" />
            </div>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Kategori</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="edit-entry-category-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Banka/Kasa</Label>
              <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="edit-entry-account-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank_name} - {a.account_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Cari</Label>
              <Select value={form.cari_id || "none"} onValueChange={(v) => setForm({ ...form, cari_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="edit-entry-cari-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {cari.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name} ({c.type === "customer" ? "Müşteri" : "Tedarikçi"})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Açıklama</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="edit-entry-description-input" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={submit} className={`${btnColor} text-white`} data-testid="edit-entry-submit-button">Güncelle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
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
import { todayISO } from "@/lib/format";

const emptyIncome = () => ({
  date: todayISO(),
  amount: "",
  category: "SaaS Abonelikleri",
  account_id: "",
  cari_id: "",
  description: "",
});

const emptyExpense = () => ({
  date: todayISO(),
  amount: "",
  category: "Personel Maaş & Prim",
  account_id: "",
  cari_id: "",
  description: "",
});

export const IncomeDialog = ({ open, onOpenChange, defaults }) => {
  const { accounts, cari, categories, addIncome } = useFinance();
  const [form, setForm] = useState(emptyIncome());

  React.useEffect(() => {
    if (open) setForm({ ...emptyIncome(), ...(defaults || {}) });
  }, [open, defaults]);

  const submit = () => {
    if (!form.amount || Number(form.amount) <= 0)
      return toast.error("Geçerli bir tutar girin");
    if (!form.account_id) return toast.error("Banka/kasa hesabı seçin");
    addIncome({ ...form, cari_id: form.cari_id || null });
    toast.success("Gelir kaydedildi", { description: `${Number(form.amount).toLocaleString("tr-TR")} ₺ başarıyla eklendi` });
    setForm(emptyIncome());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[520px]" data-testid="income-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Yeni Gelir Kaydı</DialogTitle>
          <DialogDescription className="text-slate-400">
            Gelir tutarı seçilen hesabın bakiyesine otomatik eklenir.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Tarih</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="income-form-date-input" />
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Tutar (₺)</Label>
              <Input type="number" step="0.01" placeholder="0,00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono-data" data-testid="income-form-amount-input" />
            </div>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Kategori</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="income-form-category-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.income.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Banka/Kasa</Label>
              <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="income-form-account-select"><SelectValue placeholder="Hesap seç" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank_name} - {a.account_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Cari (opsiyonel)</Label>
              <Select value={form.cari_id || "none"} onValueChange={(v) => setForm({ ...form, cari_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="income-form-cari-select"><SelectValue placeholder="Cari seç" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {cari.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name} ({c.type === "customer" ? "Müşteri" : "Tedarikçi"})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Açıklama</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Fatura no, dönem bilgisi vb." className="bg-[#0E1522] border-slate-700" data-testid="income-form-description-input" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="income-form-cancel-button">İptal</Button>
          <Button onClick={submit} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="income-form-submit-button">Geliri Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ExpenseDialog = ({ open, onOpenChange, defaults }) => {
  const { accounts, cari, categories, addExpense } = useFinance();
  const [form, setForm] = useState(emptyExpense());

  React.useEffect(() => {
    if (open) setForm({ ...emptyExpense(), ...(defaults || {}) });
  }, [open, defaults]);

  const submit = () => {
    if (!form.amount || Number(form.amount) <= 0) return toast.error("Geçerli bir tutar girin");
    if (!form.account_id) return toast.error("Banka/kasa hesabı seçin");
    addExpense({ ...form, cari_id: form.cari_id || null });
    toast.success("Gider kaydedildi", { description: `${Number(form.amount).toLocaleString("tr-TR")} ₺ hesaptan düşüldü` });
    setForm(emptyExpense());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[520px]" data-testid="expense-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Yeni Gider Kaydı</DialogTitle>
          <DialogDescription className="text-slate-400">Gider tutarı seçilen hesaptan düşülür.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Tarih</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="expense-form-date-input" />
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Tutar (₺)</Label>
              <Input type="number" step="0.01" placeholder="0,00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono-data" data-testid="expense-form-amount-input" />
            </div>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Kategori</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="expense-form-category-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.expense.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Banka/Kasa</Label>
              <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
                <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="expense-form-account-select"><SelectValue placeholder="Hesap seç" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank_name} - {a.account_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Cari (opsiyonel)</Label>
              <Select value={form.cari_id || "none"} onValueChange={(v) => setForm({ ...form, cari_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="expense-form-cari-select"><SelectValue placeholder="Cari seç" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  {cari.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name} ({c.type === "customer" ? "Müşteri" : "Tedarikçi"})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Açıklama</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="expense-form-description-input" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="expense-form-cancel-button">İptal</Button>
          <Button onClick={submit} className="bg-rose-500 hover:bg-rose-600 text-white" data-testid="expense-form-submit-button">Gideri Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TransferDialog = ({ open, onOpenChange }) => {
  const { accounts, transfer } = useFinance();
  const [form, setForm] = useState({ from_id: "", to_id: "", amount: "", description: "" });

  const submit = () => {
    if (!form.from_id || !form.to_id) return toast.error("Gönderen ve alıcı hesabı seçin");
    if (form.from_id === form.to_id) return toast.error("Aynı hesap seçilemez");
    if (!form.amount || Number(form.amount) <= 0) return toast.error("Geçerli bir tutar girin");
    const ok = transfer(form);
    if (ok) {
      toast.success("Virman tamamlandı", { description: `${Number(form.amount).toLocaleString("tr-TR")} ₺ transfer edildi` });
      setForm({ from_id: "", to_id: "", amount: "", description: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[480px]" data-testid="transfer-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Hesaplar Arası Virman</DialogTitle>
          <DialogDescription className="text-slate-400">Kaynak hesabından düşüp hedefe ekler.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Gönderen Hesap</Label>
            <Select value={form.from_id} onValueChange={(v) => setForm({ ...form, from_id: v })}>
              <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="transfer-from-select"><SelectValue placeholder="Hesap seç" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank_name} - {a.account_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Alıcı Hesap</Label>
            <Select value={form.to_id} onValueChange={(v) => setForm({ ...form, to_id: v })}>
              <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="transfer-to-select"><SelectValue placeholder="Hesap seç" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank_name} - {a.account_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Tutar (₺)</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono-data" data-testid="transfer-amount-input" />
          </div>
          <div>
            <Label className="text-slate-300 text-xs uppercase tracking-wider">Açıklama</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="transfer-description-input" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={submit} className="bg-cyan-500 hover:bg-cyan-600 text-white" data-testid="transfer-submit-button">Virman Yap</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const SettleDialog = ({ open, onOpenChange, upcoming }) => {
  const { accounts, settleUpcoming } = useFinance();
  const [accountId, setAccountId] = useState("");

  const submit = () => {
    if (!accountId) return toast.error("Hesap seçin");
    settleUpcoming(upcoming.id, accountId);
    toast.success(upcoming.type === "collection" ? "Tahsilat alındı" : "Ödeme yapıldı");
    setAccountId("");
    onOpenChange(false);
  };

  if (!upcoming) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[440px]" data-testid="settle-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {upcoming.type === "collection" ? "Tahsilatı Al" : "Ödemeyi Yap"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">{upcoming.description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label className="text-slate-300 text-xs uppercase tracking-wider">Hesap</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="settle-account-select"><SelectValue placeholder="Hesap seç" /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank_name} - {a.account_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={submit} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="settle-submit-button">Onayla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

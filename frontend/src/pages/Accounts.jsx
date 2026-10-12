import React, { useState } from "react";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, ArrowLeftRight, Trash2, Wallet, Copy, Pencil, FileText } from "lucide-react";
import { TransferDialog } from "@/components/FinanceDialogs";
import { toast } from "sonner";

const emptyForm = () => ({
  bank_name: "",
  account_name: "",
  account_type: "Vadesiz Ticari",
  iban: "",
  balance: "",
  color: "#10B981",
});

export default function Accounts() {
  const { accounts, transfers, addAccount, deleteAccount, updateAccount } = useFinance();
  const navigate = useNavigate();
  const [transferOpen, setTransferOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      bank_name: a.bank_name,
      account_name: a.account_name,
      account_type: a.account_type,
      iban: a.iban,
      balance: a.balance,
      color: a.color,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.bank_name || !form.account_name) return toast.error("Banka ve hesap adı zorunlu");
    if (editingId) {
      updateAccount(editingId, form);
      toast.success("Hesap güncellendi");
    } else {
      addAccount(form);
      toast.success("Hesap eklendi");
    }
    setForm(emptyForm());
    setEditingId(null);
    setDialogOpen(false);
  };

  const copyIban = (iban) => {
    navigator.clipboard?.writeText(iban);
    toast.success("IBAN kopyalandı");
  };

  const findAccount = (id) => accounts.find((a) => a.id === id);

  return (
    <div className="space-y-6" data-testid="accounts-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Banka & Kasa Portföyü</h1>
          <p className="text-sm text-slate-400 mt-1">Toplam {accounts.length} hesap · {fmtTRY(total)}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTransferOpen(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white gap-1.5" data-testid="account-transfer-button">
            <ArrowLeftRight className="h-4 w-4" /> Virman
          </Button>
          <Button onClick={openAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" data-testid="account-add-button">
            <Plus className="h-4 w-4" /> Yeni Hesap
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a, idx) => (
          <Card key={a.id} className="bg-[#131C2E] border-slate-800 p-5 relative overflow-hidden group hover:border-slate-700 transition-colors" data-testid={`account-card-${idx}`}>
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full blur-3xl opacity-30" style={{ background: a.color }} />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl grid place-items-center" style={{ background: `${a.color}22`, color: a.color }}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display font-semibold text-slate-100">{a.bank_name}</div>
                  <div className="text-xs text-slate-500">{a.account_type}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-cyan-400"
                  onClick={() => navigate(`/hesaplar/${a.id}`)}
                  data-testid={`account-detail-button-${idx}`}
                  title="Ekstre & Hareketler"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-emerald-400"
                  onClick={() => openEdit(a)}
                  data-testid={`account-edit-button-${idx}`}
                  title="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-rose-400"
                  onClick={() => { if (confirm("Hesabı sil?")) { deleteAccount(a.id); toast.success("Hesap silindi"); } }}
                  data-testid={`account-delete-button-${idx}`}
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">{a.account_name}</div>
              <div className="font-display font-bold text-2xl text-emerald-400 font-mono-data mt-1">{fmtTRY(a.balance)}</div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="text-[11px] font-mono text-slate-500 truncate">{a.iban}</div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-200 shrink-0" onClick={() => copyIban(a.iban)}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Transfers log */}
      {transfers.length > 0 && (
        <Card className="bg-[#131C2E] border-slate-800 p-5">
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-4">Son Virmanlar</h2>
          <div className="space-y-2">
            {transfers.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0E1522] border border-slate-800/80">
                <div className="flex items-center gap-3 text-sm">
                  <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
                  <div>
                    <div className="text-slate-200">{findAccount(t.from_id)?.bank_name} → {findAccount(t.to_id)?.bank_name}</div>
                    <div className="text-xs text-slate-500">{t.description} · {t.date}</div>
                  </div>
                </div>
                <div className="font-mono-data font-bold text-cyan-400">{fmtTRY(t.amount)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? "Hesabı Düzenle" : "Yeni Banka/Kasa Hesabı"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Banka Adı</Label>
                <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="Örn. Garanti BBVA" className="bg-[#0E1522] border-slate-700" data-testid="account-form-bank-input" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Hesap Adı</Label>
                <Input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder="Örn. Ana Hesap" className="bg-[#0E1522] border-slate-700" data-testid="account-form-name-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Hesap Tipi</Label>
                <Input value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} className="bg-[#0E1522] border-slate-700" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">
                  {editingId ? "Güncel Bakiye" : "Başlangıç Bakiye"}
                </Label>
                <Input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono-data" data-testid="account-form-balance-input" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">IBAN</Label>
              <Input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="TR..." className="bg-[#0E1522] border-slate-700 font-mono" />
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Renk</Label>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="bg-[#0E1522] border-slate-700 h-10 w-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={submit} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="account-form-submit-button">
              {editingId ? "Güncelle" : "Hesap Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

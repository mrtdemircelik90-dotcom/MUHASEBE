import React, { useState, useMemo } from "react";
import { useFinance } from "@/lib/finance-store";
import { fmtTRY } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Phone, Mail, Building2, Pencil, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const emptyForm = () => ({
  type: "customer",
  company_name: "",
  contact_person: "",
  tax_no: "",
  tax_office: "",
  phone: "",
  email: "",
  balance: 0,
  category: "",
});

export default function CurrentAccounts() {
  const { cari, addCari, deleteCari, updateCari } = useFinance();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tab, setTab] = useState("all");
  const [form, setForm] = useState(emptyForm());

  const filtered = useMemo(() => {
    if (tab === "all") return cari;
    return cari.filter((c) => c.type === tab);
  }, [cari, tab]);

  const totalReceivable = cari.filter((c) => c.type === "customer").reduce((s, c) => s + c.balance, 0);
  const totalPayable = cari.filter((c) => c.type === "supplier").reduce((s, c) => s + c.balance, 0);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      type: c.type,
      company_name: c.company_name,
      contact_person: c.contact_person || "",
      tax_no: c.tax_no || "",
      tax_office: c.tax_office || "",
      phone: c.phone || "",
      email: c.email || "",
      balance: c.balance,
      category: c.category || "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.company_name) return toast.error("Firma adı zorunlu");
    if (editingId) {
      updateCari(editingId, form);
      toast.success("Cari güncellendi");
    } else {
      addCari(form);
      toast.success("Cari eklendi");
    }
    setForm(emptyForm());
    setEditingId(null);
    setOpen(false);
  };

  return (
    <div className="space-y-6" data-testid="cari-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Cari Hesaplar</h1>
          <p className="text-sm text-slate-400 mt-1">Müşteri alacakları ve tedarikçi borçları</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5" data-testid="cari-add-button">
          <Plus className="h-4 w-4" /> Yeni Cari
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#131C2E] border border-emerald-500/20 p-5">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Toplam Alacak</div>
          <div className="font-display font-bold text-2xl text-emerald-400 font-mono-data mt-2" data-testid="cari-total-receivable">{fmtTRY(totalReceivable)}</div>
          <div className="text-xs text-slate-500 mt-1">{cari.filter((c) => c.type === "customer").length} müşteri</div>
        </Card>
        <Card className="bg-[#131C2E] border border-rose-500/20 p-5">
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Toplam Borç</div>
          <div className="font-display font-bold text-2xl text-rose-400 font-mono-data mt-2" data-testid="cari-total-payable">{fmtTRY(totalPayable)}</div>
          <div className="text-xs text-slate-500 mt-1">{cari.filter((c) => c.type === "supplier").length} tedarikçi</div>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#131C2E] border border-slate-800">
          <TabsTrigger value="all" data-testid="cari-tab-all">Tümü</TabsTrigger>
          <TabsTrigger value="customer" data-testid="cari-tab-customer">Müşteriler (Alacak)</TabsTrigger>
          <TabsTrigger value="supplier" data-testid="cari-tab-supplier">Tedarikçiler (Borç)</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, idx) => (
              <Card key={c.id} className="bg-[#131C2E] border-slate-800 p-5 hover:border-slate-700 transition-colors" data-testid={`cari-card-${idx}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${c.type === "customer" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-100 truncate">{c.company_name}</div>
                      <div className="text-xs text-slate-500 truncate">{c.contact_person}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-500 hover:text-cyan-400"
                      onClick={() => navigate(`/cari/${c.id}`)}
                      data-testid={`cari-detail-button-${idx}`}
                      title="Ekstre & Hareketler"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-500 hover:text-emerald-400"
                      onClick={() => openEdit(c)}
                      data-testid={`cari-edit-button-${idx}`}
                      title="Düzenle"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-500 hover:text-rose-400"
                      onClick={() => { if (confirm("Cariyi sil?")) { deleteCari(c.id); toast.success("Cari silindi"); } }}
                      data-testid={`cari-delete-button-${idx}`}
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">{c.type === "customer" ? "Alacak Bakiye" : "Borç Bakiye"}</div>
                  <div className={`font-display font-bold text-xl font-mono-data mt-1 ${c.type === "customer" ? "text-emerald-400" : "text-rose-400"}`}>
                    {c.type === "customer" ? "+" : "−"}{fmtTRY(c.balance)}
                  </div>
                  {c.category && <Badge variant="outline" className="mt-2 bg-slate-800/60 border-slate-700 text-slate-300 text-[10px]">{c.category}</Badge>}
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {c.phone || "-"}</div>
                  <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {c.email || "-"}</div>
                  <div className="font-mono text-[11px]">VKN: {c.tax_no} · {c.tax_office}</div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#131C2E] border-slate-700/60 text-slate-100 sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? "Cariyi Düzenle" : "Yeni Cari Hesap"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Tip</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-[#0E1522] border-slate-700" data-testid="cari-form-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Müşteri (Alacaklı)</SelectItem>
                    <SelectItem value="supplier">Tedarikçi (Borçlu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">
                  {editingId ? "Güncel Bakiye" : "Başlangıç Bakiye"}
                </Label>
                <Input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono-data" data-testid="cari-form-balance-input" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Firma Adı</Label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="bg-[#0E1522] border-slate-700" data-testid="cari-form-company-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">İletişim Kişisi</Label>
                <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="bg-[#0E1522] border-slate-700" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Kategori</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-[#0E1522] border-slate-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">VKN</Label>
                <Input value={form.tax_no} onChange={(e) => setForm({ ...form, tax_no: e.target.value })} className="bg-[#0E1522] border-slate-700 font-mono" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Vergi Dairesi</Label>
                <Input value={form.tax_office} onChange={(e) => setForm({ ...form, tax_office: e.target.value })} className="bg-[#0E1522] border-slate-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Telefon</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-[#0E1522] border-slate-700" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">E-Posta</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-[#0E1522] border-slate-700" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={submit} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="cari-form-submit-button">
              {editingId ? "Güncelle" : "Cari Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

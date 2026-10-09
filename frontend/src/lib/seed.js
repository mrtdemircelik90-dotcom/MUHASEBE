// Seed data for Liravest finance app

export const INCOME_CATEGORIES = [
  "Yazılım Lisans Satışı",
  "SaaS Abonelikleri",
  "Teknik Danışmanlık",
  "Bakım & Destek Anlaşması",
  "E-Ticaret Komisyonları",
  "Mevduat / Fon Getirisi",
  "Diğer Gelirler",
];

export const EXPENSE_CATEGORIES = [
  "Personel Maaş & Prim",
  "SGK & Muhtasar Vergiler",
  "Ofis Kirası & Aidat",
  "Bulut Sunucu & AWS/SaaS",
  "Pazarlama & Google Ads",
  "Yazılım / Araç Lisansları",
  "Muhasebe & Hukuk Danışmanlığı",
  "Ulaşım & Seyahat",
  "Ofis İkram & Mutfak",
];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const daysAhead = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const SEED_ACCOUNTS = [
  {
    id: "acc-1",
    bank_name: "Garanti BBVA",
    account_name: "Ticari Ana Hesap",
    account_type: "Vadesiz Ticari",
    iban: "TR33 0006 2000 0001 2345 6789 01",
    balance: 845250.0,
    color: "#009036",
  },
  {
    id: "acc-2",
    bank_name: "Türkiye İş Bankası",
    account_name: "Operasyon & Maaş Hesabı",
    account_type: "Vadesiz Ticari",
    iban: "TR64 0006 4000 0012 3456 7890 12",
    balance: 412800.5,
    color: "#004B87",
  },
  {
    id: "acc-3",
    bank_name: "Yapı Kredi",
    account_name: "E-Ticaret & POS Tahsilat",
    account_type: "POS Bloke/Vadesiz",
    iban: "TR12 0006 7010 0000 0012 3456 78",
    balance: 298400.0,
    color: "#002B7F",
  },
  {
    id: "acc-4",
    bank_name: "Akbank",
    account_name: "Vergi & SGK Fon Hesabı",
    account_type: "Vadeli / Likit Fon",
    iban: "TR89 0004 6000 0088 8888 8888 88",
    balance: 185000.0,
    color: "#ED1C24",
  },
  {
    id: "acc-5",
    bank_name: "Şirket Kasası",
    account_name: "Merkez Ofis Nakit Kasa",
    account_type: "Nakit",
    iban: "KASA-001-TRY",
    balance: 38450.0,
    color: "#F59E0B",
  },
];

export const SEED_CARI = [
  {
    id: "cari-1",
    type: "customer",
    company_name: "Nova Yazılım ve Danışmanlık A.Ş.",
    contact_person: "Ece Çetin",
    tax_no: "6310492817",
    tax_office: "Zincirlikuyu VD",
    phone: "+90 212 444 8920",
    email: "muhasebe@novayazilim.com.tr",
    balance: 184500.0,
    category: "Kurumsal Yazılım",
  },
  {
    id: "cari-2",
    type: "customer",
    company_name: "Atlas Lojistik & Antrepo Ltd.",
    contact_person: "Cemil Bozkurt",
    tax_no: "1049823102",
    tax_office: "Kadıköy VD",
    phone: "+90 216 550 3020",
    email: "finans@atlaslojistik.com",
    balance: 72400.0,
    category: "Lojistik & Depo",
  },
  {
    id: "cari-3",
    type: "supplier",
    company_name: "BulutHost Bilişim Sunucu Hizmetleri",
    contact_person: "Hakan Tekin",
    tax_no: "2918374610",
    tax_office: "Ümraniye VD",
    phone: "+90 850 303 4050",
    email: "odeme@buluthost.com",
    balance: 46800.0,
    category: "Sunucu & Altyapı",
  },
  {
    id: "cari-4",
    type: "supplier",
    company_name: "Plaza Yönetimi & Gayrimenkul A.Ş.",
    contact_person: "Meral Aktaş",
    tax_no: "7719283011",
    tax_office: "Beşiktaş VD",
    phone: "+90 212 284 1000",
    email: "aidat@maslakplaza.com",
    balance: 65000.0,
    category: "Ofis & Kira",
  },
  {
    id: "cari-5",
    type: "customer",
    company_name: "Vesta Medya ve Reklam Ajansı",
    contact_person: "Görkem Yıldız",
    tax_no: "9102837461",
    tax_office: "Şişli VD",
    phone: "+90 212 310 9080",
    email: "fatura@vestamedya.com",
    balance: 41200.0,
    category: "Dijital Pazarlama",
  },
];

export const SEED_INCOME = [
  { id: "inc-1", date: daysAgo(2), amount: 125000, category: "SaaS Abonelikleri", account_id: "acc-1", cari_id: "cari-1", description: "Nova Yazılım - Kasım dönemi SaaS tahsilatı", status: "received" },
  { id: "inc-2", date: daysAgo(5), amount: 48500, category: "Teknik Danışmanlık", account_id: "acc-1", cari_id: "cari-2", description: "Atlas Lojistik - Sistem entegrasyon hizmeti", status: "received" },
  { id: "inc-3", date: daysAgo(9), amount: 72000, category: "Yazılım Lisans Satışı", account_id: "acc-3", cari_id: "cari-5", description: "Vesta Medya - Yıllık lisans yenileme", status: "received" },
  { id: "inc-4", date: daysAgo(14), amount: 18200, category: "Bakım & Destek Anlaşması", account_id: "acc-1", cari_id: "cari-1", description: "Aylık bakım anlaşması", status: "received" },
  { id: "inc-5", date: daysAgo(21), amount: 9500, category: "Mevduat / Fon Getirisi", account_id: "acc-4", cari_id: null, description: "Vadeli hesap getirisi", status: "received" },
  { id: "inc-6", date: daysAgo(28), amount: 56400, category: "E-Ticaret Komisyonları", account_id: "acc-3", cari_id: null, description: "POS tahsilat - online satışlar", status: "received" },
  { id: "inc-7", date: daysAgo(35), amount: 95000, category: "SaaS Abonelikleri", account_id: "acc-1", cari_id: "cari-1", description: "Ekim dönemi SaaS tahsilatı", status: "received" },
  { id: "inc-8", date: daysAgo(42), amount: 32000, category: "Teknik Danışmanlık", account_id: "acc-1", cari_id: "cari-5", description: "Reklam ajansı entegrasyon", status: "received" },
];

export const SEED_EXPENSE = [
  { id: "exp-1", date: daysAgo(1), amount: 285000, category: "Personel Maaş & Prim", account_id: "acc-2", cari_id: null, description: "Kasım maaş bordrosu", status: "paid" },
  { id: "exp-2", date: daysAgo(3), amount: 65000, category: "Ofis Kirası & Aidat", account_id: "acc-2", cari_id: "cari-4", description: "Maslak Plaza - Kasım kirası", status: "paid" },
  { id: "exp-3", date: daysAgo(7), amount: 46800, category: "Bulut Sunucu & AWS/SaaS", account_id: "acc-2", cari_id: "cari-3", description: "BulutHost sunucu altyapı ücreti", status: "paid" },
  { id: "exp-4", date: daysAgo(10), amount: 38500, category: "Pazarlama & Google Ads", account_id: "acc-1", cari_id: null, description: "Google Ads reklam harcaması", status: "paid" },
  { id: "exp-5", date: daysAgo(12), amount: 72400, category: "SGK & Muhtasar Vergiler", account_id: "acc-4", cari_id: null, description: "SGK primleri", status: "paid" },
  { id: "exp-6", date: daysAgo(18), amount: 15200, category: "Yazılım / Araç Lisansları", account_id: "acc-1", cari_id: null, description: "Figma, Linear, GitHub team", status: "paid" },
  { id: "exp-7", date: daysAgo(22), amount: 8900, category: "Muhasebe & Hukuk Danışmanlığı", account_id: "acc-1", cari_id: null, description: "Mali müşavir aylık ücret", status: "paid" },
  { id: "exp-8", date: daysAgo(26), amount: 4200, category: "Ulaşım & Seyahat", account_id: "acc-5", cari_id: null, description: "Müşteri ziyaretleri yakıt+otopark", status: "paid" },
  { id: "exp-9", date: daysAgo(30), amount: 275000, category: "Personel Maaş & Prim", account_id: "acc-2", cari_id: null, description: "Ekim maaş bordrosu", status: "paid" },
  { id: "exp-10", date: daysAgo(33), amount: 65000, category: "Ofis Kirası & Aidat", account_id: "acc-2", cari_id: "cari-4", description: "Maslak Plaza - Ekim kirası", status: "paid" },
];

export const SEED_UPCOMING = [
  { id: "up-1", type: "collection", due_date: daysAhead(2), amount: 184500, cari_id: "cari-1", description: "Nova Yazılım - Aralık dönemi SaaS fatura tahsilatı", status: "pending", method: "Havale/EFT" },
  { id: "up-2", type: "payment", due_date: daysAhead(4), amount: 46800, cari_id: "cari-3", description: "BulutHost - Aralık sunucu ödemesi", status: "pending", method: "Havale/EFT" },
  { id: "up-3", type: "collection", due_date: daysAhead(7), amount: 72400, cari_id: "cari-2", description: "Atlas Lojistik - Entegrasyon fatura 2.taksit", status: "pending", method: "Çek" },
  { id: "up-4", type: "payment", due_date: daysAhead(10), amount: 65000, cari_id: "cari-4", description: "Maslak Plaza - Aralık kira ödemesi", status: "pending", method: "Otomatik Ödeme" },
  { id: "up-5", type: "collection", due_date: daysAhead(15), amount: 41200, cari_id: "cari-5", description: "Vesta Medya - Danışmanlık faturası", status: "pending", method: "Havale/EFT" },
  { id: "up-6", type: "payment", due_date: daysAhead(-3), amount: 12500, cari_id: null, description: "Vergi dairesi - MTV ödemesi", status: "overdue", method: "Online Ödeme" },
  { id: "up-7", type: "payment", due_date: daysAhead(20), amount: 285000, cari_id: null, description: "Aralık maaş ödemesi", status: "pending", method: "Toplu Havale" },
];

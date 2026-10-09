export const fmtTRY = (n) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

export const fmtNumber = (n) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(
    Number(n) || 0,
  );

export const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

export const fmtDateFull = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const daysBetween = (iso) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(iso);
  t.setHours(0, 0, 0, 0);
  return Math.round((t - now) / (1000 * 60 * 60 * 24));
};

export const monthKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (key) => {
  const [y, m] = key.split("-");
  const names = [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ];
  return `${names[parseInt(m, 10) - 1]} ${y.slice(2)}`;
};

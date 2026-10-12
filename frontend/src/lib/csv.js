import { toast } from "sonner";

export const downloadCSV = (filename, rows) => {
  if (!rows || !rows.length) {
    toast.error("Dışa aktarılacak veri yok");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("CSV dışa aktarıldı");
};

// Date range helpers
export const DATE_RANGES = [
  { key: "all", label: "Tüm Zamanlar", days: null },
  { key: "30", label: "Son 30 Gün", days: 30 },
  { key: "60", label: "Son 60 Gün", days: 60 },
  { key: "90", label: "Son 90 Gün", days: 90 },
  { key: "custom", label: "Özel Aralık", days: null },
];

export const inRange = (iso, range, customFrom, customTo) => {
  if (!iso) return false;
  if (range.key === "all") return true;
  const d = new Date(iso);
  if (range.key === "custom") {
    if (customFrom && d < new Date(customFrom)) return false;
    if (customTo) {
      const end = new Date(customTo);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  }
  if (range.days) {
    const limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() - range.days);
    return d >= limit;
  }
  return true;
};

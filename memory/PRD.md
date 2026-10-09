# Liravest — Modern Finans Yönetim Konsolu

## Problem Statement
Gelirleri, giderleri, banka hesaplarını, cari hesapları, yaklaşan ödemeleri ve tahsilatları tek yerden yönetebileceğim, finansal raporlar oluşturabileceğim ve nakit akışını anlık takip edebileceğim modern bir finans yönetim uygulaması.

## Kullanıcı Seçimleri
- Tek kullanıcı / küçük işletme (auth yok)
- Para birimi: sadece TRY (₺)
- Tüm modüller (Gelir, Gider, Banka, Cari, Yaklaşan, Rapor, Nakit Akışı)
- Recharts grafikler + CSV export
- Manuel giriş + hızlı formlar

## Mimari
- **Frontend-only** React 19 SPA (CRA + craco)
- **Durum**: React Context + LocalStorage (`liravest-finance-v1`)
- **UI**: shadcn/ui + Tailwind, koyu obsidyen tema (emerald/coral aksan), Outfit + Plus Jakarta Sans + JetBrains Mono
- **Grafikler**: Recharts (AreaChart, BarChart, LineChart, PieChart)
- **Yönlendirme**: react-router-dom v7
- **Backend**: değiştirilmedi (ihtiyaç yok, veri lokal)

## Tamamlanan İşler (09.10.2026)
- 8 sayfa: Dashboard, Gelir, Gider, Banka & Kasa, Cari Hesaplar, Yaklaşan Ödeme/Tahsilat, Raporlar, Hareket Geçmişi
- 4 modal: Gelir Ekle, Gider Ekle, Virman (hesaplar arası), Vade Tahsil/Öde
- 5 banka hesabı + 5 cari + 8 gelir + 10 gider + 7 yaklaşan vade seed verisi
- Çift yönlü bakiye hesaplama (gelir → hesap +, cari −; gider → hesap −, cari −; virman → hesap transferi)
- CSV export (UTF-8 BOM, Türkçe karakter destekli)
- Toast bildirimleri (sonner)
- Tüm interaktif elementlerde `data-testid`
- Testing agent: 11/11 flow geçti (%100)

## Deferred / Backlog
- P1: Grafikler için tarih aralığı filtresi (Son 30/60/90 gün)
- P1: Her kaydı düzenleme (şu an sadece sil + yeniden ekle)
- P1: Cari ekstre sayfası (seçili cariye ait tüm hareketler)
- P2: Çoklu şirket/firma profili desteği
- P2: Backend sync (opsiyonel, LocalStorage → MongoDB)
- P2: KDV/Stopaj hesap otomasyonu
- P2: E-fatura içe aktarma

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, TrendingUp, Wallet, PieChart } from "lucide-react";

export default function Login() {
  const handleGoogleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left: brand */}
        <div className="hidden lg:flex flex-col justify-between p-12 border-r border-slate-800/60 relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center shadow-lg shadow-emerald-500/20">
              <span className="font-display font-black text-slate-950 text-xl">L</span>
            </div>
            <div>
              <div className="font-display font-bold text-xl leading-tight">Liravest</div>
              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Finans Konsolu</div>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Nakit akışını tek <span className="text-emerald-400">panelden</span> yönet.
            </h1>
            <p className="text-slate-400">
              Gelirlerinizi, giderlerinizi, cari hesaplarınızı ve yaklaşan vadelerinizi anlık görün. TRY odaklı modern kurumsal finans konsolu.
            </p>
            <div className="space-y-3 pt-4">
              {[
                { icon: Wallet, text: "Çoklu banka ve kasa hesabı yönetimi" },
                { icon: TrendingUp, text: "Gelir, gider ve cari hesap takibi" },
                { icon: PieChart, text: "Recharts tabanlı canlı finansal raporlar" },
                { icon: ShieldCheck, text: "Google ile güvenli tek tıkla giriş" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 grid place-items-center">
                    <f.icon className="h-4 w-4" />
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-600 font-mono tracking-wider">
            © {new Date().getFullYear()} Liravest · Türkiye
          </div>
        </div>

        {/* Right: login card */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <Card className="bg-[#131C2E] border-slate-800 p-8 w-full max-w-md relative">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center">
                <span className="font-display font-black text-slate-950">L</span>
              </div>
              <div className="font-display font-bold text-lg">Liravest</div>
            </div>

            <div className="mb-8">
              <div className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase mb-2">Hoş geldin</div>
              <h2 className="font-display text-3xl font-bold tracking-tight">Finansal konsoluna erişim.</h2>
              <p className="text-sm text-slate-400 mt-2">Devam etmek için Google hesabınla giriş yap. Verilerin güvende, oturumun 7 gün açık kalır.</p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold gap-2.5 shadow-lg"
              data-testid="google-signin-button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google ile Giriş Yap
            </Button>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 leading-relaxed">
                Giriş yaparak, finansal verilerinizin yalnızca sizin erişebileceğiniz güvenli bir oturumda saklanmasını kabul etmiş olursunuz. Emergent tarafından yönetilen OAuth kullanılmaktadır.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/lib/auth-context";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/login", { replace: true });
      return;
    }
    const sessionId = decodeURIComponent(match[1]);

    (async () => {
      try {
        const res = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true },
        );
        setUser(res.data);
        // Clean hash and go to dashboard
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/", { replace: true, state: { user: res.data } });
      } catch (e) {
        setError("Oturum doğrulanamadı. Lütfen tekrar deneyin.");
        setTimeout(() => navigate("/login", { replace: true }), 1800);
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 grid place-items-center">
      <div className="text-center space-y-3">
        <div className="h-10 w-10 mx-auto rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <div className="text-sm text-slate-400 font-mono tracking-wider">
          {error || "Oturum oluşturuluyor..."}
        </div>
      </div>
    </div>
  );
}

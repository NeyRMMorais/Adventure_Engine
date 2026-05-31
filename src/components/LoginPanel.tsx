import React, { useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

interface LoginPanelProps {
  onLogin: (pin: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin, onGoogleLogin, isLoading, error }) => {
  const [pin, setPin] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pin.trim() || isLoading) return;
    await onLogin(pin.trim());
  };

  return (
    <div className="max-w-md mx-auto w-full bg-immersive-panel border border-immersive-border rounded-3xl p-6 md:p-8 shadow-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <div className="flex items-center gap-2 text-immersive-accent">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest">
                Secure Gate
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
              Enter Adventure Engine
            </h1>
          </div>
          <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl">
            <Lock className="w-6 h-6 text-immersive-accent" />
          </div>
        </div>

        {/* Google Authentication Segment */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onGoogleLogin}
            className="w-full h-12 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-800 font-bold transition-all flex items-center justify-center gap-3 text-xs rounded-xl cursor-pointer hover:shadow-lg hover:shadow-white/[0.02]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
          <span className="text-[9px] text-slate-500 font-mono text-center">
            🔒 100% free identity service via Google Accounts.
          </span>
        </div>

        {/* Decorative Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[9px] font-mono uppercase tracking-wider text-slate-600 font-bold">
            Or Use Access PIN
          </span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 focus:border-immersive-accent focus:ring-1 focus:ring-immersive-accent/20 rounded-xl pl-11 pr-4 py-3 placeholder-slate-600 focus:outline-none transition-all text-white font-mono text-sm tracking-widest"
              placeholder="Enter PIN"
              maxLength={32}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !pin.trim()}
            className="w-full h-12 bg-immersive-accent hover:bg-immersive-accent/95 disabled:opacity-40 disabled:cursor-not-allowed text-immersive-bg font-extrabold uppercase tracking-widest font-mono rounded-xl transition-all flex items-center justify-center text-xs cursor-pointer"
          >
            {isLoading ? "Verifying..." : "Unlock with PIN"}
          </button>
        </form>

        <div className="border-t border-white/5 pt-4 flex flex-col gap-1 text-[10px] text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-400">Environment Setup:</span>
          <span>
            Google identity is active. Setup Google Client secrets inside Settings &gt; Secrets under variables <code className="text-[9px] font-mono text-immersive-accent">GOOGLE_CLIENT_ID</code> and <code className="text-[9px] font-mono text-immersive-accent">GOOGLE_CLIENT_SECRET</code> to transition from preview mode to production.
          </span>
        </div>
      </div>
    </div>
  );
};

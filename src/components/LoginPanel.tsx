import React, { useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

interface LoginPanelProps {
  onLogin: (pin: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin, isLoading, error }) => {
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent">
            Access PIN
          </label>
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
            className="w-full h-12 bg-immersive-accent hover:bg-immersive-accent/95 disabled:opacity-40 disabled:cursor-not-allowed text-immersive-bg font-extrabold uppercase tracking-widest font-mono rounded-xl transition-all flex items-center justify-center text-xs"
          >
            {isLoading ? "Verifying..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
};

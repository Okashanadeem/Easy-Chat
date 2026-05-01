"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, MessageSquare, ArrowLeft, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a brief loading state for a more premium feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password === "admin123") {
      document.cookie = "admin_auth=true; path=/";
      router.push("/admin");
    } else {
      setError("Incorrect access key. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-[#0B0E14] transition-colors duration-500">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Easy Chat Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
            Easy Chat
          </h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-800" />
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] opacity-90">
              Admin Gateway
            </p>
            <div className="h-[1px] w-8 bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-[2.5rem] p-10 border border-white/60 dark:border-slate-800/60 relative overflow-hidden group">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-blue-500/20 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Security Check</h2>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Authentication required</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Access Password
                </label>
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-600 dark:group-focus-within/input:text-blue-400 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-3xl focus:outline-none focus:border-blue-500/50 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 animate-shake">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 dark:hover:bg-blue-700 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ShieldCheck size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 flex flex-col items-center gap-6">
          <Link 
            href="/"
            className="group flex items-center gap-3 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <ArrowLeft size={16} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Zeno Chat</span>
          </Link>

          <div className="flex items-center gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 w-full justify-center">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
              SMIU BSSE FALL 2025
            </p>
            <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
              v1.0.0 Stable
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}

"use client";

import { Sparkles, Menu, ShieldCheck, Cpu } from "lucide-react";
import { useNav } from "@/context/NavContext";
import { usePathname } from "next/navigation";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showActions?: boolean;
}

export default function Header({ 
  title = "Zeno", 
  subtitle = "SMIU RAG CORE",
  showActions = true 
}: HeaderProps) {
  const { open } = useNav();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-30 glass px-3 py-2 md:px-6 md:py-3 backdrop-blur-2xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={open}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-900 dark:hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95"
          >
            <Menu size={18} className="md:w-5 md:h-5" />
          </button>
          
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative scale-90">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                <img src="/logo.png" alt="Easy Chat Logo" className="w-full h-full object-contain" />
              </div>
              {!isAdmin && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />}
            </div>


            <div>
              <h2 className="text-sm md:text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                {title}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[7px] md:text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {subtitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
              Innovation by
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 italic uppercase">
                Product of
              </span>
              <span className="text-[10px] font-black text-slate-900 dark:text-slate-300 italic uppercase">
                CAMS
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

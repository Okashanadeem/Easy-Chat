"use client";

import { MessageSquare, ShieldCheck, X, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNav } from "@/context/NavContext";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useNav();
  const [isDark, setIsDark] = useState(true); // Default to Dark

  useEffect(() => {
    // Check if user has a preference saved, otherwise use Dark as default
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navItems = [
    { name: "Zeno", href: "/", icon: MessageSquare, description: "AI Chat" },
    { name: "Manage", href: "/admin", icon: ShieldCheck, description: "Intelligence" },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-500"
          onClick={close}
        />
      )}

      {/* Drawer Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 z-[60] transform transition-transform duration-500 ease-in-out shadow-2xl flex flex-col p-8 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <button 
          onClick={close}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 flex items-center justify-center">
              <img src="/logo.png" alt="Easy Chat Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">Easy Chat</h1>
              <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-1 opacity-90">V2.0 Core</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em] mb-4 px-4">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className={`shrink-0 p-2 rounded-xl ${isActive ? "bg-white/10" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"} transition-colors duration-300`}>
                  <Icon size={18} strokeWidth={isActive ? 3 : 2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-widest">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-6">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400 transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Theme Mode</span>
            {isDark ? <Sun size={18} className="text-yellow-500 group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="text-blue-600 group-hover:-rotate-12 transition-transform" />}
          </button>

          <a 
            href="https://www.linkedin.com/in/okasha-nadeem/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#F8FAFC] dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800 shadow-sm group cursor-pointer hover:border-blue-400 transition-all"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-xs group-hover:scale-105 transition-transform duration-300">
              CR
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Okasha Nadeem</span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">BSSE SMIU</span>
            </div>
          </a>
        </div>
      </aside>
    </>
  );
}

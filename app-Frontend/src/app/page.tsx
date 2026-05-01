"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Header from "@/components/Header";
import { Clock, HelpCircle, Sparkles, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: string;
}

const HEADINGS = [
  { main: "Assalam-o-Alaikum,", accent: "Zeno is Live!" },
  { main: "Kya Scene hai,", accent: "Aj parhai ka?" },
  { main: "Zeno yahan hai,", accent: "Tension kis baat ki?" },
  { main: "Academic Stress?", accent: "Zeno handles it." },
  { main: "SMIU ka Smartest,", accent: "AI Co-pilot." },
  { main: "Ready to ACE,", accent: "the Semester?" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Assalam-o-Alaikum! 👋 I'm **Zeno**, your AI Classroom Assistant, developed by **Okasha Nadeem** (CR of BSSE Fall 2025). Main yahan aapki class resources, assignments, aur portal links mein help karne ke liye hoon. How can I assist you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dynamic Headings
  const [headingIndex, setHeadingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadingIndex((prev) => (prev + 1) % HEADINGS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  // Perfect Starter Questions
  const starters = [
    { title: "New Student?", desc: "How to start with CAMS", icon: Sparkles },
    { title: "Drive Map", desc: "Show Google Drive hierarchy", icon: HelpCircle },
    { title: "Official Links", desc: "Find CMS, Portal & Hub", icon: Sparkles },
    { title: "Submit Leave", desc: "How to apply for leave", icon: HelpCircle },
  ];

  const [loadingMessage, setLoadingMessage] = useState("Processing...");

  const loadingMessages = [
    "Consulting the CR's brain...",
    "Searching for GPA secrets...",
    "Waking up the SMIU servers...",
    "Checking CMS for updates...",
    "Bribing the algorithm with chai...",
  ];

  useEffect(() => {
    if (isLoading) {
      const randomMsg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setLoadingMessage(randomMsg);
    }
  }, [isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
      }
    };
    const el = scrollRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (retryTimer && retryTimer > 0) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        },
      );

      const data = await response.json();
      if (data.retry_after) setRetryTimer(data.retry_after);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          source: data.source,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please check your internet or try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[100dvh] relative transition-colors duration-500 overflow-hidden">
      <Header />

      {/* Main Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-12 space-y-6 scroll-smooth no-scrollbar pb-52 md:pb-64"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 1 && (
            <div className="py-8 md:py-16 space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={headingIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.9]"
                  >
                    {HEADINGS[headingIndex].main} <br /> 
                    <span className="text-blue-600 dark:text-blue-400">{HEADINGS[headingIndex].accent}</span>
                  </motion.h3>
                </AnimatePresence>
              </motion.div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 px-2">
                {starters.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      onClick={() => handleSendMessage(item.desc)}
                      className="group relative text-left p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-500 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:-translate-y-1"
                    >
                      <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl md:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100 dark:border-slate-700">
                          <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <span className="block text-[10px] md:text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{item.title}</span>
                          <span className="block text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider line-clamp-1">{item.desc}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 md:gap-8">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  source={msg.source}
                />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-[10px] text-blue-600 dark:text-blue-400 font-black bg-white dark:bg-slate-900 w-fit px-5 py-2.5 rounded-full border border-blue-100 dark:border-blue-900/50 shadow-lg animate-pulse uppercase italic tracking-widest"
              >
                <Sparkles size={14} className="animate-spin" />
                {loadingMessage}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="fixed bottom-32 right-6 md:right-12 p-3 bg-white dark:bg-slate-800 text-blue-600 shadow-2xl rounded-full border border-slate-100 dark:border-slate-700 z-50 hover:scale-110 transition-transform"
          >
            <ArrowDown size={20} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-8 z-40 bg-gradient-to-t from-slate-50 via-slate-50/80 dark:from-[#0B0E14] dark:via-[#0B0E14]/80 to-transparent">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading || (retryTimer !== null && retryTimer > 0)}
        />

        {retryTimer !== null && retryTimer > 0 && (
          <div className="max-w-md mx-auto mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/30 animate-pulse">
            <Clock size={14} />
            Cooldown: {retryTimer}s
          </div>
        )}
      </footer>
    </div>
  );
}

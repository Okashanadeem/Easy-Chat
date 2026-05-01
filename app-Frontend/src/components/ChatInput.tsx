"use client";

import { Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "Where is assignment 02 of DLD?",
  "Where can I submit leave?",
  "What is Academic Nexus?",
  "Show me the class drive link...",
  "How to check my attendance?",
  "Who is the CR of BSSE Fall 2025?",
];

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % SUGGESTIONS.length;
      const fullText = SUGGESTIONS[i];

      setPlaceholder(
        isDeleting
          ? fullText.substring(0, placeholder.length - 1)
          : fullText.substring(0, placeholder.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 100);

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholder === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative">
        <form 
          onSubmit={handleSubmit} 
          className="relative bg-white dark:bg-slate-900 backdrop-blur-xl p-1.5 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-800 flex items-end gap-2 md:gap-4 px-4 md:px-5 transition-all duration-300 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5"
        >
          <div className="hidden sm:flex shrink-0 mb-3 md:mb-4">
            <Sparkles className="text-blue-500/50" size={16} />
          </div>
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask anything about BSSE..."}
            className="flex-1 py-2.5 md:py-3.5 bg-transparent outline-none text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 selection:bg-blue-100 dark:selection:bg-blue-900 resize-none max-h-[150px] transition-all"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`shrink-0 mb-1.5 h-9 w-9 md:h-11 md:w-11 rounded-xl md:rounded-2xl transition-all flex items-center justify-center ${
              isLoading || !message.trim()
                ? "bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700" 
                : "bg-slate-900 dark:bg-blue-600 text-white shadow-md hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            <Send className={`${isLoading ? "animate-pulse" : ""} w-4 h-4 md:w-5 md:h-5`} strokeWidth={3} />
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 opacity-40 group cursor-default">
        <span className="h-px w-8 bg-slate-300 dark:bg-slate-700 group-hover:w-12 transition-all" />
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
          System Designed and Developed by Okasha Nadeem
        </p>
        <span className="h-px w-8 bg-slate-300 dark:bg-slate-700 group-hover:w-12 transition-all" />
      </div>
    </div>
  );
}

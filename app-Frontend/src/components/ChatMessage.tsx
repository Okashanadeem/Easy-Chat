import { User, Bot, Copy, Check, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  source?: string;
}

export default function ChatMessage({ role, content, source }: ChatMessageProps) {
  const isUser = role === "user";
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState(isUser ? (content || "") : "");
  const [isStreaming, setIsStreaming] = useState(!isUser && !!content);

  useEffect(() => {
    if (!isUser && content) {
      let currentWordIndex = 0;
      const words = content.split(" ");
      setDisplayedContent("");
      setIsStreaming(true);

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          const nextWord = words[currentWordIndex];
          if (nextWord !== undefined) {
            setDisplayedContent((prev) => (prev ? prev + " " + nextWord : nextWord));
          }
          currentWordIndex++;
        } else {
          setIsStreaming(false);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [content, isUser]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`flex gap-3 md:gap-4 p-4 md:p-5 ${
      isUser 
        ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white ml-auto rounded-[1.5rem] rounded-br-none shadow-xl shadow-blue-500/10 max-w-[85%]" 
        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] rounded-bl-none shadow-sm max-w-[92%] md:max-w-[85%]"
    } transition-all`}
    >
      
      {!isUser && (
        <div className="shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden">
          <img 
            src="/logo.png" 
            alt="Assistant Logo" 
            className={`w-full h-full object-contain ${isStreaming ? "animate-pulse" : ""}`} 
          />
        </div>
      )}


      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <p className={`font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] ${isUser ? "text-blue-100" : "text-slate-400"}`}>
            {isUser ? "You" : "Zeno"}
          </p>

          {source && source !== "undefined" && !isUser && (
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
              Source: {source}
            </span>
          )}
        </div>
        
        <div className={`prose prose-sm md:prose-base max-w-none leading-relaxed font-bold tracking-tight ${
          isUser 
            ? "prose-invert prose-p:text-blue-50 text-white selection:bg-white/20" 
            : "text-slate-700 dark:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white prose-strong:text-blue-700 dark:prose-strong:text-blue-400"
        }`}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <span className="inline-flex items-center gap-1 group/link bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  <a 
                    {...props} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 no-underline hover:underline underline-offset-4"
                  >
                    {props.children}
                  </a>
                  <button
                    onClick={() => handleCopy(props.href || "")}
                    title="Copy Link"
                    className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-blue-100 dark:border-blue-700 text-blue-500 dark:text-blue-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {copiedLink === props.href ? (
                      <Check size={12} className="text-green-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                  <ExternalLink size={10} className="text-blue-300 dark:text-blue-600" />
                </span>
              )
            }}
          >
            {displayedContent}
          </ReactMarkdown>
          {isStreaming && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-1.5 h-4 bg-blue-500 ml-1 rounded-full align-middle"
            />
          )}
        </div>
      </div>

      {isUser && (
        <div className="shrink-0 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white ring-1 ring-white/20">
          <User size={18} strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
}

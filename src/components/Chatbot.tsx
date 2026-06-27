import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, X, Send, Compass, Sparkles, ChevronUp, ChevronDown 
} from "lucide-react";
import { ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ChatbotProps {
  onQuickPlanDestination: (destName: string) => void;
}

const SUGGESTIONS = [
  "What is the best time to visit Kyoto?",
  "Recommend 3 secret local spots in Rome",
  "Give me a packing guide for Banff National Park",
  "Help me plan a romantic budget trip to Santorini"
];

export default function Chatbot({ onQuickPlanDestination }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLarge, setIsLarge] = useState(false); // expandable size modifier
  const [sessionId, setSessionId] = useState<string>(() => {
    const cached = localStorage.getItem("travel_session_id");
    if (cached) return cached;
    const newId = "user-" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("travel_session_id", newId);
    return newId;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: "Hello! I'm **Nomad AI**, your personal travel concierge. 🌍\n\nAsk me anything about flight routes, local customs, secret food spots, packing lists, or click a suggestion below! I can also help you design an itinerary in a flash.",
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("https://8bc9d732-790d-410a-bce7-e051528f2d0d-00-13ze8drzyq1qb.sisko.replit.dev/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text
        })
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.reply || "I'm sorry, I couldn't formulate a response. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Chat API error:", err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `⚠️ **Nomad AI is experiencing some turbulence:**\n\n*Could not connect to travel servers. Please try again.*`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic lightweight markdown renderer to format responses beautifully
  const renderMessageContent = (content: string) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((p, idx) => {
      let parts: React.ReactNode[] = [p];
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIndex = 0;
      const elements: React.ReactNode[] = [];
      let count = 0;

      while ((match = boldRegex.exec(p)) !== null) {
        if (match.index > lastIndex) {
          elements.push(p.substring(lastIndex, match.index));
        }
        elements.push(<strong key={`b-${count++}`} className="font-bold text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < p.length) {
        elements.push(p.substring(lastIndex));
      }

      const rawText = elements.length > 0 ? elements : parts;

      if (p.trim().startsWith("* ") || p.trim().startsWith("- ") || p.trim().match(/^\d+\.\s/)) {
        const lines = p.split("\n");
        return (
          <ul key={idx} className="list-disc pl-5 space-y-1 my-1.5 text-xs text-white/80 font-light">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[\s*-]+/, "").replace(/^\d+\.\s+/, "");
              
              let lineElements: React.ReactNode[] = [];
              let lineLastIndex = 0;
              let lineCount = 0;
              let lineMatch;
              
              while ((lineMatch = boldRegex.exec(cleanLine)) !== null) {
                if (lineMatch.index > lineLastIndex) {
                  lineElements.push(cleanLine.substring(lineLastIndex, lineMatch.index));
                }
                lineElements.push(<strong key={`b-l-${lineCount++}`} className="font-bold text-white">{lineMatch[1]}</strong>);
                lineLastIndex = boldRegex.lastIndex;
              }
              if (lineLastIndex < cleanLine.length) {
                lineElements.push(cleanLine.substring(lineLastIndex));
              }

              return (
                <li key={lIdx} className="leading-relaxed font-sans">
                  {lineElements.length > 0 ? lineElements : cleanLine}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={idx} className="text-xs text-white/85 leading-relaxed font-sans font-light mb-1.5 last:mb-0">
          {rawText}
        </p>
      );
    });
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300"
      style={{
        maxHeight: "calc(100vh - 85px)",
      }}
    >
      <AnimatePresence>
        {!isOpen ? (
          // 1. Collapsed Circular Chat Bubble
          <motion.button
            key="bubble"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 15 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-xl shadow-sky-500/25 cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white shadow ring-2 ring-white">
              AI
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2.5 hidden group-hover:flex flex-col items-end">
              <div className="bg-slate-900 text-white text-[10px] font-semibold py-1.5 px-3 rounded-lg shadow-md whitespace-nowrap">
                Chat with Nomad AI 🌍
              </div>
            </div>
          </motion.button>
        ) : (
          // 2. Expanded Chat Dialogue Panel (Styled with glass theme)
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`flex flex-col glass rounded-2xl border border-white/12 shadow-2xl overflow-hidden transition-all duration-300 ${
              isLarge 
                ? "w-[92vw] sm:w-[500px] h-[550px]" 
                : "w-[88vw] sm:w-[360px] h-[450px]"
            }`}
            style={{
              maxHeight: "calc(100vh - 100px)"
            }}
          >
            {/* Dialogue Header */}
            <div className="flex items-center justify-between bg-white/5 border-b border-white/10 p-3.5 text-white shadow-sm backdrop-blur-md">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 border border-white/10 backdrop-blur-md">
                  <Compass className="h-4.5 w-4.5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-display text-xs font-bold leading-tight flex items-center space-x-1">
                    <span>Nomad AI</span>
                    <Sparkles className="h-3 w-3 text-sky-300 animate-pulse" />
                  </h4>
                  <span className="text-[9px] font-medium text-white/60 flex items-center space-x-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Ready to assist</span>
                  </span>
                </div>
              </div>

              {/* Action Controls in Header */}
              <div className="flex items-center space-x-1">
                {/* Toggle Size (Expand / Collapse) */}
                <button
                  onClick={() => setIsLarge(!isLarge)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title={isLarge ? "Reduce size" : "Expand window size"}
                >
                  {isLarge ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>

                {/* Close Dialogue */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title="Close chat"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/45 backdrop-blur-md">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-left text-xs shadow-xl border ${
                    msg.role === "user"
                      ? "bg-sky-500 text-white border-sky-500/20"
                      : "bg-white/5 text-white border-white/10"
                  }`}>
                    {renderMessageContent(msg.content)}
                    <span className={`text-[8px] mt-1.5 block text-right font-mono ${
                      msg.role === "user" ? "text-white/60" : "text-white/45"
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Animated Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center space-x-1.5 shadow-sm">
                    <span className="h-1.5 w-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips Area */}
            {messages.length === 1 && (
              <div className="px-3.5 py-2.5 border-t border-white/10 bg-slate-900/60 space-y-2 backdrop-blur-md">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Suggested Questions</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="rounded-lg border border-white/10 bg-white/5 hover:bg-sky-500/20 hover:border-sky-400/50 px-2.5 py-1.5 text-left text-[10px] text-white/80 hover:text-white transition duration-150 line-clamp-1 block cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input Field Container */}
            <div className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center space-x-2 backdrop-blur-md">
              <input
                type="text"
                placeholder="Ask about travel advice, packing list, weather..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                disabled={isLoading}
                className="flex-1 rounded-xl glass-input py-2.5 px-3 text-xs outline-none transition"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg hover:bg-sky-400 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

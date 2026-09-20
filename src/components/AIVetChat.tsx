import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Stethoscope, HelpCircle, User, Bot, AlertCircle } from "lucide-react";
import { Farm, Cow } from "../types";

interface AIVetChatProps {
  farms: Farm[];
  cows: Cow[];
}

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function AIVetChat({ farms, cows }: AIVetChatProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "مرحباً بك في العيادة البيطرية الذكية لتطبيق أكبيطرة 🩺✨. أنا مستشارك البيطري المدعوم بـ Gemini AI. كيف يمكنني مساعدتك اليوم في رعاية قطيعك وحمايته؟",
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Quick consultations list
  const quickConsultations = [
    "ما هو جدول اللقاحات السنوي الموصى به للأبقار الحلوب؟",
    "كيف أتعامل مع التهاب الضرع الحاد (Mastitis) في المزرعة؟",
    "طرق طبيعية ومغذية لزيادة إنتاج الحليب اليومي ونسبة الدسم.",
    "ما هي أعراض التواء الأنفحة الحاد (Abomasal Displacement) وكيفية تداركه إسعافياً؟",
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    // Append User Message
    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/farm-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          farmDetails: {
            cowsCount: cows.filter(c => c.status !== 'sold' && c.status !== 'deceased').length,
            name: farms[0]?.name || "مزارع أكبيطرة",
          },
        }),
      });

      const data = await response.json();
      
      const botMsg: Message = {
        sender: "bot",
        text: response.ok ? data.answer : `عذراً، حدثت مشكلة: ${data.error}`,
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const botMsg: Message = {
        sender: "bot",
        text: "عذراً، لم نتمكن من الوصول للمستشار البيطري الذكي حالياً. يرجى التحقق من اتصالك بالإنترنت ومفتاح API.",
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(query);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-md flex flex-col h-[75vh] overflow-hidden text-right" id="ai-vet-chat-root">
      {/* Top Header */}
      <div className="bg-gradient-to-l from-emerald-800 to-teal-700 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/15 rounded-xl text-white">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">العيادة البيطرية الذكية 🩺</h3>
            <p className="text-xs text-emerald-100">مستشارك البيطري الفوري المدعم بالذكاء الاصطناعي</p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full text-emerald-200">
          متصل بـ Gemini
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => {
          const isBot = msg.sender === "bot";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${
                isBot ? "mr-0 ml-auto flex-row" : "mr-auto ml-0 flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div className={`p-2 rounded-xl text-white shrink-0 ${
                isBot ? "bg-emerald-800" : "bg-teal-600"
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message bubble */}
              <div className="space-y-1.5">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isBot 
                    ? "bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tr-none text-right"
                    : "bg-emerald-800 text-white rounded-tl-none text-right"
                }`}>
                  <div className="whitespace-pre-line text-sm">{msg.text}</div>
                </div>
                <p className="text-[9px] text-slate-400 font-mono text-left px-2">{msg.timestamp}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 mr-0 ml-auto max-w-[80%]">
            <div className="p-2 bg-emerald-800 rounded-xl text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm rounded-tr-none text-xs text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span>المستشار البيطري يقوم بمراجعة السجلات الطبية...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="p-4 border-t border-slate-100 bg-white space-y-2">
        <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>استشارات شائعة ومقترحة:</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {quickConsultations.map((c, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(c)}
              disabled={loading}
              className="text-[11px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all text-right disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-100 bg-white flex gap-2">
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="p-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-md transition-all border-none disabled:opacity-50 shrink-0"
        >
          <Send className="w-5 h-5 transform rotate-180" />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتب استشارتك الطبية أو سؤالك عن إدارة القطيع والمزارع هنا..."
          className="flex-grow p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm text-right"
          disabled={loading}
        />
      </form>
    </div>
  );
}

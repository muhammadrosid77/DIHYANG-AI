import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MapPin, Cloud, Info, Mic, PaperclipIcon, RotateCcw, Sparkles, Thermometer, Mountain } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import { sendChatMessage, type ChatMessage } from "../services/api";

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
  time: string;
};

const quickReplies = [
  { text: "🌡️ Cuaca Dieng hari ini?", query: "Bagaimana cuaca di Dieng hari ini?" },
  { text: "🏛️ Tempat wisata terbaik", query: "Apa saja tempat wisata terbaik di Dieng?" },
  { text: "🎟️ Harga tiket resmi", query: "Berapa harga tiket retribusi resmi di Dieng?" },
  { text: "🌄 Sunrise terbaik Dieng", query: "Di mana spot sunrise terbaik di Dieng?" },
  { text: "🏨 Penginapan dekat Dieng", query: "Rekomendasikan penginapan di Dieng" },
  { text: "🚌 Cara ke Dieng dari Jogja", query: "Bagaimana cara ke Dieng dari Yogyakarta?" },
];

const nowTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "bot",
    text: "Halo! Saya **DITA** 🏔️\n*Dieng Intelligence Tourism Assistant*\n\nSaya siap membantu perjalanan Anda ke Dataran Tinggi Dieng! Tanya apa saja tentang cuaca, destinasi, tiket, hingga penginapan di Dieng.",
    time: "10:00",
  },
];

function parseMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const html = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
    return <div key={i} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />;
  });
}

export default function ChatbotSection() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const c = useThemeColors();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Build history for API context
  const buildHistory = (): ChatMessage[] => {
    return messages
      .filter((m) => m.id !== 1) // skip initial bot greeting
      .map((m) => ({
        role: m.role === "bot" ? "model" as const : "user" as const,
        content: m.text,
      }));
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text, time: nowTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = buildHistory();
      const response = await sendChatMessage(text, history);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "bot", text: response.reply, time: nowTime() },
      ]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: "Maaf, terjadi gangguan koneksi ke server. Silakan coba lagi dalam beberapa saat. 🔄",
          time: nowTime(),
        },
      ]);
    }
  };

  const handleReset = () => setMessages(initialMessages);

  return (
    <section className="py-20 px-4" style={{ backgroundColor: c.bgSurface }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: c.bgTint, color: c.successText }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Dieng Intelligence Tourism Assistant
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: c.textPrimary }}>
            Chat dengan DITA 🏔️
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: c.textSecondary }}>
            DITA adalah asisten AI khusus wisata Dieng yang siap menjawab pertanyaan seputar cuaca,
            destinasi, tiket, hingga rute perjalanan ke Dataran Tinggi Dieng.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Chat Window */}
          <div
            className="lg:col-span-2 rounded-3xl overflow-hidden shadow-xl border"
            style={{ borderColor: c.border }}
          >
            {/* Chat Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: c.gradientChatHeader }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md text-xl"
                  style={{ background: c.gradientPrimary }}
                >
                  🏔️
                </div>
                <div>
                  <div className="text-white font-bold">DITA — Dieng Intelligence Tourism Assistant</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs" style={{ color: c.primaryLight }}>Online • Siap Membantu Wisata Dieng</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                title="Reset percakapan"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: c.bgInput }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 shadow text-sm"
                    style={{
                      background:
                        msg.role === "bot"
                          ? c.gradientPrimary
                          : c.gradientAccent,
                    }}
                  >
                    {msg.role === "bot" ? "🏔️" : "👤"}
                  </div>
                  <div className={`max-w-sm flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className="px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed"
                      style={{
                        backgroundColor: msg.role === "user" ? c.navBg : c.bgSurface,
                        color: msg.role === "user" ? "#ffffff" : c.textPrimary,
                        borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      }}
                    >
                      {parseMarkdown(msg.text)}
                    </div>
                    <span className="text-[10px] mt-1 px-1" style={{ color: c.textMuted }}>{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow text-sm" style={{ background: c.gradientPrimary }}>
                    🏔️
                  </div>
                  <div className="px-4 py-3 rounded-2xl shadow-sm" style={{ backgroundColor: c.bgSurface, borderRadius: "20px 20px 20px 4px" }}>
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{ backgroundColor: c.primary, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ backgroundColor: c.bgSurface, borderColor: c.border }}>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                style={{ borderColor: c.border, backgroundColor: c.bgInput }}
              >
                <button className="p-1 rounded-lg transition-colors">
                  <PaperclipIcon className="w-4 h-4" style={{ color: c.textMuted }} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Tanya DITA tentang wisata Dieng..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: c.textPrimary }}
                />
                <button className="p-1 rounded-lg transition-colors">
                  <Mic className="w-4 h-4" style={{ color: c.textMuted }} />
                </button>
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className="p-2 rounded-xl text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: c.gradientPrimary }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Replies */}
            <div className="rounded-3xl p-5 shadow-sm border" style={{ backgroundColor: c.bgSurface, borderColor: c.border }}>
              <h3 className="font-bold text-sm mb-4" style={{ color: c.textPrimary }}>
                💬 Pertanyaan Populer Dieng
              </h3>
              <div className="space-y-2">
                {quickReplies.map((q) => (
                  <button
                    key={q.query}
                    onClick={() => handleSend(q.query)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: c.bgTint, color: c.successText, border: `1px solid ${c.successBorder}` }}
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>

            {/* DITA Capabilities */}
            <div className="rounded-3xl p-5" style={{ background: c.gradientNav }}>
              <h3 className="font-bold text-sm text-white mb-4">🤖 Kemampuan DITA</h3>
              <div className="space-y-3">
                {[
                  { icon: Cloud, text: "Prediksi cuaca dingin & embun beku Dieng" },
                  { icon: Mountain, text: "Info destinasi: candi, kawah, telaga, gunung" },
                  { icon: Thermometer, text: "Tips keselamatan wisata dataran tinggi" },
                  { icon: MapPin, text: "Panduan rute, transportasi & akomodasi" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm" style={{ color: c.primaryLight }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

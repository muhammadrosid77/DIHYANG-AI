import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Star, Users, Cloud, TrendingUp, Thermometer, Wind } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import { fetchCurrentWeather, type CurrentWeather } from "../services/api";

const spots = [
  "Candi Arjuna", "Kawah Sikidang", "Telaga Warna", "Bukit Sikunir",
  "Gunung Prau", "Batu Ratapan Angin",
];

const stats = [
  { icon: MapPin, value: "20+", label: "Destinasi Wisata" },
  { icon: Cloud, value: "98%", label: "Akurasi Cuaca" },
  { icon: Users, value: "10K+", label: "Wisatawan/Bulan" },
  { icon: Star, value: "4.9", label: "Rating Platform" },
];

function getWeatherEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("cerah")) return "☀️";
  if (c.includes("berawan")) return "⛅";
  if (c.includes("kabut") || c.includes("berkabut")) return "🌫️";
  if (c.includes("gerimis")) return "🌦️";
  if (c.includes("hujan")) return "🌧️";
  if (c.includes("badai")) return "⛈️";
  return "🌤️";
}

function getWeatherTip(condition: string, temp: number): string {
  if (temp <= 5) return "Sangat dingin! Bawa jaket berlapis & syal!";
  if (condition.toLowerCase().includes("kabut")) return "Berkabut — Bawa jaket tebal!";
  if (condition.toLowerCase().includes("hujan")) return "Hujan — Siapkan jas hujan!";
  if (temp <= 10) return "Dingin — Bawa jaket tebal!";
  return "Cuaca nyaman untuk berwisata!";
}

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState("");
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const c = useThemeColors();

  useEffect(() => {
    fetchCurrentWeather()
      .then(setWeather)
      .catch(() => {
        // Fallback jika API gagal
        setWeather({
          temperature: 14, feels_like: 11, humidity: 85, dewpoint: 10,
          wind_speed: 10, wind_direction: 180, precipitation: 0,
          pressure: 850, cloudcover: 60, visibility: 5,
          weather_code: 2, condition: "Berawan", condition_label: "Berawan",
          high: 19, low: 7,
        });
      });
  }, []);

  const temp = weather?.temperature ?? 14;
  const emoji = weather ? getWeatherEmoji(weather.condition) : "🌫️";
  const conditionText = weather?.condition_label ?? "Memuat...";
  const tip = weather ? getWeatherTip(weather.condition, temp) : "Memuat cuaca...";

  return (
    <div className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555773744-f6c0d85cdce2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      />
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ background: c.gradientHeroOverlay }}
      />

      {/* Decorative blobs */}
      <div className="absolute top-40 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl z-10" style={{ backgroundColor: c.primary }} />
      <div className="absolute bottom-20 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl z-10" style={{ backgroundColor: "#0ea5e9" }} />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: "rgba(79,209,197,0.2)",
                color: c.primaryLight,
                border: "1px solid rgba(79,209,197,0.3)",
              }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Platform Wisata Cerdas Dieng #1
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Jelajahi{" "}
              <span
                style={{
                  background: `linear-gradient(90deg, ${c.primary}, ${c.accent})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Dieng
              </span>
              <br />
              Negeri di Atas Awan
            </h1>

            <p className="text-base mb-8" style={{ color: c.primaryLight, lineHeight: "1.8" }}>
              Platform wisata berbasis AI untuk Dataran Tinggi Dieng — prediksi cuaca dingin real-time,
              itinerary adaptif, dan informasi destinasi terlengkap se-Dieng Plateau.
            </p>

            {/* Search Form */}
            <div
              className="rounded-2xl p-2 shadow-2xl mb-6"
              style={{ backgroundColor: c.bgSurface, backdropFilter: "blur(20px)" }}
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: c.bgInput }}>
                  <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: c.primary }} />
                  <input
                    type="text"
                    placeholder="Cari destinasi di Dieng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: c.textPrimary }}
                  />
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl sm:w-44" style={{ backgroundColor: c.bgInput }}>
                  <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: c.primary }} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm w-full"
                    style={{ color: c.textPrimary }}
                  />
                </div>
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-all hover:scale-105"
                  style={{ background: c.gradientPrimary, boxShadow: `0 4px 15px ${c.primaryGlow}` }}
                >
                  <Search className="w-4 h-4" />
                  Cari
                </button>
              </div>
            </div>

            {/* Spot Chips */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm mr-1" style={{ color: c.primaryLight }}>Populer:</span>
              {spots.map((s) => (
                <button
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Weather Card + Stats */}
          <div className="flex flex-col gap-4">
            {/* Live Weather */}
            <div
              className="rounded-2xl p-5 shadow-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(14,165,233,0.25), rgba(6,182,212,0.15))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: "#7dd3fc" }}>
                    ● LIVE — Cuaca Sekarang
                  </div>
                  <div className="flex items-center gap-1 text-white text-sm">
                    <MapPin className="w-3.5 h-3.5" style={{ color: c.primary }} />
                    Dieng Plateau, Wonosobo
                  </div>
                </div>
                <span className="text-5xl">{emoji}</span>
              </div>
              <div className="text-white text-4xl font-bold mb-1">{Math.round(temp)}°C</div>
              <div className="text-sm mb-4" style={{ color: "#bae6fd" }}>
                {conditionText} — {tip}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Kelembaban", value: `${weather?.humidity ?? "--"}%` },
                  { label: "Angin", value: `${weather?.wind_speed ?? "--"} km/h` },
                  { label: "Malam nanti", value: `${weather?.low ?? "--"}°C` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <div className="text-white font-semibold text-sm">{item.value}</div>
                    <div className="text-xs" style={{ color: "#93c5fd" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frost Warning — dynamic */}
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: "rgba(56,189,248,0.15)",
                border: "1px solid rgba(56,189,248,0.3)",
                backdropFilter: "blur(20px)",
              }}
            >
              <span className="text-2xl">{(weather?.low ?? 5) <= 5 ? "🧊" : "🌡️"}</span>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: "#e0f2fe" }}>
                  {(weather?.low ?? 5) <= 5 ? "Potensi Embun Beku (Embun Upas)" : "Info Suhu Malam"}
                </div>
                <div className="text-xs" style={{ color: "#bae6fd" }}>
                  {(weather?.low ?? 5) <= 5
                    ? `Suhu malam diprediksi ${weather?.low ?? 5}°C. Fenomena embun beku mungkin terjadi dini hari. Siapkan pakaian hangat berlapis.`
                    : `Suhu malam diprediksi ${weather?.low ?? "--"}°C. Tetap bawa jaket tebal untuk berjaga-jaga.`}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(79,209,197,0.2)" }}>
                    <Icon className="w-5 h-5" style={{ color: c.primary }} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg leading-none">{value}</div>
                    <div className="text-xs mt-0.5" style={{ color: c.primaryLight }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-24 z-20"
        style={{ background: `linear-gradient(to bottom, transparent, ${c.bgBase})` }}
      />
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Thermometer, Droplets, Wind, Eye, Sun, CloudRain, Cloud, CloudSnow,
  AlertTriangle, CheckCircle, MapPin, ChevronDown, RefreshCw, Bell,
} from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import {
  fetchCurrentWeather, fetchForecast, fetchHourlyToday, fetchDashboardPredictions,
  type CurrentWeather, type ForecastDay, type HourlyEntry, type DashboardPredictions,
} from "../services/api";

const locations = ["Dieng Plateau", "Sikunir", "Kawah Sikidang", "Telaga Warna", "Gunung Prau", "Wonosobo"];

function getWeatherEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("cerah")) return "☀️";
  if (c.includes("berawan")) return "⛅";
  if (c.includes("kabut") || c.includes("berkabut")) return "🌫️";
  if (c.includes("gerimis")) return "🌦️";
  if (c.includes("hujan lebat")) return "🌧️";
  if (c.includes("hujan lokal")) return "🌦️";
  if (c.includes("hujan")) return "🌧️";
  if (c.includes("salju")) return "🌨️";
  if (c.includes("badai")) return "⛈️";
  return "🌤️";
}

type Alert = {
  level: "danger" | "warning" | "info";
  icon: string;
  title: string;
  desc: string;
  time: string;
};

function buildAlerts(
  current: CurrentWeather | null,
  forecast: ForecastDay[],
  predictions: DashboardPredictions | null,
): Alert[] {
  const alerts: Alert[] = [];

  // ML risk alert
  if (predictions?.predictions.risk) {
    const risk = predictions.predictions.risk;
    if (risk.level >= 3) {
      alerts.push({
        level: "danger",
        icon: "⚠️",
        title: `Risiko Wisata: ${risk.label}`,
        desc: risk.advisory,
        time: "Real-time",
      });
    } else if (risk.level >= 2) {
      alerts.push({
        level: "warning",
        icon: "🌡️",
        title: `Risiko Wisata: ${risk.label}`,
        desc: risk.advisory,
        time: "Real-time",
      });
    }
  }

  // Frost warning (suhu rendah)
  if (current && current.low <= 5) {
    alerts.push({
      level: "danger",
      icon: "🧊",
      title: "Potensi Embun Beku (Embun Upas)",
      desc: `Suhu dini hari diprediksi ${current.low}°C di Dieng Plateau. Waspadai jalur licin. Gunakan pakaian berlapis & alas kaki anti-selip.`,
      time: "Hari ini",
    });
  }

  // Rain alert from ML predictions
  if (predictions?.predictions.rain.will_rain) {
    alerts.push({
      level: "warning",
      icon: "🌧️",
      title: `Hujan Diprediksi — Probabilitas ${predictions.predictions.rain.probability}%`,
      desc: predictions.predictions.rain.advisory,
      time: "Real-time",
    });
  }

  // Heavy rain day from forecast
  const heavyRainDay = forecast.find((d) => d.rain >= 70);
  if (heavyRainDay) {
    alerts.push({
      level: "warning",
      icon: "🌧️",
      title: `Hujan Lebat — ${heavyRainDay.day}, ${heavyRainDay.date}`,
      desc: `Curah hujan tinggi (${heavyRainDay.rain}%) diprediksi. Tunda aktivitas outdoor jika memungkinkan.`,
      time: "Prakiraan",
    });
  }

  // Sunrise good day
  const clearDay = forecast.find((d) => d.condition.toLowerCase().includes("cerah") && d.rain <= 10);
  if (clearDay) {
    alerts.push({
      level: "info",
      icon: "🌄",
      title: `Sunrise Ideal — ${clearDay.day}, ${clearDay.date}`,
      desc: "Langit diprediksi cerah. Waktu terbaik untuk menikmati golden sunrise di Bukit Sikunir & Gunung Prau!",
      time: "Prakiraan",
    });
  }

  return alerts.length > 0 ? alerts : [{
    level: "info",
    icon: "✅",
    title: "Kondisi Normal",
    desc: "Tidak ada peringatan khusus saat ini. Selamat menikmati wisata Dieng!",
    time: "Sekarang",
  }];
}

export default function WeatherDashboard() {
  const [selectedLocation, setSelectedLocation] = useState("Dieng Plateau");
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const c = useThemeColors();

  // API state
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyEntry[]>([]);
  const [predictions, setPredictions] = useState<DashboardPredictions | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [curData, foreData, hourData, predData] = await Promise.allSettled([
        fetchCurrentWeather(),
        fetchForecast(),
        fetchHourlyToday(),
        fetchDashboardPredictions(),
      ]);
      if (curData.status === "fulfilled") setCurrent(curData.value);
      if (foreData.status === "fulfilled") setForecast(foreData.value.forecast);
      if (hourData.status === "fulfilled") setHourly(hourData.value.hourly);
      if (predData.status === "fulfilled") setPredictions(predData.value);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Weather data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Derived data
  const alerts = buildAlerts(current, forecast, predictions);

  const forecastCards = forecast.map((d) => ({
    day: d.day,
    date: d.date,
    icon: getWeatherEmoji(d.condition),
    maxTemp: d.high,
    minTemp: d.low,
    rain: d.rain,
    condition: d.condition_label,
    wind: d.wind,
    humidity: 0, // not in forecast API
  }));

  const tempTrendData = hourly.map((h) => ({
    time: h.hour,
    suhu: h.temp,
    terasa: Math.round(h.temp - 2), // approximation
  }));

  const rainfallData = forecast.map((d) => ({
    day: d.day,
    curah: d.precip_mm,
    peluang: d.rain,
  }));

  const timeDiff = lastUpdate
    ? Math.round((Date.now() - lastUpdate.getTime()) / 60000)
    : null;
  const updateLabel = timeDiff !== null
    ? timeDiff < 1 ? "Baru saja" : `${timeDiff} menit lalu`
    : "Memuat...";

  const alertColors: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
    danger: { bg: c.dangerBg, border: c.dangerBorder, badge: c.dangerBadge, badgeText: "BAHAYA" },
    warning: { bg: c.warningBg, border: c.warningBorder, badge: c.warningBadge, badgeText: "PERINGATAN" },
    info: { bg: c.successBg, border: c.successBorder, badge: c.successBadge, badgeText: "INFO BAIK" },
  };

  return (
    <section className="py-20 px-4" style={{ backgroundColor: c.bgAlt }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: c.bgTint, color: c.successText }}
              >
                🌤️ REAL-TIME
              </span>
              <span className="text-xs" style={{ color: c.textMuted }}>
                Diperbarui {updateLabel}
              </span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: c.textPrimary }}>
              Dashboard Prediksi Cuaca
            </h2>
            <p className="mt-1 text-sm" style={{ color: c.textSecondary }}>
              Data cuaca real-time & prakiraan 7 hari berbasis AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border shadow-sm"
                style={{ backgroundColor: c.bgSurface, borderColor: c.border, color: c.textPrimary }}
                onClick={() => setShowLocationMenu(!showLocationMenu)}
              >
                <MapPin className="w-4 h-4" style={{ color: c.primary }} />
                {selectedLocation}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showLocationMenu && (
                <div
                  className="absolute right-0 mt-1 w-48 rounded-xl shadow-xl border z-30"
                  style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
                >
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      className="block w-full text-left px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors"
                      style={{ color: loc === selectedLocation ? c.primary : c.textPrimary }}
                      onClick={() => { setSelectedLocation(loc); setShowLocationMenu(false); }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="p-2.5 rounded-xl border shadow-sm transition-colors"
              style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
              onClick={loadData}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: c.primary }} />
            </button>
            <button
              className="p-2.5 rounded-xl border shadow-sm transition-colors"
              style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
            >
              <Bell className="w-4 h-4" style={{ color: c.primary }} />
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3 mb-8">
          {alerts.map((alert, i) => {
            const colors = alertColors[alert.level];
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl border"
                style={{ backgroundColor: colors.bg, borderColor: colors.border }}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: colors.badge }}
                    >
                      {colors.badgeText}
                    </span>
                    <span className="font-semibold text-sm" style={{ color: c.textPrimary }}>
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: c.textSecondary }}>{alert.desc}</p>
                </div>
                <span className="text-xs flex-shrink-0 mt-1" style={{ color: c.textMuted }}>
                  {alert.time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Current Weather */}
          <div
            className="rounded-3xl p-6 text-white col-span-1"
            style={{ background: c.gradientWeatherCard }}
          >
            <div className="text-sm font-medium mb-1 opacity-80">Sekarang — {selectedLocation}</div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-6xl font-bold">
                {current ? `${Math.round(current.temperature)}°C` : "--°C"}
              </div>
              <span className="text-6xl">{current ? getWeatherEmoji(current.condition) : "⏳"}</span>
            </div>
            <div className="text-lg font-medium opacity-90 mb-5">
              {current ? `${current.condition_label} — Terasa ${current.feels_like}°C` : "Memuat data cuaca..."}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Droplets, label: "Kelembaban", value: current ? `${current.humidity}%` : "--%"  },
                { icon: Wind, label: "Angin", value: current ? `${current.wind_speed} km/h` : "-- km/h" },
                { icon: Eye, label: "Jarak Pandang", value: current ? `${current.visibility} km` : "-- km" },
                { icon: Sun, label: "Tekanan", value: current ? `${current.pressure} hPa` : "-- hPa" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                  <div className="flex items-center gap-1.5 mb-1 opacity-75">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <div className="font-semibold text-sm">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div
            className="rounded-3xl p-5 col-span-2 shadow-sm border"
            style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
          >
            <h3 className="font-bold text-base mb-4" style={{ color: c.textPrimary }}>
              Prakiraan 7 Hari
            </h3>
            {forecastCards.length > 0 ? (
              <>
                <div className="grid grid-cols-7 gap-2">
                  {forecastCards.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveDay(i)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all hover:scale-105"
                      style={{
                        backgroundColor: activeDay === i ? c.navBg : day.rain >= 70 ? c.dangerBg : c.bgTint,
                        border: day.rain >= 70 ? `1.5px solid ${c.dangerBorder}` : "1.5px solid transparent",
                        transform: activeDay === i ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      <div className="text-[10px] font-semibold" style={{ color: activeDay === i ? c.primaryLight : c.textMuted }}>
                        {day.day}
                      </div>
                      <span className="text-xl">{day.icon}</span>
                      <div className="text-xs font-bold" style={{ color: activeDay === i ? "#ffffff" : c.textPrimary }}>
                        {day.maxTemp}°
                      </div>
                      <div className="text-[10px]" style={{ color: activeDay === i ? c.primaryLight : c.textMuted }}>
                        {day.minTemp}°
                      </div>
                      {day.rain >= 50 && (
                        <div
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: activeDay === i ? "rgba(239,68,68,0.3)" : c.dangerBg, color: activeDay === i ? "#fca5a5" : c.dangerText }}
                        >
                          {day.rain}%
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {/* Detail */}
                <div
                  className="mt-4 p-4 rounded-2xl"
                  style={{ backgroundColor: c.bgTint }}
                >
                  <div className="text-sm font-semibold mb-3" style={{ color: c.textPrimary }}>
                    {forecastCards[activeDay]?.day}, {forecastCards[activeDay]?.date} — {forecastCards[activeDay]?.condition}
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Maks / Min", value: `${forecastCards[activeDay]?.maxTemp}° / ${forecastCards[activeDay]?.minTemp}°` },
                      { label: "Curah Hujan", value: `${forecastCards[activeDay]?.rain}%` },
                      { label: "Angin", value: `${forecastCards[activeDay]?.wind} km/h` },
                      { label: "Presipitasi", value: `${forecast[activeDay]?.precip_mm ?? 0} mm` },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <div className="text-xs mb-0.5" style={{ color: c.textSecondary }}>{label}</div>
                        <div className="text-sm font-bold" style={{ color: c.textPrimary }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-sm" style={{ color: c.textMuted }}>
                {loading ? "Memuat prakiraan cuaca..." : "Data prakiraan tidak tersedia"}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Temperature Trend */}
          <div
            className="rounded-3xl p-6 shadow-sm border"
            style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>
                  Tren Suhu Harian
                </h3>
                <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>Hari ini • {selectedLocation}</p>
              </div>
              <Thermometer className="w-5 h-5" style={{ color: c.primary }} />
            </div>
            {tempTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={tempTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c.accent} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={c.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.borderLight} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: c.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: c.textMuted }} axisLine={false} tickLine={false} domain={["auto", "auto"]} unit="°" />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", backgroundColor: c.bgSurface, color: c.textPrimary }}
                    formatter={(value: number, name: string) => [`${value}°C`, name]}
                  />
                  <Legend iconType="circle" iconSize={8} />
                  <Area key="suhu" type="monotone" dataKey="suhu" name="Suhu" stroke={c.primary} strokeWidth={2.5} fill="url(#tempGrad)" dot={false} activeDot={{ r: 5 }} />
                  <Area key="terasa" type="monotone" dataKey="terasa" name="Terasa Seperti" stroke={c.accent} strokeWidth={2} fill="url(#feelsGrad)" dot={false} strokeDasharray="4 4" activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: c.textMuted }}>
                {loading ? "Memuat data per jam..." : "Data per jam tidak tersedia"}
              </div>
            )}
          </div>

          {/* Rainfall Chart */}
          <div
            className="rounded-3xl p-6 shadow-sm border"
            style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base" style={{ color: c.textPrimary }}>
                  Prakiraan Curah Hujan
                </h3>
                <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>7 hari ke depan • mm & peluang %</p>
              </div>
              <CloudRain className="w-5 h-5" style={{ color: "#0ea5e9" }} />
            </div>
            {rainfallData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={rainfallData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.borderLight} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: c.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: c.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", backgroundColor: c.bgSurface, color: c.textPrimary }}
                    formatter={(value: number, name: string) => [
                      name === "Curah Hujan (mm)" ? `${value} mm` : `${value}%`,
                      name,
                    ]}
                  />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar key="curah" dataKey="curah" name="Curah Hujan (mm)" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  <Bar key="peluang" dataKey="peluang" name="Peluang (%)" fill="#bae6fd" radius={[6, 6, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: c.textMuted }}>
                {loading ? "Memuat data curah hujan..." : "Data curah hujan tidak tersedia"}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

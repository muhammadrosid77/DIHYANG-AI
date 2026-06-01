import { useState, type ReactNode } from "react";
import {
  MapPin, Calendar, Users, Sparkles, Clock, ChevronRight, CloudRain,
  Sun, Cloud, AlertCircle, Plus, CheckCircle2, Navigation, Utensils, Camera, Bed,
} from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import { generateItinerary, type ItineraryResponse, type ItineraryDay } from "../services/api";

const destinations = ["Dieng Plateau", "Sikunir", "Kawah Sikidang", "Telaga Warna", "Gunung Prau", "Batu Ratapan Angin", "Wonosobo", "Sumur Jalatunda"];
const interests = ["Sunrise 🌄", "Budaya 🏛️", "Kuliner 🍜", "Alam 🌿", "Fotografi 📸", "Trekking 🥾", "Kawah 🌋", "Sejarah 📜"];

// Duration options: label shown to user → API value
const durationOptions = [
  { label: "1 Hari", value: "1d" },
  { label: "2 Hari 1 Malam", value: "2d1n" },
  { label: "3 Hari 2 Malam", value: "3d2n" },
];

// Budget options: label → numeric midpoint (Rp)
const budgetOptions = [
  { label: "< Rp 500rb/hari", value: 300000 },
  { label: "Rp 500rb–1jt/hari", value: 750000 },
  { label: "Rp 1–2jt/hari", value: 1500000 },
  { label: "> Rp 2jt/hari", value: 2500000 },
];

// Travel style options
const travelStyles = [
  { label: "Solo 🧍", value: "solo" },
  { label: "Pasangan 💑", value: "couple" },
  { label: "Keluarga 👨‍👩‍👧", value: "family" },
  { label: "Rombongan 👥", value: "group" },
];

const vehicleOptions = ["Motor", "Mobil", "Bus/Travel"];

const activityIcons: Record<string, ReactNode> = {
  attraction: <Camera className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  transport: <Navigation className="w-4 h-4" />,
  hotel: <Bed className="w-4 h-4" />,
  stay: <Bed className="w-4 h-4" />,
  shopping: <MapPin className="w-4 h-4" />,
};

const activityTypeLabel: Record<string, string> = {
  attraction: "Wisata",
  food: "Kuliner",
  transport: "Transportasi",
  hotel: "Penginapan",
  stay: "Penginapan",
  shopping: "Belanja",
};

const activityColors: Record<string, { bg: string; color: string }> = {
  attraction: { bg: "#d1fae5", color: "#065f46" },
  food: { bg: "#fef3c7", color: "#92400e" },
  transport: { bg: "#dbeafe", color: "#1e40af" },
  hotel: { bg: "#ede9fe", color: "#5b21b6" },
  stay: { bg: "#ede9fe", color: "#5b21b6" },
  shopping: { bg: "#fce7f3", color: "#9d174d" },
};

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function SmartItinerary() {
  const [step, setStep] = useState<"form" | "result">("form");
  const [destination, setDestination] = useState("Dieng Plateau");
  const [durationIdx, setDurationIdx] = useState(1); // default 2d1n
  const [budgetIdx, setBudgetIdx] = useState(1); // default 500rb–1jt
  const [travelStyleIdx, setTravelStyleIdx] = useState(0); // default solo
  const [vehicle, setVehicle] = useState("Motor");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Sunrise 🌄", "Budaya 🏛️"]);
  const [guests, setGuests] = useState(2);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const c = useThemeColors();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateItinerary({
        duration: durationOptions[durationIdx].value,
        travelStyle: travelStyles[travelStyleIdx].value,
        budget: budgetOptions[budgetIdx].value,
        vehicle: vehicle.toLowerCase(),
      });
      setResult(data);
      setActiveDay(0);
      setStep("result");
    } catch (err) {
      setError("Gagal terhubung ke server. Pastikan backend berjalan dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4" style={{ backgroundColor: c.bgBase }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: c.warningBg, color: "#92400e" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by AI
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: c.textPrimary }}>
            Smart Itinerary Wisata Dieng
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: c.textSecondary }}>
            Rencanakan perjalanan ke Dieng yang adaptif terhadap cuaca dingin & kabut. AI kami menyesuaikan aktivitas
            secara otomatis — termasuk potensi embun beku malam hari.
          </p>
        </div>

        {step === "form" ? (
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-3xl shadow-xl border overflow-hidden"
              style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
            >
              {/* Form Header */}
              <div
                className="px-8 py-6"
                style={{ background: c.gradientItinerary }}
              >
                <h3 className="text-white font-bold text-lg mb-1">Rancang Perjalanan Impianmu</h3>
                <p style={{ color: c.primaryLight, fontSize: "13px" }}>
                  Isi preferensi dan biarkan AI menyusun itinerary terbaik untukmu
                </p>
              </div>

              <div className="p-8 space-y-7">
                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: c.textPrimary }}>
                    <MapPin className="w-4 h-4 inline mr-1.5" style={{ color: c.primary }} />
                    Destinasi Wisata
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {destinations.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDestination(d)}
                        className="py-2 px-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: destination === d ? c.navBg : c.bgTint,
                          color: destination === d ? "#ffffff" : c.successText,
                          border: destination === d ? "none" : `1px solid ${c.successBorder}`,
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration + Travel Style + Vehicle */}
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: c.textPrimary }}>
                      <Calendar className="w-4 h-4 inline mr-1.5" style={{ color: c.primary }} />
                      Durasi
                    </label>
                    <div className="flex flex-col gap-2">
                      {durationOptions.map((d, i) => (
                        <button
                          key={d.value}
                          onClick={() => setDurationIdx(i)}
                          className="py-2 px-3 rounded-xl text-sm text-left transition-all"
                          style={{
                            backgroundColor: durationIdx === i ? c.navBg : c.bgInput,
                            color: durationIdx === i ? "#ffffff" : c.textPrimary,
                            border: durationIdx === i ? "none" : `1px solid ${c.border}`,
                          }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: c.textPrimary }}>
                      💰 Anggaran/Hari
                    </label>
                    <div className="flex flex-col gap-2">
                      {budgetOptions.map((b, i) => (
                        <button
                          key={b.label}
                          onClick={() => setBudgetIdx(i)}
                          className="py-2 px-3 rounded-xl text-xs text-left transition-all"
                          style={{
                            backgroundColor: budgetIdx === i ? c.navBg : c.bgInput,
                            color: budgetIdx === i ? "#ffffff" : c.textPrimary,
                            border: budgetIdx === i ? "none" : `1px solid ${c.border}`,
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: c.textPrimary }}>
                      <Users className="w-4 h-4 inline mr-1.5" style={{ color: c.primary }} />
                      Gaya Perjalanan
                    </label>
                    <div className="flex flex-col gap-2">
                      {travelStyles.map((ts, i) => (
                        <button
                          key={ts.value}
                          onClick={() => setTravelStyleIdx(i)}
                          className="py-2 px-3 rounded-xl text-sm text-left transition-all"
                          style={{
                            backgroundColor: travelStyleIdx === i ? c.navBg : c.bgInput,
                            color: travelStyleIdx === i ? "#ffffff" : c.textPrimary,
                            border: travelStyleIdx === i ? "none" : `1px solid ${c.border}`,
                          }}
                        >
                          {ts.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vehicle + Guests */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: c.textPrimary }}>
                      🚗 Kendaraan
                    </label>
                    <div className="flex gap-2">
                      {vehicleOptions.map((v) => (
                        <button
                          key={v}
                          onClick={() => setVehicle(v)}
                          className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            backgroundColor: vehicle === v ? c.navBg : c.bgInput,
                            color: vehicle === v ? "#ffffff" : c.textPrimary,
                            border: vehicle === v ? "none" : `1px solid ${c.border}`,
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: c.textPrimary }}>
                      <Users className="w-4 h-4 inline mr-1.5" style={{ color: c.primary }} />
                      Jumlah Tamu
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-10 h-10 rounded-xl border text-lg font-bold transition-all"
                        style={{ borderColor: c.successBorder, color: c.primary }}
                      >−</button>
                      <span className="text-2xl font-bold w-8 text-center" style={{ color: c.textPrimary }}>{guests}</span>
                      <button
                        onClick={() => setGuests(Math.min(20, guests + 1))}
                        className="w-10 h-10 rounded-xl border text-lg font-bold transition-all"
                        style={{ borderColor: c.successBorder, color: c.primary }}
                      >+</button>
                      <span className="text-xs" style={{ color: c.textMuted }}>Orang</span>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: c.textPrimary }}>
                    ✨ Minat & Aktivitas (pilih beberapa)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: selectedInterests.includes(interest) ? c.navBg : c.bgTint,
                          color: selectedInterests.includes(interest) ? "#ffffff" : c.successText,
                          border: selectedInterests.includes(interest) ? "none" : `1px solid ${c.successBorder}`,
                        }}
                      >
                        {selectedInterests.includes(interest) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="p-3 rounded-xl text-sm flex items-center gap-2"
                    style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{
                    background: c.gradientAccent,
                    boxShadow: "0 6px 20px rgba(246,173,85,0.4)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      AI sedang menyusun itinerary...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Generate Smart Itinerary
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : result ? (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setStep("form")}
              className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: c.primary }}
            >
              ← Ubah Preferensi
            </button>

            {/* Summary Bar */}
            <div
              className="rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center border"
              style={{ backgroundColor: c.bgSurface, borderColor: c.successBorder }}
            >
              {[
                { icon: MapPin, label: destination },
                { icon: Calendar, label: durationOptions[durationIdx].label },
                { icon: Users, label: `${guests} orang` },
                { icon: null, label: `💰 ${result.budget}` },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  {Icon && <Icon className="w-4 h-4" style={{ color: c.primary }} />}
                  <span className="text-sm font-medium" style={{ color: c.textPrimary }}>{label}</span>
                </div>
              ))}
              <div className="ml-auto">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: c.bgTint, color: c.successText }}
                >
                  ✅ AI Dioptimalkan
                </span>
              </div>
            </div>

            {/* Weather Note */}
            {result.weatherNote && (
              <div
                className="rounded-2xl p-4 mb-6 flex items-start gap-3 border"
                style={{ backgroundColor: c.warningBg, borderColor: c.warningBorder }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: "#92400e" }}>Catatan Cuaca & Keselamatan</div>
                  <div className="text-sm" style={{ color: "#78350f" }}>{result.weatherNote}</div>
                </div>
              </div>
            )}

            {/* Gear */}
            {result.gear && result.gear.length > 0 && (
              <div
                className="rounded-2xl p-4 mb-6 border"
                style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
              >
                <div className="text-sm font-semibold mb-3" style={{ color: c.textPrimary }}>🎒 Perlengkapan yang Perlu Dibawa</div>
                <div className="flex flex-wrap gap-2">
                  {result.gear.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: c.bgTint, color: c.successText, border: `1px solid ${c.successBorder}` }}
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Day Selector */}
              <div className="lg:col-span-1">
                <h3 className="font-bold text-sm mb-3" style={{ color: c.textPrimary }}>
                  Pilih Hari
                </h3>
                <div className="space-y-2">
                  {result.days.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveDay(i)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:scale-[1.02] border"
                      style={{
                        backgroundColor: activeDay === i ? c.navBg : c.bgSurface,
                        borderColor: activeDay === i ? "transparent" : c.border,
                      }}
                    >
                      <span className="text-2xl">
                        {i === 0 ? "🌅" : i === 1 ? "⛅" : "🌄"}
                      </span>
                      <div>
                        <div className="text-sm font-bold" style={{ color: activeDay === i ? "#ffffff" : c.textPrimary }}>
                          {day.day}
                        </div>
                        <div className="text-xs" style={{ color: activeDay === i ? c.primaryLight : c.textMuted }}>
                          {day.date}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="lg:col-span-3">
                <div
                  className="rounded-3xl overflow-hidden border shadow-sm"
                  style={{ backgroundColor: c.bgSurface, borderColor: c.border }}
                >
                  <div
                    className="px-6 py-4 flex items-center justify-between border-b"
                    style={{ borderColor: c.borderLight, backgroundColor: c.bgTint }}
                  >
                    <div>
                      <div className="font-bold text-sm" style={{ color: c.textPrimary }}>
                        {result.days[activeDay]?.day} — {result.days[activeDay]?.date}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
                        {result.days[activeDay]?.items.length} aktivitas
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: c.bgSurface, color: c.successText }}
                    >
                      ✅ Dioptimalkan
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="relative">
                      {/* Timeline line */}
                      <div
                        className="absolute left-10 top-0 bottom-0 w-0.5"
                        style={{ backgroundColor: c.border }}
                      />

                      <div className="space-y-5">
                        {result.days[activeDay]?.items.map((activity, i) => {
                          const type = activity.type || "attraction";
                          const actColors = activityColors[type] ?? activityColors.attraction;
                          return (
                            <div key={i} className="flex gap-5 relative">
                              {/* Time */}
                              <div className="w-14 text-right flex-shrink-0 pt-3">
                                <span className="text-xs font-semibold" style={{ color: c.textMuted }}>
                                  {activity.time}
                                </span>
                              </div>

                              {/* Dot */}
                              <div className="relative flex-shrink-0 mt-3">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                                  style={{ backgroundColor: actColors.color }}
                                />
                              </div>

                              {/* Activity Card */}
                              <div
                                className="flex-1 p-4 rounded-2xl border transition-all hover:shadow-md"
                                style={{ backgroundColor: c.bgInput, borderColor: c.borderLight }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
                                        style={{ backgroundColor: actColors.bg, color: actColors.color }}
                                      >
                                        {activityIcons[type] ?? activityIcons.attraction}
                                        {activityTypeLabel[type] ?? "Aktivitas"}
                                      </span>
                                      {activity.cost > 0 && (
                                        <span className="text-xs" style={{ color: c.textMuted }}>
                                          {formatCurrency(activity.cost)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-semibold text-sm" style={{ color: c.textPrimary }}>
                                      {activity.title}
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: c.textSecondary }}>
                                      {activity.desc}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

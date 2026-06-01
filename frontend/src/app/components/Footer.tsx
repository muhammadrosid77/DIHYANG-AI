import { Leaf, MapPin, Mail, Phone, Instagram, Twitter, Youtube, ArrowUp } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";

const footerLinks = {
  Fitur: ["Prediksi Cuaca", "DITA AI", "Smart Itinerary", "Pusat Informasi"],
  "Wisata Dieng": ["Candi Arjuna", "Bukit Sikunir", "Telaga Warna", "Kawah Sikidang", "Gunung Prau", "Batu Ratapan Angin"],
  Perusahaan: ["Tentang Kami", "Blog Wisata", "Karir", "Hubungi Kami"],
  Bantuan: ["FAQ", "Panduan Pengguna", "Kebijakan Privasi", "Syarat & Ketentuan"],
};

export default function Footer() {
  const c = useThemeColors();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer style={{ backgroundColor: c.gradientFooter }}>
      {/* CTA Banner */}
      <div
        className="py-14 px-4 text-center relative overflow-hidden"
        style={{ background: c.gradientCtaBanner }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: c.primary }}
        />
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Siap Menjelajahi Dieng? 🏔️
          </h2>
          <p className="mb-6 max-w-lg mx-auto text-sm" style={{ color: c.primaryLight }}>
            Bergabunglah dengan 10.000+ wisatawan yang sudah merasakan kemudahan Dihyang
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="px-7 py-3 rounded-full text-white font-bold text-sm shadow-xl hover:scale-105 transition-all"
              style={{ background: c.gradientAccent, boxShadow: "0 4px 20px rgba(246,173,85,0.4)" }}
            >
              Mulai Sekarang
            </button>
            <button
              className="px-7 py-3 rounded-full font-semibold text-sm transition-all hover:bg-white/10"
              style={{ border: "1.5px solid rgba(255,255,255,0.4)", color: "#ffffff" }}
            >
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: c.gradientPrimary }}
              >
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold">Dihyang</div>
                <div className="text-xs" style={{ color: c.navText }}>Dataran Tinggi Dieng</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: c.navText }}>
              Platform wisata cerdas khusus Dataran Tinggi Dieng. Kami menggabungkan prediksi cuaca dingin real-time dan asisten AI (DITA) untuk pengalaman wisata Dieng terbaik.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: c.primaryLight }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: c.primary }} />
                Jakarta, Indonesia
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: c.primaryLight }}>
                <Mail className="w-3.5 h-3.5" style={{ color: c.primary }} />
                halo@smartwisata.id
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: c.primaryLight }}>
                <Phone className="w-3.5 h-3.5" style={{ color: c.primary }} />
                +62 21 1234 5678
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: c.navText }}
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: c.navBg }}
        >
          <p className="text-xs" style={{ color: c.navText }}>
            © 2026 SmartDieng. Hak Cipta Dilindungi. Dibuat dengan ❤️ untuk para penjelajah Dataran Tinggi Dieng.
          </p>
          <div className="flex items-center gap-3">
            {[Instagram, Twitter, Youtube].map((Icon, i) => (
              <button
                key={i}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: "rgba(79,209,197,0.15)", color: c.primary }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
            <button
              onClick={scrollTop}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 ml-2"
              style={{ backgroundColor: c.primary, color: "#ffffff" }}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

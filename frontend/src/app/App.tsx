import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import WeatherDashboard from "./components/WeatherDashboard";
import RouteNavigation from "./components/RouteNavigation";
import ChatbotSection from "./components/ChatbotSection";
import SmartItinerary from "./components/SmartItinerary";
import InfoCenter from "./components/InfoCenter";
import Footer from "./components/Footer";
import FloatingChatbot from "./components/FloatingChatbot";

function AppContent() {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: "var(--bg-base)" }}>
      <Navbar />
      <div id="beranda"><HeroSection /></div>
      <div id="cuaca"><WeatherDashboard /></div>
      <RouteNavigation />
      <div id="asisten"><ChatbotSection /></div>
      <div id="itinerary"><SmartItinerary /></div>
      <div id="info"><InfoCenter /></div>
      <Footer />
      <FloatingChatbot />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

/**
 * DIHYANG AI — API Service Layer
 * Semua fetch ke backend FastAPI terpusat di sini.
 */

const API_BASE = "/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CurrentWeather = {
  temperature: number;
  feels_like: number;
  humidity: number;
  dewpoint: number;
  wind_speed: number;
  wind_direction: number;
  precipitation: number;
  pressure: number;
  cloudcover: number;
  visibility: number;
  weather_code: number;
  condition: string;
  condition_label: string;
  high: number;
  low: number;
};

export type ForecastDay = {
  date: string;
  day: string;
  high: number;
  low: number;
  rain: number;
  precip_mm: number;
  wind: number;
  condition: string;
  condition_label: string;
  weather_code: number;
};

export type HourlyEntry = {
  hour: string;
  temp: number;
  humidity: number;
  precip: number;
  wind: number;
  visibility: number;
  condition: string;
};

export type DashboardPredictions = {
  success: boolean;
  timestamp: string;
  current: {
    temperature: number;
    precipitation: number;
    humidity: number;
    visibility_km: number;
    windspeed: number;
    hour: number;
    date: string;
  };
  predictions: {
    temperature: {
      current: number;
      predicted: number;
      change: number;
      advisory: string;
    };
    rain: {
      will_rain: boolean;
      probability: number;
      advisory: string;
    };
    risk: {
      level: number;
      label: string;
      icon: string;
      color: string;
      advisory: string;
      confidence: number;
    };
  };
  models: {
    temperature: string;
    rain: string;
    risk: string;
    loaded: boolean;
  };
};

export type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export type ItineraryRequest = {
  duration: string;
  travelStyle: string;
  budget: number;
  vehicle: string;
};

export type ItineraryDay = {
  day: string;
  date: string;
  items: {
    time: string;
    title: string;
    desc: string;
    cost: number;
    type: string;
  }[];
};

export type ItineraryResponse = {
  title: string;
  budget: string;
  weatherNote: string;
  gear: string[];
  days: ItineraryDay[];
};

export type DestinationEntry = {
  nama: string;
  lokasi?: string;
  kategori?: string;
  harga_lokal?: number;
  harga_asing?: number;
  jam_buka?: string;
  rating?: number;
  tips?: string;
  [key: string]: unknown;
};

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Weather ─────────────────────────────────────────────────────────────────

export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  return fetchJSON<CurrentWeather>("/weather/current");
}

export async function fetchForecast(): Promise<{ forecast: ForecastDay[] }> {
  return fetchJSON<{ forecast: ForecastDay[] }>("/weather/forecast");
}

export async function fetchHourlyToday(): Promise<{ hourly: HourlyEntry[]; date: string }> {
  return fetchJSON<{ hourly: HourlyEntry[]; date: string }>("/weather/hourly-today");
}

// ─── ML Predictions ──────────────────────────────────────────────────────────

export async function fetchDashboardPredictions(): Promise<DashboardPredictions> {
  return fetchJSON<DashboardPredictions>("/ml/predict/dashboard");
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<{ reply: string }> {
  return fetchJSON<{ reply: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

// ─── Itinerary ───────────────────────────────────────────────────────────────

export async function generateItinerary(
  params: ItineraryRequest
): Promise<ItineraryResponse> {
  return fetchJSON<ItineraryResponse>("/itinerary/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ─── Destinations ────────────────────────────────────────────────────────────

export async function fetchDestinations(): Promise<DestinationEntry[]> {
  return fetchJSON<DestinationEntry[]>("/destinations/");
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Moon, Sun, Wind, Droplets, Thermometer } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { getWeatherIcon, getWeatherDescription } from "@/lib/wmo";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Map from "@/components/map";

type WeatherData = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    pressure_msl: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

type City = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<City>({ name: "Москва", latitude: 55.7558, longitude: 37.6173 });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<City[]>([]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      setWeather(res.data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    try {
      const res = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=ru&format=json`
      );
      if (res.data.results) {
        setSearchResults(res.data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const selectCity = (selected: City) => {
    setCity(selected);
    setSearchResults([]);
    setQuery("");
    fetchWeather(selected.latitude, selected.longitude);
  };

  useEffect(() => {
    fetchWeather(city.latitude, city.longitude);
  }, []);

  const CurrentIcon = weather ? getWeatherIcon(weather.current.weather_code) : Sun;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CurrentIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold hidden sm:block">Погода.РФ</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <form onSubmit={searchCity} className="relative">
              <div className="flex items-center bg-input/20 rounded-lg border border-input focus-within:ring-2 ring-primary transition-all">
                <Search className="w-4 h-4 ml-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск города..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent border-none p-2 focus:outline-none w-32 md:w-64 text-sm"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectCity(result)}
                      className="w-full text-left p-2 hover:bg-primary/10 text-sm flex items-center justify-between"
                    >
                      <span>{result.name}</span>
                      <span className="text-xs text-muted-foreground">{result.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        {loading || !weather ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Current Weather Card */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card p-6 md:p-10 rounded-3xl shadow-lg border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CurrentIcon className="w-64 h-64" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-lg">{city.name}, {city.country || "Россия"}</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-12">
                    <div>
                      <h2 className="text-7xl md:text-9xl font-bold tracking-tighter">
                        {Math.round(weather.current.temperature_2m)}°
                      </h2>
                      <p className="text-xl md:text-2xl font-medium mt-2 text-primary">
                        {getWeatherDescription(weather.current.weather_code)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 md:gap-8 w-full md:w-auto">
                      <div className="flex items-center gap-3">
                        <Wind className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-muted-foreground">Ветер</p>
                          <p className="font-bold">{weather.current.wind_speed_10m} км/ч</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-muted-foreground">Влажность</p>
                          <p className="font-bold">{weather.current.relative_humidity_2m}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-sm text-muted-foreground">Давление</p>
                          <p className="font-bold">{weather.current.pressure_msl} гПа</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecast */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {weather.daily.time.map((time, i) => {
                   const CodeIcon = getWeatherIcon(weather.daily.weather_code[i]);
                   return (
                     <div key={time} className="bg-card p-3 rounded-xl border border-border flex flex-col items-center justify-center text-center gap-2 hover:border-primary transition-colors">
                       <span className="text-xs text-muted-foreground">
                         {format(new Date(time), "EEE", { locale: ru })}
                       </span>
                       <CodeIcon className="w-8 h-8 text-primary my-1" />
                       <div className="text-sm font-bold">
                         <span>{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                         <span className="text-muted-foreground ml-1 font-normal">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>

            {/* Map Column */}
            <div className="h-[400px] md:h-auto bg-card rounded-3xl overflow-hidden border border-border shadow-lg">
              <Map lat={city.latitude} lon={city.longitude} />
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
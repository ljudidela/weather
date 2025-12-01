"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Moon, Sun, Wind, Droplets, Thermometer, Navigation } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { getWeatherIcon, getWeatherDescription } from "@/lib/wmo";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Map from "@/components/map";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleMapClick = (lat: number, lon: number) => {
    const newCity = {
      name: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      latitude: lat,
      longitude: lon,
      country: "Координаты"
    };
    setCity(newCity);
    fetchWeather(lat, lon);
  };

  useEffect(() => {
    fetchWeather(city.latitude, city.longitude);
  }, []);

  const CurrentIcon = weather ? getWeatherIcon(weather.current.weather_code) : Sun;

  return (
    <main className="min-h-screen p-4 md:p-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-card/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/10">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="p-2.5 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20">
              <CurrentIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Погода.РФ
            </h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <form onSubmit={searchCity} className="relative flex-1 md:flex-none">
              <div className="flex items-center bg-background/50 rounded-xl border border-border focus-within:ring-2 ring-primary/50 transition-all shadow-sm">
                <Search className="w-4 h-4 ml-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск города..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent border-none p-2.5 focus:outline-none w-full md:w-64 text-sm"
                />
              </div>
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectCity(result)}
                        className="w-full text-left p-3 hover:bg-primary/10 text-sm flex items-center justify-between border-b border-border/50 last:border-0 transition-colors"
                      >
                        <span className="font-medium">{result.name}</span>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{result.country}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl bg-background/50 hover:bg-accent transition-all border border-border"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        {loading || !weather ? (
          <div className="h-96 flex items-center justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Current Weather Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-gradient-to-br from-card to-card/50 p-6 md:p-10 rounded-[2rem] shadow-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
                <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-700">
                  <CurrentIcon className="w-64 h-64" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-lg font-medium">{city.name}, {city.country || "Россия"}</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-8 md:gap-16">
                    <div>
                      <div className="flex items-start">
                        <span className="text-8xl md:text-[10rem] font-bold tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                          {Math.round(weather.current.temperature_2m)}
                        </span>
                        <span className="text-4xl md:text-6xl font-light text-muted-foreground mt-4 md:mt-8">°</span>
                      </div>
                      <p className="text-2xl md:text-3xl font-medium mt-2 text-primary">
                        {getWeatherDescription(weather.current.weather_code)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 md:gap-8 w-full md:w-auto">
                      <div className="flex items-center gap-4 bg-background/40 p-3 rounded-2xl border border-white/5">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                          <Wind className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Ветер</p>
                          <p className="font-bold text-lg">{weather.current.wind_speed_10m} <span className="text-sm font-normal text-muted-foreground">км/ч</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-background/40 p-3 rounded-2xl border border-white/5">
                        <div className="p-2 bg-cyan-500/10 rounded-xl">
                          <Droplets className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Влажность</p>
                          <p className="font-bold text-lg">{weather.current.relative_humidity_2m}<span className="text-sm font-normal text-muted-foreground">%</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-background/40 p-3 rounded-2xl border border-white/5 col-span-2">
                        <div className="p-2 bg-orange-500/10 rounded-xl">
                          <Thermometer className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Давление</p>
                          <p className="font-bold text-lg">{weather.current.pressure_msl} <span className="text-sm font-normal text-muted-foreground">гПа</span></p>
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
                   const isToday = i === 0;
                   return (
                     <motion.div 
                       key={time} 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 * i }}
                       className={cn(
                         "p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-3 transition-all duration-300",
                         isToday 
                           ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105" 
                           : "bg-card/50 border-border hover:bg-card hover:border-primary/50 hover:-translate-y-1"
                       )}
                     >
                       <span className={cn("text-xs font-medium", isToday ? "text-primary-foreground/80" : "text-muted-foreground")}>
                         {format(new Date(time), "EEE", { locale: ru })}
                       </span>
                       <CodeIcon className={cn("w-8 h-8", isToday ? "text-white" : "text-primary")} />
                       <div className="flex flex-col">
                         <span className="text-lg font-bold">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                         <span className={cn("text-sm", isToday ? "text-primary-foreground/60" : "text-muted-foreground")}>
                           {Math.round(weather.daily.temperature_2m_min[i])}°
                         </span>
                       </div>
                     </motion.div>
                   );
                })}
              </div>
            </motion.div>

            {/* Map Column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="h-[400px] lg:h-auto bg-card rounded-[2rem] overflow-hidden border border-border shadow-xl relative group"
            >
              <div className="absolute top-4 left-4 z-[400] bg-card/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-border pointer-events-none">
                <Navigation className="w-3 h-3 inline-block mr-1 text-primary" />
                Нажмите на карту для выбора
              </div>
              <Map lat={city.latitude} lon={city.longitude} onLocationSelect={handleMapClick} />
            </motion.div>

          </div>
        )}
      </motion.div>
    </main>
  );
}
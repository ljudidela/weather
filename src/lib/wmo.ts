import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Snowflake } from "lucide-react";

export const getWeatherIcon = (code: number) => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return Sun;
  if (code >= 1 && code <= 3) return Cloud;
  if (code >= 45 && code <= 48) return CloudFog;
  if (code >= 51 && code <= 55) return CloudDrizzle;
  if (code >= 56 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 65) return CloudRain;
  if (code >= 66 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 85 && code <= 86) return CloudSnow;
  if (code >= 95 && code <= 99) return CloudLightning;
  return Sun;
};

export const getWeatherDescription = (code: number): string => {
  const codes: Record<number, string> = {
    0: "Ясно",
    1: "Преимущественно ясно",
    2: "Переменная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Туман с инеем",
    51: "Морось: легкая",
    53: "Морось: умеренная",
    55: "Морось: плотная",
    56: "Ледяная морось: легкая",
    57: "Ледяная морось: плотная",
    61: "Дождь: слабый",
    63: "Дождь: умеренный",
    65: "Дождь: сильный",
    66: "Ледяной дождь: слабый",
    67: "Ледяной дождь: сильный",
    71: "Снегопад: слабый",
    73: "Снегопад: умеренный",
    75: "Снегопад: сильный",
    77: "Снежные зерна",
    80: "Ливень: слабый",
    81: "Ливень: умеренный",
    82: "Ливень: сильный",
    85: "Снежный ливень: слабый",
    86: "Снежный ливень: сильный",
    95: "Гроза: слабая",
    96: "Гроза с градом",
    99: "Гроза с сильным градом"
  };
  return codes[code] || "Неизвестно";
};
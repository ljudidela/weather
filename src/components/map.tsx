"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/components/theme-provider";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/20 animate-pulse">
      <span className="text-muted-foreground text-sm">Загрузка карты...</span>
    </div>
  ),
});

interface MapProps {
  lat: number;
  lon: number;
  onLocationSelect?: (lat: number, lon: number) => void;
}

export default function Map(props: MapProps) {
  const { theme } = useTheme();
  // Force re-render on theme change to fix tiles if needed, though usually CSS handles filters
  return <MapInner key={theme} {...props} />;
}
"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground">Загрузка карты...</div>,
});

export default function Map({ lat, lon }: { lat: number; lon: number }) {
  return <MapInner lat={lat} lon={lon} />;
}
"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const KazakhstanMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full min-h-[calc(100vh-64px)] rounded-none" />,
});

"use client"

import React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { KazakhstanMap } from "@/components/map"

export default function Home() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Карта", active: true }]}>
      <div className="flex flex-1 flex-col bg-background">
        <KazakhstanMap />
      </div>
    </DashboardLayout>
  )
}

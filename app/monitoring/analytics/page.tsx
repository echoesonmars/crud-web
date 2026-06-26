"use client"

import React, { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MonitoringSearchForm } from "@/components/monitoring-search-form"
import { ShieldAlert, Activity, Eye, CheckCircle2 } from "lucide-react"

interface AlarmEvent {
  id: string
  type: string
  cameraName: string
  timestamp: string
  details: string
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<AlarmEvent[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEvents = async (params?: { query: string; type: string; date: Date | undefined }) => {
    setLoading(true)
    try {
      let url = "/api/alarms"
      const urlParams = new URLSearchParams()
      
      if (params) {
        if (params.query) urlParams.append("query", params.query)
        if (params.type && params.type !== "all") urlParams.append("type", params.type)
        if (params.date) urlParams.append("date", params.date.toISOString())
      }

      if (urlParams.toString()) {
        url += `?${urlParams.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Ошибка получения событий")
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (params: { query: string; type: string; date: Date | undefined }) => {
    fetchEvents(params)
  }

  // Analytics helper variables
  const criticalCount = events.filter(e => ["Драка", "Огонь", "Оружие", "ДТП", "Вандализм", "Упавший человек"].includes(e.type)).length
  const warningCount = events.filter(e => ["Курение", "Нарушитель", "Пересечение линии", "Длительное нахождение в зоне"].includes(e.type)).length
  const infoCount = events.length - criticalCount - warningCount

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Мониторинг" },
        { label: "Аналитика", active: true },
      ]}
    >
      <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Аналитика событий</h1>
          <p className="text-sm text-muted-foreground">
            Статистика нарушений и графики распределения событий по источникам и типам угроз
          </p>
        </div>

        {/* Search filter form */}
        <MonitoringSearchForm onSearch={handleSearch} loading={loading} />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Activity className="size-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Всего событий</div>
              <div className="text-2xl font-bold text-foreground">{events.length}</div>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Критичные</div>
              <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Eye className="size-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Предупреждения</div>
              <div className="text-2xl font-bold text-amber-500">{warningCount}</div>
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Информационные</div>
              <div className="text-2xl font-bold text-emerald-500">{infoCount}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

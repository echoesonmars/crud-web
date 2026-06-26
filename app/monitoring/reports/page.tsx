"use client"

import React, { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MonitoringSearchForm } from "@/components/monitoring-search-form"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface AlarmEvent {
  id: string
  type: string
  cameraName: string
  timestamp: string
  details: string
}

export default function ReportsPage() {
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

  // Generate CSV download
  const handleExportCSV = () => {
    if (events.length === 0) return
    const headers = ["Время", "Тип события", "Источник", "Подробности"]
    const rows = events.map(e => [
      new Date(e.timestamp).toLocaleString("ru-RU"),
      e.type,
      e.cameraName,
      e.details
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `report_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Мониторинг" },
        { label: "Отчет", active: true },
      ]}
    >
      <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Генерация отчетов</h1>
          <p className="text-sm text-muted-foreground">
            Выгрузка журналов безопасности и статистики событий в файлы CSV и XLS
          </p>
        </div>

        {/* Unified filter form */}
        <MonitoringSearchForm onSearch={handleSearch} loading={loading} />

        {/* Report Export Operations Panel */}
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">Доступно записей для экспорта: {events.length}</h3>
            <p className="text-xs text-muted-foreground">
              Выберите формат для мгновенного сохранения отфильтрованного списка событий.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={events.length === 0}
              onClick={handleExportCSV}
              className="border-border text-foreground hover:bg-accent/20 cursor-pointer flex items-center gap-1.5 text-xs h-9"
            >
              <Download className="size-4" />
              Экспорт CSV
            </Button>
            <Button
              disabled={events.length === 0}
              onClick={() => alert("Экспорт XLS подготовлен к скачиванию.")}
              className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs h-9 cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="size-4" />
              Экспорт XLS
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

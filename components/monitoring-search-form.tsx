"use client"

import React, { useState } from "react"
import { SearchInput } from "@/components/shared/search-input"
import { SituationSelect } from "@/components/shared/situation-select"
import { DatePicker } from "@/components/shared/date-picker"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface MonitoringSearchFormProps {
  onSearch: (params: { query: string; type: string; date: Date | undefined }) => void
  loading?: boolean
}

export function MonitoringSearchForm({
  onSearch,
  loading = false,
}: MonitoringSearchFormProps) {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("all")
  const [date, setDate] = useState<Date | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ query, type, date })
  }

  const handleReset = () => {
    setQuery("")
    setType("all")
    setDate(undefined)
    onSearch({ query: "", type: "all", date: undefined })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border p-5 rounded-2xl flex flex-col gap-4 shadow-sm w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Поиск источника / описания
          </label>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Введите камеру или детали..."
          />
        </div>

        {/* Situation Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Тип ситуации
          </label>
          <SituationSelect value={type} onChange={setType} />
        </div>

        {/* Date Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Выбор даты
          </label>
          <DatePicker date={date} setDate={setDate} placeholder="Выберите дату события" />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border/40 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="border-border text-foreground hover:bg-accent/20 cursor-pointer"
        >
          Сбросить
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium px-5 cursor-pointer flex items-center gap-1.5"
        >
          <Search className="size-4" />
          {loading ? "Поиск..." : "Найти"}
        </Button>
      </div>
    </form>
  )
}

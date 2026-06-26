"use client"

import React from "react"
import { Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ViewToggleProps {
  mode: "table" | "card"
  onChange: (mode: "table" | "card") => void
  className?: string
}

export function ViewToggle({
  mode,
  onChange,
  className = "",
}: ViewToggleProps) {
  return (
    <div className={`flex items-center gap-1 bg-secondary/40 p-1 rounded-lg border border-border/80 ${className}`}>
      <Button
        variant={mode === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange("table")}
        className={`h-8 px-3 text-xs gap-1.5 cursor-pointer transition-colors ${
          mode === "table"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <List className="size-3.5" />
        <span>Таблица</span>
      </Button>
      <Button
        variant={mode === "card" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onChange("card")}
        className={`h-8 px-3 text-xs gap-1.5 cursor-pointer transition-colors ${
          mode === "card"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Grid className="size-3.5" />
        <span>Карточки</span>
      </Button>
    </div>
  )
}

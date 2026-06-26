"use client"

import React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Поиск...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 bg-card border-border text-foreground rounded-lg focus-visible:ring-primary focus-visible:ring-1"
      />
    </div>
  )
}

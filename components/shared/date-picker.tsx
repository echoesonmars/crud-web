"use client"

import React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Выбрать дату",
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setOpen(false)
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal bg-card border-border text-foreground hover:bg-accent/20 cursor-pointer ${
                !date && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
              {date ? (
                date.toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="bg-card text-foreground"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

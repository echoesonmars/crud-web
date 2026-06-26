import React from "react"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusStyles = (val: string) => {
    const norm = val.toLowerCase()
    if (norm === "stable" || norm === "стабильно" || norm === "success") {
      return {
        label: "Стабильно",
        classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      }
    }
    if (norm === "warning" || norm === "предупреждение" || norm === "pending") {
      return {
        label: "Предупреждение",
        classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      }
    }
    if (norm === "critical" || norm === "критично" || norm === "критический" || norm === "error" || norm === "danger") {
      return {
        label: "Критично",
        classes: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      }
    }
    // Fallback for custom events or text
    return {
      label: val,
      classes: "bg-primary/10 text-primary border-primary/20",
    }
  }

  const { label, classes } = getStatusStyles(status)

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${classes} ${className}`}
    >
      {label}
    </span>
  )
}

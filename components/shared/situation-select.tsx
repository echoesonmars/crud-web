"use client"

import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const SITUATIONS = [
  "Бегущий человек",
  "Вандализм",
  "Вебхук",
  "Видеосигнал ослеплён",
  "Видеосигнал потерян",
  "Вход в зону",
  "Выход из зоны",
  "Газовый баллон",
  "Длительное нахождение в зоне",
  "Драка",
  "ДТП",
  "Дым",
  "Забранный предмет",
  "Запись архива",
  "Запись архива начата",
  "Запись архива остановлена",
  "Зафиксировано движение",
  "Зафиксировано окончание движения",
  "Избыточное количество людей",
  "Курение",
  "Лежащий человек",
  "Нарушение дистанции",
  "Нарушение ношения СИЗ",
  "Нарушение ношения СИЗ на голове",
  "Нарушение ношения СИЗ на ногах",
  "Нарушение ношения СИЗ на плечах",
  "Нарушение ношения СИЗ на руках",
  "Нарушение ношения СИЗ на теле",
  "Нарушитель",
  "Недостаточное количество людей",
  "Неклассифицированное нарушение",
  "Неклассифицированное событие",
  "Нет передвижения источника",
  "Огонь",
  "Оружие",
  "Оставленный предмет",
  "Пересечение линии",
  "Переход в неположенном месте",
  "Переход на красный",
  "Подключён внешний микрофон",
  "Предмет",
  "Разговор по телефону",
  "Распознанное лицо известно",
  "Распознанное лицо неизвестно",
  "Сидящий человек",
  "Скопление транспортных средств",
  "Снимок во время движения",
  "Упавший человек",
  "Хулиганство",
  "Человек"
]

interface SituationSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SituationSelect({
  value,
  onChange,
  className = "",
}: SituationSelectProps) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={(val) => onChange(val || "all")}>
        <SelectTrigger className="w-full bg-card border-border text-foreground hover:bg-accent/20 cursor-pointer">
          <SelectValue placeholder="Выберите тип ситуации" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-card border-border text-foreground">
          <SelectItem value="all" className="cursor-pointer">Все ситуации</SelectItem>
          {SITUATIONS.map((situation) => (
            <SelectItem key={situation} value={situation} className="cursor-pointer">
              {situation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

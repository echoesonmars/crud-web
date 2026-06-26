import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const type = searchParams.get("type") || ""
    const dateStr = searchParams.get("date") || ""

    const where: Prisma.AlarmEventWhereInput = {}

    // 1. Text search filter
    if (query) {
      where.OR = [
        { cameraName: { contains: query, mode: "insensitive" } },
        { details: { contains: query, mode: "insensitive" } },
      ]
    }

    // 2. Type filter
    if (type && type !== "all") {
      where.type = type
    }

    // 3. Date filter
    if (dateStr) {
      const selectedDate = new Date(dateStr)
      if (!isNaN(selectedDate.getTime())) {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        where.timestamp = {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    }

    const events = await db.alarmEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("GET alarms error:", error)
    return NextResponse.json(
      { error: "Не удалось получить список тревог" },
      { status: 500 }
    )
  }
}

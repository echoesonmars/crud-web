import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const points = await db.mapPoint.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(points)
  } catch (error) {
    console.error("Failed to fetch map points:", error)
    return NextResponse.json(
      { error: "Failed to fetch map points" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const cameras = await db.camera.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(cameras)
  } catch (error) {
    console.error("GET cameras error:", error)
    return NextResponse.json(
      { error: "Не удалось получить список камер" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, info, streamUrl } = await request.json()

    if (!name || !info || !streamUrl) {
      return NextResponse.json(
        { error: "Все поля обязательны для заполнения" },
        { status: 400 }
      )
    }

    const camera = await db.camera.create({
      data: { name, info, streamUrl },
    })

    return NextResponse.json(camera, { status: 201 })
  } catch (error) {
    console.error("POST camera error:", error)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Камера с таким именем уже существует" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Не удалось создать камеру" },
      { status: 500 }
    )
  }
}

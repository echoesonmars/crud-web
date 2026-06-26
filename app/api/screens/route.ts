import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const screens = await db.screen.findMany({
      include: {
        cameras: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(screens)
  } catch (error) {
    console.error("GET screens error:", error)
    return NextResponse.json(
      { error: "Не удалось получить список мониторов" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, cameraIds } = await request.json()

    if (!name || !cameraIds || !Array.isArray(cameraIds) || cameraIds.length === 0) {
      return NextResponse.json(
        { error: "Имя экрана и выбор хотя бы одной камеры обязательны" },
        { status: 400 }
      )
    }

    const screen = await db.screen.create({
      data: {
        name,
        cameras: {
          connect: cameraIds.map((id: string) => ({ id })),
        },
      },
      include: {
        cameras: true,
      },
    })

    return NextResponse.json(screen, { status: 201 })
  } catch (error) {
    console.error("POST screen error:", error)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Экран с таким именем уже существует" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Не удалось создать экран" },
      { status: 500 }
    )
  }
}

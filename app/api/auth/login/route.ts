import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find the user in the database
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true, user: { email: user.email, name: user.name } })

    // Set HTTP-only session cookie (expires in 7 days)
    response.cookies.set("session-token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: "Произошла внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

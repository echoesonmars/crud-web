import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Delete the session cookie by setting maxAge to 0
  response.cookies.set("session-token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  })

  return response
}

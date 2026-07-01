import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: "Email and Role are required fields." }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        role // 'CUSTOMER' | 'MERCHANT' | 'SERVICE_PRO'
      },
      include: {
        customerProfile: true,
        merchantProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "No account found with this email for the selected role." }, { status: 404 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required for authentication." }, { status: 400 })
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "Credentials not fully configured on this profile." }, { status: 400 })
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid password. Please try again." }, { status: 401 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

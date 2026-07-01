import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      role, // 'CUSTOMER' | 'MERCHANT' | 'SERVICE_PRO'
      contactName,
      phone,
      storeName,
      storeType,
      description,
      taxId,
      aadharNumber,
      address
    } = body

    if (!email || !role || !password) {
      return NextResponse.json({ error: "Missing required fields: email, password, and role" }, { status: 400 })
    }

    // Check if user already exists globally since email is unique
    const existingUser = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email address already exists. Please log in directly." }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Create User
    const newUser = await prisma.user.create({
      data: {
        email,
        role,
        passwordHash,
        ...(role === "CUSTOMER" ? {
          customerProfile: {
            create: {
              address: address || "",
              rewardsPoints: 100 // Give 100 starting welcome points
            }
          }
        } : {
          merchantProfile: {
            create: {
              phone: phone || "",
              contactName: contactName || "",
              storeName: storeName || "",
              storeType: storeType || "",
              description: description || "",
              taxId: taxId || "",
              aadharNumber: aadharNumber || "",
              address: address || "",
              isVerified: true
            }
          }
        })
      },
      include: {
        customerProfile: true,
        merchantProfile: true
      }
    })

    return NextResponse.json({ success: true, user: newUser }, { status: 201 })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

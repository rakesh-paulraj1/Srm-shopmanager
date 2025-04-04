// src/app/api/customers/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany()
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers'+error },
      { status: 500 }
    )
  }
}

// POST /api/customers
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newCustomer = await prisma.customer.create({
      data: body
    })
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer'+error },
      { status: 500 }
    )
  }
}
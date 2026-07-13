import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession, isAdminSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  if (!isAdminSession(session)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        include: { employee: { select: { fullName: true } } }
      }
    }
  })
  return NextResponse.json(projects)
}

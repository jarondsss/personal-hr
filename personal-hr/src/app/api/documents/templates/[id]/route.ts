import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await getRequiredAdminSession()

  const { id } = await params
  const template = await prisma.documentTemplate.findUnique({ where: { id } })
  if (!template) return new Response("Template not found", { status: 404 })

  let content = template.content
  if (!content) {
    try {
      content = await readFile(path.join(process.cwd(), "public/templates", path.basename(template.fileName)))
    } catch {
      return new Response("Template file not found", { status: 404 })
    }
  }

  return new Response(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Cache-Control": "private, no-store",
    },
  })
}

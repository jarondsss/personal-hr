import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import SkillForm from "./SkillForm"

export default async function SkillsPage({ params }: { params: { token: string } }) {
  const { token } = await params

  const link = await prisma.skillLink.findUnique({
    where: { token },
    include: { employee: { include: { skills: true } } },
  })
  if (!link) notFound()
  if (!link.employee) notFound()

  // Key forces React to remount SkillForm when skills change after router.refresh()
  const formKey = link.employee.skills.map(s => s.id).join(",") || "empty"

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary">Update Your Skills, {link.employee.fullName}</h1>
          <p className="opacity-70 mt-2">
            List the skills you have. You can reopen this link to edit them later.
          </p>
        </div>

        <SkillForm key={formKey} link={link} existing={link.employee.skills} />
      </div>
    </div>
  )
}
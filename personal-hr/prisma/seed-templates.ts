import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const defaults = [
    { name: 'PKWT / Kontrak Kerja', fileName: 'contract-template.docx' },
    { name: 'Internship Agreement', fileName: 'intern-template.docx' },
    { name: 'Surat Keterangan Kerja', fileName: 'keterangan-template.docx' }
  ]

  for (const tpl of defaults) {
    await prisma.documentTemplate.upsert({
      where: { name: tpl.name },
      update: {},
      create: tpl
    })
  }
  console.log("Templates seeded")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

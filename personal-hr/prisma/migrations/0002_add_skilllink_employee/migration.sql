-- AlterTable
ALTER TABLE "SkillLink" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "SkillLink" ADD CONSTRAINT "SkillLink_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
import { unstable_cache } from 'next/cache'
import prisma from './prisma'

// Cache master data (job titles, leave types, etc.) for 1 hour
export const getCachedMasterData = unstable_cache(
  async (category: string) => {
    return prisma.masterData.findMany({
      where: { category },
      orderBy: { label: 'asc' },
    })
  },
  ['master-data'],
  {
    revalidate: 3600, // 1 hour
    tags: ['master-data'],
  }
)

// Cache company profile for 1 hour
export const getCachedCompanyProfile = unstable_cache(
  async () => {
    return prisma.companyProfile.findFirst()
  },
  ['company-profile'],
  {
    revalidate: 3600,
    tags: ['company-profile'],
  }
)

// Cache active employees list for 5 minutes (changes more frequently)
export const getCachedActiveEmployees = unstable_cache(
  async () => {
    return prisma.employee.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    })
  },
  ['active-employees'],
  {
    revalidate: 300, // 5 minutes
    tags: ['employees'],
  }
)

// Cache job title data for 1 hour (returns array, not Map - serialization issue)
export const getCachedJobTitleData = unstable_cache(
  async () => {
    return prisma.masterData.findMany({
      where: { category: 'JOB_TITLE' },
      select: { value: true, label: true },
    })
  },
  ['job-title-data'],
  {
    revalidate: 3600,
    tags: ['master-data'],
  }
)

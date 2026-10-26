import { revalidateTag } from 'next/cache'

/**
 * Revalidate cache tags when data changes
 * Call these functions after mutations (create/update/delete)
 */

export function revalidateMasterData() {
  revalidateTag('master-data')
}

export function revalidateEmployees() {
  revalidateTag('employees')
}

export function revalidateCompanyProfile() {
  revalidateTag('company-profile')
}

export function revalidateAll() {
  revalidateTag('master-data')
  revalidateTag('employees')
  revalidateTag('company-profile')
}

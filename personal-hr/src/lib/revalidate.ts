import { revalidateTag } from 'next/cache'

/**
 * Revalidate cache tags when data changes
 * Call these functions after mutations (create/update/delete)
 */

export function revalidateMasterData() {
  revalidateTag('master-data', 'max')
}

export function revalidateEmployees() {
  revalidateTag('employees', 'max')
}

export function revalidateCompanyProfile() {
  revalidateTag('company-profile', 'max')
}

export function revalidateAll() {
  revalidateTag('master-data', 'max')
  revalidateTag('employees', 'max')
  revalidateTag('company-profile', 'max')
}

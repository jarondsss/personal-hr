"use server"

import { revalidatePath } from "next/cache"
import { writeFile, unlink } from "fs/promises"
import path from "path"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"

export async function getMasterData() {
  await getRequiredAdminSession()

  return await prisma.masterData.findMany({
    orderBy: [{ category: 'asc' }, { label: 'asc' }]
  })
}

export async function addMasterData(formData: FormData) {
  await getRequiredAdminSession()

  const category = formData.get("category")?.toString()
  const label = formData.get("label")?.toString()
  const value = formData.get("value")?.toString()
  const quota = formData.get("quota")?.toString()

  if (!category || !label || !value) {
    return { error: "All fields are required" }
  }

  let metadata = null;
  if (category === "LEAVE_TYPE" && quota) {
    metadata = JSON.stringify({ quota: parseInt(quota) || 0 })
  }

  try {
    await prisma.masterData.create({
      data: { 
        category, 
        label, 
        value: value.toUpperCase().replace(/\s+/g, '_'),
        metadata 
      }
    })
    revalidatePath("/dashboard/master-data")
    return { success: true }
  } catch (error: any) {
    console.error("Prisma error:", error)
    if (error.code === 'P2002') {
      return { error: "Value already exists in this category." }
    }
    return { error: "Failed to save data. See console for details." }
  }
}

export async function deleteMasterData(id: string) {
  await getRequiredAdminSession()

  try {
    await prisma.masterData.delete({
      where: { id }
    })
    revalidatePath("/dashboard/master-data")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete" }
  }
}

export async function getCompanyProfile() {
  await getRequiredAdminSession()

  const profile = await prisma.companyProfile.findFirst()
  return profile
}

export async function updateCompanyProfile(formData: FormData) {
  await getRequiredAdminSession()

  const companyName = formData.get("companyName")?.toString()
  const email = formData.get("email")?.toString()
  const phone = formData.get("phone")?.toString()
  const address = formData.get("address")?.toString()

  if (!companyName || !email || !phone) {
    return { error: "Company name, email, and phone are required" }
  }

  try {
    const existing = await prisma.companyProfile.findFirst()

    if (existing) {
      await prisma.companyProfile.update({
        where: { id: existing.id },
        data: { companyName, email, phone, address }
      })
    } else {
      await prisma.companyProfile.create({
        data: { companyName, email, phone, address }
      })
    }

    revalidatePath("/dashboard/master-data")
    return { success: true }
  } catch (error) {
    console.error("Failed to update company profile:", error)
    return { error: "Failed to save company profile" }
  }
}

export async function uploadCompanyLogo(formData: FormData) {
  await getRequiredAdminSession()

  const file = formData.get("logo") as File

  if (!file) {
    return { error: "No file provided" }
  }

  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "File size must be under 2MB" }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = path.extname(file.name) || ".png"
    const filename = `company-logo${ext}`
    const filePath = path.join(process.cwd(), "public/uploads/logos", filename)

    await writeFile(filePath, buffer)

    const logoUrl = `/uploads/logos/${filename}`

    const existing = await prisma.companyProfile.findFirst()
    if (existing) {
      await prisma.companyProfile.update({
        where: { id: existing.id },
        data: { logoUrl }
      })
    }

    revalidatePath("/dashboard/master-data")
    return { success: true, logoUrl }
  } catch (error) {
    console.error("Failed to upload logo:", error)
    return { error: "Failed to upload logo" }
  }
}

export async function removeCompanyLogo() {
  await getRequiredAdminSession()

  try {
    const existing = await prisma.companyProfile.findFirst()
    if (existing?.logoUrl) {
      // Remove file
      const filePath = path.join(process.cwd(), "public", existing.logoUrl)
      try {
        await unlink(filePath)
      } catch {}

      await prisma.companyProfile.update({
        where: { id: existing.id },
        data: { logoUrl: null }
      })
    }

    revalidatePath("/dashboard/master-data")
    return { success: true }
  } catch (error) {
    console.error("Failed to remove logo:", error)
    return { error: "Failed to remove logo" }
  }
}

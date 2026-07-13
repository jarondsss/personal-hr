"use server"

import prisma from "@/lib/prisma";
import { deleteSession, getRequiredAdminSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function extendContract(employeeId: string) {
  await getRequiredAdminSession();

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { endContract: true },
  });

  if (!employee) throw new Error("Employee not found");
  if (!employee.endContract) throw new Error("Employee has no contract end date");

  const newEnd = new Date(employee.endContract);
  newEnd.setFullYear(newEnd.getFullYear() + 1);

  await prisma.employee.update({
    where: { id: employeeId },
    data: { endContract: newEnd },
  });

  revalidatePath("/dashboard");
}

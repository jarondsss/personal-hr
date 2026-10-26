import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as { prismaGlobal?: ReturnType<typeof prismaClientSingleton> }

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma

export default prisma

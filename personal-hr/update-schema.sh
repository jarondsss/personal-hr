sed -i '/endContract    DateTime?/a\  birthPlace     String?\n  birthDate      DateTime?\n  gender         String?\n  idCardNumber   String?' prisma/schema.prisma
npx prisma generate
npx prisma db push --accept-data-loss

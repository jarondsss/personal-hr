import { PrismaClient } from '@prisma/client'
import { isWeekend } from 'date-fns'

const prisma = new PrismaClient()

async function run() {
  console.log("=== STARTING PAYROLL TEST ===\n")

  // 1. Create Dummy Employee
  // Gaji = 1.730.000 (biar gampang dibagi 173 = 10.000 / jam)
  const emp = await prisma.employee.create({
    data: {
      fullName: 'Test Pegawai',
      email: 'test@hr.local' + Date.now(),
      jobTitle: 'Tester',
      status: 'FULLTIME',
      salary: 1730000,
      salaryType: 'GROSS',
      joinDate: new Date('2024-01-01')
    }
  })

  // 2. Create Public Holiday (Weekday: Wed, May 1, 2024)
  const holiday = await prisma.masterData.create({
    data: {
      category: 'PUBLIC_HOLIDAY',
      label: 'May Day',
      value: '2024-05-01'
    }
  })

  // 3. Create Overtimes
  // a) Normal Weekday (May 2, 2024 - Thursday) - 2 hours
  await prisma.overtimeRequest.create({
    data: {
      employeeId: emp.id,
      date: new Date('2024-05-02'),
      startTime: '17:00',
      endTime: '19:00',
      durationHours: 2,
      reason: 'Lembur biasa',
      status: 'APPROVED'
    }
  })

  // b) Public Holiday (May 1, 2024 - Wednesday) - 4 hours
  await prisma.overtimeRequest.create({
    data: {
      employeeId: emp.id,
      date: new Date('2024-05-01'),
      startTime: '08:00',
      endTime: '12:00',
      durationHours: 4,
      reason: 'Lembur tanggal merah',
      status: 'APPROVED'
    }
  })

  // c) Weekend (May 4, 2024 - Saturday) - 10 hours
  await prisma.overtimeRequest.create({
    data: {
      employeeId: emp.id,
      date: new Date('2024-05-04'),
      startTime: '08:00',
      endTime: '18:00',
      durationHours: 10,
      reason: 'Lembur weekend',
      status: 'APPROVED'
    }
  })

  // --- RUN LOGIC ---
  const year = 2024
  const month = 5

  const employees = await prisma.employee.findMany({
    where: { id: emp.id },
    include: {
      overtimes: {
        where: {
          status: 'APPROVED',
          date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0)
          }
        }
      }
    }
  })

  const publicHolidaysData = await prisma.masterData.findMany({
    where: { category: "PUBLIC_HOLIDAY" }
  })
  const publicHolidayDates = publicHolidaysData.map(h => new Date(h.value).toISOString().split('T')[0])

  const isPublicHolidayOrWeekend = (date: Date) => {
    if (isWeekend(date)) return true
    const dateString = date.toISOString().split('T')[0]
    return publicHolidayDates.includes(dateString)
  }

  const targetEmp = employees[0]
  const HOURLY_RATE = targetEmp.salary / 173;
  let overtimePay = 0;

  console.log(`Employee Salary: Rp ${targetEmp.salary}`);
  console.log(`Hourly Rate: Rp ${HOURLY_RATE} (Salary / 173)\n`);

  for (const ot of targetEmp.overtimes) {
    const hours = ot.durationHours;
    let payForThisOt = 0;

    if (isPublicHolidayOrWeekend(new Date(ot.date))) {
      if (hours <= 8) {
        payForThisOt = hours * 2.0 * HOURLY_RATE;
      } else if (hours <= 9) {
        payForThisOt = (8 * 2.0 * HOURLY_RATE) + ((hours - 8) * 3.0 * HOURLY_RATE);
      } else {
        payForThisOt = (8 * 2.0 * HOURLY_RATE) + (1 * 3.0 * HOURLY_RATE) + ((hours - 9) * 4.0 * HOURLY_RATE);
      }
      console.log(`[Holiday/Weekend] ${ot.date.toISOString().split('T')[0]} | ${hours} hours -> Rp ${payForThisOt}`)
    } else {
      if (hours <= 1) {
        payForThisOt = hours * 1.5 * HOURLY_RATE;
      } else {
        payForThisOt = (1 * 1.5 * HOURLY_RATE) + ((hours - 1) * 2.0 * HOURLY_RATE);
      }
      console.log(`[Weekday] ${ot.date.toISOString().split('T')[0]} | ${hours} hours -> Rp ${payForThisOt}`)
    }
    overtimePay += payForThisOt
  }

  console.log(`\nTotal Overtime Pay: Rp ${overtimePay}`)

  // Cleanup
  await prisma.overtimeRequest.deleteMany({ where: { employeeId: emp.id } })
  await prisma.employee.delete({ where: { id: emp.id } })
  await prisma.masterData.delete({ where: { id: holiday.id } })
  console.log("\n=== TEST FINISHED & DATA CLEANED UP ===")
}

run().catch(console.error)

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSession, isAdminSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!isAdminSession(session)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const filePath = path.join(process.cwd(), 'src/app/dashboard/payroll/template/12. Salary Slip.ods');
  const fileBuffer = fs.readFileSync(filePath);
  
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/vnd.oasis.opendocument.spreadsheet',
    },
  });
}

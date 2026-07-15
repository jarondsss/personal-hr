
export const generatePayslipOds = async (payroll: any, companyProfile?: any) => {
  const xlsx = await import('xlsx')
  // Read the template via API route to get it as array buffer on client
  const response = await fetch('/api/template/salary-slip');
  const arrayBuffer = await response.arrayBuffer();

  // Parse workbook
  const workbook = xlsx.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const sheet = workbook.Sheets['Salary Slip'];

  const monthName = new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' });

  // Company info (header cells)
  if (companyProfile?.companyName) {
    sheet['D4'] = { v: companyProfile.companyName, t: 's' };
  }
  if (companyProfile?.email || companyProfile?.phone) {
    sheet['D5'] = { v: [companyProfile.email, companyProfile.phone].filter(Boolean).join(' | '), t: 's' };
  }
  if (companyProfile?.address) {
    sheet['D6'] = { v: companyProfile.address, t: 's' };
  }

  // Update specific cells based on the template structure we mapped
  // D10: Cut off date
  sheet['D10'] = { v: `25 ${monthName} ${payroll.year}`, t: 's' };
  
  // D11: Name
  sheet['D11'] = { v: payroll.employee.fullName, t: 's' };
  
  // D12: Job Position
  sheet['D12'] = { v: payroll.employee.jobTitle || '-', t: 's' };
  
  // J11: PTKP
  sheet['J11'] = { v: payroll.employee.taxStatus || '-', t: 's' };
  
  // J12: NPWP
  sheet['J12'] = { v: payroll.employee.npwp || '-', t: 's' };

  // Earnings
  // E17: Basic Salary
  sheet['E17'] = { v: payroll.basicSalary, t: 'n' };
  // E18: Allowance (using Overtime for now, or just leave 0 if separated)
  sheet['E18'] = { v: payroll.overtimePay, t: 'n' };

  // Deductions
  // J17: PPh 21
  sheet['J17'] = { v: payroll.deductions, t: 'n' };
  
  // Totals
  const totalEarnings = payroll.basicSalary + payroll.overtimePay;
  sheet['E21'] = { v: totalEarnings, t: 'n' };
  sheet['J21'] = { v: payroll.deductions, t: 'n' };
  
  // Take Home Pay
  sheet['E23'] = { v: payroll.netSalary, t: 'n' };

  // Generate output Blob
  const out = xlsx.write(workbook, { type: 'array', bookType: 'ods' });
  return new Blob([out], { type: 'application/vnd.oasis.opendocument.spreadsheet' });
};

const fs = require('fs');
const path = 'src/app/dashboard/employees/actions.import.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/row\.phone \|\| null/g, "row.phone?.trim() || null");
code = code.replace(/row\.idCardNumber \|\| null/g, "row.idCardNumber?.trim() || null");
code = code.replace(/row\.npwp \|\| null/g, "row.npwp?.trim() || null");
code = code.replace(/row\.githubUsername \|\| null/g, "row.githubUsername?.trim() || null");
code = code.replace(/row\.bankName \|\| 'BCA'/g, "row.bankName?.trim() || 'BCA'");
code = code.replace(/row\.bankAccount \|\| null/g, "row.bankAccount?.trim() || null");
code = code.replace(/row\.gender \|\| null/g, "row.gender?.trim() || null");
code = code.replace(/row\.birthPlace \|\| null/g, "row.birthPlace?.trim() || null");
code = code.replace(/row\.address \|\| null/g, "row.address?.trim() || null");

fs.writeFileSync(path, code);

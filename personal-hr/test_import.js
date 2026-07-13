const fs = require('fs');

function check() {
  const row = { fullName: "Test", email: "test@test.com", bankAccount: " " };
  console.log(row.bankAccount || null);
}
check();

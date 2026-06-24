#!/bin/bash
# Ngetes next-auth endpoint sama BE login

echo "Mulai ngetest FE Auth / BE"
echo "--------------------------------"

# Ngecek env variables FE
cd /home/jajang/Documents/jajang-work/NVP/FE
if [ -f .env ]; then
  echo ".env FE ada"
  grep NEXT_PUBLIC_API_BASE_URL .env || echo "NEXT_PUBLIC_API_BASE_URL nggak ada"
  grep NEXTAUTH_SECRET .env || echo "NEXTAUTH_SECRET nggak ada"
else
  echo ".env FE kaga ada woy"
fi

echo "--------------------------------"
echo "Mengecek endpoint BE..."
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' | grep -q "token" && echo "BE Auth jalan!" || echo "BE Auth kayaknya nggak jalan / ga ada admin user default."


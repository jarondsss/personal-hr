#!/bin/bash

# Jalankan backend (Fastify) di background
echo "Menjalankan Backend..."
cd /home/jajang/Documents/jajang-work/NVP/BE/nvp-portal-be
bun run start > be.log 2>&1 &
BE_PID=$!

echo "Tunggu BE nyala bentar..."
sleep 3

# Test nembak auth API pake akun admin
echo "Ngetest API login BE..."
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dwi@nvpdev.tech","password":"..@@Po90"}' | jq '.'

echo "Matiin BE..."
kill $BE_PID

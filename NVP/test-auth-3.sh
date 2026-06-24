#!/bin/bash

cd /home/jajang/Documents/jajang-work/NVP/BE/nvp-portal-be
bun run start > be.log 2>&1 &
BE_PID=$!

sleep 3

curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dwi@nvpdev.tech","password":"..@@Po90"}'

kill $BE_PID

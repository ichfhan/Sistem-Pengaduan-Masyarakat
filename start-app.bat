@echo off
echo Starting All Services...

start "Service Auth (5001)" cmd /k "cd backend/service-auth && npm install && node index.js"
start "Service Pengaduan (5002)" cmd /k "cd backend/service-pengaduan && npm install && node index.js"
start "Service Tindak Lanjut (5003)" cmd /k "cd backend/service-tindak-lanjut && npm install && node index.js"
start "Service Dashboard (5005)" cmd /k "cd backend/service-dashboard && npm install && node index.js"
start "Frontend Next.js (3000)" cmd /k "cd frontend && npm install && npm run dev"

echo All services started! Please ensure Nginx is running if you want to use port 5000.
echo Access Frontend at http://localhost:3000

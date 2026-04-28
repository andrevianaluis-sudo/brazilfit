@echo off
echo.
echo  ⚡ Starting BrazilFit...
echo.
start "BrazilFit Backend" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul
start "BrazilFit Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo  Backend:  http://localhost:3001
echo  Frontend: http://localhost:5173
echo.
pause

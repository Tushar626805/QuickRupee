@echo off
title QuickRupee Launcher

echo ====================================
echo        QUICKRUPEE STARTUP
echo ====================================
echo.

echo Starting Flask Backend...
start "QuickRupee Backend" cmd /k "cd /d D:\quickrupee_demo\backend && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python app.py"

timeout /t 3 /nobreak >nul

echo Starting React Frontend...
start "QuickRupee Frontend" cmd /k "cd /d D:\quickrupee_demo\frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo Opening QuickRupee...
start http://localhost:5173

echo.
echo QuickRupee has been launched.
exit

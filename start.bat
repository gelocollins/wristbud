@echo off
echo Starting WristBud Health Monitoring System...
echo.

echo Checking if MySQL is running...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ MySQL is running
) else (
    echo ⚠ MySQL not detected. Please start MySQL service first.
    echo   You can start it with: net start mysql
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting backend server...
start "WristBud Server" cmd /k "echo WristBud Server - http://localhost:5000 && npm run server"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting frontend...
start "WristBud Frontend" cmd /k "echo WristBud Frontend - http://localhost:5173 && npm run dev"

echo.
echo ✓ WristBud is starting up!
echo.
echo Backend Server: http://localhost:5000
echo Frontend App:   http://localhost:5173
echo.
echo Test Login: test@test.com / test123
echo.
echo Press any key to close this window...
pause >nul
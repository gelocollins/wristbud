#!/bin/bash

echo "Starting WristBud Health Monitoring System..."
echo

echo "Checking if MySQL is running..."
if pgrep -x "mysqld" > /dev/null; then
    echo "✓ MySQL is running"
elif systemctl is-active --quiet mysql; then
    echo "✓ MySQL service is active"
elif systemctl is-active --quiet mariadb; then
    echo "✓ MariaDB service is active"
else
    echo "⚠ MySQL/MariaDB not detected. Please start MySQL service first."
    echo "  You can start it with: sudo systemctl start mysql"
    echo "  Or: sudo systemctl start mariadb"
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

echo
echo "Installing dependencies..."
npm install

echo
echo "Starting backend server..."
gnome-terminal --title="WristBud Server" -- bash -c "echo 'WristBud Server - http://localhost:5000'; npm run server; exec bash" 2>/dev/null || \
xterm -title "WristBud Server" -e "echo 'WristBud Server - http://localhost:5000'; npm run server; bash" 2>/dev/null || \
echo "Please run 'npm run server' in a new terminal"

echo "Waiting for server to start..."
sleep 3

echo
echo "Starting frontend..."
gnome-terminal --title="WristBud Frontend" -- bash -c "echo 'WristBud Frontend - http://localhost:5173'; npm run dev; exec bash" 2>/dev/null || \
xterm -title "WristBud Frontend" -e "echo 'WristBud Frontend - http://localhost:5173'; npm run dev; bash" 2>/dev/null || \
echo "Please run 'npm run dev' in a new terminal"

echo
echo "✓ WristBud is starting up!"
echo
echo "Backend Server: http://localhost:5000"
echo "Frontend App:   http://localhost:5173"
echo
echo "Test Login: test@test.com / test123"
echo
echo "Press Enter to exit..."
read
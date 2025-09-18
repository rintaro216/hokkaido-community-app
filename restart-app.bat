@echo off
chcp 65001 > nul
echo Restarting Hokkaido Traveler App...
echo.
cd /d "%~dp0"
npx expo start --port 8083
pause
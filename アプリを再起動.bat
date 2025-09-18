@echo off
echo 北海道旅人アプリを再起動しています...
echo.
cd /d "%~dp0"
npx expo start --port 8083
pause
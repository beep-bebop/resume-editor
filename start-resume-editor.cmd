@echo off
setlocal

title Resume Studio
cd /d "%~dp0"

set "APP_URL=http://localhost:5173/"
set "NO_OPEN="
if /I "%~1"=="--no-open" set "NO_OPEN=1"

rem Prefer the newer Node.js runtime bundled with Codex.
set "BUNDLED_NODE=C:\Users\Faye\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
if exist "%BUNDLED_NODE%\node.exe" set "PATH=%BUNDLED_NODE%;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js was not found. Install Node.js 22.13 or newer.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found. Reinstall Node.js and try again.
    pause
    exit /b 1
)

rem Reuse an existing server instead of starting a duplicate.
netstat -ano | findstr /R /C:":5173 .*LISTENING" >nul
if not errorlevel 1 (
    echo Resume Studio is already running at %APP_URL%
    if not defined NO_OPEN start "" "%APP_URL%"
    exit /b 0
)

if not exist "node_modules\vite\package.json" (
    echo First run: installing dependencies. Please wait...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Dependency installation failed. Check the network and retry.
        pause
        exit /b 1
    )
)

echo.
echo Starting Resume Studio...
echo URL: %APP_URL%
echo Keep this window open. Press Ctrl+C or close it to stop the server.
echo.

rem Wait for the local port in a hidden helper, then open the browser.
if not defined NO_OPEN start "" /b powershell.exe -NoProfile -WindowStyle Hidden -Command "$url='%APP_URL%'; for($i=0; $i -lt 60; $i++){ $c=New-Object System.Net.Sockets.TcpClient; try { $c.Connect('localhost',5173); $c.Dispose(); Start-Process $url; exit } catch { $c.Dispose() }; Start-Sleep -Seconds 1 }"

call npm run dev

echo.
echo Resume Studio has stopped.
pause
endlocal

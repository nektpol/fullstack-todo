@echo off
setlocal

REM Always run relative to the repository root where this script lives.
cd /d "%~dp0"

echo Starting fullstack-todo test environment...

where cargo >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Rust/Cargo is not installed or not in PATH.
  goto :fail
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  goto :fail
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not installed or not in PATH.
  goto :fail
)

if not exist "backend\.env" (
  echo [WARN] backend\.env was not found.
  echo        Backend requires DATABASE_URL in backend\.env ^(or environment vars^) to start.
)

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd frontend
  call npm install
  if errorlevel 1 (
    popd
    echo [ERROR] npm install failed.
    goto :fail
  )
  popd
)

echo Launching backend on http://localhost:3000 ...
start "fullstack-todo backend" cmd /k "cd /d ""%~dp0backend"" && cargo run"

echo Launching frontend on http://localhost:3001 ^(safe dev mode^) ...
start "fullstack-todo frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Both services were started in separate terminal windows.
echo - Backend:  http://localhost:3000
echo - Frontend: http://localhost:3001
echo.
echo Close the opened terminals to stop the services.
pause

endlocal
exit /b 0

:fail
echo.
echo Startup failed. Fix the error above and run this file again.
pause
endlocal
exit /b 1
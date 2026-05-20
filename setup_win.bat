@echo off
echo ===================================================
echo   Presenton Windows Setup Script
echo ===================================================
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python 3.11 and add it to your PATH.
    pause
    exit /b 1
)

:: Create virtual environment inside servers/fastapi
echo Creating Python virtual environment in servers/fastapi/.venv...
cd servers\fastapi
if exist .venv (
    echo Existing .venv folder found. Recreating to ensure clean Windows compatibility...
    rmdir /s /q .venv
)

python -m venv .venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment.
    cd ..\..
    pause
    exit /b 1
)

echo Virtual environment created successfully.
echo.
echo Installing backend Python dependencies...
:: Activate virtual environment
call .venv\Scripts\activate.bat

:: Check if uv is installed for faster installation
uv --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Found uv. Using uv pip install for faster dependency installation...
    uv pip install -r requirements.txt
) else (
    echo [INFO] uv not found. Using standard pip install. This may take a minute...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
)

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    cd ..\..
    pause
    exit /b 1
)

echo Backend dependencies installed successfully.
cd ..\..
echo.
echo ===================================================
echo   Setup Completed Successfully!
echo ===================================================
echo.
echo To run the application:
echo 1. Set up your API keys in servers/fastapi/.env (copy from .env.example)
echo 2. Run 'npm run dev' to start the development servers.
echo.
pause

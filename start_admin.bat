@echo off
title Art Flair - Sabahz Atelier Admin Server
echo ==============================================================================
echo   Art Flair - Starting Admin Backend & Connecting to MySQL Database
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Testing MySQL Database Connectivity...
py database\test_connection.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not connect to MySQL database. Please check your internet or .env credentials.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Launching Backend Server on http://localhost:5000...
start "" "http://localhost:5000/dashboard.html"

echo.
echo [3/3] Serving Admin Panel (Press Ctrl+C to stop)...
py app.py

pause

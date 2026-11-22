@echo off
title Aura Artisanal Cafe & Roastery — Local Server
echo =====================================================================
echo   AURA ARTISANAL CAFE & ROASTERY — LOCAL EXECUTION LAUNCHER
echo =====================================================================
echo.
echo Starting native high-performance REST API and 3D WebGL Web Server...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0server\server.ps1" -Port 8080
pause

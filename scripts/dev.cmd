@echo off
setlocal EnableExtensions

pushd "%~dp0.." >nul 2>&1 || (
  echo No se pudo acceder al directorio del proyecto.
  exit /b 1
)
set "ROOT=%CD%"

echo Abriendo ventana: backend...
start "AI Analyzer - Backend" cmd /k "cd /d ""%ROOT%\backend"" && npm run dev"

echo Abriendo ventana: frontend...
start "AI Analyzer - Frontend" cmd /k "cd /d ""%ROOT%\frontend"" && npm run dev"

popd >nul
echo Listo. Cierra cada ventana para detener ese servidor.

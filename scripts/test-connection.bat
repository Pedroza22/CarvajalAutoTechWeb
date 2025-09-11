@echo off
echo 🔍 Verificando conexión con Supabase...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo 🚀 Ejecutando test de conexión...
echo.

REM Ejecutar el test rápido
node scripts\quick-connection-test.js
if %errorlevel% equ 0 (
    echo.
    echo 🎉 ¡Test completado exitosamente!
    echo.
    echo 💡 Si hay problemas, ejecuta el test completo:
    echo    node scripts\test-supabase-connection.js
) else (
    echo.
    echo ❌ Test falló. Ejecutando diagnóstico completo...
    echo.
    node scripts\test-supabase-connection.js
)

echo.
pause


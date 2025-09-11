# Script de PowerShell para verificar la conexión con Supabase
# Uso: .\scripts\test-connection.ps1

Write-Host "🔍 Verificando conexión con Supabase..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar si el archivo de test existe
if (-not (Test-Path "scripts\quick-connection-test.js")) {
    Write-Host "❌ Archivo de test no encontrado: scripts\quick-connection-test.js" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Ejecutando test de conexión..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar el test
try {
    $result = node scripts\quick-connection-test.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 ¡Test completado exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Si hay problemas, ejecuta el test completo:" -ForegroundColor Cyan
        Write-Host "   node scripts\test-supabase-connection.js" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Test falló. Ejecutando diagnóstico completo..." -ForegroundColor Red
        Write-Host ""
        node scripts\test-supabase-connection.js
    }
} catch {
    Write-Host "❌ Error ejecutando el test: $_" -ForegroundColor Red
    exit 1
}


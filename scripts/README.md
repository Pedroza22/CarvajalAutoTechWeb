# Scripts de Verificación de Supabase

Esta carpeta contiene scripts para verificar y diagnosticar la conexión con Supabase.

## 📋 Scripts Disponibles

### 🚀 Scripts Principales

#### `test-connection.bat` / `test-connection.ps1`
**Scripts de Windows para verificación rápida**
```bash
# Ejecutar desde la raíz del proyecto
.\scripts\test-connection.bat
# o
.\scripts\test-connection.ps1
```

#### `run-all-tests.js`
**Script maestro que ejecuta todos los tests**
```bash
node scripts/run-all-tests.js
```

### 🔧 Scripts de Configuración

#### `setup-env.js`
**Configura automáticamente el archivo .env**
```bash
node scripts/setup-env.js
```

### 🔍 Scripts de Diagnóstico

#### `quick-connection-test.js`
**Test rápido de conectividad básica**
```bash
node scripts/quick-connection-test.js
```

#### `test-supabase-connection.js`
**Test completo de conexión y funcionalidad**
```bash
node scripts/test-supabase-connection.js
```

## 🎯 Uso Recomendado

### Para Verificación Rápida
```bash
# Windows
.\scripts\test-connection.bat

# Linux/Mac
node scripts/quick-connection-test.js
```

### Para Diagnóstico Completo
```bash
node scripts/run-all-tests.js
```

### Para Configuración Inicial
```bash
node scripts/setup-env.js
```

## 📊 Qué Verifican los Scripts

### ✅ Test Rápido
- Conectividad básica con Supabase
- Configuración de credenciales
- Estado del cliente de autenticación

### ✅ Test Completo
- Conectividad básica
- Sistema de autenticación
- Acceso a tablas principales
- Test de login con credenciales demo
- Diagnóstico de problemas comunes

### ✅ Test de Configuración
- Creación del archivo .env
- Configuración de variables de entorno
- Backup de configuración existente

## 🚨 Solución de Problemas

### Error: "Cannot read properties of undefined"
```bash
# Ejecutar diagnóstico completo
node scripts/test-supabase-connection.js
```

### Error: "Supabase credentials not found"
```bash
# Configurar variables de entorno
node scripts/setup-env.js
```

### Error: "Multiple GoTrueClient instances"
```bash
# Reiniciar el servidor de desarrollo
npm start
```

### Error de Conectividad
```bash
# Verificar conectividad de red
ping 72.60.53.240
```

## 📝 Logs y Debugging

Los scripts proporcionan logs detallados para ayudar con el debugging:

- ✅ **Verde**: Operación exitosa
- ⚠️ **Amarillo**: Advertencia (no crítico)
- ❌ **Rojo**: Error crítico
- 🔍 **Cian**: Información de diagnóstico

## 🔧 Configuración Manual

Si los scripts automáticos fallan, puedes configurar manualmente:

1. **Crear archivo .env** en la raíz del proyecto:
```env
REACT_APP_SUPABASE_URL=http://72.60.53.240:8000/
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ
REACT_APP_APP_NAME=Carvajal AutoTech
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

2. **Reiniciar el servidor**:
```bash
npm start
```

## 📞 Soporte

Si los scripts no resuelven el problema:

1. Ejecuta el test completo y guarda los logs
2. Verifica la conectividad de red
3. Confirma que las credenciales de Supabase sean correctas
4. Revisa que el servidor de Supabase esté ejecutándose


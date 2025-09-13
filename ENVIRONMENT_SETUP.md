# Configuración de Variables de Entorno - Carvajal AutoTech

## Problema Identificado

El error `net::ERR_NETWORK_CHANGED` indica problemas de conectividad con Supabase. Esto puede deberse a:

1. **Falta de archivo `.env`**: Las credenciales están hardcodeadas
2. **Problemas de red**: Conexión inestable o bloqueos de firewall
3. **Configuración incorrecta**: URL o clave de Supabase incorrectas

## Solución Implementada

### 1. Configuración Centralizada
- ✅ Creado `src/config/environment.js` para manejar configuración
- ✅ Mejorado `src/services/supabase.js` con mejor manejo de errores
- ✅ Agregado componente `ConnectionStatus` para monitoreo en tiempo real

### 2. Manejo de Errores Mejorado
- ✅ Reintentos automáticos (3 intentos) para errores de red
- ✅ Verificación de conectividad antes del login
- ✅ Mensajes de error más descriptivos
- ✅ Logging condicional (solo en desarrollo)

### 3. Monitoreo de Conexión
- ✅ Indicador visual de estado de conexión
- ✅ Verificación automática cada 30 segundos
- ✅ Logs detallados para debugging

## Configuración Requerida

### Crear archivo `.env` en la raíz del proyecto:

```env
# Configuración de Supabase
REACT_APP_SUPABASE_URL=https://supabase.carvajalautotech.com
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ

# Configuración de la aplicación
REACT_APP_APP_NAME=Carvajal AutoTech
REACT_APP_VERSION=1.0.0
```

### Verificar Credenciales

1. **URL de Supabase**: Debe apuntar al proyecto correcto
2. **Clave Anónima**: Debe ser válida y tener permisos correctos
3. **Políticas RLS**: Deben estar configuradas correctamente

## Funcionalidades Agregadas

### 1. Componente ConnectionStatus
- Muestra estado de conexión en tiempo real
- Se actualiza automáticamente cada 30 segundos
- Click para verificar manualmente
- Indicadores visuales claros (✅ Conectado, ❌ Error, Verificando)

### 2. Login con Reintentos
- Verifica conectividad antes del login
- Reintenta automáticamente en caso de errores de red
- Mensajes de error específicos según el tipo de problema
- No reintenta para errores de credenciales

### 3. Logging Mejorado
- Logs solo en desarrollo (no en producción)
- Categorización de logs (DEBUG, ERROR, INFO)
- Información detallada para debugging

## Solución de Problemas

### Error: `net::ERR_NETWORK_CHANGED`
1. Verificar conexión a internet
2. Comprobar que el archivo `.env` existe
3. Verificar credenciales de Supabase
4. Revisar políticas RLS en Supabase

### Error: `Failed to fetch`
1. Verificar URL de Supabase
2. Comprobar firewall/proxy
3. Verificar que el proyecto de Supabase esté activo

### Error: `Invalid login credentials`
1. Verificar email y contraseña
2. Comprobar que el usuario existe en Supabase
3. Verificar que el email esté confirmado

## Próximos Pasos

1. **Crear archivo `.env`** con las credenciales correctas
2. **Reiniciar la aplicación** para cargar las variables de entorno
3. **Verificar el indicador de conexión** en la esquina superior derecha
4. **Probar el login** y verificar los logs en la consola

## Archivos Modificados

- ✅ `src/hooks/useAuth.js` - Login con reintentos
- ✅ `src/services/supabase.js` - Configuración mejorada
- ✅ `src/config/environment.js` - Configuración centralizada
- ✅ `src/components/ConnectionStatus.js` - Monitoreo de conexión
- ✅ `src/App.js` - Integración del componente de estado

## Notas Importantes

- El archivo `.env` debe estar en la raíz del proyecto (mismo nivel que `package.json`)
- Las variables de entorno deben comenzar con `REACT_APP_`
- Reiniciar la aplicación después de crear/modificar `.env`
- El indicador de conexión se actualiza automáticamente

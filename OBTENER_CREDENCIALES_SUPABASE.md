# 🔑 Instrucciones para Obtener Credenciales de Supabase

## ❌ Problema Actual

**Error**: `JWSError JWSInvalidSignature` y `401 Unauthorized`

**Causa**: Las credenciales actuales de Supabase han expirado o no son válidas.

## ✅ Solución Paso a Paso

### **1. Acceder al Dashboard de Supabase**

1. **Abrir navegador** y ir a: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Iniciar sesión** con tu cuenta de Supabase
3. **Seleccionar el proyecto** "Carvajal AutoTech" o el proyecto correspondiente

### **2. Obtener las Credenciales**

1. **Ir a Settings**:
   - En el menú lateral izquierdo, hacer clic en **"Settings"** (Configuración)
   - Luego hacer clic en **"API"**

2. **Copiar la Project URL**:
   - Buscar la sección **"Project URL"**
   - Copiar la URL completa (debe ser algo como: `https://xxxxxxxxxxxxx.supabase.co`)

3. **Copiar la anon public key**:
   - Buscar la sección **"Project API keys"**
   - Copiar la clave **"anon public"** (debe ser un JWT largo que empiece con `eyJ...`)

### **3. Actualizar el archivo .env**

1. **Abrir el archivo `.env`** en la raíz del proyecto
2. **Reemplazar las credenciales**:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tu-clave-completa-aqui
```

### **4. Reiniciar la Aplicación**

```bash
# Detener la aplicación (Ctrl+C en la terminal)
# Luego ejecutar:
npm start
```

## 🔍 Verificación

### **Credenciales Correctas**:
- ✅ **URL**: Debe ser `https://xxxxxxxxxxxxx.supabase.co` (no `supabase.carvajalautotech.com`)
- ✅ **Clave**: Debe ser un JWT largo que empiece con `eyJ` y tenga al menos 200 caracteres

### **Indicadores de Éxito**:
- ✅ El indicador de conexión muestra "Conectado" (verde)
- ✅ No hay errores `401 Unauthorized` en la consola
- ✅ La aplicación carga correctamente

## 🚨 Problemas Comunes

### **Si la URL es incorrecta**:
- La URL debe ser del formato: `https://xxxxxxxxxxxxx.supabase.co`
- **NO** debe ser: `https://supabase.carvajalautotech.com`

### **Si la clave es incorrecta**:
- La clave debe ser la **"anon public"** key
- **NO** debe ser la **"service_role"** key (esa es privada)
- Debe ser un JWT válido que empiece con `eyJ`

### **Si el proyecto no existe**:
- Verificar que el proyecto esté activo en Supabase
- Crear un nuevo proyecto si es necesario
- Verificar que tengas permisos de acceso al proyecto

## 📞 Contacto

Si necesitas ayuda:
1. **Verificar el estado del proyecto** en el dashboard de Supabase
2. **Contactar al administrador** del proyecto
3. **Revisar la documentación** de Supabase

## 🔄 Próximos Pasos

Una vez que tengas las credenciales correctas:
1. Actualizar el archivo `.env`
2. Reiniciar la aplicación
3. Verificar que la conexión funcione
4. Probar el login y las funcionalidades

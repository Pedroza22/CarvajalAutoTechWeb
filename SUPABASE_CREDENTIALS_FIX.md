# 🔑 Solución: Error de Credenciales de Supabase

## ❌ Problema Identificado

**Error**: `JWSError JWSInvalidSignature` y `401 Unauthorized`

**Causa**: Las credenciales de Supabase han expirado o son inválidas.

## ✅ Solución

### **1. Obtener Nuevas Credenciales de Supabase**

1. **Accede al Dashboard de Supabase**:
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Inicia sesión con tu cuenta

2. **Selecciona tu proyecto**:
   - Busca el proyecto "Carvajal AutoTech" o similar
   - Haz clic en el proyecto

3. **Obtén las credenciales**:
   - Ve a **Settings** → **API**
   - Copia la **Project URL**
   - Copia la **anon public** key

### **2. Actualizar el archivo .env**

Reemplaza el contenido del archivo `.env` con las nuevas credenciales:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tu-nueva-clave-aqui
```

### **3. Reiniciar la Aplicación**

```bash
# Detener la aplicación (Ctrl+C)
# Luego ejecutar:
npm start
```

## 🔍 Verificación

### **Indicadores de Éxito**:
- ✅ El indicador de conexión muestra "Conectado" (verde)
- ✅ No hay errores `401 Unauthorized` en la consola
- ✅ La aplicación carga correctamente sin quedarse en "Cargando..."

### **Indicadores de Problema**:
- ❌ Indicador de conexión muestra "Error de conexión" (rojo)
- ❌ Errores `JWSInvalidSignature` en la consola
- ❌ Aplicación se queda pegada en "Cargando..."

## 🛠️ Solución Temporal

Si no tienes acceso inmediato a las credenciales, puedes:

1. **Contactar al administrador** del proyecto Supabase
2. **Usar credenciales de desarrollo** si están disponibles
3. **Crear un nuevo proyecto** de Supabase para desarrollo

## 📋 Checklist de Verificación

- [ ] Credenciales de Supabase actualizadas
- [ ] Archivo `.env` modificado correctamente
- [ ] Aplicación reiniciada
- [ ] Indicador de conexión muestra "Conectado"
- [ ] No hay errores en la consola del navegador
- [ ] La aplicación carga completamente

## 🆘 Si el Problema Persiste

1. **Verifica la URL**: Asegúrate de que la URL de Supabase sea correcta
2. **Verifica la clave**: La clave anónima debe ser la correcta (anon public)
3. **Verifica el proyecto**: El proyecto debe estar activo en Supabase
4. **Verifica las políticas RLS**: Las políticas de seguridad pueden estar bloqueando el acceso

## 📞 Contacto

Si necesitas ayuda adicional:
- Revisa la documentación de Supabase
- Contacta al administrador del sistema
- Verifica el estado del proyecto en el dashboard de Supabase

# Instrucciones para Google Play Console - CarvajalAutoTech

## 📱 Configuración de Políticas de Privacidad

### 1. Alojar las Políticas de Privacidad

#### Opción A: GitHub Pages (Recomendado - Gratuito)
1. **Subir el archivo HTML a GitHub:**
   - Ve a tu repositorio: `https://github.com/Pedroza22/CarvajalAutoTechWeb`
   - Crea una nueva rama llamada `gh-pages`
   - Sube el archivo `politicas-privacidad.html` a la raíz de esta rama
   - Renómbralo a `index.html`

2. **Activar GitHub Pages:**
   - Ve a Settings > Pages en tu repositorio
   - Selecciona "Deploy from a branch"
   - Elige la rama `gh-pages`
   - Tu URL será: `https://pedroza22.github.io/CarvajalAutoTechWeb/`

#### Opción B: Netlify (Gratuito)
1. **Crear cuenta en Netlify:**
   - Ve a `https://netlify.com`
   - Conecta tu cuenta de GitHub
   - Selecciona tu repositorio

2. **Configurar deploy:**
   - Arrastra el archivo `politicas-privacidad.html` a Netlify
   - Renómbralo a `index.html`
   - Tu URL será: `https://[nombre-proyecto].netlify.app`

#### Opción C: Vercel (Gratuito)
1. **Crear cuenta en Vercel:**
   - Ve a `https://vercel.com`
   - Conecta tu cuenta de GitHub
   - Importa tu repositorio

2. **Configurar deploy:**
   - Coloca el archivo en la carpeta `public/`
   - Vercel lo desplegará automáticamente

### 2. Configuración en Google Play Console

#### Paso 1: Acceder a la Consola
1. Ve a `https://play.google.com/console`
2. Inicia sesión con tu cuenta de desarrollador
3. Selecciona tu aplicación "CarvajalAutoTech"

#### Paso 2: Configurar Políticas de Privacidad
1. **Ve a "Política" en el menú lateral**
2. **Selecciona "Política de la app"**
3. **En "Política de privacidad":**
   - Marca "Sí, mi app necesita una política de privacidad"
   - Ingresa la URL donde alojaste las políticas:
     - GitHub Pages: `https://pedroza22.github.io/CarvajalAutoTechWeb/`
     - Netlify: `https://[tu-proyecto].netlify.app`
     - Vercel: `https://[tu-proyecto].vercel.app`

#### Paso 3: Completar Información Adicional
1. **Categoría de contenido:**
   - Selecciona "Educación"
   - Marca "Contenido educativo"

2. **Datos de la app:**
   - **Nombre:** CarvajalAutoTech
   - **Descripción corta:** Aplicación educativa para aprendizaje automotriz
   - **Descripción completa:** [Usar la descripción de tu app]

3. **Información de contacto:**
   - **Email:** [tu-email@ejemplo.com]
   - **Sitio web:** [URL de tu sitio web o GitHub]

### 3. Configuración de Permisos

#### Permisos Requeridos (Android)
En tu archivo `android/app/src/main/AndroidManifest.xml`, asegúrate de tener:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### Declaración de Permisos en Play Console
1. **Ve a "Política" > "Declaración de la app"**
2. **Selecciona los permisos que usa tu app:**
   - Internet (para conectarse a Supabase)
   - Estado de red (para verificar conectividad)

### 4. Configuración de Datos Sensibles

#### En Play Console:
1. **Ve a "Política" > "Datos de la app"**
2. **Marca los tipos de datos que recopilas:**
   - ✅ Información personal (nombres, emails)
   - ✅ Información de la app (progreso educativo)
   - ✅ Identificadores (IDs de usuario)
   - ❌ Ubicación (si no la usas)
   - ❌ Información financiera (si no la usas)

3. **Para cada tipo de dato, especifica:**
   - **¿Se recopila?** Sí/No
   - **¿Se comparte?** No (para la mayoría)
   - **¿Se requiere?** Sí (para funcionalidad básica)

### 5. Configuración de Seguridad

#### En Play Console:
1. **Ve a "Política" > "Seguridad de la app"**
2. **Marca las opciones aplicables:**
   - ✅ La app maneja datos sensibles de manera segura
   - ✅ La app usa cifrado para datos en tránsito
   - ✅ La app tiene medidas de seguridad implementadas

### 6. Configuración de Menores

#### En Play Console:
1. **Ve a "Política" > "Familia"**
2. **Selecciona la categoría apropiada:**
   - **"Para todas las edades"** si es apropiado para niños
   - **"Para mayores de 13 años"** si tiene contenido más avanzado

3. **Si es para todas las edades:**
   - Completa el cuestionario de contenido familiar
   - Asegúrate de que tu política de privacidad mencione protección de menores

### 7. Checklist Final

Antes de enviar a revisión, verifica:

- [ ] ✅ Políticas de privacidad alojadas y accesibles
- [ ] ✅ URL de políticas configurada en Play Console
- [ ] ✅ Permisos declarados correctamente
- [ ] ✅ Tipos de datos especificados
- [ ] ✅ Configuración de seguridad completada
- [ ] ✅ Categoría de edad configurada
- [ ] ✅ Información de contacto actualizada
- [ ] ✅ Descripción de la app completa

### 8. URLs de Ejemplo

Una vez configurado, tu política de privacidad estará disponible en:

**GitHub Pages:**
```
https://pedroza22.github.io/CarvajalAutoTechWeb/
```

**Netlify:**
```
https://carvajalautotech-privacy.netlify.app
```

**Vercel:**
```
https://carvajalautotech-privacy.vercel.app
```

### 9. Comandos para GitHub Pages

Si eliges GitHub Pages, ejecuta estos comandos:

```bash
# Crear rama gh-pages
git checkout -b gh-pages

# Copiar el archivo HTML
cp politicas-privacidad.html index.html

# Subir a GitHub
git add index.html
git commit -m "Add privacy policy for Play Console"
git push origin gh-pages
```

### 10. Verificación

Después de configurar todo:

1. **Verifica que la URL funciona** en un navegador
2. **Prueba en diferentes dispositivos** (móvil, tablet)
3. **Asegúrate de que el contenido se vea bien**
4. **Verifica que todos los enlaces funcionen**

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. **Revisa la documentación de Google Play Console**
2. **Consulta el centro de ayuda de Google Play**
3. **Verifica que tu cuenta de desarrollador esté activa**
4. **Asegúrate de haber pagado la tarifa de registro ($25 USD)**

**¡Tu aplicación estará lista para ser publicada en Google Play Store!** 🚀

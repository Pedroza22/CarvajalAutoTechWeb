# Solución para Error de Bucket de Almacenamiento

## 🚨 Problema Identificado

```
StorageApiError: Bucket not found
```

El error indica que el bucket "images" no existe en tu proyecto de Supabase.

## 🔧 Soluciones Disponibles

### Opción 1: Crear Bucket desde Dashboard de Supabase (Recomendado)

#### Paso 1: Acceder al Dashboard
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **carvajalautotech**

#### Paso 2: Crear el Bucket
1. **Ve a "Storage" en el menú lateral**
2. **Haz clic en "New bucket"**
3. **Configura el bucket:**
   - **Name:** `images`
   - **Public bucket:** ✅ Marcar (para que las imágenes sean accesibles públicamente)
   - **File size limit:** `5 MB`
   - **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`

#### Paso 3: Configurar Políticas
1. **Ve a "Storage" > "Policies"**
2. **Crea las siguientes políticas:**

**Política 1: Upload para Admins**
```sql
CREATE POLICY "Admins can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

**Política 2: View para Todos**
```sql
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
```

**Política 3: Update para Admins**
```sql
CREATE POLICY "Admins can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

**Política 4: Delete para Admins**
```sql
CREATE POLICY "Admins can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Opción 2: Usar SQL Editor

#### Paso 1: Abrir SQL Editor
1. En el dashboard de Supabase, ve a **"SQL Editor"**
2. Haz clic en **"New query"**

#### Paso 2: Ejecutar Script
Copia y pega el siguiente script:

```sql
-- Crear bucket para imágenes de preguntas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Política para que los administradores puedan subir imágenes
CREATE POLICY "Admins can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política para que todos puedan ver las imágenes (público)
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Política para que los administradores puedan actualizar imágenes
CREATE POLICY "Admins can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política para que los administradores puedan eliminar imágenes
CREATE POLICY "Admins can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

3. **Haz clic en "Run"**

### Opción 3: Usar Service Role Key (Avanzado)

#### Paso 1: Obtener Service Role Key
1. Ve a **Settings > API** en tu dashboard de Supabase
2. Copia la **"service_role"** key (NO la anon key)

#### Paso 2: Usar el Script
1. Abre el archivo `create-bucket-manual.js`
2. Reemplaza `TU_SERVICE_ROLE_KEY_AQUI` con tu service role key
3. Ejecuta: `node create-bucket-manual.js`

## ✅ Verificación

Después de crear el bucket:

1. **Ve a Storage en tu dashboard**
2. **Verifica que el bucket "images" existe**
3. **Prueba subir una imagen desde tu aplicación**
4. **Verifica que las políticas están configuradas**

## 🔍 Troubleshooting

### Si el bucket sigue sin funcionar:

1. **Verifica las políticas:**
   - Ve a Storage > Policies
   - Asegúrate de que las políticas están activas

2. **Verifica los permisos:**
   - Asegúrate de que tu usuario tiene rol de "admin"
   - Verifica en Authentication > Users

3. **Verifica la configuración:**
   - El bucket debe ser público
   - Los tipos MIME deben incluir los formatos que usas

### Si las imágenes no se cargan:

1. **Verifica la URL:**
   - Las URLs deben ser: `https://supabase.carvajalautotech.com/storage/v1/object/public/images/[filename]`

2. **Verifica el formato:**
   - Solo se permiten: JPEG, PNG, GIF, WebP

3. **Verifica el tamaño:**
   - Máximo 5MB por archivo

## 📱 Configuración en la Aplicación

Una vez creado el bucket, tu aplicación debería funcionar automáticamente. Las URLs de las imágenes se generarán como:

```
https://supabase.carvajalautotech.com/storage/v1/object/public/images/[nombre-archivo]
```

## 🚀 Próximos Pasos

1. **Crear el bucket** usando una de las opciones anteriores
2. **Probar la funcionalidad** de subir imágenes
3. **Verificar que las imágenes se muestran** correctamente
4. **Continuar con el desarrollo** de la aplicación

---

**Nota:** Una vez que el bucket esté creado, el error "Bucket not found" desaparecerá y podrás subir imágenes sin problemas.

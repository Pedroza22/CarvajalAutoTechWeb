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

-- Política para que todos puedan ver las imágenes (público)
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Comentarios para documentación
COMMENT ON TABLE storage.buckets IS 'Buckets de almacenamiento para archivos';
COMMENT ON COLUMN storage.buckets.id IS 'ID único del bucket';
COMMENT ON COLUMN storage.buckets.name IS 'Nombre del bucket';
COMMENT ON COLUMN storage.buckets.public IS 'Si el bucket es público';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Límite de tamaño de archivo en bytes';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Tipos MIME permitidos';

import { supabase } from './supabase';

class StorageService {
  // Verificar si el bucket existe
  async checkBucketExists(bucketName = 'question_images') {
    try {
      console.log(`🔍 Verificando si el bucket '${bucketName}' existe...`);
      
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('❌ Error verificando buckets:', error);
        return false;
      }
      
      const bucketExists = data.some(bucket => bucket.id === bucketName);
      console.log(`✅ Bucket '${bucketName}' existe:`, bucketExists);
      
      return bucketExists;
    } catch (error) {
      console.error('❌ Error en checkBucketExists:', error);
      return false;
    }
  }

  // Crear bucket si no existe
  async createBucketIfNotExists(bucketName = 'question_images') {
    try {
      const exists = await this.checkBucketExists(bucketName);
      
      if (exists) {
        console.log(`✅ Bucket '${bucketName}' ya existe`);
        return true;
      }
      
      console.log(`📦 Creando bucket '${bucketName}'...`);
      
      // Nota: La creación de buckets requiere permisos de service role
      // Por ahora, solo verificamos si existe
      console.log(`⚠️ No se puede crear bucket automáticamente. Por favor crea el bucket '${bucketName}' manualmente en Supabase.`);
      
      return false;
    } catch (error) {
      console.error('❌ Error en createBucketIfNotExists:', error);
      return false;
    }
  }

  // Subir archivo al storage
  async uploadFile(file, bucketName = 'question_images', folder = '') {
    try {
      console.log('📤 Subiendo archivo...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: bucketName,
        folder: folder
      });

      // Verificar si el bucket existe
      const bucketExists = await this.checkBucketExists(bucketName);
      
      if (!bucketExists) {
        throw new Error(`El bucket '${bucketName}' no existe. Por favor crea el bucket en Supabase Dashboard > Storage.`);
      }

      // Validar archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('El archivo es demasiado grande. Máximo 5MB');
      }

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('📁 Ruta del archivo:', filePath);

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error subiendo archivo:', error);
        throw error;
      }

      console.log('✅ Archivo subido:', data);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('🔗 URL pública:', publicUrl);

      return {
        path: data.path,
        publicUrl: publicUrl,
        fileName: fileName
      };

    } catch (error) {
      console.error('❌ Error en uploadFile:', error);
      throw error;
    }
  }

  // Eliminar archivo del storage
  async deleteFile(filePath, bucketName = 'images') {
    try {
      console.log('🗑️ Eliminando archivo:', filePath);

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('❌ Error eliminando archivo:', error);
        throw error;
      }

      console.log('✅ Archivo eliminado');
      return true;

    } catch (error) {
      console.error('❌ Error en deleteFile:', error);
      throw error;
    }
  }

  // Obtener URL pública de un archivo
  getPublicUrl(filePath, bucketName = 'images') {
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  }

  // Listar archivos en un bucket
  async listFiles(bucketName = 'images', folder = 'questions') {
    try {
      console.log(`📋 Listando archivos en ${bucketName}/${folder}...`);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder);

      if (error) {
        console.error('❌ Error listando archivos:', error);
        throw error;
      }

      console.log('✅ Archivos listados:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Error en listFiles:', error);
      throw error;
    }
  }

  // Obtener información de un archivo
  async getFileInfo(filePath, bucketName = 'images') {
    try {
      console.log('ℹ️ Obteniendo información del archivo:', filePath);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('questions', {
          search: filePath
        });

      if (error) {
        console.error('❌ Error obteniendo información del archivo:', error);
        throw error;
      }

      return data?.[0] || null;

    } catch (error) {
      console.error('❌ Error en getFileInfo:', error);
      throw error;
    }
  }
}

const storageService = new StorageService();
export default storageService;

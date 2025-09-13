// Script para configurar el bucket de almacenamiento en Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorageBucket() {
  try {
    console.log('🔧 Configurando bucket de almacenamiento...');
    
    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError);
      return;
    }
    
    const imagesBucket = buckets.find(bucket => bucket.id === 'images');
    
    if (imagesBucket) {
      console.log('✅ Bucket "images" ya existe');
      return;
    }
    
    console.log('📦 Creando bucket "images"...');
    
    // Crear el bucket
    const { data, error } = await supabase.storage.createBucket('images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });
    
    if (error) {
      console.error('❌ Error creando bucket:', error);
      return;
    }
    
    console.log('✅ Bucket "images" creado exitosamente');
    
    // Verificar que se creó correctamente
    const { data: newBuckets, error: verifyError } = await supabase.storage.listBuckets();
    
    if (verifyError) {
      console.error('❌ Error verificando bucket:', verifyError);
      return;
    }
    
    const newImagesBucket = newBuckets.find(bucket => bucket.id === 'images');
    
    if (newImagesBucket) {
      console.log('✅ Bucket verificado correctamente');
      console.log('📊 Configuración del bucket:');
      console.log('   - ID:', newImagesBucket.id);
      console.log('   - Público:', newImagesBucket.public);
      console.log('   - Creado:', newImagesBucket.created_at);
    } else {
      console.error('❌ No se pudo verificar el bucket');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

setupStorageBucket();

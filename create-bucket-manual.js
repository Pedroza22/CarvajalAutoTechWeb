// Script manual para crear el bucket usando la API REST de Supabase
// Este script debe ejecutarse con las credenciales de servicio (service role key)

const SUPABASE_URL = 'https://supabase.carvajalautotech.com';
const SUPABASE_SERVICE_KEY = 'TU_SERVICE_ROLE_KEY_AQUI'; // Necesitas la service role key

async function createBucket() {
  try {
    console.log('🔧 Creando bucket de almacenamiento...');
    
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        id: 'images',
        name: 'images',
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error creando bucket:', error);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Bucket creado exitosamente:', data);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Instrucciones para usar este script:
console.log(`
📋 INSTRUCCIONES PARA CREAR EL BUCKET:

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: carvajalautotech
3. Ve a Settings > API
4. Copia la "service_role" key (NO la anon key)
5. Reemplaza 'TU_SERVICE_ROLE_KEY_AQUI' en este archivo con tu service role key
6. Ejecuta: node create-bucket-manual.js

⚠️  IMPORTANTE: La service role key es muy sensible, no la compartas públicamente.
`);

// Descomenta la siguiente línea cuando tengas la service role key:
// createBucket();

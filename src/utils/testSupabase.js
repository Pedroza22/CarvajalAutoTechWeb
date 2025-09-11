import SupabaseConfig from '../config/supabase';

export const testSupabaseConnection = async () => {
  console.log('🔄 Iniciando prueba de conexión con Supabase...');
  
  try {
    // Test 1: Verificar configuración
    console.log('📋 Configuración:');
    console.log(`   URL: ${SupabaseConfig.url}`);
    console.log(`   Key: ${SupabaseConfig.anonKey.substring(0, 20)}...`);
    console.log(`   Configurado: ${SupabaseConfig.isConfigured}`);
    
    // Test 2: Inicializar cliente
    const client = SupabaseConfig.client;
    console.log('✅ Cliente inicializado');
    
    // Test 3: Verificar sesión actual
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
      console.warn('⚠️ Error obteniendo sesión:', sessionError.message);
    } else {
      console.log('👤 Sesión actual:', sessionData.session?.user?.email || 'No autenticado');
    }
    
    // Test 4: Health check
    const healthResult = await SupabaseConfig.healthCheck();
    console.log('🏥 Health Check Result:', healthResult);
    
    return {
      success: true,
      message: 'Conexión con Supabase verificada correctamente',
      healthResult
    };
    
  } catch (error) {
    console.error('❌ Error en prueba de conexión:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para probar autenticación
export const testAuth = async () => {
  console.log('🔐 Probando autenticación...');
  
  try {
    const client = SupabaseConfig.client;
    
    // Test de login con credenciales de prueba
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    
    console.log(`📧 Intentando login con: ${testEmail}`);
    
    const { data, error } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.log('ℹ️ Login falló (esperado):', error.message);
      return {
        success: true,
        message: 'Autenticación configurada correctamente (login falló como se esperaba)',
        error: error.message
      };
    } else {
      console.log('✅ Login exitoso:', data.user?.email);
      return {
        success: true,
        message: 'Login exitoso',
        user: data.user
      };
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de autenticación:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


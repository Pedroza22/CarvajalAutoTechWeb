import { supabase } from './supabase';

class ExplanationsService {
  // Enviar explicaciones a un estudiante
  async sendExplanationsToStudent(studentId, categoryId, explanations, categoryName = null) {
    try {
      console.log('📤 Enviando explicaciones a la base de datos...');
      console.log('👤 Student ID:', studentId);
      console.log('📚 Category ID:', categoryId);
      console.log('📝 Explicaciones:', explanations);

      // Primero verificar si la tabla existe
      const { error: tableError } = await supabase
        .from('student_explanations')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('❌ Error verificando tabla:', tableError);
        // Si la tabla no existe, usar localStorage como alternativa temporal
        console.log('🔄 Tabla no existe, usando localStorage como alternativa...');
        
        try {
          // Guardar en localStorage como alternativa temporal
          const explanationsKey = `explanations_${studentId}_${categoryId}`;
          const explanationData = {
            student_id: studentId,
            category_id: categoryId,
            category_name: categoryName,
            explanations: explanations,
            sent_at: new Date().toISOString(),
            sent_by: 'admin',
            status: 'sent'
          };
          
          localStorage.setItem(explanationsKey, JSON.stringify(explanationData));
          
          // También guardar en clave consolidada
          const consolidatedKey = `student_explanations_${studentId}`;
          const existingConsolidated = localStorage.getItem(consolidatedKey);
          let consolidated = [];
          
          if (existingConsolidated) {
            try {
              consolidated = JSON.parse(existingConsolidated);
            } catch (parseError) {
              console.warn('⚠️ Error parseando explicaciones consolidadas existentes:', parseError);
              consolidated = [];
            }
          }
          
          // Agregar o actualizar la explicación en el array consolidado
          const existingIndex = consolidated.findIndex(exp => exp.category_id === categoryId);
          if (existingIndex >= 0) {
            consolidated[existingIndex] = explanationData;
          } else {
            consolidated.push(explanationData);
          }
          
          localStorage.setItem(consolidatedKey, JSON.stringify(consolidated));
          console.log('✅ Explicaciones guardadas en localStorage:', explanationData);
          console.log('✅ Explicaciones consolidadas actualizadas:', consolidated);
          return { success: true, data: explanationData, temporary: true };
        } catch (localError) {
          console.error('❌ Error guardando en localStorage:', localError);
          throw localError;
        }
      }

      // Insertar o actualizar las explicaciones enviadas
      const { data, error } = await supabase
        .from('student_explanations')
        .upsert({
          student_id: studentId,
          category_id: categoryId,
          category_name: categoryName,
          explanations: explanations,
          sent_at: new Date().toISOString(),
          sent_by: 'admin',
          status: 'sent'
        }, {
          onConflict: 'student_id,category_id'
        });

      if (error) {
        console.error('❌ Error guardando explicaciones:', error);
        throw error;
      }

      console.log('✅ Explicaciones guardadas en la base de datos:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en sendExplanationsToStudent:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener explicaciones enviadas a un estudiante
  async getSentExplanations(studentId) {
    try {
      // Primero intentar con la tabla principal
      const { data: mainData, error: mainError } = await supabase
        .from('student_explanations')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'sent');

      if (!mainError && mainData) {
        return { success: true, data: mainData || [] };
      }

      // Si la tabla principal no existe, usar localStorage
      console.log('🔄 Usando localStorage para obtener explicaciones...');
      
      try {
        const explanations = [];
        
        // Buscar todas las claves de localStorage que correspondan a explicaciones de este estudiante
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`explanations_${studentId}_`)) {
            try {
              const explanationData = JSON.parse(localStorage.getItem(key));
              console.log('🔍 Explicación encontrada en localStorage:', explanationData);
              
              if (explanationData && explanationData.status === 'sent') {
                explanations.push({
                  id: `local_${explanationData.category_id}`,
                  student_id: explanationData.student_id,
                  category_id: explanationData.category_id,
                  category_name: explanationData.category_name,
                  explanations: explanationData.explanations,
                  sent_at: explanationData.sent_at,
                  status: explanationData.status,
                  sent_by: explanationData.sent_by
                });
              }
            } catch (parseError) {
              console.warn('⚠️ Error parseando explicación de localStorage:', parseError);
            }
          }
        }

        // También buscar en una clave consolidada
        const consolidatedKey = `student_explanations_${studentId}`;
        const consolidatedData = localStorage.getItem(consolidatedKey);
        if (consolidatedData) {
          try {
            const consolidated = JSON.parse(consolidatedData);
            console.log('🔍 Explicaciones consolidadas encontradas:', consolidated);
            if (Array.isArray(consolidated)) {
              explanations.push(...consolidated);
            }
          } catch (parseError) {
            console.warn('⚠️ Error parseando explicaciones consolidadas:', parseError);
          }
        }

        console.log('✅ Explicaciones obtenidas de localStorage:', explanations);
        return { success: true, data: explanations };
      } catch (localError) {
        console.error('❌ Error obteniendo explicaciones de localStorage:', localError);
        throw localError;
      }
    } catch (error) {
      console.error('❌ Error en getSentExplanations:', error);
      return { success: false, error: error.message };
    }
  }

  // Marcar explicaciones como leídas por el estudiante
  async markAsRead(studentId, categoryId) {
    try {
      // Primero intentar con la tabla principal
      const { data: mainData, error: mainError } = await supabase
        .from('student_explanations')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('student_id', studentId)
        .eq('category_id', categoryId);

      if (!mainError) {
        return { success: true, data: mainData };
      }

      // Si la tabla principal no existe, usar localStorage
      console.log('🔄 Marcando como leído en localStorage...');
      
      try {
        const explanationsKey = `explanations_${studentId}_${categoryId}`;
        const explanationData = JSON.parse(localStorage.getItem(explanationsKey));
        
        if (explanationData) {
          explanationData.status = 'read';
          explanationData.read_at = new Date().toISOString();
          localStorage.setItem(explanationsKey, JSON.stringify(explanationData));
          console.log('✅ Explicación marcada como leída en localStorage');
          return { success: true, data: explanationData };
        } else {
          throw new Error('Explicación no encontrada en localStorage');
        }
      } catch (localError) {
        console.error('❌ Error marcando como leído en localStorage:', localError);
        throw localError;
      }
    } catch (error) {
      console.error('❌ Error en markAsRead:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas de explicaciones enviadas
  async getExplanationsStats(studentId) {
    try {
      const { data, error } = await supabase
        .from('student_explanations')
        .select('category_id, status, sent_at, read_at')
        .eq('student_id', studentId);

      if (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        sent: data?.filter(item => item.status === 'sent').length || 0,
        read: data?.filter(item => item.status === 'read').length || 0,
        pending: data?.filter(item => item.status === 'sent').length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Error en getExplanationsStats:', error);
      return { success: false, error: error.message };
    }
  }
}

const explanationsService = new ExplanationsService();
export default explanationsService;

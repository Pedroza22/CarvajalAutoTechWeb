import { supabase } from './supabase';

class QuizProgressService {
  // Guardar progreso del quiz en la base de datos
  async saveQuizProgress(studentId, categoryId, currentQuestionIndex, totalQuestions) {
    try {
      console.log(`💾 Guardando progreso: estudiante ${studentId}, categoría ${categoryId}, pregunta ${currentQuestionIndex + 1}/${totalQuestions}`);
      
      const { data, error } = await supabase
        .from('student_categories')
        .update({ 
          quiz_progress: currentQuestionIndex + 1 // +1 porque el índice es 0-based
        })
        .eq('student_id', studentId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error guardando progreso del quiz:', error);
        throw error;
      }

      console.log('✅ Progreso del quiz guardado en base de datos');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en saveQuizProgress:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener progreso del quiz desde la base de datos
  async getQuizProgress(studentId, categoryId) {
    try {
      console.log(`🔍 Obteniendo progreso: estudiante ${studentId}, categoría ${categoryId}`);
      
      const { data, error } = await supabase
        .from('student_categories')
        .select('quiz_progress, modo')
        .eq('student_id', studentId)
        .eq('category_id', categoryId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el registro
          console.log('ℹ️ No hay progreso guardado para esta categoría');
          return { success: true, data: null };
        }
        console.error('❌ Error obteniendo progreso del quiz:', error);
        throw error;
      }

      console.log('✅ Progreso obtenido:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en getQuizProgress:', error);
      return { success: false, error: error.message };
    }
  }

  // Limpiar progreso del quiz (cuando se completa)
  async clearQuizProgress(studentId, categoryId) {
    try {
      console.log(`🗑️ Limpiando progreso: estudiante ${studentId}, categoría ${categoryId}`);
      
      const { data, error } = await supabase
        .from('student_categories')
        .update({ 
          quiz_progress: null
        })
        .eq('student_id', studentId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error limpiando progreso del quiz:', error);
        throw error;
      }

      console.log('✅ Progreso del quiz limpiado');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en clearQuizProgress:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todos los progresos de un estudiante
  async getAllStudentProgress(studentId) {
    try {
      console.log(`📊 Obteniendo todos los progresos del estudiante: ${studentId}`);
      
      const { data, error } = await supabase
        .from('student_categories')
        .select('category_id, quiz_progress, modo, published')
        .eq('student_id', studentId);

      if (error) {
        console.error('❌ Error obteniendo progresos del estudiante:', error);
        throw error;
      }

      console.log('✅ Progresos del estudiante obtenidos:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en getAllStudentProgress:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new QuizProgressService();

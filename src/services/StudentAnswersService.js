import { supabase } from './supabase';

class StudentAnswersService {
  /**
   * Guardar respuesta de un estudiante
   */
  async saveAnswer({ questionId, answer, isCorrect, timeSpent }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // 1) Verificar si ya existe - evita duplicados
      const { data: existing } = await supabase
        .from('student_answers')
        .select('id')
        .eq('question_id', questionId)
        .eq('student_id', user.id);

      if (existing && existing.length > 0) {
        // Ya respondida: no intentar insertar de nuevo
        console.log('⚠️ Pregunta ya respondida, omitiendo...');
        return;
      }

      // 2) Insertar la respuesta
      const { error } = await supabase
        .from('student_answers')
        .insert({
          question_id: questionId,
          student_id: user.id,
          answer: answer,
          is_correct: isCorrect,
          time_spent: timeSpent,
          answered_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error guardando respuesta:', error);
      throw new Error(`Error guardando respuesta: ${error.message}`);
    }
  }

  /**
   * Obtener respuestas de un estudiante
   */
  async getStudentAnswers(studentId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetStudentId = studentId || user?.id;
      
      if (!targetStudentId) {
        throw new Error('ID de estudiante requerido');
      }

      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          *,
          questions (
            question,
            type,
            category_id,
            categories (name)
          )
        `)
        .eq('student_id', targetStudentId)
        .order('answered_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo respuestas:', error);
      return [];
    }
  }

  /**
   * Obtener respuestas por categoría
   */
  async getAnswersByCategory(categoryId, studentId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetStudentId = studentId || user?.id;
      
      if (!targetStudentId) {
        throw new Error('ID de estudiante requerido');
      }

      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          *,
          questions (
            question,
            type,
            category_id,
            categories (name)
          )
        `)
        .eq('student_id', targetStudentId)
        .eq('questions.category_id', categoryId)
        .order('answered_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo respuestas por categoría:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de respuestas de un estudiante
   */
  async getStudentStats(studentId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetStudentId = studentId || user?.id;
      
      if (!targetStudentId) {
        throw new Error('ID de estudiante requerido');
      }

      const { data, error } = await supabase
        .from('student_answers')
        .select('is_correct, time_spent, answered_at')
        .eq('student_id', targetStudentId);

      if (error) throw error;

      const answers = data || [];
      const totalAnswers = answers.length;
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const averageTime = answers.reduce((sum, a) => sum + (a.time_spent || 0), 0) / totalAnswers || 0;
      const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      return {
        totalAnswers,
        correctAnswers,
        incorrectAnswers: totalAnswers - correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        averageTime: Math.round(averageTime),
        lastActivity: answers.length > 0 ? answers[0].answered_at : null
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        lastActivity: null
      };
    }
  }

  /**
   * Verificar si una pregunta ya fue respondida
   */
  async isQuestionAnswered(questionId, studentId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetStudentId = studentId || user?.id;
      
      if (!targetStudentId) {
        return false;
      }

      const { data, error } = await supabase
        .from('student_answers')
        .select('id')
        .eq('question_id', questionId)
        .eq('student_id', targetStudentId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error verificando respuesta:', error);
      return false;
    }
  }

  /**
   * Eliminar respuesta (para testing o corrección)
   */
  async deleteAnswer(questionId, studentId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetStudentId = studentId || user?.id;
      
      if (!targetStudentId) {
        throw new Error('ID de estudiante requerido');
      }

      const { error } = await supabase
        .from('student_answers')
        .delete()
        .eq('question_id', questionId)
        .eq('student_id', targetStudentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error eliminando respuesta:', error);
      throw new Error(`Error eliminando respuesta: ${error.message}`);
    }
  }
}

export default new StudentAnswersService();


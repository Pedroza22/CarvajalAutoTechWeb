import { supabase } from './supabase';

class StudentAnswerService {
  /**
   * Guardar respuesta de un estudiante
   */
  async saveStudentAnswer({ questionId, studentId, answer, timeSpent }) {
    try {
      // Primero obtener la pregunta para verificar la respuesta correcta
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('correct_answer')
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;

      const isCorrect = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();

      const { data, error } = await supabase
        .from('student_answers')
        .insert({
          question_id: questionId,
          student_id: studentId,
          answer: answer.trim(),
          is_correct: isCorrect,
          time_spent: timeSpent,
          answered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: { ...data, isCorrect } };
    } catch (error) {
      console.error('❌ Error guardando respuesta del estudiante:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener respuestas de un estudiante para una pregunta específica
   */
  async getStudentAnswersForQuestion(questionId, studentId) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('*')
        .eq('question_id', questionId)
        .eq('student_id', studentId)
        .order('answered_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Error obteniendo respuestas del estudiante:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Obtener todas las respuestas de un estudiante
   */
  async getStudentAnswers(studentId) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          *,
          questions (
            id,
            question,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('student_id', studentId)
        .order('answered_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Error obteniendo respuestas del estudiante:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Obtener estadísticas de un estudiante
   */
  async getStudentStatistics(studentId) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('is_correct, time_spent, questions(category_id, categories(name))')
        .eq('student_id', studentId);

      if (error) throw error;

      const totalAnswers = data.length;
      const correctAnswers = data.filter(answer => answer.is_correct).length;
      const incorrectAnswers = totalAnswers - correctAnswers;
      const accuracyPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
      
      const averageTimeSpent = data.length > 0 
        ? data.reduce((sum, answer) => sum + (answer.time_spent || 0), 0) / data.length 
        : 0;

      // Estadísticas por categoría
      const categoryStats = {};
      data.forEach(answer => {
        const categoryName = answer.questions?.categories?.name || 'Sin categoría';
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { total: 0, correct: 0 };
        }
        categoryStats[categoryName].total++;
        if (answer.is_correct) {
          categoryStats[categoryName].correct++;
        }
      });

      return {
        success: true,
        data: {
          totalAnswers,
          correctAnswers,
          incorrectAnswers,
          accuracyPercentage: Math.round(accuracyPercentage * 100) / 100,
          averageTimeSpent: Math.round(averageTimeSpent * 100) / 100,
          categoryStats
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del estudiante:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener estadísticas de una pregunta (para admins)
   */
  async getQuestionStatistics(questionId) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('is_correct, time_spent')
        .eq('question_id', questionId);

      if (error) throw error;

      const totalAnswers = data.length;
      const correctAnswers = data.filter(answer => answer.is_correct).length;
      const incorrectAnswers = totalAnswers - correctAnswers;
      const accuracyPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
      
      const averageTimeSpent = data.length > 0 
        ? data.reduce((sum, answer) => sum + (answer.time_spent || 0), 0) / data.length 
        : 0;

      return {
        success: true,
        data: {
          questionId,
          totalAnswers,
          correctAnswers,
          incorrectAnswers,
          accuracyPercentage: Math.round(accuracyPercentage * 100) / 100,
          averageTimeSpent: Math.round(averageTimeSpent * 100) / 100
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de la pregunta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar respuesta de un estudiante (para admins)
   */
  async deleteStudentAnswer(answerId) {
    try {
      const { error } = await supabase
        .from('student_answers')
        .delete()
        .eq('id', answerId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando respuesta del estudiante:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener respuestas recientes de un estudiante
   */
  async getRecentAnswers(studentId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          *,
          questions (
            id,
            question,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('student_id', studentId)
        .order('answered_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Error obteniendo respuestas recientes:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

export const studentAnswerService = new StudentAnswerService();


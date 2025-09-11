import { supabase } from './supabase';

class QuestionsService {
  /**
   * Obtener todas las preguntas (admin: solo las suyas, student: solo lectura)
   */
  async getQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo preguntas:', error);
      throw new Error(`Error obteniendo preguntas: ${error.message}`);
    }
  }

  /**
   * Obtener preguntas por categoría
   */
  async getQuestionsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo preguntas por categoría:', error);
      throw new Error(`Error obteniendo preguntas por categoría: ${error.message}`);
    }
  }

  /**
   * Crear una nueva pregunta (solo admins)
   */
  async createQuestion(questionForm) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('questions')
        .insert({
          category_id: questionForm.categoryId,
          type: questionForm.type,
          question: questionForm.question,
          options: questionForm.options,
          correct_answer: questionForm.correctAnswer,
          time_limit: questionForm.timeLimit,
          image_url: questionForm.imageUrl, // Soporte para imágenes
          explanation: questionForm.explanation,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creando pregunta:', error);
      throw new Error(`Error creando pregunta: ${error.message}`);
    }
  }

  /**
   * Actualizar pregunta (solo admins dueños de la pregunta)
   */
  async updateQuestion(questionForm) {
    if (!questionForm.id) {
      throw new Error('ID requerido para actualizar la pregunta');
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .update({
          category_id: questionForm.categoryId,
          type: questionForm.type,
          question: questionForm.question,
          options: questionForm.options,
          correct_answer: questionForm.correctAnswer,
          time_limit: questionForm.timeLimit,
          image_url: questionForm.imageUrl,
          explanation: questionForm.explanation,
        })
        .eq('id', questionForm.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error actualizando pregunta:', error);
      throw new Error(`Error actualizando pregunta: ${error.message}`);
    }
  }

  /**
   * Eliminar pregunta (solo admins dueños de la pregunta)
   */
  async deleteQuestion(questionId) {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error eliminando pregunta:', error);
      throw new Error(`Error eliminando pregunta: ${error.message}`);
    }
  }

  /**
   * Obtener pregunta por ID
   */
  async getQuestionById(id) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo pregunta:', error);
      throw new Error(`Error obteniendo pregunta: ${error.message}`);
    }
  }

  /**
   * Obtener preguntas para un quiz (con límite y aleatorización)
   */
  async getQuestionsForQuiz(categoryId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;
      
      // Aleatorizar las preguntas
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      return shuffled;
    } catch (error) {
      console.error('❌ Error obteniendo preguntas para quiz:', error);
      throw new Error(`Error obteniendo preguntas para quiz: ${error.message}`);
    }
  }

  /**
   * Validar respuesta de una pregunta
   */
  validateAnswer(question, userAnswer) {
    if (!question || !userAnswer) return false;
    
    switch (question.type) {
      case 'multiple_choice':
        return question.correct_answer === userAnswer;
      case 'true_false':
        return question.correct_answer === userAnswer;
      case 'text':
        return question.correct_answer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
      default:
        return false;
    }
  }
}

export default new QuestionsService();
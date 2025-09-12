import { supabase } from './supabase';

class QuestionsService {
  // Obtener todas las preguntas
  async getQuestions() {
    try {
      console.log('🔍 Obteniendo todas las preguntas...');
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo preguntas:', error);
        throw error;
      }

      console.log('✅ Preguntas obtenidas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getQuestions:', error);
      throw error;
    }
  }

  // Obtener pregunta por ID
  async getQuestionById(questionId) {
    try {
      console.log('🔍 Obteniendo pregunta por ID:', questionId);
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', questionId)
        .single();

      if (error) {
        console.error('❌ Error obteniendo pregunta:', error);
        throw error;
      }

      console.log('✅ Pregunta obtenida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en getQuestionById:', error);
      throw error;
    }
  }

  // Crear nueva pregunta
  async createQuestion(questionData) {
    try {
      console.log('🔍 Creando nueva pregunta...');
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('🔍 Datos de la pregunta:', {
        categoryId: questionData.categoryId,
        type: questionData.type,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        timeLimit: questionData.timeLimit,
        imageUrl: questionData.imageUrl,
        explanation: questionData.explanation,
        userId: user?.id
      });
      
      // Mapear tipos de pregunta como en Flutter
      const typeMapping = {
        'multiple_choice': 'multipleChoice',
        'true_false': 'trueFalse', 
        'free_text': 'freeText'
      };

      // Preparar datos para insertar (alineado con Flutter)
      const insertData = {
        category_id: questionData.categoryId,
        type: typeMapping[questionData.type] || questionData.type, // Usar mapeo de Flutter
        question: questionData.question, // Campo 'question' como en Flutter
        options: questionData.options,
        correct_answer: questionData.correctAnswer,
        time_limit: questionData.timeLimit,
        explanation: questionData.explanation,
        created_by: user?.id
      };

      // Solo agregar imageUrl si existe (como en Flutter)
      if (questionData.imageUrl) {
        insertData.imageUrl = questionData.imageUrl;
      }

      const { data, error } = await supabase
        .from('questions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando pregunta:', error);
        throw error;
      }

      console.log('✅ Pregunta creada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en createQuestion:', error);
      throw error;
    }
  }

  // Actualizar pregunta
  async updateQuestion(questionId, questionData) {
    try {
      console.log('🔍 Actualizando pregunta:', questionId);
      
      // Mapear tipos de pregunta como en Flutter
      const typeMapping = {
        'multiple_choice': 'multipleChoice',
        'true_false': 'trueFalse', 
        'free_text': 'freeText'
      };

      // Preparar datos para actualizar (alineado con Flutter)
      const updateData = {
        category_id: questionData.categoryId,
        type: typeMapping[questionData.type] || questionData.type, // Usar mapeo de Flutter
        question: questionData.question, // Campo 'question' como en Flutter
        options: questionData.options,
        correct_answer: questionData.correctAnswer,
        time_limit: questionData.timeLimit,
        explanation: questionData.explanation
      };

      // Solo agregar imageUrl si existe (como en Flutter)
      if (questionData.imageUrl) {
        updateData.imageUrl = questionData.imageUrl;
      }
      
      const { data, error } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', questionId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando pregunta:', error);
        throw error;
      }

      console.log('✅ Pregunta actualizada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en updateQuestion:', error);
      throw error;
    }
  }

  // Eliminar pregunta
  async deleteQuestion(questionId) {
    try {
      console.log('🔍 Eliminando pregunta:', questionId);
      
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        console.error('❌ Error eliminando pregunta:', error);
        throw error;
      }

      console.log('✅ Pregunta eliminada');
      return true;
    } catch (error) {
      console.error('❌ Error en deleteQuestion:', error);
      throw error;
    }
  }

  // Obtener preguntas por categoría
  async getQuestionsByCategory(categoryId) {
    try {
      console.log('🔍 Obteniendo preguntas por categoría:', categoryId);
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo preguntas por categoría:', error);
        throw error;
      }

      console.log('✅ Preguntas por categoría obtenidas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getQuestionsByCategory:', error);
      throw error;
    }
  }

  // Función auxiliar para formatear tipo de pregunta
  formatQuestionType(type) {
    const typeMap = {
      'multiple_choice': 'Opción Múltiple',
      'true_false': 'Verdadero/Falso',
      'free_text': 'Texto Libre'
    };
    return typeMap[type] || type;
  }

  // Función auxiliar para obtener icono según tipo
  getQuestionTypeIcon(type) {
    const iconMap = {
      'multiple_choice': '🔘',
      'true_false': '☑️',
      'free_text': '📝'
    };
    return iconMap[type] || '❓';
  }
}

export default new QuestionsService();
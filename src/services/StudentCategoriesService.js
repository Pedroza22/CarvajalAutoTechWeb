import { supabase } from './supabase';

class StudentCategoriesService {
  // Obtener categorías asignadas a un estudiante específico
  static async getAssignedCategories(studentId) {
    try {
      console.log('🔍 Obteniendo categorías asignadas para estudiante:', studentId);

      // Obtener las categorías asignadas al estudiante
      const { data: assignedCategories, error: assignedError } = await supabase
        .from('student_categories')
        .select(`
          category_id,
          published,
          categories (
            id,
            name,
            description,
            color,
            icon,
            is_active,
            created_at
          )
        `)
        .eq('student_id', studentId);

      if (assignedError) {
        console.error('❌ Error obteniendo categorías asignadas:', assignedError);
        throw assignedError;
      }

      // Filtrar solo las categorías activas y con datos completos
      const validCategories = assignedCategories
        ?.filter(item => item.categories && item.categories.is_active)
        ?.map(item => ({
          ...item.categories,
          isPublished: item.published,
          assignedAt: item.created_at
        })) || [];

      console.log('✅ Categorías asignadas obtenidas:', validCategories.length);
      return validCategories;
    } catch (error) {
      console.error('❌ Error en getAssignedCategories:', error);
      throw error;
    }
  }

  // Obtener preguntas de una categoría específica para un estudiante
  static async getCategoryQuestions(categoryId, studentId) {
    try {
      console.log('🔍 Obteniendo preguntas para categoría:', categoryId, 'estudiante:', studentId);

      // Verificar que el estudiante tenga acceso a esta categoría
      const { data: hasAccess, error: accessError } = await supabase
        .from('student_categories')
        .select('id')
        .eq('student_id', studentId)
        .eq('category_id', categoryId)
        .single();

      if (accessError || !hasAccess) {
        throw new Error('No tienes acceso a esta categoría');
      }

      // Obtener las preguntas de la categoría
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question,
          type,
          options,
          correct_answer,
          explanation,
          time_limit,
          image_url,
          created_at
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('❌ Error obteniendo preguntas:', questionsError);
        throw questionsError;
      }

      console.log('✅ Preguntas obtenidas:', questions?.length || 0);
      return questions || [];
    } catch (error) {
      console.error('❌ Error en getCategoryQuestions:', error);
      throw error;
    }
  }

  // Obtener estadísticas de un estudiante para una categoría específica
  static async getCategoryStats(studentId, categoryId) {
    try {
      console.log('🔍 Obteniendo estadísticas para estudiante:', studentId, 'categoría:', categoryId);

      // Obtener respuestas del estudiante para esta categoría
      const { data: responses, error: responsesError } = await supabase
        .from('student_responses')
        .select(`
          id,
          is_correct,
          created_at,
          questions (
            id,
            category_id
          )
        `)
        .eq('student_id', studentId)
        .eq('questions.category_id', categoryId);

      if (responsesError) {
        console.error('❌ Error obteniendo respuestas:', responsesError);
        throw responsesError;
      }

      const totalAnswers = responses?.length || 0;
      const correctAnswers = responses?.filter(r => r.is_correct).length || 0;
      const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      // Obtener la última actividad
      const lastActivity = responses?.length > 0 
        ? responses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null;

      const stats = {
        totalAnswers,
        correctAnswers,
        incorrectAnswers: totalAnswers - correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        lastActivity: lastActivity ? new Date(lastActivity.created_at) : null
      };

      console.log('✅ Estadísticas obtenidas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error en getCategoryStats:', error);
      throw error;
    }
  }

  // Obtener todas las estadísticas del estudiante
  static async getAllStudentStats(studentId) {
    try {
      console.log('🔍 Obteniendo todas las estadísticas para estudiante:', studentId);

      // Obtener todas las respuestas del estudiante
      const { data: responses, error: responsesError } = await supabase
        .from('student_responses')
        .select(`
          id,
          is_correct,
          created_at,
          questions (
            id,
            category_id,
            categories (
              id,
              name
            )
          )
        `)
        .eq('student_id', studentId);

      if (responsesError) {
        console.error('❌ Error obteniendo respuestas:', responsesError);
        throw responsesError;
      }

      const totalAnswers = responses?.length || 0;
      const correctAnswers = responses?.filter(r => r.is_correct).length || 0;
      const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      // Calcular racha (días consecutivos con actividad)
      const streak = this.calculateStreak(responses || []);

      const stats = {
        totalAnswers,
        correctAnswers,
        incorrectAnswers: totalAnswers - correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        streak
      };

      console.log('✅ Estadísticas generales obtenidas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error en getAllStudentStats:', error);
      throw error;
    }
  }

  // Calcular racha de días consecutivos
  static calculateStreak(responses) {
    if (!responses || responses.length === 0) return 0;

    // Agrupar respuestas por día
    const responsesByDay = {};
    responses.forEach(response => {
      const date = new Date(response.created_at).toDateString();
      if (!responsesByDay[date]) {
        responsesByDay[date] = [];
      }
      responsesByDay[date].push(response);
    });

    // Ordenar fechas
    const dates = Object.keys(responsesByDay).sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Si hay actividad hoy o ayer, empezar a contar
    if (dates.includes(today) || dates.includes(yesterday)) {
      streak = 1;
      
      // Contar días consecutivos hacia atrás
      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        const previousDate = new Date(dates[i - 1]);
        const diffDays = (previousDate - currentDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  }
}

export default StudentCategoriesService;

import { supabase } from './supabase';

class StatisticsService {
  /**
   * Obtiene el resumen general de estadísticas.
   * Si el usuario es estudiante, devuelve sus propios datos.
   * Si el usuario es admin, se puede traer datos agregados.
   */
  async getOverallStats(userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new Error('ID de usuario requerido');
      }

      const { data, error } = await supabase
        .from('stats_overall')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas generales:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas por categoría para un usuario.
   */
  async getCategoryStats(userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new Error('ID de usuario requerido');
      }

      const { data, error } = await supabase
        .from('stats_by_category')
        .select('*')
        .eq('user_id', targetUserId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas por categoría:', error);
      return [];
    }
  }

  /**
   * Obtiene el top 5 de estudiantes (solo admin).
   */
  async getTopStudents() {
    try {
      const { data, error } = await supabase
        .from('stats_top_students')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo top estudiantes:', error);
      return [];
    }
  }

  /**
   * Obtiene tendencias de respuestas por día para un usuario.
   */
  async getTrends(userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new Error('ID de usuario requerido');
      }

      const { data, error } = await supabase
        .from('stats_trends')
        .select('*')
        .eq('user_id', targetUserId)
        .order('day', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo tendencias:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas personalizadas para el dashboard
   */
  async getDashboardStats(userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new Error('ID de usuario requerido');
      }

      // Obtener estadísticas generales
      const overallStats = await this.getOverallStats(targetUserId);
      
      // Obtener estadísticas por categoría
      const categoryStats = await this.getCategoryStats(targetUserId);
      
      // Obtener tendencias de los últimos 7 días
      const trends = await this.getTrends(targetUserId);
      const recentTrends = trends.slice(-7); // Últimos 7 días

      // Calcular métricas adicionales
      const totalQuestions = categoryStats.reduce((sum, cat) => sum + (cat.total_questions || 0), 0);
      const totalCorrect = categoryStats.reduce((sum, cat) => sum + (cat.correct_answers || 0), 0);
      const totalIncorrect = categoryStats.reduce((sum, cat) => sum + (cat.incorrect_answers || 0), 0);
      const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      // Encontrar la categoría con mejor rendimiento
      const bestCategory = categoryStats.reduce((best, current) => {
        const currentAccuracy = current.total_questions > 0 ? 
          (current.correct_answers / current.total_questions) * 100 : 0;
        const bestAccuracy = best.total_questions > 0 ? 
          (best.correct_answers / best.total_questions) * 100 : 0;
        return currentAccuracy > bestAccuracy ? current : best;
      }, categoryStats[0] || {});

      // Encontrar la categoría que necesita más práctica
      const needsPractice = categoryStats.reduce((worst, current) => {
        const currentAccuracy = current.total_questions > 0 ? 
          (current.correct_answers / current.total_questions) * 100 : 100;
        const worstAccuracy = worst.total_questions > 0 ? 
          (worst.correct_answers / worst.total_questions) * 100 : 100;
        return currentAccuracy < worstAccuracy ? current : worst;
      }, categoryStats[0] || {});

      return {
        overall: {
          totalQuestions,
          totalCorrect,
          totalIncorrect,
          accuracy: Math.round(overallAccuracy * 100) / 100,
          ...overallStats
        },
        categories: categoryStats,
        trends: recentTrends,
        insights: {
          bestCategory: bestCategory?.category_name || 'N/A',
          needsPractice: needsPractice?.category_name || 'N/A',
          totalCategories: categoryStats.length,
          activeCategories: categoryStats.filter(cat => cat.total_questions > 0).length
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del dashboard:', error);
      return {
        overall: {
          totalQuestions: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          accuracy: 0
        },
        categories: [],
        trends: [],
        insights: {
          bestCategory: 'N/A',
          needsPractice: 'N/A',
          totalCategories: 0,
          activeCategories: 0
        }
      };
    }
  }

  /**
   * Obtiene estadísticas para administradores
   */
  async getAdminStats() {
    try {
      // Verificar que el usuario es admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.role === 'admin') {
        throw new Error('Acceso denegado: se requieren permisos de administrador');
      }

      // Obtener top estudiantes (si existe la vista)
      let topStudents = [];
      try {
        topStudents = await this.getTopStudents();
      } catch (_) {
        topStudents = [];
      }

      // Calcular estadísticas generales sin depender de vistas
      const countExact = { count: 'exact', head: true };
      // Total preguntas
      const qRes = await supabase.from('questions').select('*', countExact);
      const totalQuestions = qRes?.count || 0;
      // Respuestas totales
      let totalAnswers = 0;
      try {
        const aRes = await supabase.from('student_answers').select('*', countExact);
        totalAnswers = aRes?.count || 0;
      } catch (_) {}
      // Estudiantes totales
      let totalStudents = 0;
      try {
        const sRes = await supabase.from('user_profiles').select('*', countExact).eq('role', 'student');
        totalStudents = sRes?.count || 0;
      } catch (_) {}
      // Precisión promedio aproximada (si hay vista de agregados la tomamos; si no, 0 por ahora)
      let averageAccuracy = 0;
      try {
        const accRes = await supabase.from('stats_overall').select('*').limit(1);
        if (Array.isArray(accRes) && accRes[0]?.average_accuracy != null) {
          averageAccuracy = accRes[0].average_accuracy;
        }
      } catch (_) {}

      const systemStats = {
        total_questions: totalQuestions,
        total_answers: totalAnswers,
        total_students: totalStudents,
        average_accuracy: averageAccuracy
      };

      // Evitar depender de vistas inexistentes: no llamar stats_categories_system
      const categoryStats = [];

      return {
        topStudents: topStudents || [],
        systemStats: systemStats || {},
        categoryStats: categoryStats || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de admin:', error);
      return {
        topStudents: [],
        systemStats: {},
        categoryStats: [],
        lastUpdated: null
      };
    }
  }

  /**
   * Genera un reporte de progreso para un estudiante
   */
  async generateProgressReport(userId = null, days = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new Error('ID de usuario requerido');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener respuestas del período
      const { data: answers, error } = await supabase
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
        .eq('student_id', targetUserId)
        .gte('answered_at', startDate.toISOString())
        .order('answered_at', { ascending: true });

      if (error) throw error;

      // Procesar datos para el reporte
      const dailyProgress = {};
      const categoryProgress = {};
      let totalCorrect = 0;
      let totalIncorrect = 0;

      answers.forEach(answer => {
        const date = answer.answered_at.split('T')[0];
        const categoryName = answer.questions?.categories?.name || 'Sin categoría';

        // Progreso diario
        if (!dailyProgress[date]) {
          dailyProgress[date] = { correct: 0, incorrect: 0, total: 0 };
        }
        dailyProgress[date].total++;
        if (answer.is_correct) {
          dailyProgress[date].correct++;
          totalCorrect++;
        } else {
          dailyProgress[date].incorrect++;
          totalIncorrect++;
        }

        // Progreso por categoría
        if (!categoryProgress[categoryName]) {
          categoryProgress[categoryName] = { correct: 0, incorrect: 0, total: 0 };
        }
        categoryProgress[categoryName].total++;
        if (answer.is_correct) {
          categoryProgress[categoryName].correct++;
        } else {
          categoryProgress[categoryName].incorrect++;
        }
      });

      return {
        period: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
          days
        },
        summary: {
          totalAnswers: totalCorrect + totalIncorrect,
          correctAnswers: totalCorrect,
          incorrectAnswers: totalIncorrect,
          accuracy: totalCorrect + totalIncorrect > 0 ? 
            Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 10000) / 100 : 0
        },
        dailyProgress: Object.entries(dailyProgress).map(([date, stats]) => ({
          date,
          ...stats,
          accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 10000) / 100 : 0
        })),
        categoryProgress: Object.entries(categoryProgress).map(([category, stats]) => ({
          category,
          ...stats,
          accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 10000) / 100 : 0
        }))
      };
    } catch (error) {
      console.error('❌ Error generando reporte de progreso:', error);
      return null;
    }
  }
}

export default new StatisticsService();


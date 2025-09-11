import { supabase } from '../config/supabase';

class StatisticsService {
  /**
   * Obtiene estadísticas generales del sistema para administradores
   * @param {string} period - Período de tiempo ('7d', '30d', '90d', '1y')
   * @returns {Promise<Object>} Estadísticas del sistema
   */
  async getAdminStatistics(period = '30d') {
    try {
      console.log('📊 Cargando estadísticas del sistema...');
      
      // Calcular fechas según el período
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Obtener estadísticas en paralelo
      const [
        totalStudents,
        totalQuestions,
        totalCategories,
        totalQuizzes,
        averageScore,
        completionRate,
        recentActivity,
        categoryStats,
        difficultyStats,
        monthlyStats
      ] = await Promise.all([
        this.getTotalStudents(),
        this.getTotalQuestions(),
        this.getTotalCategories(),
        this.getTotalQuizzes(),
        this.getAverageScore(),
        this.getCompletionRate(),
        this.getRecentActivity(startDate, endDate),
        this.getCategoryStats(),
        this.getDifficultyStats(),
        this.getMonthlyStats(startDate, endDate)
      ]);

      const statistics = {
        totalStudents,
        totalQuestions,
        totalCategories,
        totalQuizzes,
        averageScore,
        completionRate,
        recentActivity,
        categoryStats,
        difficultyStats,
        monthlyStats
      };

      console.log('✅ Estadísticas cargadas:', statistics);
      return statistics;
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtiene el total de estudiantes activos
   */
  async getTotalStudents() {
    try {
      const { count, error } = await supabase
        .from('app_users')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de estudiantes:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de preguntas
   */
  async getTotalQuestions() {
    try {
      const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de preguntas:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de categorías
   */
  async getTotalCategories() {
    try {
      const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de categorías:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de quizzes completados
   */
  async getTotalQuizzes() {
    try {
      const { count, error } = await supabase
        .from('student_answers')
        .select('quiz_id', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error obteniendo total de quizzes:', error);
      return 0;
    }
  }

  /**
   * Obtiene la puntuación promedio
   */
  async getAverageScore() {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('is_correct');

      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const correctAnswers = data.filter(answer => answer.is_correct).length;
      const totalAnswers = data.length;
      
      return totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    } catch (error) {
      console.error('Error obteniendo puntuación promedio:', error);
      return 0;
    }
  }

  /**
   * Obtiene la tasa de finalización
   */
  async getCompletionRate() {
    try {
      // Obtener total de estudiantes
      const { count: totalStudents, error: studentsError } = await supabase
        .from('app_users')
        .select('*', { count: 'exact', head: true });

      if (studentsError) throw studentsError;

      // Obtener estudiantes que han completado al menos un quiz
      const { count: activeStudents, error: activeError } = await supabase
        .from('student_answers')
        .select('student_id', { count: 'exact', head: true });

      if (activeError) throw activeError;

      if (!totalStudents || totalStudents === 0) return 0;
      
      return Math.round((activeStudents / totalStudents) * 100);
    } catch (error) {
      console.error('Error obteniendo tasa de finalización:', error);
      return 0;
    }
  }

  /**
   * Obtiene actividad reciente
   */
  async getRecentActivity(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          created_at,
          student_id,
          is_correct,
          questions (
            question,
            categories (
              name
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data) return [];

      // Transformar datos para el formato esperado
      return data.map(activity => ({
        type: 'quiz_completed',
        student: `Estudiante ${activity.student_id.substring(0, 8)}`,
        score: activity.is_correct ? 100 : 0,
        date: activity.created_at,
        category: activity.questions?.categories?.name || 'Sin categoría'
      }));
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas por categoría
   */
  async getCategoryStats() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          questions (
            id,
            student_answers (
              id,
              is_correct
            )
          )
        `);

      if (error) throw error;

      if (!data) return [];

      return data.map(category => {
        const questions = category.questions || [];
        const totalQuestions = questions.length;
        
        const allAnswers = questions.flatMap(q => q.student_answers || []);
        const totalAnswers = allAnswers.length;
        const correctAnswers = allAnswers.filter(a => a.is_correct).length;
        
        const avgScore = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

        return {
          name: category.name,
          questions: totalQuestions,
          quizzes: Math.ceil(totalAnswers / 10), // Estimación de quizzes
          avgScore
        };
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas por categoría:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas por dificultad
   */
  async getDifficultyStats() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('difficulty');

      if (error) throw error;

      if (!data) return [];

      const difficultyCounts = data.reduce((acc, question) => {
        const difficulty = question.difficulty || 'medium';
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {});

      const total = data.length;
      
      return [
        {
          difficulty: 'Fácil',
          count: difficultyCounts.easy || 0,
          percentage: total > 0 ? Math.round(((difficultyCounts.easy || 0) / total) * 100) : 0
        },
        {
          difficulty: 'Media',
          count: difficultyCounts.medium || 0,
          percentage: total > 0 ? Math.round(((difficultyCounts.medium || 0) / total) * 100) : 0
        },
        {
          difficulty: 'Difícil',
          count: difficultyCounts.hard || 0,
          percentage: total > 0 ? Math.round(((difficultyCounts.hard || 0) / total) * 100) : 0
        }
      ];
    } catch (error) {
      console.error('Error obteniendo estadísticas por dificultad:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas mensuales
   */
  async getMonthlyStats(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('created_at, is_correct')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data) return [];

      // Agrupar por mes
      const monthlyData = {};
      
      data.forEach(answer => {
        const date = new Date(answer.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            students: new Set(),
            quizzes: 0,
            correctAnswers: 0,
            totalAnswers: 0
          };
        }
        
        monthlyData[monthKey].students.add(answer.student_id);
        monthlyData[monthKey].totalAnswers++;
        if (answer.is_correct) {
          monthlyData[monthKey].correctAnswers++;
        }
      });

      // Convertir a array y calcular promedios
      return Object.entries(monthlyData).map(([month, stats]) => {
        const avgScore = stats.totalAnswers > 0 
          ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) 
          : 0;

        return {
          month: this.getMonthName(month),
          students: stats.students.size,
          quizzes: Math.ceil(stats.totalAnswers / 10), // Estimación
          avgScore
        };
      }).slice(-3); // Últimos 3 meses
    } catch (error) {
      console.error('Error obteniendo estadísticas mensuales:', error);
      return [];
    }
  }

  /**
   * Convierte el formato de mes a nombre legible
   */
  getMonthName(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return monthNames[parseInt(month) - 1] || 'Mes';
  }

  /**
   * Obtiene estadísticas de un estudiante específico
   */
  async getStudentStatistics(studentId) {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          id,
          is_correct,
          created_at,
          questions (
            id,
            difficulty,
            categories (
              name
            )
          )
        `)
        .eq('student_id', studentId);

      if (error) throw error;

      if (!data) return null;

      const totalAnswers = data.length;
      const correctAnswers = data.filter(a => a.is_correct).length;
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      // Agrupar por categoría
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
        totalAnswers,
        correctAnswers,
        accuracy,
        categoryStats,
        lastActivity: data.length > 0 ? data[0].created_at : null
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del estudiante:', error);
      return null;
    }
  }
}

export default new StatisticsService();
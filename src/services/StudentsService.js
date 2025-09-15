import { supabase } from './supabase';

class StudentsService {
  // Obtener estudiante por email
  async getStudentByEmail(email) {
    try {
      console.log('🔍 Obteniendo estudiante por email:', email);
      
      const { data: student, error } = await supabase
        .from('app_users_enriched')
        .select('id, email, full_name, raw_user_meta_data')
        .eq('email', email)
        .single();

      if (error) {
        console.error('❌ Error obteniendo estudiante por email:', error);
        throw error;
      }

      console.log('✅ Estudiante obtenido por email:', student);
      return student;
    } catch (error) {
      console.error('❌ Error en getStudentByEmail:', error);
      throw error;
    }
  }

  // Obtener todos los estudiantes con estadísticas (paginado y sin N+1)
  async getAllStudents({ page = 1, pageSize = 20, searchText = '', orderBy = 'email', ascending = true } = {}) {
    try {
      console.log('🔍 Obteniendo estudiantes con estadísticas (paginado)...', { page, pageSize, searchText, orderBy, ascending });

      // 1) Filtros base
      let baseQuery = supabase
        .from('app_users_enriched')
        .select('id, email, full_name, raw_user_meta_data', { count: 'exact' });

      if (searchText && searchText.trim()) {
        const term = `%${searchText.trim()}%`;
        // Buscar por email o nombre completo (si la vista lo soporta)
        baseQuery = baseQuery.or(`email.ilike.${term},full_name.ilike.${term}`);
      }

      // 2) Obtener total de filas (usando la misma base)
      const { data: countProbe, count, error: countError } = await baseQuery
        .order(orderBy, { ascending })
        .range(0, 0);
      if (countError) {
        console.warn('⚠️ Error obteniendo conteo de estudiantes:', countError.message);
      }

      // 3) Traer página solicitada
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data: students, error: studentsError } = await supabase
        .from('app_users_enriched')
        .select('id, email, full_name, raw_user_meta_data')
        .order(orderBy, { ascending })
        .range(from, to);

      if (studentsError) {
        console.error('❌ Error obteniendo estudiantes:', studentsError);
        throw studentsError;
      }

      const studentIds = (students || []).map(s => s.id);
      if (!studentIds.length) {
        return { data: [], total: count || 0, page, pageSize };
      }

      // 4) Obtener respuestas de todos los estudiantes de la página en una sola consulta
      const { data: answersBatch, error: answersBatchError } = await supabase
        .from('student_answers')
        .select('student_id, is_correct, answered_at, questions(category_id)')
        .in('student_id', studentIds);

      if (answersBatchError) {
        console.warn('⚠️ Error obteniendo respuestas por lote:', answersBatchError.message);
      }

      // 5) Reducir métricas por estudiante
      const byStudent = new Map();
      for (const student of students) {
        byStudent.set(student.id, {
          id: student.id,
          name: this.getDisplayName(student),
          email: student.email,
          studentId: student.raw_user_meta_data?.student_id || null,
          totalAnswers: 0,
          correctAnswers: 0,
          averageScore: 0,
          lastActivity: null,
          totalQuizzes: 0,
          status: 'active'
        });
      }

      (answersBatch || []).forEach(row => {
        const stats = byStudent.get(row.student_id);
        if (!stats) return;
        stats.totalAnswers += 1;
        if (row.is_correct) stats.correctAnswers += 1;
        if (!stats.lastActivity || new Date(row.answered_at) > new Date(stats.lastActivity)) {
          stats.lastActivity = row.answered_at;
        }
        const catId = row.questions?.category_id;
        if (catId) {
          if (!stats._catSet) stats._catSet = new Set();
          stats._catSet.add(catId);
        }
      });

      const studentsWithStats = Array.from(byStudent.values()).map(s => {
        s.averageScore = s.totalAnswers > 0 ? Math.round((s.correctAnswers / s.totalAnswers) * 100) : 0;
        s.totalQuizzes = s._catSet ? s._catSet.size : 0;
        delete s._catSet;
        return s;
      });

      console.log('✅ Estudiantes con estadísticas procesados:', studentsWithStats.length);
      return { data: studentsWithStats, total: count || countProbe?.length || 0, page, pageSize };
    } catch (error) {
      console.error('❌ Error en getAllStudents:', error);
      throw error;
    }
  }

  // Obtener estadísticas de un estudiante específico
  async getStudentStats(studentId) {
    try {
      console.log('🔍 Obteniendo estadísticas del estudiante:', studentId);
      
      // Obtener respuestas del estudiante
      const { data: answers, error: answersError } = await supabase
        .from('student_answers')
        .select('is_correct, answered_at')
        .eq('student_id', studentId);

      if (answersError) {
        console.error('❌ Error obteniendo respuestas:', answersError);
        throw answersError;
      }

      // Calcular estadísticas
      const totalAnswers = answers?.length || 0;
      const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      
      // Obtener última actividad (fecha real, no string relativo)
      const lastActivity = answers?.length > 0 
        ? answers.sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at))[0].answered_at
        : null;

      const stats = {
        totalAnswers,
        correctAnswers,
        accuracy,
        lastActivity
      };

      console.log('✅ Estadísticas del estudiante:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error en getStudentStats:', error);
      throw error;
    }
  }

  // Obtener estudiantes con sus estadísticas
  async getStudentsWithStats() {
    try {
      console.log('🔍 Obteniendo estudiantes con estadísticas...');
      
      const students = await this.getAllStudents();
      const studentsWithStats = [];

      for (const student of students) {
        try {
          const stats = await this.getStudentStats(student.id);
          studentsWithStats.push({
            id: student.id,
            name: this.getDisplayName(student),
            email: student.email,
            totalAnswers: stats.totalAnswers,
            accuracy: stats.accuracy,
            lastActivity: stats.lastActivity
          });
        } catch (error) {
          console.warn(`⚠️ Error obteniendo stats para ${student.email}:`, error);
          // Agregar estudiante sin stats
          studentsWithStats.push({
            id: student.id,
            name: this.getDisplayName(student),
            email: student.email,
            totalAnswers: 0,
            accuracy: 0,
            lastActivity: 'Sin actividad'
          });
        }
      }

      console.log('✅ Estudiantes con estadísticas obtenidos:', studentsWithStats.length);
      return studentsWithStats;
    } catch (error) {
      console.error('❌ Error en getStudentsWithStats:', error);
      throw error;
    }
  }

  // Obtener detalle completo de un estudiante
  async getStudentDetail(studentId) {
    try {
      console.log('🔍 Obteniendo detalle del estudiante:', studentId);
      
      // Obtener información básica del estudiante
      const { data: student, error: studentError } = await supabase
        .from('app_users_enriched')
        .select('id, email, full_name, raw_user_meta_data')
        .eq('id', studentId)
        .single();

      if (studentError) {
        console.error('❌ Error obteniendo estudiante:', studentError);
        throw studentError;
      }

      // Obtener estadísticas
      const stats = await this.getStudentStats(studentId);

      // Obtener categorías asignadas con estadísticas
      const { data: categories, error: categoriesError } = await supabase
        .from('student_categories')
        .select(`
          category_id,
          published,
          modo,
          categories (
            name
          )
        `)
        .eq('student_id', studentId);

      if (categoriesError) {
        console.error('❌ Error obteniendo categorías:', categoriesError);
        throw categoriesError;
      }

      // Obtener estadísticas por categoría
      const categoryStats = [];
      for (const category of categories || []) {
        try {
          // Obtener todas las respuestas de esta categoría
          const { data: categoryAnswers, error: categoryAnswersError } = await supabase
            .from('student_answers')
            .select(`
              is_correct,
              answered_at,
              questions (
                category_id
              )
            `)
            .eq('student_id', studentId)
            .eq('questions.category_id', category.category_id)
            .order('answered_at', { ascending: false });

          if (categoryAnswersError) {
            console.warn(`⚠️ Error obteniendo respuestas de categoría ${category.category_id}:`, categoryAnswersError);
            continue;
          }

          // Agrupar respuestas por sesión de quiz (mismo día)
          const quizSessions = {};
          categoryAnswers?.forEach(answer => {
            const date = new Date(answer.answered_at).toDateString();
            if (!quizSessions[date]) {
              quizSessions[date] = [];
            }
            quizSessions[date].push(answer);
          });

          // Obtener la sesión más reciente
          const latestSessionDate = Object.keys(quizSessions).sort().pop();
          const latestSession = quizSessions[latestSessionDate] || [];

          // Contar preguntas reales de la categoría
          const { data: categoryQuestions, error: questionsError } = await supabase
            .from('questions')
            .select('id')
            .eq('category_id', category.category_id);
          
          const totalQuestions = categoryQuestions?.length || 0;
          const correctAnswers = latestSession.filter(a => a.is_correct).length || 0;
          const incorrectAnswers = latestSession.length - correctAnswers; // Respuestas dadas menos correctas
          const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          
          // Obtener fecha y tiempo del quiz más reciente
          const mostRecentAnswer = latestSession[0];
          const completedAt = mostRecentAnswer?.answered_at || null;
          const totalTimeMinutes = totalQuestions * 2; // Estimación simple por ahora
          
          const lastAnswered = completedAt 
            ? this.getTimeAgo(completedAt)
            : 'Sin respuestas';
          
          // Formatear fecha para mostrar en el admin
          const formattedDate = completedAt 
            ? new Date(completedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Sin fecha';

          categoryStats.push({
            categoryId: category.category_id,
            categoryName: category.categories?.name || 'Sin nombre',
            totalQuestions,
            answered: totalQuestions,
            correct: correctAnswers,
            incorrect: incorrectAnswers,
            accuracy,
            published: category.published || false, // Usar el estado real de publicación
            modo: category.modo !== undefined ? category.modo : true, // Usar el modo real (default true)
            lastAnswered,
            completedAt,
            formattedDate,
            totalTimeMinutes
          });
        } catch (error) {
          console.warn(`⚠️ Error procesando categoría ${category.category_id}:`, error);
        }
      }

      const studentDetail = {
        id: student.id,
        name: this.getDisplayName(student),
        email: student.email,
        joinedDate: 'Fecha no disponible', // La vista app_users_enriched no tiene created_at
        totalAnswers: stats.totalAnswers,
        overallAccuracy: stats.accuracy,
        lastActivity: stats.lastActivity,
        categoryStats
      };

      console.log('✅ Detalle del estudiante obtenido:', studentDetail);
      return studentDetail;
    } catch (error) {
      console.error('❌ Error en getStudentDetail:', error);
      throw error;
    }
  }

  // Toggle publicación de categoría para un estudiante
  async toggleCategoryPublication(studentId, categoryId, published) {
    try {
      console.log(`🔍 Cambiando publicación de categoría ${categoryId} para estudiante ${studentId} a ${published}`);
      
      // Obtener el usuario actual para verificar que es admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el usuario es admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        throw new Error('Solo los administradores pueden cambiar la publicación de categorías');
      }

      const { data, error } = await supabase
        .from('student_categories')
        .update({ published })
        .eq('student_id', studentId)
        .eq('category_id', categoryId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error cambiando publicación:', error);
        throw error;
      }

      console.log('✅ Publicación cambiada:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error en toggleCategoryPublication:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estado de publicación de categorías para un estudiante
  async getStudentCategoryPublicationStatus(studentId) {
    try {
      console.log('🔍 Obteniendo estado de publicación para estudiante:', studentId);
      
      const { data, error } = await supabase
        .from('student_categories')
        .select(`
          category_id,
          published,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('student_id', studentId)
        .order('categories(name)');

      if (error) {
        console.error('❌ Error obteniendo estado de publicación:', error);
        throw error;
      }

      console.log('✅ Estado de publicación obtenido:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getStudentCategoryPublicationStatus:', error);
      throw error;
    }
  }

  // Función auxiliar para obtener nombre de display
  getDisplayName(student) {
    // 1) full_name desde la vista
    const full = student.full_name?.toString();
    if (full && full.trim() && !full.includes('@')) {
      return full.trim();
    }

    // 2) metadata parseada
    const meta = student.raw_user_meta_data;
    if (meta) {
      const firstName = meta.first_name || meta.firstName;
      const lastName = meta.last_name || meta.lastName;
      if (firstName || lastName) {
        return `${firstName || ''} ${lastName || ''}`.trim();
      }
    }

    // 3) fallback: convertir email a nombre presentable
    const email = student.email?.toString() || '';
    return this.prettifyEmail(email);
  }

  // Función auxiliar para convertir email a nombre
  prettifyEmail(email) {
    if (!email) return 'Estudiante';
    const local = email.split('@')[0];
    const cleaned = local.replace(/[._\-+]/g, ' ');
    const parts = cleaned.split(/\s+/).filter(p => p.length > 0);
    const capitalized = parts.map(p => {
      if (p.length <= 1) return p.toUpperCase();
      return p[0].toUpperCase() + p.substring(1);
    }).join(' ');
    return capitalized || email;
  }

  // Función auxiliar para calcular tiempo transcurrido
  getTimeAgo(dateString) {
    if (!dateString) return 'Hace mucho tiempo';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
  }

  // Obtener historial de quizzes del estudiante
  async getStudentQuizHistory(studentId) {
    try {
      console.log('🔍 Obteniendo historial de quizzes para estudiante:', studentId);
      
      // Obtener las respuestas del estudiante agrupadas por categoría
      // Ahora podemos usar category_id directamente
      const { data: studentAnswers, error } = await supabase
        .from('student_answers')
        .select(`
          category_id,
          is_correct,
          answered_at,
          time_spent,
          categories (
            id,
            name
          )
        `)
        .eq('student_id', studentId)
        .order('answered_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo respuestas del estudiante:', error);
        throw error;
      }

      // Agrupar por categoría y calcular estadísticas
      const categoryStats = {};
      studentAnswers?.forEach(answer => {
        const categoryId = answer.category_id;
        const categoryName = answer.categories?.name || 'Categoría desconocida';
        
        if (!categoryId) {
          console.warn('⚠️ Respuesta sin category_id:', answer);
          return;
        }
        
        if (!categoryStats[categoryId]) {
          categoryStats[categoryId] = {
            id: categoryId,
            categoryName,
            totalQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            totalTime: 0,
            lastAnsweredAt: null,
            explanationsEnabled: true, // Por defecto, asumimos que están habilitadas
            answeredQuestions: new Set() // Para contar preguntas únicas respondidas
          };
        }
        
        // Contar respuestas correctas/incorrectas
        if (answer.is_correct) {
          categoryStats[categoryId].correctAnswers++;
        } else {
          categoryStats[categoryId].incorrectAnswers++;
        }
        
        if (answer.time_spent) {
          categoryStats[categoryId].totalTime += answer.time_spent;
        }
        
        if (!categoryStats[categoryId].lastAnsweredAt || 
            new Date(answer.answered_at) > new Date(categoryStats[categoryId].lastAnsweredAt)) {
          categoryStats[categoryId].lastAnsweredAt = answer.answered_at;
        }
      });

      // Obtener el número real de preguntas por categoría
      for (const categoryId of Object.keys(categoryStats)) {
        try {
          const { count, error: countError } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', categoryId);

          if (countError) {
            console.warn(`⚠️ Error obteniendo conteo de preguntas para categoría ${categoryId}:`, countError);
            categoryStats[categoryId].totalQuestions = 0;
          } else {
            categoryStats[categoryId].totalQuestions = count || 0;
          }
        } catch (error) {
          console.warn(`⚠️ Error obteniendo preguntas para categoría ${categoryId}:`, error);
          categoryStats[categoryId].totalQuestions = 0;
        }
      }

      // Convertir a array, filtrar categorías sin preguntas y calcular porcentajes
      const quizHistory = Object.values(categoryStats)
        .filter(quiz => quiz.totalQuestions > 0) // Solo mostrar categorías que tengan preguntas
        .map(quiz => ({
          id: quiz.id,
          categoryName: quiz.categoryName,
          totalQuestions: quiz.totalQuestions,
          correctAnswers: quiz.correctAnswers,
          incorrectAnswers: quiz.incorrectAnswers,
          accuracyPercentage: Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100),
          timeSpent: quiz.totalTime > 0 ? `${Math.round(quiz.totalTime)} min` : '0 min',
          completedAt: quiz.lastAnsweredAt,
          explanationsEnabled: quiz.explanationsEnabled,
          difficulty: 'Difícil' // Por defecto, podríamos calcular esto basado en el rendimiento
        }));

      console.log('✅ Historial de quizzes obtenido:', quizHistory);
      return quizHistory;
    } catch (error) {
      console.error('❌ Error en getStudentQuizHistory:', error);
      throw error;
    }
  }

  // Obtener detalles de un quiz específico
  async getQuizDetails(categoryId, studentId) {
    try {
      console.log('🔍 Obteniendo detalles del quiz:', { categoryId, studentId });
      
      // Obtener las preguntas de la categoría
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question,
          options,
          correct_answer,
          explanation,
          type
        `)
        .eq('category_id', categoryId)
        .order('id', { ascending: true });

      if (questionsError) {
        console.error('❌ Error obteniendo preguntas:', questionsError);
        throw questionsError;
      }

      console.log('📝 Preguntas encontradas:', questions?.length || 0);

      // Obtener las respuestas del estudiante para esta categoría
      const { data: studentAnswers, error: answersError } = await supabase
        .from('student_answers')
        .select(`
          question_id,
          answer,
          is_correct,
          answered_at
        `)
        .eq('student_id', studentId)
        .eq('category_id', categoryId)
        .order('answered_at', { ascending: true });

      if (answersError) {
        console.error('❌ Error obteniendo respuestas del estudiante:', answersError);
        throw answersError;
      }

      console.log('📝 Respuestas del estudiante encontradas:', studentAnswers?.length || 0);

      // Crear un mapa de respuestas por pregunta
      const answersMap = {};
      studentAnswers?.forEach(answer => {
        answersMap[answer.question_id] = {
          studentAnswer: answer.answer,
          isCorrect: answer.is_correct,
          answeredAt: answer.answered_at
        };
      });

      // Combinar preguntas con respuestas
      const questionsWithAnswers = questions?.map(question => {
        const answer = answersMap[question.id];
        return {
          id: question.id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correct_answer,
          explanation: question.explanation,
          type: question.type,
          studentAnswer: answer?.studentAnswer || null,
          isCorrect: answer?.isCorrect || false,
          answeredAt: answer?.answeredAt || null
        };
      }) || [];

      console.log('✅ Detalles del quiz obtenidos:', questionsWithAnswers);
      return {
        questions: questionsWithAnswers,
        totalQuestions: questionsWithAnswers.length,
        correctAnswers: questionsWithAnswers.filter(q => q.isCorrect).length,
        incorrectAnswers: questionsWithAnswers.filter(q => !q.isCorrect).length
      };
    } catch (error) {
      console.error('❌ Error en getQuizDetails:', error);
      throw error;
    }
  }
}

const studentsService = new StudentsService();
export default studentsService;

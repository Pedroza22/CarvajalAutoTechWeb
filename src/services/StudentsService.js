import { supabase } from './supabase';

class StudentsService {
  // Obtener todos los estudiantes
  async getAllStudents() {
    try {
      console.log('🔍 Obteniendo todos los estudiantes...');
      
      const { data, error } = await supabase
        .from('app_users_enriched')
        .select('id, email, full_name, raw_user_meta_data')
        .order('email', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo estudiantes:', error);
        throw error;
      }

      console.log('✅ Estudiantes obtenidos:', data?.length || 0);
      return data || [];
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
      
      // Obtener última actividad
      const lastActivity = answers?.length > 0 
        ? this.getTimeAgo(answers.sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at))[0].answered_at)
        : 'Sin actividad';

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
        .select('id, email, full_name, raw_user_meta_data, created_at')
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
            .eq('questions.category_id', category.category_id);

          if (categoryAnswersError) {
            console.warn(`⚠️ Error obteniendo respuestas de categoría ${category.category_id}:`, categoryAnswersError);
            continue;
          }

          const totalQuestions = categoryAnswers?.length || 0;
          const correctAnswers = categoryAnswers?.filter(a => a.is_correct).length || 0;
          const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          const lastAnswered = totalQuestions > 0 
            ? this.getTimeAgo(categoryAnswers.sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at))[0].answered_at)
            : 'Sin respuestas';

          categoryStats.push({
            categoryId: category.category_id,
            categoryName: category.categories?.name || 'Sin nombre',
            totalQuestions,
            answered: totalQuestions,
            correct: correctAnswers,
            accuracy,
            published: category.published || false,
            lastAnswered
          });
        } catch (error) {
          console.warn(`⚠️ Error procesando categoría ${category.category_id}:`, error);
        }
      }

      const studentDetail = {
        id: student.id,
        name: this.getDisplayName(student),
        email: student.email,
        joinedDate: new Date(student.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
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
      return data;
    } catch (error) {
      console.error('❌ Error en toggleCategoryPublication:', error);
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
}

export default new StudentsService();

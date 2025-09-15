import { supabase } from './supabase';

class StudentCategoriesService {
  // Obtener categorías asignadas a un estudiante
  async getAssignedCategories(studentId) {
    try {
      console.log('🔍 Obteniendo categorías asignadas para estudiante:', studentId);
      
      const { data, error } = await supabase
        .from('student_categories')
        .select(`
          category_id,
          published,
          categories (
            id,
            name,
            description,
            is_active
          )
        `)
        .eq('student_id', studentId);

      if (error) {
        console.error('❌ Error obteniendo categorías asignadas:', error);
        throw error;
      }

      console.log('✅ Categorías asignadas obtenidas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getAssignedCategories:', error);
      return [];
    }
  }

  // Asignar categoría a estudiante
  async assignCategoryToStudent(studentId, categoryId, published = false) {
    try {
      console.log('🔗 Asignando categoría a estudiante:', { studentId, categoryId, published });
      
      const { data, error } = await supabase
        .from('student_categories')
        .upsert({
          student_id: studentId,
          category_id: categoryId,
          published: published
        });

      if (error) {
        console.error('❌ Error asignando categoría:', error);
        throw error;
      }

      console.log('✅ Categoría asignada exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error en assignCategoryToStudent:', error);
      throw error;
    }
  }

  // Remover asignación de categoría
  async removeCategoryFromStudent(studentId, categoryId) {
    try {
      console.log('🗑️ Removiendo categoría de estudiante:', { studentId, categoryId });
      
      const { error } = await supabase
        .from('student_categories')
        .delete()
        .eq('student_id', studentId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error removiendo categoría:', error);
        throw error;
      }

      console.log('✅ Categoría removida exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en removeCategoryFromStudent:', error);
      throw error;
    }
  }

  // Cambiar estado de publicación
  async togglePublication(studentId, categoryId, published) {
    try {
      console.log('🔄 Cambiando estado de publicación:', { studentId, categoryId, published });
      
      const { error } = await supabase
        .from('student_categories')
        .update({ published })
        .eq('student_id', studentId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error cambiando publicación:', error);
        throw error;
      }

      console.log('✅ Estado de publicación actualizado');
      return true;
    } catch (error) {
      console.error('❌ Error en togglePublication:', error);
      throw error;
    }
  }

  // Obtener estudiantes asignados a una categoría
  async getStudentsForCategory(categoryId) {
    try {
      console.log('👥 Obteniendo estudiantes para categoría:', categoryId);
      
      const { data, error } = await supabase
        .from('student_categories')
        .select(`
          student_id,
          published,
          app_users_enriched!student_categories_student_id_fkey (
            id,
            email,
            full_name,
            raw_user_meta_data
          )
        `)
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error obteniendo estudiantes:', error);
        throw error;
      }

      console.log('✅ Estudiantes obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getStudentsForCategory:', error);
      return [];
    }
  }

  /**
   * Obtiene las preguntas de una categoría para un estudiante
   */
  async getCategoryQuestions(categoryId, studentId) {
    try {
      console.log('🔍 Obteniendo preguntas de categoría:', categoryId, 'para estudiante:', studentId);
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question,
          options,
          correct_answer,
          time_limit,
          explanation,
          image_url,
          type
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo preguntas:', error);
        throw error;
      }

      console.log('✅ Preguntas obtenidas:', data?.length || 0);
      
      // Debug: Log de la primera pregunta para verificar estructura
      if (data && data.length > 0) {
        console.log('🔍 Debug primera pregunta:', {
          id: data[0].id,
          question: data[0].question?.substring(0, 50) + '...',
          type: data[0].type,
          options: data[0].options,
          correct_answer: data[0].correct_answer,
          hasOptions: !!data[0].options,
          optionsType: typeof data[0].options,
          optionsLength: Array.isArray(data[0].options) ? data[0].options.length : 'N/A'
        });
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error en getCategoryQuestions:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas de una categoría para un estudiante
   */
  async getCategoryStats(studentId, categoryId) {
    try {
      console.log('🔍 Obteniendo estadísticas de categoría:', categoryId, 'para estudiante:', studentId);
      
      // Primero obtener las preguntas de la categoría
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('category_id', categoryId);

      if (questionsError) {
        console.error('❌ Error obteniendo preguntas:', questionsError);
        throw questionsError;
      }

      const questionIds = questions?.map(q => q.id) || [];
      
      if (questionIds.length === 0) {
        return {
          totalAnswers: 0,
          correctAnswers: 0,
          accuracy: 0
        };
      }

      // Luego obtener las respuestas para esas preguntas
      const { data, error } = await supabase
        .from('student_answers')
        .select(`
          id,
          is_correct,
          answered_at
        `)
        .eq('student_id', studentId)
        .in('question_id', questionIds);

      if (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        throw error;
      }

      const totalAnswers = data?.length || 0;
      const correctAnswers = data?.filter(a => a.is_correct).length || 0;
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      console.log('✅ Estadísticas obtenidas:', { totalAnswers, correctAnswers, accuracy });
      return {
        totalAnswers,
        correctAnswers,
        accuracy
      };
    } catch (error) {
      console.error('❌ Error en getCategoryStats:', error);
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        accuracy: 0
      };
    }
  }

  /**
   * Guarda las respuestas del estudiante para un quiz
   */
  async saveStudentAnswers(studentId, categoryId, answers, totalTimeMinutes = null, quizMode = true) {
    try {
      console.log('💾 Guardando respuestas del estudiante:', studentId, 'para categoría:', categoryId);
      
      // Obtener las preguntas completas para calcular is_correct
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, correct_answer, options')
        .eq('category_id', categoryId);

      if (questionsError) {
        console.error('❌ Error obteniendo preguntas:', questionsError);
        throw questionsError;
      }

      // Crear un mapa de respuestas correctas
      const correctAnswersMap = {};
      questions.forEach(q => {
        correctAnswersMap[q.id] = q.correct_answer;
      });
      
      // Preparar los datos para insertar con is_correct
      const answersToInsert = Object.entries(answers).map(([questionId, answer]) => {
        const correctAnswer = correctAnswersMap[questionId];
        
        // Obtener la pregunta completa para hacer la comparación correcta
        const question = questions.find(q => q.id === questionId);
        let isCorrect = false;
        
        if (answer && answer !== 'TIMEOUT' && question) {
          // Si correct_answer es una letra (A, B, C, D), comparar directamente
          if (['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            isCorrect = answer === correctAnswer;
          } else {
            // Si correct_answer es texto completo, obtener la opción correspondiente
            const optionIndex = String.fromCharCode(65 + question.options.indexOf(correctAnswer));
            isCorrect = answer === optionIndex;
          }
        }
        
        console.log(`🔍 Pregunta ${questionId}:`);
        console.log(`   Respuesta del estudiante: "${answer}"`);
        console.log(`   Respuesta correcta: "${correctAnswer}"`);
        console.log(`   Es correcta: ${isCorrect}`);
        
        return {
          student_id: studentId,
          question_id: questionId,
          answer: answer || 'NO_ANSWER',
          is_correct: isCorrect,
          answered_at: new Date().toISOString(),
          time_spent: null, // No guardamos tiempo por pregunta individual por ahora
          category_id: categoryId, // Agregar category_id
          quiz_mode: quizMode // Agregar quiz_mode
        };
      });

      // Insertar las respuestas una por una para evitar conflictos
      const results = [];
      for (const answerData of answersToInsert) {
        const { data, error } = await supabase
          .from('student_answers')
          .upsert(answerData, { 
            onConflict: 'student_id,question_id',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error('❌ Error guardando respuesta individual:', error);
          throw error;
        }
        results.push(data);
      }

      console.log('✅ Respuestas guardadas exitosamente:', results.length);

      console.log('✅ Respuestas guardadas/actualizadas:', answersToInsert.length);
      console.log('📝 Detalles de respuestas:', answersToInsert.map(a => ({
        question_id: a.question_id,
        answer: a.answer,
        is_correct: a.is_correct
      })));
      return { success: true, data: results };
    } catch (error) {
      console.error('❌ Error en saveStudentAnswers:', error);
      throw error;
    }
  }

  /**
   * Calcula las estadísticas del quiz completado
   */
  async calculateQuizStats(studentId, categoryId, answers) {
    try {
      console.log('📊 Calculando estadísticas del quiz...');
      
      // Obtener las preguntas con sus respuestas correctas
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .eq('category_id', categoryId);

      if (questionsError) {
        console.error('❌ Error obteniendo preguntas:', questionsError);
        throw questionsError;
      }

      // Calcular estadísticas
      let correctAnswers = 0;
      let totalAnswers = Object.keys(answers).length;
      let totalQuestions = questions.length;

      questions.forEach(question => {
        const studentAnswer = answers[question.id];
        if (studentAnswer && studentAnswer === question.correct_answer) {
          correctAnswers++;
        }
      });

      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      const completionRate = totalQuestions > 0 ? Math.round((totalAnswers / totalQuestions) * 100) : 0;

      const stats = {
        totalQuestions,
        totalAnswers,
        correctAnswers,
        incorrectAnswers: totalAnswers - correctAnswers,
        accuracy,
        completionRate,
        score: correctAnswers,
        maxScore: totalQuestions
      };

      console.log('✅ Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error en calculateQuizStats:', error);
      return {
        totalQuestions: 0,
        totalAnswers: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        completionRate: 0,
        score: 0,
        maxScore: 0
      };
    }
  }

  // Notificar al admin que se completó un quiz
  async notifyQuizCompletion(studentId, categoryId, stats) {
    try {
      console.log('📢 Notificando completación de quiz:', { studentId, categoryId, stats });
      
      // Intentar actualizar solo con campos básicos que sabemos que existen
      const updateData = {
        student_id: studentId,
        category_id: categoryId
      };

      // Solo agregar campos si existen en la tabla
      try {
        const { data, error } = await supabase
          .from('student_categories')
          .upsert(updateData, {
            onConflict: 'student_id,category_id'
          });

        if (error) {
          console.warn('⚠️ Error actualizando student_categories (no crítico):', error);
          // No lanzar error, solo loggear
        } else {
          console.log('✅ Estadísticas del admin actualizadas:', data);
        }
        
        return { success: true, data };
      } catch (dbError) {
        console.warn('⚠️ Error de base de datos en notifyQuizCompletion (no crítico):', dbError);
        return { success: true, data: null }; // Retornar éxito para no interrumpir el flujo
      }
    } catch (error) {
      console.error('❌ Error en notifyQuizCompletion:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar si las explicaciones están habilitadas para un estudiante y categoría
  async checkExplanationsEnabled(studentId, categoryId) {
    try {
      console.log('🔍 Verificando si explicaciones están habilitadas:', { studentId, categoryId });
      
      const { data, error } = await supabase
        .from('student_categories')
        .select('published')
        .eq('student_id', studentId)
        .eq('category_id', categoryId)
        .single();

      if (error) {
        console.warn('⚠️ Error verificando estado de explicaciones:', error);
        return false; // Por defecto, asumir que no están habilitadas
      }

      console.log('📊 Estado de explicaciones:', data?.published || false);
      return data?.published || false;
    } catch (error) {
      console.error('❌ Error en checkExplanationsEnabled:', error);
      return false; // Por defecto, asumir que no están habilitadas
    }
  }
}

const studentCategoriesService = new StudentCategoriesService();
export default studentCategoriesService;

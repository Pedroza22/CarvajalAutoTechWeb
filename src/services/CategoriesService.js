import { supabase } from './supabase';

class CategoriesService {
  // Obtener todas las categorías
  async getAllCategories() {
    try {
      console.log('🔍 Obteniendo todas las categorías...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo categorías:', error);
        throw error;
      }

      console.log('✅ Categorías obtenidas:', data?.length || 0);
      return data || [];
    } catch (error) {
      if (error) {
        console.error('❌ Error en getAllCategories:', error);
        throw error;
      } else {
        console.error('❌ Error desconocido en getAllCategories');
        throw new Error('Error desconocido al obtener categorías');
      }
    }
  }

  // Obtener categorías activas
  async getActiveCategories() {
    try {
      console.log('🔍 Obteniendo categorías activas...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo categorías activas:', error);
        throw error;
      }

      console.log('✅ Categorías activas obtenidas:', data?.length || 0);
      return data || [];
    } catch (error) {
      if (error) {
        console.error('❌ Error en getActiveCategories:', error);
        throw error;
      } else {
        console.error('❌ Error desconocido en getActiveCategories');
        throw new Error('Error desconocido al obtener categorías activas');
      }
    }
  }

  // Crear nueva categoría
  async createCategory(categoryData) {
    try {
      console.log('🔍 Creando nueva categoría...');
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          icon: categoryData.icon,
          created_by: user?.id || categoryData.createdBy || 'system'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando categoría:', error);
        throw error;
      }

      console.log('✅ Categoría creada:', data);
      return data;
    } catch (error) {
      if (error) {
        console.error('❌ Error en createCategory:', error);
        throw error;
      } else {
        console.error('❌ Error desconocido en createCategory');
        throw new Error('Error desconocido al crear categoría');
      }
    }
  }

  // Actualizar categoría
  async updateCategory(categoryId, categoryData) {
    try {
      console.log('🔍 Actualizando categoría:', categoryId);
      
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          description: categoryData.description,
          icon: categoryData.icon,
          is_active: categoryData.isActive
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando categoría:', error);
        throw error;
      }

      console.log('✅ Categoría actualizada:', data);
      return data;
    } catch (error) {
      if (error) {
        console.error('❌ Error en updateCategory:', error);
        throw error;
      } else {
        console.error('❌ Error desconocido en updateCategory');
        throw new Error('Error desconocido al actualizar categoría');
      }
    }
  }

  // Eliminar categoría
  async deleteCategory(categoryId) {
    try {
      console.log('🔍 Eliminando categoría:', categoryId);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('❌ Error eliminando categoría:', error);
        throw error;
      }

      console.log('✅ Categoría eliminada');
      return true;
    } catch (error) {
      if (error) {
        console.error('❌ Error en deleteCategory:', error);
        throw error;
      } else {
        console.error('❌ Error desconocido en deleteCategory');
        throw new Error('Error desconocido al eliminar categoría');
      }
    }
  }

  // Obtener categorías asignadas a un estudiante específico
  async getAssignedCategories(studentId) {
    try {
      console.log('🔍 Buscando categorías asignadas para estudiante:', studentId);
      
      // Primero obtener las categorías asignadas al estudiante
      const { data: assignedData, error: assignedError } = await supabase
        .from('student_categories')
        .select('category_id')
        .eq('student_id', studentId);

      if (assignedError) {
        console.error('❌ Error obteniendo categorías asignadas:', assignedError);
        throw assignedError;
      }

      if (!assignedData || assignedData.length === 0) {
        console.log('⚠️ No hay categorías asignadas al estudiante');
        return [];
      }

      // Extraer los IDs de las categorías asignadas
      const assignedCategoryIds = assignedData.map(item => item.category_id);

      // Obtener las categorías activas que coincidan con los IDs asignados
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .in('id', assignedCategoryIds)
        .order('created_at', { ascending: false });

      if (categoriesError) {
        console.error('❌ Error obteniendo categorías activas:', categoriesError);
        throw categoriesError;
      }

      console.log('✅ Categorías asignadas encontradas:', categoriesData?.length || 0, categoriesData);
      return categoriesData || [];
    } catch (error) {
      console.error('❌ Error obteniendo categorías asignadas:', error);
      return [];
    }
  }

  // Obtener solo categorías publicadas para un estudiante (para el dashboard)
  async getPublishedCategoriesForStudent(studentId) {
    try {
      console.log('🔍 [SERVICIO] Obteniendo categorías publicadas para estudiante:', studentId);
      
      // Obtener categorías asignadas y publicadas
      const { data: assignedData, error: assignedError } = await supabase
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
        .eq('student_id', studentId)
        .eq('published', true);

      if (assignedError) {
        console.error('❌ Error obteniendo categorías publicadas:', assignedError);
        throw assignedError;
      }

      if (!assignedData || assignedData.length === 0) {
        console.log('⚠️ [SERVICIO] No hay categorías publicadas para el estudiante');
        console.log('🔍 [SERVICIO] Verificando si hay categorías asignadas (no publicadas)...');
        
        // Verificar si hay categorías asignadas pero no publicadas
        const { data: allAssigned, error: allAssignedError } = await supabase
          .from('student_categories')
          .select(`
            category_id,
            published,
            categories (
              id,
              name
            )
          `)
          .eq('student_id', studentId);
          
        if (allAssignedError) {
          console.error('❌ [SERVICIO] Error verificando categorías asignadas:', allAssignedError);
        } else {
          console.log('📋 [SERVICIO] Todas las categorías asignadas:', allAssigned?.map(item => ({
            categoryName: item.categories?.name,
            published: item.published
          })));
        }
        
        return [];
      }

      // Filtrar solo las categorías activas y con datos completos
      const publishedCategories = await Promise.all(
        assignedData
          .filter(item => item.categories && item.categories.is_active)
          .map(async (item) => {
            // Obtener el conteo de preguntas para esta categoría
                          const { data: questions, error: questionsError } = await supabase
                            .from('questions')
                            .select('id')
                            .eq('category_id', item.category_id);

            if (questionsError) {
              console.warn(`Error cargando preguntas para categoría ${item.category_id}:`, questionsError);
            }

            return {
              ...item.categories,
              isPublished: item.published,
              questionCount: questions?.length || 0
            };
          })
      );

      console.log('✅ [SERVICIO] Categorías publicadas encontradas:', publishedCategories.length);
      console.log('📊 [SERVICIO] Detalles de categorías:', publishedCategories.map(c => ({
        name: c.name,
        questionCount: c.questionCount,
        isPublished: c.isPublished
      })));
      return publishedCategories;
    } catch (error) {
      console.error('❌ Error obteniendo categorías publicadas:', error);
      return [];
    }
  }

  // Asignar estudiante a categoría
  async assignStudentToCategory(studentId, categoryId) {
    try {
      console.log('🔍 Asignando estudiante a categoría:', { studentId, categoryId });
      
      const { data, error } = await supabase
        .from('student_categories')
        .insert({
          student_id: studentId,
          category_id: categoryId,
          published: false // Por defecto no publicado
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error asignando estudiante a categoría:', error);
        throw error;
      }

      console.log('✅ Estudiante asignado a categoría:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en assignStudentToCategory:', error);
      throw error;
    }
  }

  // Desasignar estudiante de categoría
  async unassignStudentFromCategory(studentId, categoryId) {
    try {
      console.log('🔍 Desasignando estudiante de categoría:', { studentId, categoryId });
      
      const { error } = await supabase
        .from('student_categories')
        .delete()
        .eq('student_id', studentId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error desasignando estudiante de categoría:', error);
        throw error;
      }

      console.log('✅ Estudiante desasignado de categoría');
      return true;
    } catch (error) {
      console.error('❌ Error en unassignStudentFromCategory:', error);
      throw error;
    }
  }

  // Obtener estudiantes asignados a una categoría
  async getStudentsByCategory(categoryId) {
    try {
      console.log('🔍 Obteniendo estudiantes por categoría:', categoryId);
      
      const { data, error } = await supabase
        .from('student_categories')
        .select(`
          student_id,
          published,
          app_users_enriched (
            id,
            email,
            full_name
          )
        `)
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error obteniendo estudiantes por categoría:', error);
        throw error;
      }

      console.log('✅ Estudiantes por categoría obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getStudentsByCategory:', error);
      throw error;
    }
  }

  // Función auxiliar para obtener color por defecto
  getDefaultColor() {
    return '#6366f1';
  }

  // Función auxiliar para obtener icono por defecto
  getDefaultIcon() {
    return '📚';
  }
}

const categoriesService = new CategoriesService();
export default categoriesService;
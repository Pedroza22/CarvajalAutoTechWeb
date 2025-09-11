import { supabase } from './supabase';

class CategoriesService {
  async getActiveCategories() {
    try {
      console.log('🔍 Buscando categorías activas...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error en query de categorías:', error);
        throw error;
      }
      
      console.log('✅ Categorías encontradas:', data?.length || 0, data);
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return [];
    }
  }

  // Nuevo: Obtener categorías asignadas a un estudiante específico
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

  // Nuevo: Obtener progreso del estudiante en categorías asignadas
  async getStudentProgress(studentId) {
    try {
      console.log('🔍 Obteniendo progreso del estudiante:', studentId);
      
      const { data, error } = await supabase
        .rpc('get_student_progress', {
          student_id: studentId
        });

      if (error) {
        console.error('❌ Error obteniendo progreso:', error);
        throw error;
      }

      console.log('✅ Progreso obtenido:', data?.length || 0, data);
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo progreso del estudiante:', error);
      return [];
    }
  }

  async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo todas las categorías:', error);
      return [];
    }
  }

  async createCategory({ name, description }) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name, description, is_active: true })
        .select('*')
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error creando categoría:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCategory(id, { name, description }) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name, description })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error actualizando categoría:', error);
      return { success: false, error: error.message };
    }
  }

  async toggleActive(id, isActive) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active: isActive })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error cambiando estado de categoría:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteCategory(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando categoría:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CategoriesService();



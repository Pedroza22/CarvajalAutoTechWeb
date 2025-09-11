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



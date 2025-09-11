import { supabase } from './supabase';

class CategoryService {
  /**
   * Crear una categoría (solo admins)
   */
  async createCategory({ name, description, createdBy }) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          description,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creando categoría:', error);
      return null; // Equivalente al comportamiento de Flutter
    }
  }

  /**
   * Obtener todas las categorías activas (estudiantes)
   */
  async getActiveCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return [];
    }
  }

  /**
   * Obtener todas las categorías (solo admins)
   */
  async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo categorías (admin):', error);
      return [];
    }
  }

  /**
   * Actualizar nombre/descripción de la categoría
   */
  async updateCategory({ categoryId, name, description }) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name,
          description,
        })
        .eq('id', categoryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error actualizando categoría:', error);
      return false;
    }
  }

  /**
   * Activar o desactivar categoría
   */
  async toggleCategoryActive({ categoryId, isActive }) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          is_active: isActive,
        })
        .eq('id', categoryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error cambiando estado de categoría:', error);
      return false;
    }
  }

  /**
   * Eliminar una categoría
   */
  async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error eliminando categoría:', error);
      return false;
    }
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(categoryId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo categoría:', error);
      return null;
    }
  }
}

export default new CategoryService();
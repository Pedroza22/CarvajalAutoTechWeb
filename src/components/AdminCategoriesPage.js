import React, { useEffect, useState } from 'react';
import CategoriesService from '../services/CategoriesService';
import CustomButton from './CustomButton';
import CustomTextField from './CustomTextField';
import CategoryCard from './admin/CategoryCard';
import { AppTheme } from '../utils/appTheme';

const AdminCategoriesPage = ({ onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchText]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const rows = await CategoriesService.getAllCategories();
      setCategories(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchText.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredCategories(filtered);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    setShowCreateForm(true);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      description: category.description || '' 
    });
    setShowCreateForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    
    setSaving(true);
    try {
      if (editingCategory) {
        // Actualizar categoría existente
        const res = await CategoriesService.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        if (res.success) {
          await loadCategories();
          resetForm();
          console.log('✅ Categoría actualizada');
        } else {
          console.error('❌ Error:', res.error || 'Error desconocido');
        }
      } else {
        // Crear nueva categoría
        const res = await CategoriesService.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        if (res.success) {
          await loadCategories();
          resetForm();
          console.log('✅ Categoría creada');
        } else {
          console.error('❌ Error:', res.error || 'Error desconocido');
        }
      }
    } catch (error) {
      console.error('Error guardando categoría:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    
    try {
      const res = await CategoriesService.deleteCategory(category.id);
      if (res.success) {
        await loadCategories();
        console.log('✅ Categoría eliminada');
      } else {
        console.error('❌', res.error);
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const res = await CategoriesService.toggleActive(category.id, !category.is_active);
      if (res.success) {
        await loadCategories();
        console.log('✅ Estado de categoría actualizado');
      } else {
        console.error('❌', res.error);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const pageStyle = {
    padding: '16px',
    background: AppTheme.primaryBlack,
    minHeight: '100vh',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  };

  const titleStyle = {
    color: AppTheme.white,
    fontSize: '24px',
    fontWeight: '600',
    margin: 0,
  };

  const searchContainerStyle = {
    padding: '16px',
    marginBottom: '16px',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: AppTheme.lightBlack,
    border: `1px solid ${AppTheme.greyDark}`,
    borderRadius: AppTheme.borderRadius.medium,
    color: AppTheme.white,
    fontSize: '16px',
    fontFamily: AppTheme.typography.fontFamily,
    outline: 'none',
  };

  const searchInputFocusStyle = {
    ...searchInputStyle,
    borderColor: AppTheme.primaryRed,
    boxShadow: `0 0 0 2px ${AppTheme.primaryRed}33`,
  };

  const createFormStyle = {
    ...AppTheme.card(),
    padding: '20px',
    marginBottom: '24px',
  };

  const formTitleStyle = {
    color: AppTheme.white,
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  };

  const formRowStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  };

  const formActionsStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  };

  const categoriesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    padding: '16px',
  };

  // Responsive styles
  const getResponsiveStyles = () => {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    return {
      page: {
        padding: isSmallMobile ? '8px' : isMobile ? '12px' : '16px',
        maxWidth: '100%',
        overflow: 'hidden',
      },
      header: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        alignItems: isSmallMobile ? 'stretch' : 'center',
        gap: isSmallMobile ? '12px' : '16px',
      },
      title: {
        fontSize: isSmallMobile ? '20px' : isMobile ? '22px' : '24px',
      },
      searchContainer: {
        padding: isSmallMobile ? '12px' : '16px',
      },
      searchInput: {
        fontSize: isSmallMobile ? '14px' : '16px',
        padding: isSmallMobile ? '10px 12px' : '12px 16px',
      },
      createForm: {
        padding: isSmallMobile ? '16px' : '20px',
        marginBottom: isSmallMobile ? '16px' : '24px',
      },
      formRow: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '12px' : '16px',
      },
      formActions: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '8px' : '12px',
      },
      categoriesGrid: {
        gridTemplateColumns: isSmallMobile ? '1fr' : 
                           isMobile ? 'repeat(auto-fill, minmax(280px, 1fr))' :
                           'repeat(auto-fill, minmax(300px, 1fr))',
        gap: isSmallMobile ? '12px' : '16px',
        padding: isSmallMobile ? '8px' : '16px',
      },
      floatingButton: {
        bottom: isSmallMobile ? '16px' : '24px',
        right: isSmallMobile ? '16px' : '24px',
        padding: isSmallMobile ? '12px 20px' : '16px 24px',
        fontSize: isSmallMobile ? '14px' : '16px',
      },
    };
  };

  const responsiveStyles = getResponsiveStyles();

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '48px 16px',
    color: AppTheme.greyLight,
    fontSize: '16px',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '48px 16px',
    color: AppTheme.primaryRed,
    fontSize: '16px',
  };

  const floatingButtonStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: AppTheme.gradients.primary,
    border: 'none',
    borderRadius: '50px',
    padding: '16px 24px',
    color: AppTheme.white,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: AppTheme.shadows.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 1000,
  };

  return (
    <div style={{ ...pageStyle, ...responsiveStyles.page }}>
      {/* Header */}
      <div style={{ ...headerStyle, ...responsiveStyles.header }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <CustomButton
            text="← Volver"
            onClick={() => onNavigate && onNavigate('admin-home')}
            variant="outline"
            size="small"
            fullWidth={false}
          />
          <h1 style={{ ...titleStyle, ...responsiveStyles.title }}>Categorías</h1>
        </div>
        <CustomButton
          text="Nueva Categoría"
          onClick={handleCreate}
          icon="➕"
          fullWidth={window.innerWidth <= 480}
        />
      </div>

      {/* Búsqueda */}
      <div style={{ ...searchContainerStyle, ...responsiveStyles.searchContainer }}>
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ ...searchInputStyle, ...responsiveStyles.searchInput }}
          onFocus={(e) => {
            e.target.style.borderColor = AppTheme.primaryRed;
            e.target.style.boxShadow = `0 0 0 2px ${AppTheme.primaryRed}33`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = AppTheme.greyDark;
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Formulario de creación/edición */}
      {showCreateForm && (
        <div style={{ ...createFormStyle, ...responsiveStyles.createForm }}>
          <div style={formTitleStyle}>
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </div>
          
          <div style={{ ...formRowStyle, ...responsiveStyles.formRow }}>
            <div style={{ flex: 1 }}>
              <CustomTextField
                controller={{ value: formData.name }}
                label="Nombre"
                hint="Ingresa el nombre de la categoría"
                onChanged={(value) => setFormData({ ...formData, name: value })}
                maxLength={50}
              />
            </div>
            <div style={{ flex: 2 }}>
              <CustomTextField
                controller={{ value: formData.description }}
                label="Descripción"
                hint="Descripción de la categoría (opcional)"
                onChanged={(value) => setFormData({ ...formData, description: value })}
                maxLines={2}
                maxLength={200}
              />
            </div>
          </div>
          
          <div style={{ ...formActionsStyle, ...responsiveStyles.formActions }}>
            <CustomButton
              text="Cancelar"
              variant="outline"
              onClick={resetForm}
              fullWidth={window.innerWidth <= 480}
            />
            <CustomButton
              text={editingCategory ? 'Actualizar' : 'Crear'}
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              isLoading={saving}
              fullWidth={window.innerWidth <= 480}
            />
          </div>
        </div>
      )}

      {/* Grid de categorías */}
      {loading ? (
        <div style={loadingStyle}>
          Cargando categorías...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div style={emptyStateStyle}>
          {searchText ? 'No se encontraron categorías' : 'No hay categorías'}
        </div>
      ) : (
        <div style={{ ...categoriesGridStyle, ...responsiveStyles.categoriesGrid }}>
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDelete(category)}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Botón flotante para crear */}
      {!showCreateForm && (
        <button
          style={{ ...floatingButtonStyle, ...responsiveStyles.floatingButton }}
          onClick={handleCreate}
        >
          <span>➕</span>
          Nueva Categoría
        </button>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
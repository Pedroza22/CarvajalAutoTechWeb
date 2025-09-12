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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningCategory, setAssigningCategory] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentPublicationStatus, setStudentPublicationStatus] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchText]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando categorías... [ARCHIVO CORRECTO]');
      const rows = await CategoriesService.getAllCategories();
      console.log('📋 Categorías obtenidas:', rows?.length || 0);
      
      const categoriesWithQuestions = await Promise.all(
        (Array.isArray(rows) ? rows : []).map(async (category) => {
          try {
            console.log(`🔍 Cargando preguntas para categoría: ${category.name} (ID: ${category.id})`);
            
            const { supabase } = await import('../services/supabase');
            
            // Primero verificar si hay preguntas en total
            const { data: allQuestions, error: allQuestionsError } = await supabase
              .from('questions')
              .select('id, category_id');
              
            console.log(`📊 Total de preguntas en la DB:`, allQuestions?.length || 0);
            if (allQuestionsError) {
              console.error('❌ Error consultando todas las preguntas:', allQuestionsError);
            }
            
            // Ahora consultar por categoría específica
            const { data: questions, error } = await supabase
              .from('questions')
              .select('id, category_id')
              .eq('category_id', category.id);

            if (error) {
              console.error(`❌ Error cargando preguntas para categoría ${category.id}:`, error);
              return { ...category, questionCount: 0 };
            }

            const questionCount = questions?.length || 0;
            console.log(`✅ Categoría ${category.name}: ${questionCount} preguntas`);
            console.log(`📋 Preguntas encontradas:`, questions?.map(q => ({ id: q.id, category_id: q.category_id })));
            return { ...category, questionCount };
          } catch (error) {
            console.error(`❌ Error cargando preguntas para categoría ${category.id}:`, error);
            return { ...category, questionCount: 0 };
          }
        })
      );
      
      console.log('📊 Categorías con preguntas cargadas:', categoriesWithQuestions);
      setCategories(categoriesWithQuestions);
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
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

  const handleAssign = async (category) => {
    setAssigningCategory(category);
    setShowAssignModal(true);
    await loadStudents();
    await loadAssignedStudents(category.id);
  };

  const loadStudents = async () => {
    try {
      const { supabase } = await import('../services/supabase');
      const { data, error } = await supabase
        .from('app_users_enriched')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      setStudents([]);
    }
  };

  const loadAssignedStudents = async (categoryId) => {
    try {
      const { supabase } = await import('../services/supabase');
      const { data, error } = await supabase
        .from('student_categories')
        .select('student_id, published')
        .eq('category_id', categoryId);

      if (error) throw error;
      
      const assignedStudentIds = (data || []).map(item => item.student_id);
      const publicationStatus = {};
      
      (data || []).forEach(item => {
        publicationStatus[item.student_id] = item.published;
      });
      
      setSelectedStudents(assignedStudentIds);
      setStudentPublicationStatus(publicationStatus);
    } catch (error) {
      console.error('Error cargando estudiantes asignados:', error);
      setSelectedStudents([]);
      setStudentPublicationStatus({});
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handlePublicationToggle = async (studentId, published) => {
    if (!assigningCategory) return;
    
    try {
      const { supabase } = await import('../services/supabase');
      const { error } = await supabase
        .from('student_categories')
        .update({ published })
        .eq('student_id', studentId)
        .eq('category_id', assigningCategory.id);

      if (error) throw error;
      
      setStudentPublicationStatus(prev => ({
        ...prev,
        [studentId]: published
      }));
      
      console.log(`✅ Categoría ${published ? 'publicada' : 'despublicada'} para estudiante ${studentId}`);
    } catch (error) {
      console.error('Error cambiando publicación:', error);
      alert('Error cambiando publicación: ' + error.message);
    }
  };

  const handleAssignSubmit = async () => {
    if (!assigningCategory) return;

    try {
      const { supabase } = await import('../services/supabase');
      
      // Obtener estudiantes previamente asignados
      const { data: previouslyAssigned } = await supabase
        .from('student_categories')
        .select('student_id')
        .eq('category_id', assigningCategory.id);

      const previouslyAssignedIds = previouslyAssigned?.map(item => item.student_id) || [];

      // Estudiantes a agregar
      const studentsToAdd = selectedStudents.filter(id => !previouslyAssignedIds.includes(id));
      
      // Estudiantes a eliminar
      const studentsToRemove = previouslyAssignedIds.filter(id => !selectedStudents.includes(id));

      // Agregar estudiantes
      for (const studentId of studentsToAdd) {
        await supabase
          .from('student_categories')
          .insert({
            student_id: studentId,
            category_id: assigningCategory.id,
            published: false
          });
      }

      // Eliminar estudiantes
      for (const studentId of studentsToRemove) {
        await supabase
          .from('student_categories')
          .delete()
          .eq('student_id', studentId)
          .eq('category_id', assigningCategory.id);
      }

      // Mostrar notificación de éxito
      const addedCount = studentsToAdd.length;
      const removedCount = studentsToRemove.length;
      let message = 'Estudiantes asignados correctamente';
      
      if (addedCount > 0 && removedCount > 0) {
        message = `${addedCount} estudiantes agregados, ${removedCount} estudiantes removidos`;
      } else if (addedCount > 0) {
        message = `${addedCount} estudiantes agregados`;
      } else if (removedCount > 0) {
        message = `${removedCount} estudiantes removidos`;
      }
      
      alert(message);
      setShowAssignModal(false);
      setAssigningCategory(null);
      setSelectedStudents([]);
      setStudentSearchTerm('');
      setStudentPublicationStatus({});
    } catch (error) {
      console.error('Error asignando estudiantes:', error);
      alert('Error asignando estudiantes: ' + error.message);
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
              onAssign={() => handleAssign(category)}
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

      {/* Modal para asignar estudiantes */}
      {showAssignModal && assigningCategory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: AppTheme.dark,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              color: AppTheme.white,
              marginBottom: '16px',
              fontSize: '1.2rem'
            }}>
              Asignar estudiantes a: {assigningCategory.name}
            </h3>
            
            <div style={{
              background: `${AppTheme.info}20`,
              border: `1px solid ${AppTheme.info}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                color: AppTheme.info,
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                💡 Información importante:
              </div>
              <div style={{
                color: AppTheme.greyLight,
                fontSize: '0.8rem',
                lineHeight: '1.4'
              }}>
                • Los estudiantes solo pueden ver las categorías que están <strong>asignadas Y publicadas</strong><br/>
                • Usa los botones 📢/🔒 para publicar/despublicar categorías individualmente<br/>
                • Las categorías no publicadas no aparecen en el dashboard del estudiante
              </div>
            </div>

            {/* Búsqueda de estudiantes */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Buscar estudiantes..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${AppTheme.greyDark}`,
                  background: AppTheme.dark,
                  color: AppTheme.white,
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Lista de estudiantes */}
            <div style={{
              maxHeight: '300px',
              overflow: 'auto',
              marginBottom: '20px',
              border: `1px solid ${AppTheme.greyDark}`,
              borderRadius: '8px',
              padding: '8px'
            }}>
              {students
                .filter(student => 
                  student.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                  student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
                )
                .map(student => (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: selectedStudents.includes(student.id) 
                        ? `${AppTheme.primaryRed}20` 
                        : 'transparent',
                      border: selectedStudents.includes(student.id) 
                        ? `1px solid ${AppTheme.primaryRed}` 
                        : '1px solid transparent',
                      marginBottom: '4px'
                    }}
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      style={{
                        marginRight: '12px',
                        transform: 'scale(1.2)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: AppTheme.white,
                        fontWeight: '500',
                        fontSize: '1rem'
                      }}>
                        {student.full_name}
                      </div>
                      <div style={{
                        color: AppTheme.greyLight,
                        fontSize: '0.9rem'
                      }}>
                        {student.email}
                      </div>
                    </div>
                    
                    {/* Estado de publicación */}
                    {selectedStudents.includes(student.id) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontSize: '0.8rem',
                          color: AppTheme.greyLight
                        }}>
                          {studentPublicationStatus[student.id] ? 'Publicada' : 'No publicada'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublicationToggle(student.id, !studentPublicationStatus[student.id]);
                          }}
                          style={{
                            background: studentPublicationStatus[student.id] 
                              ? AppTheme.success 
                              : AppTheme.warning,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          {studentPublicationStatus[student.id] ? '📢' : '🔒'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssigningCategory(null);
                  setSelectedStudents([]);
                  setStudentSearchTerm('');
                  setStudentPublicationStatus({});
                }}
                style={{
                  background: 'transparent',
                  color: AppTheme.white,
                  border: `1px solid ${AppTheme.greyDark}`,
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignSubmit}
                style={{
                  background: AppTheme.primaryRed,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Asignar ({selectedStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
import React, { useEffect, useState } from 'react';
import { AppTheme } from '../../utils/appTheme';
import CustomButton from '../CustomButton';
import QuestionsService from '../../services/QuestionsService';
import CategoriesService from '../../services/CategoriesService';
import useModal from '../../hooks/useModal';
import CustomModal from '../CustomModal';

const AdminQuestionsListPage = ({ onNavigate }) => {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const { modalState, showModal, hideModal, showSuccess, showError, showConfirm } = useModal();
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showModules, setShowModules] = useState(true);
  const [modulesCount, setModulesCount] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  // Asegurar que siempre inicie mostrando módulos
  useEffect(() => {
    setShowModules(true);
  }, []);

  useEffect(() => {
    if (!showModules) {
      loadQuestions();
    }
  }, [selectedCategory, page, pageSize, showModules]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paged, categoriesData] = await Promise.all([
        QuestionsService.getQuestionsPaged({ page, pageSize }),
        CategoriesService.getAllCategories()
      ]);
      const qData = Array.isArray(paged) ? paged : paged.data;
      setQuestions(qData || []);
      const totalCount = Array.isArray(paged) ? qData.length : (paged.total || 0);
      setTotal(totalCount);
      setModulesCount(Math.max(1, Math.ceil(totalCount / pageSize)));
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setQuestions([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      if (selectedCategory) {
        const byCat = await QuestionsService.getQuestionsByCategory(selectedCategory);
        setQuestions(byCat || []);
        setTotal((byCat || []).length);
      } else {
        const paged = await QuestionsService.getQuestionsPaged({ page, pageSize });
        setQuestions(paged.data || []);
        setTotal(paged.total || 0);
      }
    } catch (error) {
      console.error('Error cargando preguntas:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    console.log('🔍 Editando pregunta:', question);
    onNavigate('admin-create-question', { questionData: question });
  };

  const handleDeleteQuestion = async (questionId) => {
    showConfirm(
      'Eliminar Pregunta',
      '¿Estás seguro de que quieres eliminar esta pregunta?',
      async () => {
        await deleteQuestion(questionId);
      },
      () => {
        console.log('❌ Usuario canceló la eliminación');
      }
    );
  };

  const deleteQuestion = async (questionId) => {

    try {
      setLoading(true);
      await QuestionsService.deleteQuestion(questionId);
      console.log('✅ Pregunta eliminada exitosamente');
      showSuccess('Pregunta Eliminada', 'Pregunta eliminada exitosamente');
      await loadQuestions(); // Recargar la lista
    } catch (error) {
      console.error('❌ Error eliminando pregunta:', error);
      showError('Error', 'Error al eliminar la pregunta: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions
    .filter(q => q.question.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pageStyle = {
    padding: '20px',
    background: AppTheme.primaryBlack,
    minHeight: '100vh',
    maxWidth: '1400px',
    margin: '0 auto',
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

  const filtersStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  };

  const selectStyle = {
    padding: '12px 16px',
    background: AppTheme.lightBlack,
    border: `1px solid ${AppTheme.greyDark}`,
    borderRadius: AppTheme.borderRadius.medium,
    color: AppTheme.white,
    fontSize: '16px',
    fontFamily: AppTheme.typography.fontFamily,
    outline: 'none',
    minWidth: '200px',
  };

  const searchInputStyle = {
    flex: 1,
    minWidth: '300px',
    padding: '12px 16px',
    background: AppTheme.lightBlack,
    border: `1px solid ${AppTheme.greyDark}`,
    borderRadius: AppTheme.borderRadius.medium,
    color: AppTheme.white,
    fontSize: '16px',
    fontFamily: AppTheme.typography.fontFamily,
    outline: 'none',
  };

  const questionsListStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
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
      filters: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '12px' : '16px',
        padding: isSmallMobile ? '12px' : '16px',
      },
      filterSelect: {
        fontSize: isSmallMobile ? '14px' : '16px',
        padding: isSmallMobile ? '8px 12px' : '10px 16px',
      },
      searchInput: {
        fontSize: isSmallMobile ? '14px' : '16px',
        padding: isSmallMobile ? '10px 12px' : '12px 16px',
      },
      questionsList: {
        padding: isSmallMobile ? '8px' : '16px',
        gap: isSmallMobile ? '8px' : '12px',
      },
      questionCard: {
        padding: isSmallMobile ? '12px' : '16px',
        marginBottom: isSmallMobile ? '8px' : '12px',
      },
      questionHeader: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        alignItems: isSmallMobile ? 'stretch' : 'center',
        gap: isSmallMobile ? '8px' : '12px',
      },
      questionTitle: {
        fontSize: isSmallMobile ? '14px' : '16px',
        lineHeight: isSmallMobile ? '1.4' : '1.5',
      },
      questionMeta: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '4px' : '8px',
        fontSize: isSmallMobile ? '12px' : '14px',
      },
      questionActions: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '8px' : '12px',
        marginTop: isSmallMobile ? '12px' : '16px',
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

  const questionCardStyle = {
    ...AppTheme.card(),
    padding: '14px 16px',
    display: 'block',
    overflow: 'hidden'
  };

  const questionHeaderStyle = {
    display: 'block',
    marginBottom: '6px'
  };

  const questionTextStyle = {
    color: AppTheme.white,
    fontSize: '15px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const questionMetaStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end',
    minWidth: '0',
    flexShrink: 0
  };

  const categoryTagStyle = {
    background: AppTheme.primaryRed,
    color: AppTheme.white,
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 0
  };

  const typeTagStyle = {
    background: AppTheme.info,
    color: AppTheme.white,
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 0
  };

  const dateStyle = {
    color: AppTheme.greyLight,
    fontSize: '12px',
  };

  const optionsStyle = {
    marginTop: '12px',
    padding: '12px',
    background: AppTheme.greyDark,
    borderRadius: AppTheme.borderRadius.small,
  };

  const optionStyle = {
    color: AppTheme.greyLight,
    fontSize: '14px',
    marginBottom: '4px',
  };

  const correctOptionStyle = {
    ...optionStyle,
    color: AppTheme.success,
    fontWeight: '600',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '48px 16px',
    color: AppTheme.greyLight,
    fontSize: '16px',
  };

  // Formateador de texto para mejorar legibilidad (quiebres de línea después de puntos/bullets)
  const formatReadableText = (text = '') => {
    try {
      if (!text || typeof text !== 'string') return '';
      // Reemplazar bullets de tipo '• ' por saltos de línea antes
      let t = text.replace(/\s*•\s*/g, '\n• ');
      // Asegurar salto de línea después de punto seguido cuando hay viñetas largas
      t = t.replace(/\.\s+/g, '.\n');
      // Compactar múltiples saltos
      t = t.replace(/\n{3,}/g, '\n\n');
      return t.trim();
    } catch (_) {
      return String(text || '');
    }
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '48px 16px',
    color: AppTheme.primaryRed,
    fontSize: '16px',
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
          <h1 style={{ ...titleStyle, ...responsiveStyles.title }}>Lista de Preguntas</h1>
        </div>
        <CustomButton
          text="Nueva Pregunta"
          onClick={() => onNavigate && onNavigate('admin-create-question', null)}
          icon="➕"
          fullWidth={window.innerWidth <= 480}
        />
      </div>

      {/* Filtros */}
      <div style={{ ...filtersStyle, ...responsiveStyles.filters }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ ...selectStyle, ...responsiveStyles.filterSelect }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Buscar preguntas..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ ...searchInputStyle, ...responsiveStyles.searchInput }}
        />
      </div>

      {/* Selector de módulos */}
      {showModules ? (
        <div>
          {loading ? (
            <div style={loadingStyle}>
              Cargando módulos...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {Array.from({ length: modulesCount }).map((_, i) => {
                // Obtener la categoría de las preguntas de este módulo
                const moduleStart = (i * pageSize) + 1;
                const moduleEnd = Math.min((i + 1) * pageSize, total || (i + 1) * pageSize);
                const moduleQuestions = questions.filter(q => {
                  const questionNumber = questions.indexOf(q) + 1;
                  return questionNumber >= moduleStart && questionNumber <= moduleEnd;
                });
                
                // Obtener la categoría más común en este módulo
                const categoryCounts = {};
                moduleQuestions.forEach(q => {
                  const categoryName = getCategoryName(q.category_id);
                  categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
                });
                const mostCommonCategory = Object.keys(categoryCounts).reduce((a, b) => 
                  categoryCounts[a] > categoryCounts[b] ? a : b, 'Sin categoría'
                );
                
                return (
                  <div key={i} style={{ ...questionCardStyle, cursor: 'pointer' }} onClick={() => { setPage(i + 1); setShowModules(false); }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={questionTextStyle}>{`Módulo ${i + 1}`}</div>
                      <div style={{ 
                        color: AppTheme.primary, 
                        fontSize: 11, 
                        fontWeight: '500',
                        background: AppTheme.primary + '15',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${AppTheme.primary}30`
                      }}>
                        📂 {mostCommonCategory}
                      </div>
                    </div>
                    <div style={{ color: AppTheme.greyLight, fontSize: 12 }}>{`Preguntas ${moduleStart} – ${moduleEnd}`}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Lista de preguntas */}
          {loading ? (
        <div style={loadingStyle}>
          Cargando preguntas...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div style={emptyStateStyle}>
          {searchText ? 'No se encontraron preguntas' : 'No hay preguntas disponibles'}
        </div>
      ) : (
        <div style={{ ...questionsListStyle, ...responsiveStyles.questionsList }}>
          {/* Controles de paginación */}
          {!selectedCategory && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: AppTheme.greyLight }}>
              <div>
                <button onClick={() => setShowModules(true)} style={{ marginRight: 8, padding: '6px 10px', borderRadius: 6, border: `1px solid ${AppTheme.greyDark}`, background: AppTheme.lightBlack, color: AppTheme.white, cursor: 'pointer' }}>← Módulos</button>
                Módulo {page} de {totalPages} • {total} preguntas totales
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${AppTheme.greyDark}`, background: AppTheme.lightBlack, color: AppTheme.white, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${AppTheme.greyDark}`, background: AppTheme.lightBlack, color: AppTheme.white, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {filteredQuestions.map((question, idx) => (
            <div
              key={question.id}
              style={{ ...questionCardStyle, ...responsiveStyles.questionCard, cursor: 'pointer' }}
              onClick={() => setSelectedQuestion(question)}
            >
              <div style={questionHeaderStyle}>
                <div style={questionTextStyle}>{!selectedCategory ? `Pregunta ${((page - 1) * pageSize) + idx + 1}` : `Pregunta ${idx + 1}`}</div>
                <div style={{ color: AppTheme.greyLight, fontSize: 12, marginTop: 4 }}>Categoría: {getCategoryName(question.category_id)}</div>
              </div>
            </div>
          ))}
          {/* Controles de paginación (abajo) */}
          {!selectedCategory && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', color: AppTheme.greyLight }}>
              <div>
                Módulo {page} de {totalPages}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${AppTheme.greyDark}`, background: AppTheme.lightBlack, color: AppTheme.white, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${AppTheme.greyDark}`, background: AppTheme.lightBlack, color: AppTheme.white, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}
      
      {/* Modal personalizado */}
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        buttons={modalState.buttons}
        showCloseButton={modalState.showCloseButton}
      />

      {/* Panel de detalle de pregunta tipo modal simple */}
      {selectedQuestion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: AppTheme.lightBlack, border: `1px solid ${AppTheme.greyDark}`, borderRadius: 12, width: 'min(900px, 92vw)', maxHeight: '90vh', overflow: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ color: AppTheme.white, margin: 0, fontSize: 18 }}>Detalle de la pregunta</h2>
              <button onClick={() => setSelectedQuestion(null)} style={{ background: 'transparent', color: AppTheme.white, border: `1px solid ${AppTheme.greyDark}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Cerrar</button>
            </div>
            <div style={{ color: AppTheme.white, fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {formatReadableText(selectedQuestion.question)}
            </div>
            {selectedQuestion.options?.length > 0 && (
              <div style={optionsStyle}>
                <div style={{ color: AppTheme.white, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Opciones</div>
                {selectedQuestion.options.map((opt, i) => (
                  <div key={i} style={opt === selectedQuestion.correct_answer ? correctOptionStyle : optionStyle}>
                    {opt === selectedQuestion.correct_answer ? '✓ ' : '• '}{opt}
                  </div>
                ))}
              </div>
            )}
            {selectedQuestion.explanation && (
              <div style={{ marginTop: 12, padding: 12, background: AppTheme.info + '20', borderRadius: AppTheme.borderRadius.small }}>
                <div style={{ color: AppTheme.info, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Explicación</div>
                <div style={{ color: AppTheme.white, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {formatReadableText(selectedQuestion.explanation)}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { const q = selectedQuestion; setSelectedQuestion(null); handleEditQuestion(q); }} style={{ background: AppTheme.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>✏️ Editar</button>
              <button onClick={() => { const id = selectedQuestion.id; setSelectedQuestion(null); handleDeleteQuestion(id); }} style={{ background: AppTheme.danger, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>🗑️ Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsListPage;
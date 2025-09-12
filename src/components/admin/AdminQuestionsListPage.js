import React, { useEffect, useState } from 'react';
import { AppTheme } from '../../utils/appTheme';
import CustomButton from '../CustomButton';
import QuestionsService from '../../services/QuestionsService';
import CategoriesService from '../../services/CategoriesService';

const AdminQuestionsListPage = ({ onNavigate }) => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionsData, categoriesData] = await Promise.all([
        QuestionsService.getQuestions(),
        CategoriesService.getAllCategories()
      ]);
      setQuestions(questionsData || []);
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
      let questionsData;
      if (selectedCategory) {
        questionsData = await QuestionsService.getQuestionsByCategory(selectedCategory);
      } else {
        questionsData = await QuestionsService.getQuestions();
      }
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error cargando preguntas:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    console.log('🔍 Editando pregunta:', question);
    onNavigate('admin-create-question', question);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      return;
    }

    try {
      setLoading(true);
      await QuestionsService.deleteQuestion(questionId);
      console.log('✅ Pregunta eliminada exitosamente');
      alert('Pregunta eliminada exitosamente');
      await loadQuestions(); // Recargar la lista
    } catch (error) {
      console.error('❌ Error eliminando pregunta:', error);
      alert('Error al eliminar la pregunta: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question => 
    question.question.toLowerCase().includes(searchText.toLowerCase())
  );

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
    display: 'flex',
    flexDirection: 'column',
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
    padding: '20px',
  };

  const questionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
    minWidth: 0
  };

  const questionTextStyle = {
    color: AppTheme.white,
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '1.4',
    flex: 1,
    marginRight: '16px',
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
          onClick={() => onNavigate && onNavigate('admin-create-question')}
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
          {filteredQuestions.map((question) => (
            <div key={question.id} style={{ ...questionCardStyle, ...responsiveStyles.questionCard }}>
              <div style={{ ...questionHeaderStyle, ...responsiveStyles.questionHeader }}>
                <div style={{ ...questionTextStyle, ...responsiveStyles.questionTitle }}>
                  {question.question}
                </div>
                <div style={{ ...questionMetaStyle, ...responsiveStyles.questionMeta }}>
                  <div style={categoryTagStyle}>
                    {getCategoryName(question.category_id)}
                  </div>
                  <div style={typeTagStyle}>
                    {question.type === 'multiple_choice' ? 'Opción múltiple' :
                     question.type === 'true_false' ? 'Verdadero/Falso' :
                     question.type === 'text' ? 'Texto libre' : question.type}
                  </div>
                  <div style={dateStyle}>
                    {formatDate(question.created_at)}
                  </div>
                </div>
              </div>
              
              {question.options && question.options.length > 0 && (
                <div style={optionsStyle}>
                  <div style={{ color: AppTheme.white, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Opciones:
                  </div>
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      style={option === question.correct_answer ? correctOptionStyle : optionStyle}
                    >
                      {option === question.correct_answer ? '✓ ' : '• '}{option}
                    </div>
                  ))}
                </div>
              )}
              
              {question.explanation && (
                <div style={{ marginTop: '12px', padding: '12px', background: AppTheme.info + '20', borderRadius: AppTheme.borderRadius.small }}>
                  <div style={{ color: AppTheme.info, fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    Explicación:
                  </div>
                  <div style={{ color: AppTheme.white, fontSize: '14px' }}>
                    {question.explanation}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => handleEditQuestion(question)}
                  style={{
                    background: AppTheme.primary,
                    color: AppTheme.white,
                    border: 'none',
                    borderRadius: AppTheme.borderRadius.small,
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = AppTheme.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = AppTheme.primary;
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  style={{
                    background: AppTheme.danger,
                    color: AppTheme.white,
                    border: 'none',
                    borderRadius: AppTheme.borderRadius.small,
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = AppTheme.dangerDark;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = AppTheme.danger;
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsListPage;
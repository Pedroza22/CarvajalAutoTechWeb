import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import QuestionsService from '../../services/QuestionsService';
import CategoriesService from '../../services/CategoriesService';

const AdminQuestionsPage = ({ onNavigate }) => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    categoryId: '',
    difficulty: 'medium',
    points: 10
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, categoriesData] = await Promise.all([
        QuestionsService.getAllQuestions(),
        CategoriesService.getAllCategories()
      ]);
      
      setQuestions(questionsData);
      setCategories(categoriesData);
      console.log('✅ Datos cargados:', { questions: questionsData.length, categories: categoriesData.length });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(question => question.categoryId === selectedCategory);
    }

    setFilteredQuestions(filtered);
  };

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      categoryId: '',
      difficulty: 'medium',
      points: 10
    });
    setShowCreateModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || 0,
      explanation: question.explanation || '',
      categoryId: question.categoryId || '',
      difficulty: question.difficulty || 'medium',
      points: question.points || 10
    });
    setShowCreateModal(true);
  };

  const handleDeleteQuestion = async (question) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar esta pregunta?`)) {
      try {
        await QuestionsService.deleteQuestion(question.id);
        await loadData();
        alert('Pregunta eliminada exitosamente');
      } catch (error) {
        console.error('❌ Error eliminando pregunta:', error);
        alert('Error al eliminar la pregunta');
      }
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      alert('La pregunta es obligatoria');
      return;
    }

    if (!formData.categoryId) {
      alert('Debe seleccionar una categoría');
      return;
    }

    if (formData.options.filter(opt => opt.trim()).length < 2) {
      alert('Debe tener al menos 2 opciones');
      return;
    }

    try {
      const questionData = {
        ...formData,
        options: formData.options.filter(opt => opt.trim()),
        createdBy: 'current-user-id' // TODO: Obtener del contexto de usuario
      };

      if (editingQuestion) {
        await QuestionsService.updateQuestion(editingQuestion.id, questionData);
        alert('Pregunta actualizada exitosamente');
      } else {
        await QuestionsService.createQuestion(questionData);
        alert('Pregunta creada exitosamente');
      }
      
      setShowCreateModal(false);
      await loadData();
    } catch (error) {
      console.error('❌ Error guardando pregunta:', error);
      alert('Error al guardar la pregunta');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return getColor('success');
      case 'medium': return getColor('warning');
      case 'hard': return getColor('error');
      default: return getColor('textMuted');
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Media';
      case 'hard': return 'Difícil';
      default: return 'Media';
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: safeColor('textMuted')
      }}>
        Cargando preguntas...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary'),
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: safeColor('textPrimary'),
            margin: '0 0 8px 0'
          }}>
            Gestión de Preguntas
          </h1>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Administra las preguntas del sistema
          </p>
        </div>
        <button
          onClick={handleCreateQuestion}
          style={{
            background: safeColor('primary'),
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Nueva Pregunta
        </button>
      </div>

      {/* Filtros */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`,
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Buscar preguntas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${safeColor('border')}`,
            background: safeColor('dark'),
            color: safeColor('textPrimary'),
            fontSize: '1rem'
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            minWidth: '200px',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${safeColor('border')}`,
            background: safeColor('dark'),
            color: safeColor('textPrimary'),
            fontSize: '1rem'
          }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de preguntas */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        border: `1px solid ${safeColor('border')}`,
        overflow: 'hidden'
      }}>
        {filteredQuestions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: safeColor('textMuted')
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
              color: safeColor('textPrimary')
            }}>
              No hay preguntas
            </h3>
            <p style={{ margin: 0 }}>
              {searchTerm || selectedCategory
                ? 'No se encontraron preguntas con los filtros aplicados'
                : 'Crea tu primera pregunta para comenzar'
              }
            </p>
          </div>
        ) : (
          <div>
            {filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                style={{
                  padding: '20px',
                  borderBottom: index < filteredQuestions.length - 1 ? `1px solid ${safeColor('border')}33` : 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      margin: '0 0 12px 0',
                      color: safeColor('textPrimary'),
                      lineHeight: '1.4'
                    }}>
                      {question.question}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: safeColor('primary') + '20',
                        color: safeColor('primary'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        📂 {getCategoryName(question.categoryId)}
                      </span>
                      <span style={{
                        background: getDifficultyColor(question.difficulty) + '20',
                        color: getDifficultyColor(question.difficulty),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        🎯 {getDifficultyLabel(question.difficulty)}
                      </span>
                      <span style={{
                        background: safeColor('warning') + '20',
                        color: safeColor('warning'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        ⭐ {question.points || 10} pts
                      </span>
                    </div>

                    {question.explanation && (
                      <p style={{
                        fontSize: '0.9rem',
                        color: safeColor('textMuted'),
                        margin: '0 0 12px 0',
                        lineHeight: '1.4'
                      }}>
                        💡 {question.explanation}
                      </p>
                    )}

                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      📅 Creada: {formatDate(question.created_at)}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => handleEditQuestion(question)}
                      style={{
                        background: safeColor('warning'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question)}
                      style={{
                        background: safeColor('error'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: safeColor('textMuted'),
        fontSize: '0.9rem'
      }}>
        Mostrando {filteredQuestions.length} de {questions.length} preguntas
      </div>

      {/* Modal para crear/editar pregunta */}
      {showCreateModal && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: `1px solid ${safeColor('border')}`
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: safeColor('textPrimary'),
              margin: '0 0 20px 0'
            }}>
              {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </h2>

            <form onSubmit={handleSubmitQuestion}>
              {/* Pregunta */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Pregunta *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Escribe la pregunta aquí..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${safeColor('border')}`,
                    background: safeColor('dark'),
                    color: safeColor('textPrimary'),
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              {/* Categoría */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Categoría *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${safeColor('border')}`,
                    background: safeColor('dark'),
                    color: safeColor('textPrimary'),
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Opciones */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Opciones de respuesta *
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                      style={{ cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: `1px solid ${safeColor('border')}`,
                        background: safeColor('dark'),
                        color: safeColor('textPrimary'),
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Dificultad y puntos */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    marginBottom: '8px'
                  }}>
                    Dificultad
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${safeColor('border')}`,
                      background: safeColor('dark'),
                      color: safeColor('textPrimary'),
                      fontSize: '1rem'
                    }}
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Media</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    marginBottom: '8px'
                  }}>
                    Puntos
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                    min="1"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${safeColor('border')}`,
                      background: safeColor('dark'),
                      color: safeColor('textPrimary'),
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              {/* Explicación */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Explicación
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explicación de la respuesta correcta..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${safeColor('border')}`,
                    background: safeColor('dark'),
                    color: safeColor('textPrimary'),
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Botones */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'transparent',
                    color: safeColor('textPrimary'),
                    border: `1px solid ${safeColor('border')}`,
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: safeColor('primary'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingQuestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsPage;
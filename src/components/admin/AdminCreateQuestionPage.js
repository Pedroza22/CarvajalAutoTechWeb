import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import QuestionsService from '../../services/QuestionsService';
import CategoriesService from '../../services/CategoriesService';
import supabase from '../../config/supabase';

const AdminCreateQuestionPage = ({ onNavigate, questionData = null }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    question: '',
    type: 'multiple_choice',
    categoryId: '',
    options: ['', ''],
    correctAnswer: '',
    timeLimit: '',
    explanation: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isEditing = !!questionData;

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadQuestionData();
    }
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await CategoriesService.getAllCategories();
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
    }
  };

  const loadQuestionData = () => {
    if (questionData) {
      setFormData({
        question: questionData.question || '',
        type: questionData.type || 'multiple_choice',
        categoryId: questionData.category_id || '',
        options: questionData.options || ['', ''],
        correctAnswer: questionData.correct_answer || '',
        timeLimit: questionData.time_limit || '',
        explanation: questionData.explanation || '',
        imageUrl: questionData.image_url || ''
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Limpiar URL si hay archivo
    }
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `questions/${fileName}`;
      
      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.client.storage
        .from('images')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Obtener URL pública
      const { data: { publicUrl } } = supabase.client.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
      
      // Si la respuesta correcta era la opción eliminada, limpiarla
      if (formData.correctAnswer === formData.options[index]) {
        setFormData(prev => ({ ...prev, correctAnswer: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      alert('La pregunta es obligatoria');
      return;
    }
    
    if (!formData.categoryId) {
      alert('Selecciona una categoría');
      return;
    }
    
    if (formData.type !== 'free_text' && !formData.correctAnswer) {
      alert('Selecciona la respuesta correcta');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = formData.imageUrl.trim() || null;
      
      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }
      
      const questionPayload = {
        categoryId: formData.categoryId,
        type: formData.type,
        question: formData.question.trim(),
        options: formData.type === 'multiple_choice' ? formData.options.filter(opt => opt.trim()) : 
                 formData.type === 'true_false' ? ['Verdadero', 'Falso'] : [],
        correctAnswer: formData.correctAnswer,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        explanation: formData.explanation.trim() || null,
        imageUrl: imageUrl,
        createdBy: 'current-user-id' // Se manejará en el servicio
      };

      if (isEditing) {
        await QuestionsService.updateQuestion(questionData.id, questionPayload);
        alert('Pregunta actualizada exitosamente');
      } else {
        await QuestionsService.createQuestion(questionPayload);
        alert('Pregunta creada exitosamente');
      }
      
      onNavigate('admin-questions');
    } catch (error) {
      console.error('❌ Error guardando pregunta:', error);
      alert('Error al guardar la pregunta');
    } finally {
      setLoading(false);
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const getQuestionTypeIcon = (type) => {
    const iconMap = {
      'multiple_choice': '🔘',
      'true_false': '☑️',
      'free_text': '📝'
    };
    return iconMap[type] || '❓';
  };

  const getQuestionTypeLabel = (type) => {
    const typeMap = {
      'multiple_choice': 'Opción Múltiple',
      'true_false': 'Verdadero/Falso',
      'free_text': 'Texto Libre'
    };
    return typeMap[type] || type;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary'),
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <button
          onClick={() => onNavigate('admin-questions')}
          style={{
            background: 'transparent',
            border: `1px solid ${safeColor('border')}`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: safeColor('textPrimary'),
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Volver
        </button>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: safeColor('textPrimary'),
          margin: 0
        }}>
          {isEditing ? 'Editar Pregunta' : 'Crear Pregunta'}
        </h1>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${safeColor('border')}`
        }}>
          {/* Tipo de pregunta */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              marginBottom: '12px'
            }}>
              Tipo de Pregunta
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {[
                { value: 'multiple_choice', label: 'Opción Múltiple', icon: '🔘' },
                { value: 'true_false', label: 'Verdadero/Falso', icon: '☑️' },
                { value: 'free_text', label: 'Texto Libre', icon: '📝' }
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      type: type.value,
                      correctAnswer: '',
                      options: type.value === 'true_false' ? ['Verdadero', 'Falso'] : ['', '']
                    }));
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${formData.type === type.value ? safeColor('primary') : safeColor('border')}`,
                    background: formData.type === type.value ? `${safeColor('primary')}20` : 'transparent',
                    color: safeColor('textPrimary'),
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{type.icon}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              marginBottom: '8px'
            }}>
              Categoría
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
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
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pregunta */}
          <div style={{ marginBottom: '24px' }}>
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
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
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

          {/* Opciones (solo para opción múltiple) */}
          {formData.type === 'multiple_choice' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <label style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary')
                }}>
                  Opciones *
                </label>
                {formData.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    style={{
                      background: safeColor('success'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ Agregar
                  </button>
                )}
              </div>
              {formData.options.map((option, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={option}
                    checked={formData.correctAnswer === option}
                    onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '6px',
                      border: `1px solid ${safeColor('border')}`,
                      background: safeColor('dark'),
                      color: safeColor('textPrimary'),
                      fontSize: '1rem'
                    }}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      style={{
                        background: safeColor('error'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Respuesta correcta para verdadero/falso */}
          {formData.type === 'true_false' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: safeColor('textPrimary'),
                marginBottom: '12px'
              }}>
                Respuesta Correcta *
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Verdadero', 'Falso'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('correctAnswer', option)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${formData.correctAnswer === option ? safeColor('success') : safeColor('border')}`,
                      background: formData.correctAnswer === option ? `${safeColor('success')}20` : 'transparent',
                      color: safeColor('textPrimary'),
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Respuesta esperada para texto libre */}
          {formData.type === 'free_text' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: safeColor('textPrimary'),
                marginBottom: '8px'
              }}>
                Respuesta Esperada *
              </label>
              <input
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                placeholder="Escribe la respuesta correcta..."
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
              />
            </div>
          )}

          {/* Límite de tiempo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              marginBottom: '8px'
            }}>
              Límite de Tiempo (segundos) - Opcional
            </label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => handleInputChange('timeLimit', e.target.value)}
              placeholder="Ej: 30"
              min="1"
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

          {/* Explicación */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              marginBottom: '8px'
            }}>
              Explicación - Opcional
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Explica por qué la respuesta es correcta..."
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

          {/* Subida de imagen */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              marginBottom: '8px'
            }}>
              Imagen - Opcional
            </label>
            
            {/* Input de archivo */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${safeColor('border')}`,
                background: safeColor('dark'),
                color: safeColor('textPrimary'),
                fontSize: '1rem',
                marginBottom: '8px'
              }}
            />
            
            {/* Mostrar archivo seleccionado */}
            {selectedFile && (
              <div style={{
                padding: '8px 12px',
                background: safeColor('primary') + '20',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: safeColor('primary'),
                marginBottom: '8px'
              }}>
                📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            
            {/* O URL como alternativa */}
            <div style={{ marginTop: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: safeColor('textMuted'),
                marginBottom: '4px'
              }}>
                O ingresa una URL:
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => {
                  handleInputChange('imageUrl', e.target.value);
                  if (e.target.value) setSelectedFile(null); // Limpiar archivo si hay URL
                }}
                placeholder="https://ejemplo.com/imagen.jpg"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${safeColor('border')}`,
                  background: safeColor('dark'),
                  color: safeColor('textPrimary'),
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => onNavigate('admin-questions')}
              style={{
                background: 'transparent',
                color: safeColor('textPrimary'),
                border: `1px solid ${safeColor('border')}`,
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: safeColor('primary'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateQuestionPage;
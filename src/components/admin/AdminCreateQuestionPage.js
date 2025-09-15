import React, { useState, useEffect, useCallback } from 'react';
import { getColor } from '../../utils/constants';
import QuestionsService from '../../services/QuestionsService';
import CategoriesService from '../../services/CategoriesService';
import { supabase } from '../../services/supabase';
import useModal from '../../hooks/useModal';
import CustomModal from '../CustomModal';

const AdminCreateQuestionPage = ({ onNavigate, questionData = null }) => {
  console.log('🔍 AdminCreateQuestionPage - supabase disponible:', !!supabase);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    question: '',
    type: 'multiple_choice',
    categoryId: '',
    moduleId: 1,
    options: ['', ''],
    correctAnswer: '',
    timeLimit: '',
    explanation: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showNewModuleForm, setShowNewModuleForm] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const { modalState, showModal, hideModal, showSuccess, showError } = useModal();

  const isEditing = !!questionData;

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await CategoriesService.getAllCategories();
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
    }
  }, [formData.categoryId]);

  const loadQuestionData = useCallback(() => {
    if (questionData) {
      console.log('🔍 Cargando datos de pregunta:', questionData);
      
      // Mapear tipos de Flutter a tipos de UI
      const typeMapping = {
        'multipleChoice': 'multiple_choice',
        'trueFalse': 'true_false',
        'freeText': 'free_text'
      };
      
      const uiType = typeMapping[questionData.type] || questionData.type || 'multiple_choice';
      
      setFormData({
        question: questionData.question || '',
        type: uiType,
        categoryId: questionData.category_id || '',
        options: questionData.options || (uiType === 'true_false' ? ['Verdadero', 'Falso'] : ['', '']),
        correctAnswer: questionData.correct_answer || '',
        timeLimit: questionData.time_limit || '',
        explanation: questionData.explanation || '',
        imageUrl: questionData.imageUrl || questionData.image_url || ''
      });
    }
  }, [questionData]);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadQuestionData();
    }
  }, [isEditing, loadCategories, loadQuestionData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showError('Archivo Inválido', 'Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, WebP)');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Archivo Muy Grande', 'El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }
      
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Limpiar URL si hay archivo
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    try {
      setUploading(true);
      console.log('📤 Iniciando subida de archivo...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      console.log('🔍 Verificando supabase:', supabase);
      if (!supabase) {
        throw new Error('Supabase no está disponible');
      }
      
      // Crear nombre único para el archivo (igual que en Flutter)
      const fileName = `${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;
      const filePath = `questions/${fileName}`;
      
      console.log('📁 Subiendo archivo:', {
        fileName: fileName,
        filePath: filePath,
        fileSize: file.size
      });
      
      // Subir archivo a Supabase Storage (igual que en Flutter)
      const { error: uploadError } = await supabase.storage
        .from('question_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ Error subiendo archivo:', uploadError);
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }
      
      // Obtener URL pública (igual que en Flutter)
      const { data: { publicUrl } } = supabase.storage
        .from('question_images')
        .getPublicUrl(fileName);
      
      console.log('✅ Archivo subido exitosamente:', {
        fileName: fileName,
        publicUrl: publicUrl
      });
      
      return publicUrl;
      
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);
      
      // Mostrar mensaje de error más específico
      if (error.message.includes('Bucket not found')) {
        throw new Error('El bucket de imágenes no está configurado. Por favor contacta al administrador para configurar el almacenamiento de imágenes.');
      } else if (error.message.includes('El archivo es demasiado grande')) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB permitido.');
      } else if (error.message.includes('Solo se permiten archivos de imagen')) {
        throw new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP).');
      } else {
        throw new Error(`Error subiendo archivo: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const handleOptionChange = useCallback((index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  }, [formData.options]);

  const addOption = useCallback(() => {
    if (formData.options.length < 6) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  }, [formData.options.length]);

  const removeOption = useCallback((index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
      
      // Si la respuesta correcta era la opción eliminada, limpiarla
      if (formData.correctAnswer === formData.options[index]) {
        setFormData(prev => ({ ...prev, correctAnswer: '' }));
      }
    }
  }, [formData.options, formData.correctAnswer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      showError('Campo Requerido', 'La pregunta es obligatoria');
      return;
    }
    
    if (!formData.categoryId) {
      showError('Campo Requerido', 'Selecciona una categoría');
      return;
    }
    
    if (!formData.correctAnswer) {
      showError('Campo Requerido', 'Selecciona la respuesta correcta');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = null;
      
      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        try {
          console.log('📤 Subiendo archivo seleccionado...');
          imageUrl = await uploadFile(selectedFile);
          console.log('✅ Imagen subida exitosamente:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Error subiendo imagen:', uploadError);
          showError('Error de Subida', `Error subiendo imagen: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }
      
      const questionPayload = {
        categoryId: formData.categoryId,
        type: formData.type,
        question: formData.question.trim(),
        options: formData.options.filter(opt => opt.trim()),
        correctAnswer: formData.correctAnswer,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        explanation: formData.explanation.trim() || null,
        imageUrl: imageUrl, // URL de la imagen subida o URL proporcionada
        // createdBy se manejará en el servicio
      };

      if (isEditing) {
        await QuestionsService.updateQuestion(questionData.id, questionPayload);
        showSuccess('Pregunta Actualizada', 'Pregunta actualizada exitosamente');
      } else {
        await QuestionsService.createQuestion(questionPayload);
        showSuccess('Pregunta Creada', 'Pregunta creada exitosamente');
      }
      
      // Navegar después de mostrar el mensaje
      setTimeout(() => {
        onNavigate('admin-questions');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error guardando pregunta:', error);
      showError('Error al Guardar', 'Error al guardar la pregunta: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  // const getQuestionTypeIcon = (type) => {
  //   const iconMap = {
  //     'multiple_choice': '🔘',
  //     'true_false': '☑️',
  //     'free_text': '📝'
  //   };
  //   return iconMap[type] || '❓';
  // };

  // const getQuestionTypeLabel = (type) => {
  //   const typeMap = {
  //     'multiple_choice': 'Opción Múltiple',
  //     'true_false': 'Verdadero/Falso',
  //     'free_text': 'Texto Libre'
  //   };
  //   return typeMap[type] || type;
  // };

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
          {/* Tipo de pregunta - Solo Opción Múltiple */}
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
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${safeColor('primary')}`,
              background: `${safeColor('primary')}20`,
              color: safeColor('primary'),
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>🔘</span>
              Opción Múltiple
            </div>
          </div>

          {/* Módulo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              marginBottom: '8px'
            }}>
              Módulo
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={formData.moduleId}
                onChange={(e) => handleInputChange('moduleId', parseInt(e.target.value))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${safeColor('border')}`,
                  background: safeColor('dark'),
                  color: safeColor('textPrimary'),
                  fontSize: '1rem'
                }}
              >
                <option value={1}>Módulo 1</option>
                <option value={2}>Módulo 2</option>
                <option value={3}>Módulo 3</option>
                <option value={4}>Módulo 4</option>
                <option value={5}>Módulo 5</option>
              </select>
              <button
                type="button"
                onClick={() => setShowNewModuleForm(!showNewModuleForm)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${safeColor('primary')}`,
                  background: 'transparent',
                  color: safeColor('primary'),
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + Nuevo
              </button>
            </div>
            {/* Mostrar categoría del módulo */}
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              background: safeColor('primary') + '15',
              borderRadius: '6px',
              border: `1px solid ${safeColor('primary')}30`,
              fontSize: '0.9rem',
              color: safeColor('primary'),
              fontWeight: '500'
            }}>
              📂 Categoría: {categories.find(cat => cat.id === formData.categoryId)?.name || 'Selecciona una categoría'}
            </div>
            {showNewModuleForm && (
              <div style={{ marginTop: '12px', padding: '12px', background: safeColor('cardBg'), borderRadius: '8px', border: `1px solid ${safeColor('border')}` }}>
                <input
                  type="text"
                  placeholder="Nombre del nuevo módulo"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${safeColor('border')}`,
                    background: safeColor('dark'),
                    color: safeColor('textPrimary'),
                    fontSize: '0.9rem',
                    marginBottom: '8px'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (newModuleName.trim()) {
                        const newModuleId = Math.max(...Array.from({ length: 5 }, (_, i) => i + 1)) + 1;
                        handleInputChange('moduleId', newModuleId);
                        setShowNewModuleForm(false);
                        setNewModuleName('');
                        showSuccess('Módulo Creado', `Módulo "${newModuleName}" creado exitosamente`);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: safeColor('success'),
                      color: 'white',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewModuleForm(false);
                      setNewModuleName('');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${safeColor('border')}`,
                      background: 'transparent',
                      color: safeColor('textPrimary'),
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
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

          {/* Opciones */}
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
            
            {/* Input de archivo - solo mostrar si no hay imagen */}
            {!formData.imageUrl && (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${safeColor('border')}`,
                  background: uploading ? safeColor('border') : safeColor('dark'),
                  color: safeColor('textPrimary'),
                  fontSize: '1rem',
                  marginBottom: '8px',
                  opacity: uploading ? 0.6 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              />
            )}
            
            {/* Mostrar estado de carga */}
            {uploading && (
              <div style={{
                padding: '8px 12px',
                background: safeColor('warning') + '20',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: safeColor('warning'),
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${safeColor('warning')}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Subiendo imagen...
              </div>
            )}
            
            {/* Mostrar imagen actual o archivo seleccionado */}
            {formData.imageUrl && !selectedFile && !uploading && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: `1px solid ${safeColor('border')}`,
                  marginBottom: '8px'
                }}>
                  <img 
                    src={formData.imageUrl} 
                    alt="Imagen de la pregunta"
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    type="button"
                    onClick={handleFileChange}
                    style={{
                      background: safeColor('primary'),
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ✏️ Reemplazar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    style={{
                      background: 'none',
                      color: safeColor('error'),
                      border: `1px solid ${safeColor('error')}`,
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            )}

            {/* Mostrar archivo seleccionado */}
            {selectedFile && !uploading && (
              <div style={{
                padding: '8px 12px',
                background: safeColor('primary') + '20',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: safeColor('primary'),
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    document.querySelector('input[type="file"]').value = '';
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: safeColor('primary'),
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0',
                    marginLeft: 'auto'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            
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
    </div>
  );
};

export default AdminCreateQuestionPage;
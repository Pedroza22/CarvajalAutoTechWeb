import React, { useEffect, useMemo, useState } from 'react';
import { getColor } from '../../utils/constants';
import { AppTheme } from '../../utils/appTheme';
import CustomButton from '../CustomButton';
import CategoriesService from '../../services/CategoriesService';
import QuestionsService from '../../services/QuestionsService';

const OptionRow = ({ index, value, onChange, onRemove, selected, onSelect }) => {
  const isSmallMobile = window.innerWidth <= 480;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8, 
      marginBottom: 8,
      flexDirection: isSmallMobile ? 'column' : 'row'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        width: isSmallMobile ? '100%' : 'auto' 
      }}>
        <input type="radio" name="correct" checked={selected} onChange={() => onSelect(index)} />
        <input
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder={`Opción ${index + 1}`}
          style={{
            flex: 1,
            padding: isSmallMobile ? '8px 10px' : '10px',
            borderRadius: 10,
            border: `1px solid ${getColor('border')}`,
            background: getColor('dark'),
            color: getColor('textPrimary'),
            fontSize: isSmallMobile ? '14px' : '16px'
          }}
        />
      </div>
      <CustomButton 
        text="-" 
        variant="outline" 
        onClick={() => onRemove(index)} 
        fullWidth={isSmallMobile}
      />
    </div>
  );
};

const AdminCreateQuestionPage = ({ onSaved }) => {
  const [type, setType] = useState('multipleChoice');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState('');
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

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
        padding: isSmallMobile ? '12px' : '16px',
      },
      headerContent: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        alignItems: isSmallMobile ? 'center' : 'flex-start',
        gap: isSmallMobile ? '8px' : '12px',
      },
      headerIcon: {
        width: isSmallMobile ? '40px' : '48px',
        height: isSmallMobile ? '40px' : '48px',
      },
      headerTitle: {
        fontSize: isSmallMobile ? '16px' : '18px',
      },
      headerSubtitle: {
        fontSize: isSmallMobile ? '12px' : '13px',
      },
      typeSelector: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '8px' : '12px',
        marginBottom: isSmallMobile ? '12px' : '16px',
      },
      formField: {
        marginBottom: isSmallMobile ? '12px' : '16px',
      },
      formInput: {
        fontSize: isSmallMobile ? '14px' : '16px',
        padding: isSmallMobile ? '10px 12px' : '12px 16px',
      },
      formSelect: {
        fontSize: isSmallMobile ? '14px' : '16px',
        padding: isSmallMobile ? '10px 12px' : '12px 16px',
      },
      formTextarea: {
        fontSize: isSmallMobile ? '14px' : '16px',
        padding: isSmallMobile ? '10px 12px' : '12px 16px',
        minHeight: isSmallMobile ? '80px' : '100px',
      },
      optionsContainer: {
        gap: isSmallMobile ? '8px' : '12px',
      },
      optionItem: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '8px' : '12px',
        marginBottom: isSmallMobile ? '8px' : '12px',
      },
      optionInput: {
        fontSize: isSmallMobile ? '14px' : '16px',
        padding: isSmallMobile ? '8px 10px' : '10px 12px',
      },
      formActions: {
        flexDirection: isSmallMobile ? 'column' : 'row',
        gap: isSmallMobile ? '8px' : '12px',
        marginTop: isSmallMobile ? '16px' : '24px',
      },
    };
  };

  const responsiveStyles = getResponsiveStyles();

  useEffect(() => {
    const load = async () => {
      const rows = await CategoriesService.getAllCategories();
      setCategories(rows);
      if (rows.length && !categoryId) setCategoryId(rows[0].id);
    };
    load();
  }, []);

  const addOption = () => setOptions((o) => [...o, '']);
  const removeOption = (idx) => setOptions((o) => o.filter((_, i) => i !== idx));
  const changeOption = (idx, val) => setOptions((o) => o.map((v, i) => (i === idx ? val : v)));

  const save = async () => {
    if (!question.trim() || !categoryId) return;
    setSaving(true);
    try {
      const payload = {
        categoryId,
        type: type === 'multipleChoice' ? 'multiple_choice' : type === 'trueFalse' ? 'true_false' : 'text',
        question: question.trim(),
        options: type === 'multipleChoice' ? options.map((s) => s.trim()) : [],
        correctAnswer:
          type === 'multipleChoice' ? options[correctIdx]?.trim() : type === 'trueFalse' ? (correctIdx === 0 ? 'Verdadero' : 'Falso') : '',
        timeLimit: timeEnabled ? Number(timeLimit) || null : null,
        imageUrl: null,
        explanation: explanation.trim() || null,
      };
      await QuestionsService.createQuestion(payload);
      if (onSaved) onSaved();
    } catch (e) {
      console.error(e);
      alert('Error guardando la pregunta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={responsiveStyles.page}>
      {/* Header */}
      <div style={{
        background: AppTheme.gradientPrimary,
        borderRadius: 16,
        ...responsiveStyles.header,
        boxShadow: AppTheme.shadow,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', ...responsiveStyles.headerContent }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ ...responsiveStyles.headerIcon, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📝</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, ...responsiveStyles.headerTitle }}>Crear pregunta</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', ...responsiveStyles.headerSubtitle }}>Define el contenido y la respuesta correcta</div>
            </div>
          </div>
          <CustomButton
            text="← Volver"
            onClick={() => onSaved && onSaved()}
            variant="outline"
            size="small"
            fullWidth={window.innerWidth <= 480}
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
          />
        </div>
      </div>

      {/* Type selector */}
      <div style={{ display: 'flex', ...responsiveStyles.typeSelector }}>
        <CustomButton 
          text="Opción múltiple" 
          onClick={() => setType('multipleChoice')} 
          variant={type === 'multipleChoice' ? 'default' : 'outline'} 
          fullWidth={window.innerWidth <= 480}
        />
        <CustomButton 
          text="Verdadero/Falso" 
          onClick={() => setType('trueFalse')} 
          variant={type === 'trueFalse' ? 'default' : 'outline'} 
          fullWidth={window.innerWidth <= 480}
        />
        <CustomButton 
          text="Texto libre" 
          onClick={() => setType('freeText')} 
          variant={type === 'freeText' ? 'default' : 'outline'} 
          fullWidth={window.innerWidth <= 480}
        />
      </div>

      {/* Category */}
      <div style={responsiveStyles.formField}>
        <div style={{ color: getColor('textPrimary'), marginBottom: 6 }}>Categoría</div>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{
          ...responsiveStyles.formSelect,
          borderRadius: 10,
          border: `1px solid ${getColor('border')}`,
          background: getColor('dark'),
          color: getColor('textPrimary'),
          width: '100%'
        }}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Question */}
      <div style={responsiveStyles.formField}>
        <div style={{ color: getColor('textPrimary'), marginBottom: 6 }}>Pregunta</div>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Escribe la pregunta..." rows={4} style={{
          width: '100%', ...responsiveStyles.formTextarea, borderRadius: 12, border: `1px solid ${getColor('border')}`,
          background: getColor('dark'), color: getColor('textPrimary')
        }} />
      </div>

      {/* Explanation */}
      <div style={responsiveStyles.formField}>
        <div style={{ color: getColor('textPrimary'), marginBottom: 6 }}>Explicación (opcional)</div>
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explica por qué la respuesta es correcta..." rows={3} style={{
          width: '100%', ...responsiveStyles.formTextarea, borderRadius: 12, border: `1px solid ${getColor('border')}`,
          background: getColor('dark'), color: getColor('textPrimary')
        }} />
      </div>

      {/* Options */}
      {type === 'multipleChoice' && (
        <div style={responsiveStyles.formField}>
          <div style={{ color: getColor('textPrimary'), marginBottom: 6 }}>Opciones</div>
          <div style={responsiveStyles.optionsContainer}>
            {options.map((opt, i) => (
              <OptionRow key={i} index={i} value={opt} onChange={changeOption} onRemove={removeOption} selected={i === correctIdx} onSelect={setCorrectIdx} />
            ))}
          </div>
          <CustomButton 
            text="Añadir opción" 
            variant="outline" 
            onClick={addOption} 
            fullWidth={window.innerWidth <= 480}
          />
        </div>
      )}

      {type === 'trueFalse' && (
        <div style={responsiveStyles.formField}>
          <div style={{ color: getColor('textPrimary'), marginBottom: 6 }}>Respuesta correcta</div>
          <div style={{ display: 'flex', gap: 12, flexDirection: window.innerWidth <= 480 ? 'column' : 'row' }}>
            <label><input type="radio" name="tf" checked={correctIdx === 0} onChange={() => setCorrectIdx(0)} /> Verdadero</label>
            <label><input type="radio" name="tf" checked={correctIdx === 1} onChange={() => setCorrectIdx(1)} /> Falso</label>
          </div>
        </div>
      )}

      {type === 'freeText' && (
        <div style={{ ...responsiveStyles.formField, color: getColor('textMuted') }}>
          La respuesta correcta se validará por texto exacto en una versión posterior.
        </div>
      )}

      {/* Time limit */}
      <div style={responsiveStyles.formField}>
        <label style={{ color: getColor('textPrimary') }}>
          <input type="checkbox" checked={timeEnabled} onChange={(e) => setTimeEnabled(e.target.checked)} /> Limite de tiempo (segundos)
        </label>
        {timeEnabled && (
          <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} style={{
            marginLeft: 12, width: 120, ...responsiveStyles.formInput, borderRadius: 10, border: `1px solid ${getColor('border')}`,
            background: getColor('dark'), color: getColor('textPrimary')
          }} />
        )}
      </div>

      <div style={{ ...responsiveStyles.formActions }}>
        <CustomButton 
          text="Crear Pregunta" 
          onClick={save} 
          isLoading={saving} 
          fullWidth={window.innerWidth <= 480}
        />
        <CustomButton 
          text="Cancelar" 
          variant="outline" 
          onClick={() => onSaved && onSaved()} 
          fullWidth={window.innerWidth <= 480}
        />
      </div>
    </div>
  );
};

export default AdminCreateQuestionPage;



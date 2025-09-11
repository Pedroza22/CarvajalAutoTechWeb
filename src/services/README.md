# Servicios de Carvajal AutoTech

Este directorio contiene todos los servicios de la aplicación web de React, basados en la arquitectura de la aplicación móvil Flutter.

## 📁 Estructura de Servicios

### 🔐 AuthService
Manejo completo de autenticación y autorización.

```javascript
import { AuthService } from './services';

// Registro de estudiante
const result = await AuthService.signUpStudent({
  email: 'estudiante@ejemplo.com',
  password: 'contraseña123',
  firstName: 'Juan',
  lastName: 'Pérez'
});

// Login
const loginResult = await AuthService.signInWithEmailPassword({
  email: 'estudiante@ejemplo.com',
  password: 'contraseña123',
  expectedRole: 'student',
  rememberMe: true
});

// Verificar autenticación
const isAuth = AuthService.isAuthenticated;
const isAdmin = await AuthService.isAdmin();
```

### 📚 CategoryService
Gestión de categorías de preguntas.

```javascript
import { CategoryService } from './services';

// Obtener categorías activas (para estudiantes)
const categories = await CategoryService.getActiveCategories();

// Obtener todas las categorías (para admins)
const allCategories = await CategoryService.getAllCategories();

// Crear nueva categoría (solo admins)
const newCategory = await CategoryService.createCategory({
  name: 'Matemáticas',
  description: 'Preguntas de matemáticas básicas',
  createdBy: 'admin-user-id'
});
```

### ❓ QuestionsService
Gestión de preguntas y quizzes.

```javascript
import { QuestionsService } from './services';

// Obtener preguntas por categoría
const questions = await QuestionsService.getQuestionsByCategory('category-id');

// Crear nueva pregunta (solo admins)
const newQuestion = await QuestionsService.createQuestion({
  categoryId: 'category-id',
  type: 'multiple_choice',
  question: '¿Cuál es la capital de España?',
  options: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
  correctAnswer: 'Madrid',
  timeLimit: 30,
  imageUrl: 'https://ejemplo.com/imagen.jpg' // Opcional
});

// Obtener preguntas para quiz
const quizQuestions = await QuestionsService.getQuestionsForQuiz('category-id', 10);

// Validar respuesta
const isCorrect = QuestionsService.validateAnswer(question, userAnswer);
```

### 📝 StudentAnswersService
Gestión de respuestas de estudiantes.

```javascript
import { StudentAnswersService } from './services';

// Guardar respuesta
await StudentAnswersService.saveAnswer({
  questionId: 'question-id',
  answer: 'Madrid',
  isCorrect: true,
  timeSpent: 15 // segundos
});

// Obtener respuestas del estudiante
const answers = await StudentAnswersService.getStudentAnswers();

// Obtener estadísticas
const stats = await StudentAnswersService.getStudentStats();

// Verificar si ya respondió
const isAnswered = await StudentAnswersService.isQuestionAnswered('question-id');
```

### 📊 StatisticsService
Estadísticas y reportes.

```javascript
import { StatisticsService } from './services';

// Estadísticas generales
const overallStats = await StatisticsService.getOverallStats();

// Estadísticas por categoría
const categoryStats = await StatisticsService.getCategoryStats();

// Estadísticas para dashboard
const dashboardStats = await StatisticsService.getDashboardStats();

// Top estudiantes (solo admins)
const topStudents = await StatisticsService.getTopStudents();

// Reporte de progreso
const progressReport = await StatisticsService.generateProgressReport(null, 30); // 30 días
```

## 🔄 Integración con Modo Demo

Todos los servicios están diseñados para funcionar tanto con Supabase real como en modo demo. El modo demo se activa automáticamente cuando `DEMO_MODE = true` en `useAuth.js`.

### Modo Demo
- ✅ Login/registro simulado
- ✅ Datos de prueba
- ✅ Sin conexión a base de datos
- ✅ Funcionalidad completa para testing

### Modo Producción
- ✅ Conexión real a Supabase
- ✅ Autenticación completa
- ✅ Persistencia de datos
- ✅ Seguridad RLS

## 🛠️ Configuración

### Variables de Entorno
```env
REACT_APP_SUPABASE_URL=tu_url_de_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Modo Demo
Para activar/desactivar el modo demo, modifica en `src/hooks/useAuth.js`:
```javascript
const DEMO_MODE = true; // true = demo, false = producción
```

## 📱 Compatibilidad con Flutter

Estos servicios están diseñados para ser equivalentes a los servicios de Flutter:

| Flutter | React | Estado |
|---------|-------|--------|
| `AuthService` | `AuthService` | ✅ Completo |
| `CategoryService` | `CategoryService` | ✅ Completo |
| `QuestionsService` | `QuestionsService` | ✅ Completo |
| `StudentAnswersService` | `StudentAnswersService` | ✅ Completo |
| `StatisticsService` | `StatisticsService` | ✅ Completo |

## 🚀 Uso en Componentes

```javascript
import React, { useState, useEffect } from 'react';
import { CategoryService, QuestionsService } from './services';

const QuizComponent = () => {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getActiveCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadQuestions = async (categoryId) => {
    try {
      const data = await QuestionsService.getQuestionsForQuiz(categoryId, 10);
      setQuestions(data);
    } catch (error) {
      console.error('Error cargando preguntas:', error);
    }
  };

  return (
    <div>
      {/* Tu componente aquí */}
    </div>
  );
};
```

## 🔧 Debugging

Todos los servicios incluyen logging detallado:
- ✅ Logs de éxito con ✅
- ❌ Logs de error con ❌
- 🔍 Logs de debug con 🔍
- ⚠️ Logs de advertencia con ⚠️

Revisa la consola del navegador para ver los logs detallados.


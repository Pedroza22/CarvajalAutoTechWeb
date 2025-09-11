// Servicio para gestión de cursos
let courses = [
  {
    id: '1',
    title: 'Fundamentos de Programación',
    description: 'Curso básico de programación para principiantes',
    duration: 30, // minutos
    questions: ['1', '2', '3'],
    assignedStudents: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    title: 'Base de Datos SQL',
    description: 'Aprende a trabajar con bases de datos relacionales',
    duration: 45,
    questions: ['4', '5'],
    assignedStudents: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
];

let questions = [
  {
    id: '1',
    courseId: '1',
    question: '¿Qué es una variable en programación?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Un valor fijo', isCorrect: false },
      { id: 'b', text: 'Un contenedor para almacenar datos', isCorrect: true },
      { id: 'c', text: 'Una función', isCorrect: false },
      { id: 'd', text: 'Un bucle', isCorrect: false }
    ],
    timeLimit: 60, // segundos
    points: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    courseId: '1',
    question: '¿Cuál es la diferencia entre == y === en JavaScript?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'No hay diferencia', isCorrect: false },
      { id: 'b', text: '== compara valor, === compara valor y tipo', isCorrect: true },
      { id: 'c', text: '=== es más rápido', isCorrect: false },
      { id: 'd', text: '== es más moderno', isCorrect: false }
    ],
    timeLimit: 90,
    points: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    courseId: '1',
    question: '¿Qué hace el operador % en programación?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Multiplicación', isCorrect: false },
      { id: 'b', text: 'División', isCorrect: false },
      { id: 'c', text: 'Módulo (resto de división)', isCorrect: true },
      { id: 'd', text: 'Potenciación', isCorrect: false }
    ],
    timeLimit: 45,
    points: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    courseId: '2',
    question: '¿Qué significa SQL?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Structured Query Language', isCorrect: true },
      { id: 'b', text: 'Simple Query Language', isCorrect: false },
      { id: 'c', text: 'Standard Query Language', isCorrect: false },
      { id: 'd', text: 'System Query Language', isCorrect: false }
    ],
    timeLimit: 30,
    points: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    courseId: '2',
    question: '¿Cuál es la función de la cláusula WHERE en SQL?',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'Ordenar resultados', isCorrect: false },
      { id: 'b', text: 'Filtrar registros', isCorrect: true },
      { id: 'c', text: 'Agrupar datos', isCorrect: false },
      { id: 'd', text: 'Crear tablas', isCorrect: false }
    ],
    timeLimit: 60,
    points: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let students = [
  {
    id: '1',
    email: 'estudiante@test.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    enrolledCourses: ['1', '2'],
    completedQuizzes: [],
    totalScore: 0,
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const courseService = {
  // CRUD de Cursos
  async getCourses() {
    await delay(500);
    return { success: true, data: courses };
  },

  async getCourseById(id) {
    await delay(300);
    const course = courses.find(c => c.id === id);
    return { success: !!course, data: course };
  },

  async createCourse(courseData) {
    await delay(800);
    const newCourse = {
      id: Date.now().toString(),
      ...courseData,
      questions: [],
      assignedStudents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    courses.push(newCourse);
    return { success: true, data: newCourse };
  },

  async updateCourse(id, courseData) {
    await delay(600);
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Curso no encontrado' };
    }
    courses[index] = {
      ...courses[index],
      ...courseData,
      updatedAt: new Date().toISOString()
    };
    return { success: true, data: courses[index] };
  },

  async deleteCourse(id) {
    await delay(400);
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Curso no encontrado' };
    }
    courses.splice(index, 1);
    // También eliminar preguntas relacionadas
    questions = questions.filter(q => q.courseId !== id);
    return { success: true };
  },

  // CRUD de Preguntas
  async getQuestions(courseId = null) {
    await delay(400);
    const filteredQuestions = courseId 
      ? questions.filter(q => q.courseId === courseId)
      : questions;
    return { success: true, data: filteredQuestions };
  },

  async getQuestionById(id) {
    await delay(300);
    const question = questions.find(q => q.id === id);
    return { success: !!question, data: question };
  },

  async createQuestion(questionData) {
    await delay(600);
    const newQuestion = {
      id: Date.now().toString(),
      ...questionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    questions.push(newQuestion);
    
    // Agregar pregunta al curso
    const courseIndex = courses.findIndex(c => c.id === questionData.courseId);
    if (courseIndex !== -1) {
      courses[courseIndex].questions.push(newQuestion.id);
      courses[courseIndex].updatedAt = new Date().toISOString();
    }
    
    return { success: true, data: newQuestion };
  },

  async updateQuestion(id, questionData) {
    await delay(500);
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      return { success: false, error: 'Pregunta no encontrada' };
    }
    questions[index] = {
      ...questions[index],
      ...questionData,
      updatedAt: new Date().toISOString()
    };
    return { success: true, data: questions[index] };
  },

  async deleteQuestion(id) {
    await delay(400);
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      return { success: false, error: 'Pregunta no encontrada' };
    }
    
    const question = questions[index];
    questions.splice(index, 1);
    
    // Remover pregunta del curso
    const courseIndex = courses.findIndex(c => c.id === question.courseId);
    if (courseIndex !== -1) {
      courses[courseIndex].questions = courses[courseIndex].questions.filter(qId => qId !== id);
      courses[courseIndex].updatedAt = new Date().toISOString();
    }
    
    return { success: true };
  },

  // Gestión de Estudiantes
  async getStudents() {
    await delay(500);
    return { success: true, data: students };
  },

  async getStudentById(id) {
    await delay(300);
    const student = students.find(s => s.id === id);
    return { success: !!student, data: student };
  },

  async updateStudent(id, studentData) {
    await delay(500);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Estudiante no encontrado' };
    }
    students[index] = { ...students[index], ...studentData };
    return { success: true, data: students[index] };
  },

  async deleteStudent(id) {
    await delay(400);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Estudiante no encontrado' };
    }
    students.splice(index, 1);
    return { success: true };
  },

  // Asignación de Cursos
  async assignCourseToStudent(courseId, studentId) {
    await delay(500);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (courseIndex === -1 || studentIndex === -1) {
      return { success: false, error: 'Curso o estudiante no encontrado' };
    }
    
    // Agregar estudiante al curso
    if (!courses[courseIndex].assignedStudents.includes(studentId)) {
      courses[courseIndex].assignedStudents.push(studentId);
      courses[courseIndex].updatedAt = new Date().toISOString();
    }
    
    // Agregar curso al estudiante
    if (!students[studentIndex].enrolledCourses.includes(courseId)) {
      students[studentIndex].enrolledCourses.push(courseId);
    }
    
    return { success: true };
  },

  async unassignCourseFromStudent(courseId, studentId) {
    await delay(500);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (courseIndex === -1 || studentIndex === -1) {
      return { success: false, error: 'Curso o estudiante no encontrado' };
    }
    
    // Remover estudiante del curso
    courses[courseIndex].assignedStudents = courses[courseIndex].assignedStudents.filter(id => id !== studentId);
    courses[courseIndex].updatedAt = new Date().toISOString();
    
    // Remover curso del estudiante
    students[studentIndex].enrolledCourses = students[studentIndex].enrolledCourses.filter(id => id !== courseId);
    
    return { success: true };
  },

  // Estadísticas
  async getStatistics() {
    await delay(600);
    const stats = {
      totalCourses: courses.length,
      totalQuestions: questions.length,
      totalStudents: students.length,
      activeCourses: courses.filter(c => c.isActive).length,
      averageQuestionsPerCourse: questions.length / courses.length || 0,
      totalAssignments: courses.reduce((sum, c) => sum + c.assignedStudents.length, 0)
    };
    return { success: true, data: stats };
  }
};


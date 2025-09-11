// services/QuizService.ts
import { supabase } from '../config/supabase';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  status: 'draft' | 'published' | 'archived';
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  instructions?: string;
  createdBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  questionCount?: number;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points: number;
  orderIndex: number;
  explanation?: string;
  mediaUrl?: string;
  isRequired: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  answerOptions?: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
  explanation?: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  status: 'in_progress' | 'completed' | 'submitted' | 'graded';
  startedAt: string;
  completedAt?: string;
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  totalPoints?: number;
  timeSpent?: number;
  attemptNumber: number;
  gradedBy?: string;
  feedback?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  quiz?: Quiz;
  student?: any;
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  pointsEarned: number;
  isCorrect?: boolean;
  answeredAt: string;
  timeSpent?: number;
  question?: Question;
  selectedOption?: AnswerOption;
}

export interface QuizResult {
  isSuccess: boolean;
  data?: any;
  error?: string;
}

export class QuizService {
  
  // CATEGORÍAS
  static async getCategories(): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error getting categories:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon,
          is_active: category.isActive,
          created_by: category.createdBy,
        })
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error creating category:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  // CUESTIONARIOS
  static async getQuizzes(status?: string): Promise<QuizResult> {
    try {
      let query = supabase
        .from('quizzes')
        .select(`
          *,
          category:categories(*),
          questions(count)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      // Mapear los datos para incluir questionCount
      const quizzes = data?.map(quiz => ({
        ...quiz,
        questionCount: quiz.questions?.[0]?.count || 0,
      }));

      return { isSuccess: true, data: quizzes };
    } catch (error) {
      console.error('Error getting quizzes:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async getQuizById(id: string): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          category:categories(*),
          questions(
            *,
            answer_options(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error getting quiz:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: quiz.title,
          description: quiz.description,
          category_id: quiz.categoryId,
          status: quiz.status,
          time_limit: quiz.timeLimit,
          max_attempts: quiz.maxAttempts,
          passing_score: quiz.passingScore,
          shuffle_questions: quiz.shuffleQuestions,
          show_results: quiz.showResults,
          instructions: quiz.instructions,
          created_by: quiz.createdBy,
        })
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error creating quiz:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async updateQuiz(id: string, updates: Partial<Quiz>): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.categoryId && { category_id: updates.categoryId }),
          ...(updates.status && { status: updates.status }),
          ...(updates.timeLimit !== undefined && { time_limit: updates.timeLimit }),
          ...(updates.maxAttempts && { max_attempts: updates.maxAttempts }),
          ...(updates.passingScore && { passing_score: updates.passingScore }),
          ...(updates.shuffleQuestions !== undefined && { shuffle_questions: updates.shuffleQuestions }),
          ...(updates.showResults !== undefined && { show_results: updates.showResults }),
          ...(updates.instructions !== undefined && { instructions: updates.instructions }),
          ...(updates.status === 'published' && { published_at: new Date().toISOString() }),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error updating quiz:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  // PREGUNTAS
  static async createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          quiz_id: question.quizId,
          question_text: question.questionText,
          question_type: question.questionType,
          points: question.points,
          order_index: question.orderIndex,
          explanation: question.explanation,
          media_url: question.mediaUrl,
          is_required: question.isRequired,
          metadata: question.metadata,
        })
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error creating question:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async createAnswerOption(option: Omit<AnswerOption, 'id' | 'createdAt'>): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('answer_options')
        .insert({
          question_id: option.questionId,
          option_text: option.optionText,
          is_correct: option.isCorrect,
          order_index: option.orderIndex,
          explanation: option.explanation,
        })
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error creating answer option:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  // INTENTOS DE CUESTIONARIO
  static async startQuizAttempt(quizId: string, studentId: string): Promise<QuizResult> {
    try {
      // Verificar intentos previos
      const { data: existingAttempts, error: countError } = await supabase
        .from('quiz_attempts')
        .select('attempt_number')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .order('attempt_number', { ascending: false })
        .limit(1);

      if (countError) {
        return { isSuccess: false, error: countError.message };
      }

      const attemptNumber = (existingAttempts?.[0]?.attempt_number || 0) + 1;

      // Verificar límite de intentos
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('max_attempts')
        .eq('id', quizId)
        .single();

      if (quiz && quiz.max_attempts && attemptNumber > quiz.max_attempts) {
        return { isSuccess: false, error: 'Has alcanzado el límite de intentos para este cuestionario' };
      }

      // Crear nuevo intento
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: studentId,
          attempt_number: attemptNumber,
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async submitAnswer(answer: Omit<StudentAnswer, 'id' | 'answeredAt'>): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .upsert({
          attempt_id: answer.attemptId,
          question_id: answer.questionId,
          selected_option_id: answer.selectedOptionId,
          text_answer: answer.textAnswer,
          time_spent: answer.timeSpent,
        })
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error submitting answer:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async completeQuizAttempt(attemptId: string): Promise<QuizResult> {
    try {
      // Calcular puntuación automáticamente
      const score = await this.calculateScore(attemptId);

      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score: score.score,
          total_points: score.totalPoints,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error completing quiz attempt:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  private static async calculateScore(attemptId: string): Promise<{ score: number; totalPoints: number }> {
    try {
      const { data: answers } = await supabase
        .from('student_answers')
        .select(`
          *,
          question:questions(*),
          selected_option:answer_options(*)
        `)
        .eq('attempt_id', attemptId);

      let totalPoints = 0;
      let earnedPoints = 0;

      answers?.forEach(answer => {
        totalPoints += answer.question?.points || 0;
        
        if (answer.question?.question_type === 'multiple_choice') {
          if (answer.selected_option?.is_correct) {
            earnedPoints += answer.question?.points || 0;
          }
        }
        // Agregar lógica para otros tipos de preguntas aquí
      });

      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

      return { score, totalPoints };
    } catch (error) {
      console.error('Error calculating score:', error);
      return { score: 0, totalPoints: 0 };
    }
  }

  // OBTENER RESULTADOS
  static async getStudentAttempts(studentId: string): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz:quizzes(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error getting student attempts:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }

  static async getAttemptDetails(attemptId: string): Promise<QuizResult> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz:quizzes(*),
          student_answers(
            *,
            question:questions(*),
            selected_option:answer_options(*)
          )
        `)
        .eq('id', attemptId)
        .single();

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      return { isSuccess: true, data };
    } catch (error) {
      console.error('Error getting attempt details:', error);
      return { isSuccess: false, error: 'Error de conexión' };
    }
  }
}


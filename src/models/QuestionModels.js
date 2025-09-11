// src/models/QuestionModels.js - Equivalente a question_models.dart de Flutter

export const QuestionType = {
  MULTIPLE_CHOICE: 'multipleChoice',
  TRUE_FALSE: 'trueFalse',
  FREE_TEXT: 'freeText'
};

// Extension para QuestionType - Equivalente a QuestionTypeExtension de Flutter
export const QuestionTypeExtension = {
  getValue: (type) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return 'multipleChoice';
      case QuestionType.TRUE_FALSE:
        return 'trueFalse';
      case QuestionType.FREE_TEXT:
        return 'freeText';
      default:
        return 'multipleChoice';
    }
  },

  fromString: (typeString) => {
    switch (typeString) {
      case 'multipleChoice':
        return QuestionType.MULTIPLE_CHOICE;
      case 'trueFalse':
        return QuestionType.TRUE_FALSE;
      case 'freeText':
        return QuestionType.FREE_TEXT;
      default:
        throw new Error(`❌ Tipo de pregunta desconocido: ${typeString}`);
    }
  }
};

// Modelo Category - Equivalente a Category de Flutter
export class Category {
  constructor({
    id,
    name,
    description,
    createdAt,
    questionCount = null,
    isActive = true,
    createdBy
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.questionCount = questionCount;
    this.isActive = isActive;
    this.createdBy = createdBy;
  }

  // Factory method - Equivalente a Category.fromJson de Flutter
  static fromJson(json) {
    return new Category({
      id: json.id,
      name: json.name,
      description: json.description,
      createdAt: json.created_at,
      questionCount: json.questionCount,
      isActive: json.is_active ?? true,
      createdBy: json.created_by
    });
  }

  // Convertir a JSON - Equivalente a toJson de Flutter
  toJson() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      created_at: this.createdAt.toISOString(),
      created_by: this.createdBy,
      is_active: this.isActive,
      questionCount: this.questionCount
    };
  }

  // Copy with - Equivalente a copyWith de Flutter
  copyWith({
    id = null,
    name = null,
    description = null,
    createdAt = null,
    createdBy = null
  }) {
    return new Category({
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      createdBy: createdBy ?? this.createdBy,
      questionCount: this.questionCount,
      isActive: this.isActive
    });
  }
}

// Modelo Question - Equivalente a Question de Flutter
export class Question {
  constructor({
    id,
    categoryId,
    type,
    question,
    options = [],
    correctAnswer,
    timeLimit = null,
    createdAt,
    updatedAt = null,
    createdBy,
    imageUrl = null
  }) {
    this.id = id;
    this.categoryId = categoryId;
    this.type = QuestionTypeExtension.fromString(type);
    this.question = question;
    this.options = options;
    this.correctAnswer = correctAnswer;
    this.timeLimit = timeLimit;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt ? (updatedAt instanceof Date ? updatedAt : new Date(updatedAt)) : null;
    this.createdBy = createdBy;
    this.imageUrl = imageUrl;
  }

  // Factory method - Equivalente a Question.fromJson de Flutter
  static fromJson(json) {
    return new Question({
      id: json.id,
      categoryId: json.category_id,
      type: json.type,
      question: json.question,
      options: json.options || [],
      correctAnswer: json.correct_answer,
      timeLimit: json.time_limit,
      createdAt: json.created_at,
      updatedAt: json.updated_at,
      createdBy: json.created_by,
      imageUrl: json.image_url
    });
  }

  // Convertir a JSON - Equivalente a toJson de Flutter
  toJson() {
    return {
      id: this.id,
      category_id: this.categoryId,
      type: QuestionTypeExtension.getValue(this.type),
      question: this.question,
      options: this.options,
      correct_answer: this.correctAnswer,
      time_limit: this.timeLimit,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
      created_by: this.createdBy,
      image_url: this.imageUrl
    };
  }
}

// Modelo QuestionForm - Equivalente a QuestionForm de Flutter
export class QuestionForm {
  constructor({
    id = null,
    categoryId,
    type,
    question,
    options = [],
    correctAnswer,
    timeLimit = null,
    imageUrl = null
  }) {
    this.id = id;
    this.categoryId = categoryId;
    this.type = QuestionTypeExtension.fromString(type);
    this.question = question;
    this.options = options;
    this.correctAnswer = correctAnswer;
    this.timeLimit = timeLimit;
    this.imageUrl = imageUrl;
  }

  // Getter para verificar si está editando - Equivalente a isEditing de Flutter
  get isEditing() {
    return this.id !== null;
  }

  // Convertir a JSON - Equivalente a toJson de Flutter
  toJson() {
    return {
      ...(this.id && { id: this.id }),
      categoryId: this.categoryId,
      type: QuestionTypeExtension.getValue(this.type),
      question: this.question,
      options: this.options,
      correctAnswer: this.correctAnswer,
      timeLimit: this.timeLimit,
      image_url: this.imageUrl
    };
  }
}

// Modelo StudentAnswer - Equivalente a StudentAnswer de Flutter
export class StudentAnswer {
  constructor({
    id,
    questionId,
    studentId,
    answer,
    isCorrect,
    answeredAt,
    timeSpent = null
  }) {
    this.id = id;
    this.questionId = questionId;
    this.studentId = studentId;
    this.answer = answer;
    this.isCorrect = isCorrect;
    this.answeredAt = answeredAt instanceof Date ? answeredAt : new Date(answeredAt);
    this.timeSpent = timeSpent; // En segundos
  }

  // Factory method - Equivalente a StudentAnswer.fromJson de Flutter
  static fromJson(json) {
    return new StudentAnswer({
      id: json.id,
      questionId: json.question_id,
      studentId: json.student_id,
      answer: json.answer,
      isCorrect: json.is_correct,
      answeredAt: json.answered_at,
      timeSpent: json.time_spent
    });
  }

  // Convertir a JSON - Equivalente a toJson de Flutter
  toJson() {
    return {
      id: this.id,
      question_id: this.questionId,
      student_id: this.studentId,
      answer: this.answer,
      is_correct: this.isCorrect,
      answered_at: this.answeredAt.toISOString(),
      time_spent: this.timeSpent
    };
  }
}


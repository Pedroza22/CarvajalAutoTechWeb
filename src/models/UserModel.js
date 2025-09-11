// src/models/UserModel.js - Equivalente a UserModel de Flutter

export const UserRole = {
  ADMIN: 'admin',
  STUDENT: 'student'
};

export class UserModel {
  constructor({
    id,
    email,
    role,
    firstName = null,
    lastName = null,
    avatarUrl = null,
    createdAt = null,
    isActive = true
  }) {
    this.id = id;
    this.email = email;
    this.role = this._parseRole(role);
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatarUrl = avatarUrl;
    this.createdAt = createdAt ? new Date(createdAt) : null;
    this.isActive = isActive;
  }

  // Factory method para crear desde JSON - Equivalente a UserModel.fromJson de Flutter
  static fromJson(json) {
    return new UserModel({
      id: json.id || '',
      email: json.email || '',
      role: json.role,
      firstName: json.first_name,
      lastName: json.last_name,
      avatarUrl: json.avatar_url,
      createdAt: json.created_at,
      isActive: json.is_active ?? true
    });
  }

  // Convertir a JSON - Equivalente a toJson de Flutter
  toJson() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      first_name: this.firstName,
      last_name: this.lastName,
      avatar_url: this.avatarUrl,
      created_at: this.createdAt?.toISOString(),
      is_active: this.isActive
    };
  }

  // Parsear rol - Equivalente a _parseRole de Flutter
  _parseRole(role) {
    if (!role) return UserRole.STUDENT;

    switch (role.toString().toLowerCase()) {
      case 'admin':
        return UserRole.ADMIN;
      case 'student':
        return UserRole.STUDENT;
      default:
        return UserRole.STUDENT;
    }
  }

  // Getters - Equivalentes a los de UserEntity de Flutter
  get fullName() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || this.email.split('@')[0];
  }

  get isAdmin() {
    return this.role === UserRole.ADMIN;
  }

  get isStudent() {
    return this.role === UserRole.STUDENT;
  }
}


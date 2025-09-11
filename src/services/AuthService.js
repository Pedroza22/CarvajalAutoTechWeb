// src/services/AuthService.js - Equivalente a AuthService de Flutter
import SupabaseConfig from '../config/supabase';
import { UserModel, UserRole } from '../models/UserModel';

class AuthService {
  static _userRoleKey = 'user_role';
  static _rememberMeKey = 'remember_me';

  // -------------------- REGISTRO --------------------
  // Equivalente a signUpStudent de Flutter
  static async signUpStudent({
    email,
    password,
    firstName = null,
    lastName = null
  }) {
    try {
      const cleanEmail = email.toLowerCase().trim();

      // Crear usuario en Supabase Auth
      const { data, error } = await SupabaseConfig.client.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            first_name: firstName?.trim() || '',
            last_name: lastName?.trim() || '',
            role: 'student'
          }
        }
      });

      if (error) {
        return AuthResult.error(this._mapAuthError(error.message));
      }

      if (!data.user) {
        return AuthResult.error('Error al crear la cuenta');
      }

      // Esperar a que el trigger cree el perfil en user_profiles
      let profile = null;
      for (let i = 0; i < 5; i++) {
        const { data: profileData } = await SupabaseConfig.client
          .from('user_profiles')
          .select()
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileData) {
          profile = profileData;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!profile) {
        return AuthResult.error('Error configurando el perfil. Inténtalo de nuevo.');
      }

      const userModel = UserModel.fromJson({
        id: data.user.id,
        email: data.user.email,
        ...profile
      });

      await this._saveUserPreferences(userModel.role, false);

      const needsConfirmation = !data.session;
      return AuthResult.success(
        userModel,
        needsConfirmation
          ? 'Te enviamos un correo de confirmación. Revisa tu bandeja de entrada.'
          : 'Cuenta creada exitosamente. ¡Bienvenido!'
      );
    } catch (error) {
      return AuthResult.error(`Error inesperado: ${error.message}`);
    }
  }

  // -------------------- LOGIN --------------------
  // Equivalente a signInWithEmailPassword de Flutter
  static async signInWithEmailPassword({
    email,
    password,
    expectedRole,
    rememberMe = false
  }) {
    try {
      const { data, error } = await SupabaseConfig.client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        return AuthResult.error(this._mapAuthError(error.message));
      }

      if (!data.user) {
        return AuthResult.error('Error en la autenticación');
      }

      const profile = await this._getUserProfile(data.user.id);
      if (!profile) {
        return AuthResult.error('Perfil de usuario no encontrado');
      }

      const userModel = UserModel.fromJson({
        id: data.user.id,
        email: data.user.email,
        ...profile
      });

      if (userModel.role !== expectedRole) {
        await this.signOut();
        return AuthResult.error(
          expectedRole === UserRole.ADMIN
            ? 'No tienes permisos de administrador'
            : 'Este usuario no es un estudiante'
        );
      }

      if (!userModel.isActive) {
        await this.signOut();
        return AuthResult.error('Tu cuenta está desactivada. Contacta al administrador.');
      }

      await this._saveUserPreferences(userModel.role, rememberMe);
      return AuthResult.success(userModel);
    } catch (error) {
      return AuthResult.error(`Error inesperado: ${error.message}`);
    }
  }

  // -------------------- PERFIL --------------------
  // Equivalente a _getUserProfile de Flutter
  static async _getUserProfile(userId) {
    try {
      const { data, error } = await SupabaseConfig.client
        .from('user_profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error obteniendo perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  // Equivalente a updateProfile de Flutter
  static async updateProfile({
    firstName = null,
    lastName = null,
    avatarUrl = null
  }) {
    try {
      const { data: { user } } = await SupabaseConfig.client.auth.getUser();
      if (!user) {
        return AuthResult.error('No hay usuario autenticado');
      }

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (firstName !== null) updateData.first_name = firstName;
      if (lastName !== null) updateData.last_name = lastName;
      if (avatarUrl !== null) updateData.avatar_url = avatarUrl;

      const { error } = await SupabaseConfig.client
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        return AuthResult.error(`Error al actualizar perfil: ${error.message}`);
      }

      return AuthResult.success(null, 'Perfil actualizado correctamente');
    } catch (error) {
      return AuthResult.error(`Error al actualizar perfil: ${error.message}`);
    }
  }

  // -------------------- SESIÓN --------------------
  // Equivalente a signOut de Flutter
  static async signOut() {
    await SupabaseConfig.client.auth.signOut();
    await this._clearUserPreferences();
  }

  // Equivalente a changePassword de Flutter
  static async changePassword(newPassword) {
    try {
      const { error } = await SupabaseConfig.client.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return AuthResult.error(this._mapAuthError(error.message));
      }

      return AuthResult.success(null, 'Contraseña actualizada correctamente');
    } catch (error) {
      return AuthResult.error(`Error inesperado: ${error.message}`);
    }
  }

  // Getters - Equivalentes a los de Flutter
  static get isAuthenticated() {
    const { data: { session } } = SupabaseConfig.client.auth.getSession();
    return !!session;
  }

  static get authStateChanges() {
    return SupabaseConfig.client.auth.onAuthStateChange;
  }

  // -------------------- HELPERS --------------------
  // Equivalente a _saveUserPreferences de Flutter
  static async _saveUserPreferences(role, rememberMe) {
    try {
      localStorage.setItem(this._userRoleKey, role);
      localStorage.setItem(this._rememberMeKey, rememberMe.toString());
    } catch (error) {
      console.error('Error guardando preferencias:', error);
    }
  }

  // Equivalente a _clearUserPreferences de Flutter
  static async _clearUserPreferences() {
    try {
      localStorage.removeItem(this._userRoleKey);
      localStorage.removeItem(this._rememberMeKey);
    } catch (error) {
      console.error('Error limpiando preferencias:', error);
    }
  }

  // Equivalente a _mapAuthError de Flutter
  static _mapAuthError(error) {
    if (!error) return 'Error desconocido';
    
    if (error.includes('Invalid login credentials')) {
      return 'Credenciales incorrectas. Verifica tu email y contraseña.';
    }
    if (error.includes('Email not confirmed')) {
      return 'Debes confirmar tu email antes de iniciar sesión.';
    }
    if (error.includes('User already registered')) {
      return 'Ya existe una cuenta con este email.';
    }
    if (error.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (error.includes('Database error granting user')) {
      return 'Error en la base de datos. Verifica configuración de triggers/policies.';
    }
    return error;
  }

  // Obtener usuario actual - Equivalente a getCurrentUser de Flutter
  static async getCurrentUser() {
    try {
      const { data: { session } } = await SupabaseConfig.client.auth.getSession();
      if (!session?.user) {
        return null;
      }

      const profile = await this._getUserProfile(session.user.id);
      if (!profile) {
        return null;
      }

      return UserModel.fromJson({
        id: session.user.id,
        email: session.user.email,
        ...profile
      });
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Verificar si es admin - Equivalente a isAdmin de Flutter
  static async isAdmin() {
    const user = await this.getCurrentUser();
    return user?.isAdmin || false;
  }

  // Verificar si es estudiante - Equivalente a isStudent de Flutter
  static async isStudent() {
    const user = await this.getCurrentUser();
    return user?.isStudent || false;
  }
}

// -------------------- AuthResult --------------------
// Equivalente a AuthResult de Flutter
export class AuthResult {
  constructor({ isSuccess, user = null, error = null, message = null }) {
    this.isSuccess = isSuccess;
    this.user = user;
    this.error = error;
    this.message = message;
  }

  static success(user, message = null) {
    return new AuthResult({
      isSuccess: true,
      user: user,
      message: message
    });
  }

  static error(error) {
    return new AuthResult({
      isSuccess: false,
      error: error
    });
  }
}

export default AuthService;


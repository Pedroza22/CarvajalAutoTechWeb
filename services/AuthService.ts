// services/AuthService.ts
import { supabase } from '../config/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AuthResult {
  isSuccess: boolean;
  user?: User;
  error?: string;
}

export interface SignInParams {
  email: string;
  password: string;
  expectedRole: 'student' | 'admin';
  rememberMe?: boolean;
}

export interface SignUpParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export class AuthService {
  
  // Método auxiliar para convertir usuario de Supabase a nuestro formato
  private static mapSupabaseUser(supabaseUser: SupabaseUser, profile?: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      firstName: profile?.first_name || supabaseUser.user_metadata?.first_name,
      lastName: profile?.last_name || supabaseUser.user_metadata?.last_name,
      role: profile?.role || supabaseUser.user_metadata?.role || 'student',
      isEmailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: profile?.created_at || supabaseUser.created_at,
      updatedAt: profile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at,
      isActive: profile?.is_active ?? true,
    };
  }

  static async signInWithEmailPassword(params: SignInParams): Promise<AuthResult> {
    try {
      // Autenticación con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (authError) {
        return {
          isSuccess: false,
          error: this.getErrorMessage(authError.message),
        };
      }

      if (!authData.user) {
        return {
          isSuccess: false,
          error: 'Usuario no encontrado',
        };
      }

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Error obteniendo perfil:', profileError);
      }

      const user = this.mapSupabaseUser(authData.user, profile);

      // Verificar rol esperado
      if (user.role !== params.expectedRole) {
        await this.signOut(); // Cerrar sesión inmediatamente
        return {
          isSuccess: false,
          error: `Esta cuenta no tiene permisos de ${params.expectedRole}`,
        };
      }

      // Configurar persistencia de sesión
      if (!params.rememberMe) {
        // Si no quiere recordar, la sesión se mantendrá solo mientras esté abierto el navegador
        localStorage.removeItem('supabase.auth.token');
      }

      // Actualizar última fecha de login en la base de datos
      await supabase
        .from('profiles')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      return {
        isSuccess: true,
        user,
      };
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        isSuccess: false,
        error: 'Error de conexión. Verifica tu internet.',
      };
    }
  }

  static async signUpStudent(params: SignUpParams): Promise<AuthResult> {
    try {
      // Registro con Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            first_name: params.firstName,
            last_name: params.lastName,
            role: 'student',
          },
        },
      });

      if (authError) {
        return {
          isSuccess: false,
          error: this.getErrorMessage(authError.message),
        };
      }

      if (!authData.user) {
        return {
          isSuccess: false,
          error: 'Error al crear el usuario',
        };
      }

      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          first_name: params.firstName,
          last_name: params.lastName,
          role: 'student',
        });

      if (profileError) {
        console.warn('Error creando perfil:', profileError);
        // No fallar el registro por esto, el perfil se puede crear después
      }

      // El perfil ya se crea automáticamente con el trigger
      // No necesitamos notificar a ningún backend externo

      const user = this.mapSupabaseUser(authData.user);

      return {
        isSuccess: true,
        user,
      };
    } catch (error) {
      console.error('SignUp error:', error);
      return {
        isSuccess: false,
        error: 'Error de conexión. Verifica tu internet.',
      };
    }
  }

  static async signOut(): Promise<void> {
    try {
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();

      // Todo se maneja en Supabase, no hay backend externo
    } catch (error) {
      console.error('SignOut error:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Obtener perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return this.mapSupabaseUser(user, profile);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Método para escuchar cambios de autenticación
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const user = this.mapSupabaseUser(session.user, profile);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Método para hacer requests autenticados a Supabase
  static async makeAuthenticatedRequest<T>(
    table: string, 
    operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert',
    data?: any,
    conditions?: any
  ): Promise<{ data: T | null; error: any }> {
    try {
      let query = supabase.from(table);
      
      switch (operation) {
        case 'select':
          query = query.select(data || '*');
          if (conditions) {
            Object.entries(conditions).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          break;
        case 'insert':
          query = query.insert(data);
          break;
        case 'update':
          query = query.update(data);
          if (conditions) {
            Object.entries(conditions).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          break;
        case 'delete':
          if (conditions) {
            Object.entries(conditions).forEach(([key, value]) => {
              query = query.delete().eq(key, value);
            });
          }
          break;
        case 'upsert':
          query = query.upsert(data);
          break;
      }
      
      return await query;
    } catch (error) {
      console.error('Supabase request error:', error);
      return { data: null, error };
    }
  }

  // Método auxiliar para mensajes de error
  private static getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Credenciales incorrectas',
      'Email not confirmed': 'Email no confirmado. Revisa tu bandeja de entrada.',
      'Too many requests': 'Demasiados intentos. Intenta más tarde.',
      'User already registered': 'Este email ya está registrado',
      'Weak password': 'La contraseña es muy débil',
      'Invalid email': 'Email inválido',
    };

    return errorMessages[error] || error || 'Error desconocido';
  }
}

import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { normalizeUserRole } from '@/utils/auth';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: User;
  session: any;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

function mapSupabaseUserToAppUser({
  authUser,
  profile,
  fallbackFirstName,
  fallbackLastName,
}: {
  authUser: any;
  profile?: any;
  fallbackFirstName?: string;
  fallbackLastName?: string;
}): User {
  return {
    id: authUser.id,
    email: authUser.email!,
    firstName: profile?.first_name || authUser.user_metadata?.first_name || fallbackFirstName || 'User',
    lastName: profile?.last_name || authUser.user_metadata?.last_name || fallbackLastName || '',
    // Temporary MVP bridge: backend may still emit legacy roles like instructor/student.
    // Normalize them here so the frontend only deals with the production target roles.
    role: normalizeUserRole(profile?.role || authUser.user_metadata?.role),
    avatar: profile?.avatar_url,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    return {
      user: mapSupabaseUserToAppUser({ authUser: data.user, profile }),
      session: data.session,
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: 'trainee',
        },
      },
    });

    if (error) throw error;

    return {
      user: mapSupabaseUserToAppUser({
        authUser: authData.user!,
        fallbackFirstName: data.firstName,
        fallbackLastName: data.lastName,
      }),
      session: authData.session,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);
    if (error) throw error;
    return { message: 'Password reset email sent' };
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    if (error) throw error;
    return { message: 'Password updated successfully' };
  },

  async verifyEmail(_token: string): Promise<{ message: string }> {
    return { message: 'Verify email is handled by Supabase' };
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return mapSupabaseUserToAppUser({ authUser: user, profile });
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const profileUpdates = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      avatar_url: userData.avatar,
      bio: userData.bio,
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return mapSupabaseUserToAppUser({ authUser: user, profile });
  },

  async changePassword(newPassword: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { message: 'Password updated successfully' };
  },
};

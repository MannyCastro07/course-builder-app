import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

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

    // Fetch profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    // If profile is missing (e.g. trigger didn't run), use metadata as fallback
    const firstName = profile?.first_name || data.user.user_metadata?.first_name || 'Usuario';
    const lastName = profile?.last_name || data.user.user_metadata?.last_name || '';
    const role = profile?.role || 'student';

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName,
        lastName,
        role,
        avatar: profile?.avatar_url,
      } as User,
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
        }
      }
    });

    if (error) throw error;

    // The trigger in SQL (if created) should handle profile creation
    // For now, we return the user object
    return {
      user: {
        id: authData.user!.id,
        email: authData.user!.email!,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
      } as User,
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
      password: data.password
    });
    if (error) throw error;
    return { message: 'Password updated successfully' };
  },

  async verifyEmail(_token: string): Promise<{ message: string }> {
    // Supabase handles this via URL
    return { message: 'Verify email is handled by Supabase' };
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email!,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      avatar: profile.avatar_url,
    } as User;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser();
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

    return {
      id: user.id,
      email: user.email!,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role,
      avatar: profile.avatar_url,
    } as User;
  },

  async changePassword(newPassword: string): Promise<{ message: string }> {
    // Supabase doesn't require old password for update, but it's good practice
    // We can re-authenticate if we want to be strict, but for now:
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return { message: 'Contraseña actualizada exitosamente' };
  },
};

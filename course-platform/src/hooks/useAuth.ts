import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services';
import { useAuthStore, showSuccessToast, showErrorToast } from '@/stores';

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

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      storeLogin(data.user, data.session?.access_token || '');
      showSuccessToast('¡Bienvenido!', `Hola, ${data.user.firstName}`);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error al iniciar sesión',
        error.message || 'Credenciales inválidas'
      );
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data.session) {
        storeLogin(data.user, data.session.access_token);
        showSuccessToast('¡Cuenta creada!', 'Tu cuenta ha sido creada exitosamente');
        navigate('/dashboard');
      } else {
        showSuccessToast(
          'Registro exitoso',
          'Por favor, revisa tu correo para confirmar tu cuenta'
        );
        navigate('/login');
      }
    },
    onError: (error: any) => {
      showErrorToast(
        'Error al registrarse',
        error.message || 'No se pudo crear la cuenta'
      );
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      showSuccessToast('Sesión cerrada', 'Has cerrado sesión exitosamente');
      navigate('/login');
    },
    onError: (error: any) => {
      // Even if the API call fails, logout locally
      storeLogout();
      queryClient.clear();
      navigate('/login');
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      showSuccessToast(
        'Correo enviado',
        'Revisa tu correo para restablecer tu contraseña'
      );
    },
    onError: (error: any) => {
      showErrorToast(
        'Error',
        error.message || 'No se pudo enviar el correo'
      );
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      showSuccessToast(
        'Contraseña actualizada',
        'Tu contraseña ha sido restablecida exitosamente'
      );
      navigate('/login');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error',
        error.message || 'No se pudo restablecer la contraseña'
      );
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (user) => {
      useAuthStore.getState().updateUser(user);
      showSuccessToast('Perfil actualizado', 'Tus cambios han sido guardados');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error',
        error.message || 'No se pudo actualizar el perfil'
      );
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ newPassword }: { newPassword: string }) =>
      authService.changePassword(newPassword),
    onSuccess: () => {
      showSuccessToast('Contraseña actualizada', 'Tu contraseña ha sido cambiada exitosamente');
    },
    onError: (error: any) => {
      showErrorToast(
        'Error',
        error.response?.data?.message || 'No se pudo cambiar la contraseña'
      );
    },
  });

  return {
    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
}

// Hook to get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: useAuthStore.getState().isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
}

// Hook to get user role
export function useUserRole() {
  const { user } = useAuthStore();
  return user?.role;
}

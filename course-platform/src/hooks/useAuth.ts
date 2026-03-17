import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services';
import { useAuthStore, showSuccessToast, showErrorToast } from '@/stores';
import { getDefaultRouteForRole } from '@/utils/auth';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      storeLogin(data.user, data.session?.access_token || '');
      showSuccessToast('Welcome back', `Signed in as ${data.user.firstName}`);
      navigate(getDefaultRouteForRole(data.user.role));
    },
    onError: (error: any) => {
      showErrorToast('Sign in failed', error.message || 'Invalid credentials');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data.session) {
        storeLogin(data.user, data.session.access_token);
        showSuccessToast('Account created', 'Your workspace is ready.');
        navigate(getDefaultRouteForRole(data.user.role));
      } else {
        showSuccessToast('Registration successful', 'Please check your email to confirm your account.');
        navigate('/login');
      }
    },
    onError: (error: any) => {
      showErrorToast('Registration failed', error.message || 'Could not create the account');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      showSuccessToast('Signed out', 'You have been logged out successfully.');
      navigate('/login');
    },
    onError: () => {
      storeLogout();
      queryClient.clear();
      navigate('/login');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      showSuccessToast('Email sent', 'Check your inbox for password reset instructions.');
    },
    onError: (error: any) => {
      showErrorToast('Request failed', error.message || 'Could not send the reset email');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      showSuccessToast('Password updated', 'Your password has been reset successfully.');
      navigate('/login');
    },
    onError: (error: any) => {
      showErrorToast('Reset failed', error.message || 'Could not reset the password');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (user) => {
      useAuthStore.getState().updateUser(user);
      showSuccessToast('Profile updated', 'Your changes have been saved.');
    },
    onError: (error: any) => {
      showErrorToast('Update failed', error.message || 'Could not update your profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ newPassword }: { newPassword: string }) => authService.changePassword(newPassword),
    onSuccess: () => {
      showSuccessToast('Password updated', 'Your password has been changed successfully.');
    },
    onError: (error: any) => {
      showErrorToast('Update failed', error.response?.data?.message || 'Could not change the password');
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: useAuthStore.getState().isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
}

export function useUserRole() {
  const { user } = useAuthStore();
  return user?.role;
}

import { trpc } from '../utils/trpc';
export function useLogin() {
  const loginMutation = trpc.auth.login.useMutation();

  const login = async (email: string, password: string) => {
    try {
      const res = await loginMutation.mutateAsync({ email, password });
      if (res.token && res.role) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
      }
      return res;
    } catch (err) {
      // error is handled by react-query
      return null;
    }
  };

  return {
    login,
    ...loginMutation
  };
}

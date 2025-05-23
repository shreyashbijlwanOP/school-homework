import { useEffect, useState } from 'react';
import { getAuthInfo, getAuth } from '../utils/auth';

export function useAuthUser() {
  const [auth, setAuth] = useState(() => getAuth());
  const [role, setRole] = useState(() => getAuthInfo().role);
  const [user, setUser] = useState(() => getAuthInfo().user);
  useEffect(() => {
    function syncAuth() {
      setAuth(getAuth());
      setRole(getAuthInfo().role);
      setUser(getAuthInfo().user);
    }
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return { isAuthenticated: auth, role, user };
}

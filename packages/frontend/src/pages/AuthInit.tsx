import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import { getAuthInfo } from '../utils/auth';

export default function AuthInit() {
  const navigate = useNavigate();

  useEffect(() => {
    const { token, role } = getAuthInfo();
    if (!token) {
      // Not logged in, go to login
      navigate('/login', { replace: true });
      return;
    }
    if (role == 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'student') {
      navigate('/student/homework', { replace: true });
    } else if (role == 'superadmin') {
      navigate('/superadmin/dashboard', { replace: true });
    } else {
      // Unknown role, fallback to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <PageLoader />;
}

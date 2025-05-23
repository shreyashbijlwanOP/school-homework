import PageLoader from '@/components/PageLoader';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/auth/init', { replace: true });
  }, [navigate]);
  return <PageLoader />;
}

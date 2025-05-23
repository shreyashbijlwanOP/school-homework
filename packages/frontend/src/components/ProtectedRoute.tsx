import { Navigate, Outlet } from 'react-router-dom';
import { getAuth } from '../utils/auth';

export default function ProtectedRoute() {
  const isAuthenticated = getAuth(); // implement your logic in utils/auth.ts
  if (!isAuthenticated) {
    return <Navigate to="/auth/init" replace />;
  }
  return <Outlet />;
}

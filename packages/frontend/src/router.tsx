import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthRoute from './components/AuthRoute';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './components/RootLayout';
import AdminDashboard from './pages/AdminDashboard';
import AuthInit from './pages/AuthInit';
import CreateHomeWork from './pages/CreateHomework';
import HomeworkPage from './pages/HomeworkPage';
import HomeworkSubmissionsPage from './pages/HomeworkSubmissionsPage';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import SubmitHomeworkPage from './pages/SubmitHomeworkPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />
  },
  {
    path: '/auth/init',
    element: <AuthInit />
  },
  {
    element: <AuthRoute />,
    children: [
      {
        path: '/login',
        element: <Login />
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          {
            path: '/admin/dashboard',
            element: <AdminDashboard />
          },
          {
            path: '/admin/create-homework',
            element: <CreateHomeWork />
          },
          {
            path: '/submissions/:homeworkId',
            element: <HomeworkSubmissionsPage />
          },
          {
            path: '/student/homework',
            element: <HomeworkPage />
          },
          {
            path: '/student/submit-homework/:homeworkId',
            element: <SubmitHomeworkPage />
          },
          {
            path: '/superadmin/dashboard',
            element: <SuperAdminDashboard />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthUser } from '../hooks/useAuthUser';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', role: 'admin' },
  { label: 'Dashboard', path: '/student/dashboard', role: 'student' },
  { label: 'Homework', path: '/student/homework', role: 'admin' },
  { label: 'Create Homework', path: '/admin/create-homework', role: 'admin' },
  { label: 'Super Admin', path: '/superadmin/dashboard', role: 'superadmin' }
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setMobileOpen(false);
    navigate('/login');
  }

  // Filter nav items based on role
  const filteredNavItems = navItems.filter((item) => !item.role || (role && item.role === role));

  return (
    <nav className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-sm relative">
      <div className="text-2xl font-extrabold tracking-tight text-primary drop-shadow-sm select-none">HSCA Satpuli</div>
      {/* Desktop nav */}
      <ul className="hidden md:flex gap-2 md:gap-4 items-center">
        {filteredNavItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-primary/10 hover:text-primary ${
                location.pathname === item.path ? 'bg-primary text-primary-foreground shadow' : 'text-primary'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
        {!isAuthenticated ? (
          <li>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              Login
            </Link>
          </li>
        ) : (
          <li>
            <button
              onClick={handleSignOut}
              className="px-4 py-1 rounded-lg font-medium bg-muted text-primary shadow hover:bg-muted/80 transition border border-border"
            >
              Sign Out
            </button>
          </li>
        )}
      </ul>
      {/* Mobile nav toggle */}
      <button
        className="md:hidden flex items-center px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Mobile nav menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-card border-b border-border shadow-md z-50 md:hidden animate-fade-in">
          <ul className="flex flex-col gap-2 p-4">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-primary/10 hover:text-primary ${
                    location.pathname === item.path ? 'bg-primary text-primary-foreground shadow' : 'text-primary'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {!isAuthenticated ? (
              <li>
                <Link
                  to="/login"
                  className="block px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 rounded-lg font-medium bg-muted text-primary shadow hover:bg-muted/80 transition border border-border"
                >
                  Sign Out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

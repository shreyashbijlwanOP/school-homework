import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isPending, isError, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res && res.token) {
      navigate('/'); // Redirect on success
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6 bg-card rounded-xl shadow-lg p-8 border border-border">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-card-foreground text-center">Login</h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-card-foreground">Email</label>
            <input
              id="email"
              type="email"
              className="px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-card-foreground">Password</label>
            <input
              id="password"
              type="password"
              className="px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          {isError && error && <div className="text-red-500 text-sm text-center">{error.message || 'Login failed'}</div>}
          <button
            type="submit"
            className="w-full px-8 py-3 mt-8 rounded-md bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition text-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

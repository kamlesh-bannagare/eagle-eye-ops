import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Shield, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(s => s.login);
  const currentUser = useAuthStore(s => s.currentUser);
  const navigate = useNavigate();

  if (currentUser) {
    navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username.trim(), password);
    if (!success) {
      setError('Invalid credentials or account disabled');
      return;
    }
    const user = useAuthStore.getState().currentUser;
    navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground font-mono tracking-wider">
            TRAKKACAM TC-300
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">
            Ground Control Station
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-md p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
              Operator ID
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full h-9 bg-muted border border-border rounded px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
              Access Key
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-9 bg-muted border border-border rounded px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-mono text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-9 bg-primary text-primary-foreground rounded text-sm font-mono font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
          >
            Authenticate
          </button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-4 font-mono">
          AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
}

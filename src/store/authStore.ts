import { create } from 'zustand';

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  enabled: boolean;
  createdAt: Date;
}

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (username: string, password: string, name: string, role: UserRole) => boolean;
  toggleUserEnabled: (id: string) => void;
  deleteUser: (id: string) => void;
}

// Simple credential store (mock only)
const credentials: Record<string, string> = {
  admin: 'admin123',
  operator1: 'pass123',
};

const defaultUsers: User[] = [
  { id: 'usr-admin', username: 'admin', role: 'admin', name: 'System Admin', enabled: true, createdAt: new Date('2025-01-01') },
  { id: 'usr-001', username: 'operator1', role: 'client', name: 'Alpha Operator', enabled: true, createdAt: new Date('2025-03-15') },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: defaultUsers,

  login: (username, password) => {
    const stored = credentials[username];
    if (!stored || stored !== password) return false;
    const user = get().users.find(u => u.username === username);
    if (!user || !user.enabled) return false;
    set({ currentUser: user });
    return true;
  },

  logout: () => set({ currentUser: null }),

  createUser: (username, password, name, role) => {
    if (credentials[username]) return false;
    credentials[username] = password;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username,
      role,
      name,
      enabled: true,
      createdAt: new Date(),
    };
    set(s => ({ users: [...s.users, newUser] }));
    return true;
  },

  toggleUserEnabled: (id) => set(s => ({
    users: s.users.map(u => u.id === id ? { ...u, enabled: !u.enabled } : u),
  })),

  deleteUser: (id) => {
    const user = get().users.find(u => u.id === id);
    if (user) delete credentials[user.username];
    set(s => ({ users: s.users.filter(u => u.id !== id) }));
  },
}));

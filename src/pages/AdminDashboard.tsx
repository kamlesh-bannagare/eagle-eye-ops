import { useState } from 'react';
import { useAuthStore, UserRole } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, UserPlus, Users, Power, Trash2, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, users, logout, createUser, toggleUserEnabled, deleteUser } = useAuthStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('client');
  const [createError, setCreateError] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      setCreateError('All fields are required');
      return;
    }
    const ok = createUser(newUsername.trim(), newPassword.trim(), newName.trim(), newRole);
    if (!ok) {
      setCreateError('Username already exists');
      return;
    }
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setShowCreate(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clientUsers = users.filter(u => u.role === 'client');

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm font-semibold text-foreground tracking-wider">
            ADMIN CONSOLE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">{currentUser.name}</span>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Clients', value: clientUsers.length, icon: Users },
              { label: 'Active', value: clientUsers.filter(u => u.enabled).length, icon: Power },
              { label: 'Disabled', value: clientUsers.filter(u => !u.enabled).length, icon: AlertTriangle },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
                <span className="text-2xl font-mono font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Client list */}
          <div className="bg-card border border-border rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Client Accounts</span>
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="flex items-center gap-1.5 h-7 px-3 bg-primary text-primary-foreground rounded text-xs font-mono font-semibold hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                New Client
              </button>
            </div>

            {/* Create form */}
            {showCreate && (
              <form onSubmit={handleCreate} className="p-4 border-b border-border bg-muted/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1">Full Name</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)}
                      className="w-full h-8 bg-muted border border-border rounded px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1">Username</label>
                    <input value={newUsername} onChange={e => setNewUsername(e.target.value)}
                      className="w-full h-8 bg-muted border border-border rounded px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1">Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-8 bg-muted border border-border rounded px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground uppercase mb-1">Role</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}
                      className="w-full h-8 bg-muted border border-border rounded px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                {createError && (
                  <p className="text-xs font-mono text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> {createError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button type="submit" className="h-7 px-4 bg-primary text-primary-foreground rounded text-xs font-mono font-semibold hover:bg-primary/90 transition-colors">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="h-7 px-4 bg-muted text-muted-foreground rounded text-xs font-mono hover:text-foreground transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="text-left px-4 py-2.5 font-medium">Name</th>
                    <th className="text-left px-4 py-2.5 font-medium">Username</th>
                    <th className="text-left px-4 py-2.5 font-medium">Role</th>
                    <th className="text-left px-4 py-2.5 font-medium">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium">Created</th>
                    <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.id !== currentUser.id).map(user => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 text-foreground">{user.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{user.username}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                          user.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 ${user.enabled ? 'text-primary' : 'text-destructive'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.enabled ? 'bg-primary' : 'bg-destructive'}`} />
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{user.createdAt.toLocaleDateString()}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleUserEnabled(user.id)}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title={user.enabled ? 'Disable' : 'Enable'}>
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteUser(user.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

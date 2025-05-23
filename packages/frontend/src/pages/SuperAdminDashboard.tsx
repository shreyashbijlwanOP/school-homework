import { useState } from 'react';
import { trpc } from '../utils/trpc';

const CLASS_ENUM = ['8th', '9th', '10th'];
const ROLES = ['admin', 'student'];

export default function SuperAdminDashboard() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    class: CLASS_ENUM[0],
    role: ROLES[0]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const { mutateAsync: createUser, isPending: creating } = trpc.users.create.useMutation();
  const { data: users = [], isLoading } = trpc.users.findAll.useQuery({
    filter: {},
    page: 1,
    limit: 100,
    sort: '-updatedAt',
    select: ''
  });
  const { mutateAsync: deleteUser } = trpc.users.delete.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        class: form.class,
        role: form.role as 'admin' | 'student',
      });
      alert('User created successfully');
      setForm({ name: '', email: '', password: '', class: CLASS_ENUM[0], role: ROLES[0] });
      utils.users.findAll.invalidate();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    await deleteUser({ id });
    utils.users.findAll.invalidate();
  };

  const handleEdit = (id: string) => {
    setEditingUserId(id);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = async (id: string, data: any) => {
    // Implement save edit logic
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left: Create User Form (less space) */}
        <form
          className="bg-card border border-border rounded-xl shadow-lg p-6 flex flex-col gap-5 md:col-span-2"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-primary mb-2 text-center">Create User</h2>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-card-foreground">Name</label>
            <input
              className="border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="User name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-card-foreground">Email</label>
            <input
              className="border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
              placeholder="User email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-card-foreground">Password</label>
            <input
              className="border border-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              type="password"
              placeholder="Password"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium text-card-foreground">Class</label>
              <select
                className="border border-border rounded px-3 py-2 bg-background text-foreground"
                name="class"
                value={form.class}
                onChange={handleChange}
              >
                {CLASS_ENUM.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-medium text-card-foreground">Role</label>
              <select
                className="border border-border rounded px-3 py-2 bg-background text-foreground"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full px-8 py-3 mt-4 rounded-md bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create User'}
          </button>
        </form>
        {/* Right: User List as Cards (more space) */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-8 flex flex-col gap-4 min-h-[400px] md:col-span-3">
          <h3 className="text-xl font-semibold text-primary mb-4 text-center">Manage Users</h3>
          <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 hide-scrollbar">
            {/* User cards list */}
            {isLoading ? (
              <div className="text-muted-foreground italic text-center">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No users found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    isEditing={editingUserId === user._id}
                    onEdit={() => handleEdit(user._id)}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onDelete={handleDelete}
                    editingUserId={editingUserId}
                    // ...other props
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// UserCard component for update/delete
function UserCard({ user, onDelete, onUpdate, isEditing, onEdit, onCancelEdit, onSaveEdit, editingUserId }: {
  user: any;
  onDelete: (id: string) => void;
  onUpdate?: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, data: any) => void;
  editingUserId: string | null;
}) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: user.password,
    class: user.class,
    role: user.role,
  });
  const [error, setError] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSaveEdit(user._id, form);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-border rounded-lg px-4 py-3 bg-background shadow-sm hover:shadow transition min-h-[80px] w-full overflow-x-auto">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-2 flex-1 w-full">
          <input name="name" value={form.name} onChange={handleChange} className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground" required />
          <input name="email" value={form.email} onChange={handleChange} className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground" required />
          <input name="password" value={form.password || ''} onChange={handleChange} className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground" required type="text" placeholder="Password" />
          <select name="class" value={form.class} onChange={handleChange} className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground">
            {CLASS_ENUM.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
          </select>
          <input name="role" value={form.role} onChange={handleChange} className="border border-border px-2 py-1 text-sm bg-muted text-foreground font-medium min-w-[60px] rounded" required type="text" placeholder="Role" />
          {error && <span className="text-xs text-red-500">{error}</span>}
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-xs bg-primary text-primary-foreground hover:bg-primary/90" style={{ minWidth: 60 }}>Save</button>
            <button type="button" className="btn btn-xs bg-muted text-foreground hover:bg-muted/80 border border-border" onClick={onCancelEdit} style={{ minWidth: 60 }}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-lg text-primary break-all min-w-[100px]">{user.name || <span className='italic text-gray-400'>No Name</span>}</span>
            <span className="text-muted-foreground text-sm break-all min-w-[150px]">{user.email || <span className='italic text-gray-400'>No Email</span>}</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-1">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium min-w-[60px]">Class: {user.class || <span className='italic text-gray-400'>-</span>}</span>
            <span className="text-xs bg-muted text-foreground px-2 py-1 rounded font-medium min-w-[60px]">Role: {user.role || <span className='italic text-gray-400'>-</span>}</span>
            <span className="text-xs bg-muted text-foreground px-2 py-1 rounded font-medium min-w-[60px]">Password: {user.password || <span className='italic text-gray-400'>-</span>}</span>
          </div>
        </>
      )}
      <div className="flex gap-2 ml-auto mt-2 md:mt-0">
        {!isEditing && (
          <button className="btn btn-sm bg-primary text-primary-foreground hover:bg-primary/90" style={{ minWidth: 60 }} onClick={(e) => { e.preventDefault(); onEdit(); }}>Edit</button>
        )}
        {!isEditing && (
          <button className="btn btn-sm bg-muted text-foreground hover:bg-muted/80 border border-border" style={{ minWidth: 60 }} onClick={() => onDelete(user._id)}>Delete</button>
        )}
      </div>
    </div>
  );
}

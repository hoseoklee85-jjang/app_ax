import { useState, useEffect } from 'react';

interface AdminUser {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminManage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', role: 'SUB_ADMIN' });

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to fetch admins', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) return alert('Username and Password are required.');
    
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ username: '', password: '', role: 'SUB_ADMIN' });
        fetchAdmins();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Failed to create admin', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      const res = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdmins();
      }
    } catch (err) {
      console.error('Failed to delete admin', err);
    }
  };

  return (
    <>
      <section className="admin-panel add-product-panel">
        <h2>Add New Admin</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="e.g. manager_kim" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="securepassword" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select 
              value={form.role} 
              onChange={e => setForm({...form, role: e.target.value})}
              style={{
                width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', 
                border: '1px solid var(--border)', borderRadius: '8px', 
                color: 'var(--text-main)', outline: 'none'
              }}
            >
              <option value="SUB_ADMIN">Sub Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Create Admin</button>
        </form>
      </section>

      <section className="admin-panel product-list-panel">
        <h2>Admin Accounts</h2>
        {loading ? (
          <p>Loading admins...</p>
        ) : (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No admins found.</td>
                  </tr>
                ) : (
                  admins.map(a => (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td className="fw-bold">{a.username}</td>
                      <td>
                        <span className={a.role === 'SUPER_ADMIN' ? 'badge-success' : 'badge-warning'}>
                          {a.role}
                        </span>
                      </td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDelete(a.id)}
                          style={{
                            background: '#ef4444', color: 'white', border: 'none',
                            padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

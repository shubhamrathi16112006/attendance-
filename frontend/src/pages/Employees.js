import React, { useState } from 'react';
import { useApi, api } from '../hooks/useApi';

export default function Employees() {
  const { data: employees, loading, refetch } = useApi('/employees');
  const [form, setForm] = useState({ name: '', department: '', role: '', email: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/employees', form);
      setForm({ name: '', department: '', role: '', email: '' });
      setAdding(false);
      refetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add employee');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await api.delete(`/employees/${id}`);
    refetch();
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading employees…</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Employees</h2>
        <button onClick={() => setAdding(a => !a)} style={{
          background: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '0.55rem 1.1rem', fontSize: '0.88rem',
        }}>
          {adding ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {adding && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>New Employee</h3>
          {error && <div style={{ color: '#ff4757', marginBottom: '0.75rem', fontSize: '0.88rem' }}>{error}</div>}
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {['name','department','role','email'].map(field => (
              <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                required type={field === 'email' ? 'email' : 'text'}
                style={{ padding: '0.6rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}
              />
            ))}
            <button type="submit" style={{ gridColumn: '1/-1', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem', fontSize: '0.9rem' }}>
              Add Employee
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
              {['Employee','Department','Role','Email',''].map(h => (
                <th key={h} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(employees || []).map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{emp.avatar}</div>
                  {emp.name}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{emp.department}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>{emp.role}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{emp.email}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>
                  <button onClick={() => handleDelete(emp.id)} style={{ background: 'transparent', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

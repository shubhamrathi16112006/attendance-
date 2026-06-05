import React, { useState } from 'react';
import { useApi, api } from '../hooks/useApi';

const STATUS_COLORS = { present: '#2ed573', late: '#ffa502', absent: '#ff4757', leave: '#6c63ff' };

export default function Attendance() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const { data, loading, refetch } = useApi(`/attendance?date=${date}`, [date]);

  const cycle = async (record) => {
    const order = ['present', 'late', 'absent', 'leave'];
    const next = order[(order.indexOf(record.status) + 1) % order.length];
    await api.put(`/attendance/${record.id}`, { status: next });
    refetch();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Attendance</h2>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}
        />
      </div>

      {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading…</div> : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                {['Employee','Department','Status','Check In','Check Out'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data || []).map(rec => (
                <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{rec.employee?.name || '—'}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{rec.employee?.department || '—'}</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <button onClick={() => cycle(rec)} style={{
                      background: 'transparent', border: `1px solid ${STATUS_COLORS[rec.status]}`,
                      color: STATUS_COLORS[rec.status], borderRadius: '6px',
                      padding: '0.2rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize',
                    }}>
                      {rec.status}
                    </button>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{rec.checkIn || '—'}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{rec.checkOut || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

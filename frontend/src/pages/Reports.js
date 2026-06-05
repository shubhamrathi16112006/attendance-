import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

export default function Reports() {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const { data, loading } = useApi(`/attendance?month=${month}`, [month]);
  const { data: employees } = useApi('/employees');

  const summary = React.useMemo(() => {
    if (!data || !employees) return [];
    return employees.map(emp => {
      const records = data.filter(r => r.employeeId === emp.id);
      const count = (s) => records.filter(r => r.status === s).length;
      return { ...emp, present: count('present'), late: count('late'), absent: count('absent'), leave: count('leave'), total: records.length };
    });
  }, [data, employees]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Reports</h2>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}
        />
      </div>

      {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading…</div> : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                {['Employee','Dept','Present','Late','Absent','Leave','Total Days'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{emp.name}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{emp.department}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#2ed573' }}>{emp.present}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#ffa502' }}>{emp.late}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#ff4757' }}>{emp.absent}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#6c63ff' }}>{emp.leave}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{emp.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

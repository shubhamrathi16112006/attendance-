import React from 'react';
import { useApi } from '../hooks/useApi';

export default function Dashboard() {
  const { data: stats, loading } = useApi('/stats');
  const { data: trend } = useApi('/trend');

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading dashboard…</div>;

  const s = stats?.today || {};

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Dashboard</h2>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Present',   value: s.present,   color: '#2ed573' },
          { label: 'Late',      value: s.late,       color: '#ffa502' },
          { label: 'Absent',    value: s.absent,     color: '#ff4757' },
          { label: 'On Leave',  value: s.onLeave,    color: '#6c63ff' },
          { label: 'Total',     value: s.total,      color: 'var(--text-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value ?? '—'}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label} Today</div>
          </div>
        ))}
      </div>

      {/* Weekly trend table */}
      {trend && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>7-Day Trend</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                {['Day', 'Present', 'Late', 'Absent', 'Leave'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trend.map(row => (
                <tr key={row.date} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0.75rem' }}>{row.day} <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{row.date}</span></td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#2ed573' }}>{row.present}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#ffa502' }}>{row.late}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#ff4757' }}>{row.absent}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#6c63ff' }}>{row.leave}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

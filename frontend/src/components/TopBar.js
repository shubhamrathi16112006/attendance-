import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user } = useAuth();
  return (
    <div style={{
      height: '60px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
    }}>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        AttendX Management Portal
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff',
          }}>
            {user.avatar || user.name?.[0]}
          </div>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{user.name}</span>
        </div>
      )}
    </div>
  );
}

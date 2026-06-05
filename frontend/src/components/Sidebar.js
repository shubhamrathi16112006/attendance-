import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/employees', icon: '◉', label: 'Employees' },
  { to: '/attendance', icon: '◎', label: 'Attendance' },
  { to: '/reports',   icon: '◆', label: 'Reports' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate a color based on user name for avatar
  const avatarGradient = user
    ? `linear-gradient(135deg, #6c63ff, #00d4b4)`
    : `linear-gradient(135deg, #6c63ff, #00d4b4)`;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">A</div>
        <div className="logo-text">
          <span className="logo-name">AttendX</span>
          <span className="logo-tagline">Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {location.pathname === item.to && <span className="nav-indicator" />}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* User info */}
        <div className="sidebar-user">
          <div className="avatar avatar-sm" style={{ background: avatarGradient }}>
            {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'Admin'}</span>
            <span className="sidebar-user-role">{user?.role === 'admin' ? 'Super Admin' : 'User'}</span>
          </div>
        </div>

        {/* Logout button */}
        <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
          <span className="logout-icon">⎋</span>
          <span className="logout-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

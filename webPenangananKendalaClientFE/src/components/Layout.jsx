import React from 'react';
import { useAuth } from '../AuthContext';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'service_desk': return;
      case 'project_manager': return;
      case 'programmer': return;
      case 'owner': return;
      default: return;
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'service_desk': return 'Service Desk';
      case 'project_manager': return 'Project Manager';
      case 'programmer': return 'Programmer';
      case 'owner': return 'Company Owner';
      default: return role;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="glass-panel" style={{
        margin: '16px',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            <span className="text-gradient"></span> Flow
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-glass)'
          }}>v1.0</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* User details card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary-glow)',
                border: '1px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                {getRoleIcon(user.role)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{user.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span className={`badge badge-${user.role}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {getRoleDisplay(user.role)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Log Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '0 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </main>
    </div>
  );
};

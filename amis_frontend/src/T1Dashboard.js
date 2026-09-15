import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { 
  colors, 
  cardStyle, 
  badgeStyle, 
  typography, 
  borderRadius 
} from './designSystem';

function T1Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [isExpanded, setIsExpanded] = useState(true);

  const activeUser = typeof user === 'string' ? { username: user, role: 'T1' } : (user || { username: 'T1 Officer', role: 'T1' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      <Sidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeUser={activeUser}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
        role="T1"
      />

      <main style={{ 
        flex: 1, 
        padding: '24px 32px', 
        transition: 'all 0.25s ease',
        minHeight: '100vh',
        backgroundColor: colors.background,
        color: colors.text,
      }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${colors.border}`
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, color: colors.text, fontSize: '22px', fontWeight: '800' }}>
                T1 Dashboard
              </h1>
              <span style={{
                ...badgeStyle,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                border: `1px solid ${colors.primaryBorder}`,
                fontWeight: '700',
              }}>
                T1 Portal
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '13px' }}>
              Maareynta iyo kormeerka xogta guud ee qeybta T1.
            </p>
          </div>
          <span style={{ 
            fontSize: '13px', 
            color: colors.textSecondary,
            fontWeight: '600',
            backgroundColor: colors.white,
            padding: '6px 14px',
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.border}`
          }}>
            Welcome, {activeUser.username}
          </span>
        </header>

        {activePage === 'dashboard' && (
          <div style={{ ...cardStyle, padding: '28px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: colors.text }}>
              T1 Dashboard Overview
            </h3>
            <p style={{ margin: 0, color: colors.textMuted, fontSize: '14px', lineHeight: 1.6 }}>
              Ku soo dhawoow dashboard-ka T1. Halkan waxaad ka arki kartaa xogta kooban ee hawlaha iyo kormeerka.
            </p>
          </div>
        )}

        {activePage === 'askar' && (
          <div style={{ ...cardStyle, padding: '28px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: colors.text }}>
              Xogta Askarta (T1 View)
            </h3>
            <p style={{ margin: 0, color: colors.textMuted, fontSize: '14px', lineHeight: 1.6 }}>
              Halkan waxaa ka soo muuqan doona shaxda (table) xogta askarta iyo xaaladaha taagan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default T1Dashboard;
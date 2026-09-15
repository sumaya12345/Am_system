import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  PieChart,
  Settings,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  sidebarStyle,
  sidebarCollapsedStyle,
  profileSectionStyle,
  profileImageStyle,
  navItemStyle,
  colors,
  typography,
  getColors,
} from '../designSystem';
import ProfileImage from '../ProfileImage';

export default function Sidebar({
  isExpanded,
  setIsExpanded,
  activeUser,
  activePage,
  setActivePage,
  onLogout,
  showMsgModal,
  setShowMsgModal,
  role,
  darkMode = false,
}) {
  const themeColors = getColors(darkMode);
  const currentSidebarStyle = isExpanded ? sidebarStyle : sidebarCollapsedStyle;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'reports',   icon: FileText,        label: 'Warbixinada' },
    { id: 'askar',     icon: Users,           label: 'Xogta Askarta' },
    { id: 'analytics', icon: PieChart,        label: 'Analytics' },
    { id: 'settings',  icon: Settings,        label: 'Habaynta' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
  };

  const isNavActive = (id) => activePage === id;

  const hoverEnter = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = themeColors.sidebarHover;
      e.currentTarget.style.color = themeColors.sidebarTextActive;
    }
  };

  const hoverLeave = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = themeColors.sidebarText;
    }
  };

  return (
    <aside style={currentSidebarStyle} className="no-print">
      {/* ── Brand / Header ── */}
      <div style={{
        padding: isExpanded ? '18px 16px 14px' : '18px 8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center',
        borderBottom: `1px solid ${themeColors.sidebarBorder}`,
      }}>
        {isExpanded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: darkMode ? '#2563eb' : '#16365c',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}>
              <Shield size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '0.04em',
                lineHeight: 1.1,
              }}>
                AMIS SYSTEM
              </div>
              <div style={{
                fontSize: '10px',
                color: darkMode ? '#60a5fa' : '#60a5fa',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}>
                Medical Portal
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: darkMode ? '#2563eb' : '#16365c',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <Shield size={18} strokeWidth={2.2} />
          </div>
        )}

        {isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Collapse sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: themeColors.sidebarText,
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── User Profile Section ── */}
      <div style={{...profileSectionStyle, borderBottom: `1px solid ${themeColors.sidebarBorder}`}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>
          <ProfileImage
            pic={activeUser?.pic || activeUser?.profile_pic}
            alt="Profile"
            style={profileImageStyle}
          />
          {isExpanded && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: themeColors.sidebarTextActive,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {activeUser?.username || `${role || 'Officer'}`}
              </div>
              <div style={{
                fontSize: '11px',
                color: darkMode ? '#60a5fa' : '#93c5fd',
                fontWeight: typography.fontWeight.medium,
                marginTop: '1px',
              }}>
                {activeUser?.role || role || 'Officer'}
              </div>
            </div>
          )}
        </div>

        {!isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            title="Expand sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: themeColors.sidebarText,
              padding: '2px',
              marginTop: '6px',
            }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Navigation Section ── */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = isNavActive(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                ...navItemStyle(active),
                justifyContent: isExpanded ? 'flex-start' : 'center',
                padding: isExpanded ? '9px 12px' : '9px 0',
              }}
              onMouseEnter={(e) => hoverEnter(e, active)}
              onMouseLeave={(e) => hoverLeave(e, active)}
              title={!isExpanded ? item.label : undefined}
            >
              <item.icon size={17} style={{ flexShrink: 0 }} />
              {isExpanded && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom Section: Messages & Logout ── */}
      <div style={{
        padding: '10px 0 14px',
        borderTop: `1px solid ${themeColors.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {/* Messages Action */}
        <div
          onClick={() => setShowMsgModal && setShowMsgModal(true)}
          style={{
            ...navItemStyle(showMsgModal),
            justifyContent: isExpanded ? 'flex-start' : 'center',
            padding: isExpanded ? '9px 12px' : '9px 0',
          }}
          onMouseEnter={(e) => hoverEnter(e, showMsgModal)}
          onMouseLeave={(e) => hoverLeave(e, showMsgModal)}
          title={!isExpanded ? 'Fariimaha' : undefined}
        >
          <MessageSquare size={17} style={{ flexShrink: 0 }} />
          {isExpanded && <span>Fariimaha</span>}
        </div>

        {/* Logout Action */}
        <div
          onClick={onLogout}
          style={{
            ...navItemStyle(false),
            color: '#f87171',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            padding: isExpanded ? '9px 12px' : '9px 0',
            borderLeft: '3px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
            e.currentTarget.style.color = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#f87171';
          }}
          title={!isExpanded ? 'Logout' : undefined}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {isExpanded && <span style={{ fontWeight: typography.fontWeight.semibold }}>Logout</span>}
        </div>
      </div>
    </aside>
  );
}

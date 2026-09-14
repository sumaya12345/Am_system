import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  PieChart,
  Settings,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import {
  sidebarStyle,
  sidebarCollapsedStyle,
  profileSectionStyle,
  profileImageStyle,
  navItemStyle,
  colors,
  typography,
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
  darkMode,
  setDarkMode,
  role,
}) {
  const currentSidebarStyle = isExpanded ? sidebarStyle : sidebarCollapsedStyle;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'reports',   icon: FileText,        label: 'Reports'   },
    { id: 'askar',     icon: Users,           label: 'Xogta Askar' },
    { id: 'analytics', icon: PieChart,        label: 'Analytics' },
    { id: 'settings',  icon: Settings,        label: 'Settings'  },
  ];

  const msgItem = { id: 'messages', icon: MessageSquare, label: 'Fariimaha', isModal: true };

  const handleNavClick = (item) => {
    if (item.isModal) {
      setShowMsgModal(true);
    } else {
      setActivePage(item.id);
    }
  };

  const isItemActive = (item) => item.isModal ? showMsgModal : activePage === item.id;

  const getNavStyle = (isActive) => ({
    ...navItemStyle(isActive),
    margin: isExpanded ? '2px 8px' : '2px 8px',
  });

  const hoverEnter = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = colors.sidebarHover;
      e.currentTarget.style.color = colors.sidebarTextActive;
    }
  };
  const hoverLeave = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = colors.sidebarText;
    }
  };

  return (
    <aside style={currentSidebarStyle}>
      {/* ── Profile Section ── */}
      <div style={profileSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <ProfileImage
            pic={activeUser?.pic || activeUser?.profile_pic}
            alt="Profile"
            style={profileImageStyle}
          />
          {isExpanded && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.bold,
                color: colors.sidebarTextActive,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {activeUser?.username || `${role} Officer`}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: '#93c5fd',
                fontWeight: typography.fontWeight.semibold,
                marginTop: '2px',
              }}>
                {activeUser?.role || role}
              </div>
            </div>
          )}
        </div>
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer', color: colors.sidebarText, flexShrink: 0, padding: '4px' }}
        >
          {isExpanded ? <X size={18} /> : <Menu size={18} />}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <div
              key={item.id}
              onClick={() => handleNavClick(item)}
              style={getNavStyle(active)}
              onMouseEnter={(e) => hoverEnter(e, active)}
              onMouseLeave={(e) => hoverLeave(e, active)}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {isExpanded && <span>{item.label}</span>}
            </div>
          );
        })}

        {/* Messages */}
        {(() => {
          const active = isItemActive(msgItem);
          return (
            <div
              onClick={() => handleNavClick(msgItem)}
              style={getNavStyle(active)}
              onMouseEnter={(e) => hoverEnter(e, active)}
              onMouseLeave={(e) => hoverLeave(e, active)}
            >
              <msgItem.icon size={18} style={{ flexShrink: 0 }} />
              {isExpanded && <span>{msgItem.label}</span>}
            </div>
          );
        })()}
      </nav>

      {/* ── Bottom: Logout ── */}
      <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          onClick={onLogout}
          style={{
            ...navItemStyle(false),
            margin: '2px 8px',
            color: '#fca5a5',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fca5a5'; }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {isExpanded && <span style={{ fontWeight: '600' }}>Logout</span>}
        </div>
      </div>
    </aside>
  );
}

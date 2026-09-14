/**
 * AMIS Design System
 * White + Blue — clean, professional, consistent across all dashboards
 */

// ─── COLOR TOKENS ────────────────────────────────────────────────────────────
export const colors = {
  // Primary Blue
  primary:       '#1d4ed8',
  primaryHover:  '#1e40af',
  primaryLight:  '#dbeafe',
  primaryDark:   '#1e3a8a',
  primaryText:   '#ffffff',

  // Sidebar (Deep Blue)
  sidebar:       '#1e3a8a',
  sidebarHover:  '#1d4ed8',
  sidebarActive: '#2563eb',
  sidebarText:   '#bfdbfe',
  sidebarTextActive: '#ffffff',

  // Backgrounds
  background:    '#f1f5f9',
  white:         '#ffffff',
  backgroundAlt: '#f8fafc',

  // Borders
  border:        '#e2e8f0',
  borderLight:   '#f1f5f9',

  // Text
  text:          '#1e293b',
  textMuted:     '#64748b',
  textLight:     '#94a3b8',

  // Status
  success:       '#10b981',
  warning:       '#f59e0b',
  error:         '#ef4444',
  info:          '#3b82f6',

  // Shadows
  shadow:   '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
};

// ─── SPACING ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs:  '4px',
  sm:  '8px',
  md:  '12px',
  lg:  '16px',
  xl:  '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
};

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────
export const borderRadius = {
  sm:   '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
};

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: {
    xs:   '11px',
    sm:   '12px',
    base: '14px',
    md:   '15px',
    lg:   '16px',
    xl:   '18px',
    '2xl':'20px',
    '3xl':'24px',
    '4xl':'28px',
  },
  fontWeight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
    extrabold:'800',
  },
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
export const sidebarStyle = {
  width: '260px',
  height: '100vh',
  backgroundColor: colors.sidebar,
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  transition: 'all 0.3s ease',
  flexShrink: 0,
};

export const sidebarCollapsedStyle = {
  width: '72px',
  height: '100vh',
  backgroundColor: colors.sidebar,
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  transition: 'all 0.3s ease',
  flexShrink: 0,
};

// ─── PROFILE SECTION ─────────────────────────────────────────────────────────
export const profileSectionStyle = {
  padding: '20px 16px',
  borderBottom: `1px solid rgba(255,255,255,0.1)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const profileImageStyle = {
  width: '40px',
  height: '40px',
  borderRadius: borderRadius.full,
  border: '2px solid rgba(255,255,255,0.4)',
  objectFit: 'cover',
  backgroundColor: colors.sidebarHover,
  flexShrink: 0,
};

// ─── NAV ITEMS ───────────────────────────────────────────────────────────────
export const navItemStyle = (isActive = false) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 14px',
  margin: '2px 8px',
  borderRadius: borderRadius.md,
  cursor: 'pointer',
  gap: '10px',
  transition: 'all 0.15s ease',
  color:           isActive ? colors.sidebarTextActive : colors.sidebarText,
  backgroundColor: isActive ? colors.sidebarActive    : 'transparent',
  fontWeight:      isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
  fontSize:        typography.fontSize.base,
  textDecoration: 'none',
  userSelect: 'none',
});

// ─── CARD ─────────────────────────────────────────────────────────────────────
export const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: borderRadius.lg,
  border: `1px solid ${colors.border}`,
  boxShadow: colors.shadow,
  padding: spacing.xl,
};

// ─── TABLE ───────────────────────────────────────────────────────────────────
export const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: colors.white,
  fontSize: typography.fontSize.base,
};

export const tableHeaderStyle = {
  backgroundColor: colors.primary,
  color: colors.white,
  fontWeight: typography.fontWeight.semibold,
  fontSize: typography.fontSize.sm,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '12px 16px',
  textAlign: 'left',
};

export const tableCellStyle = {
  padding: '12px 16px',
  borderBottom: `1px solid ${colors.border}`,
  fontSize: typography.fontSize.base,
  color: colors.text,
  verticalAlign: 'middle',
};

// ─── BUTTONS ─────────────────────────────────────────────────────────────────
const buttonBase = {
  padding: '9px 18px',
  borderRadius: borderRadius.md,
  border: 'none',
  cursor: 'pointer',
  fontWeight: typography.fontWeight.semibold,
  fontSize: typography.fontSize.base,
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: spacing.sm,
  fontFamily: typography.fontFamily,
  lineHeight: '1',
};

export const buttonPrimaryStyle = {
  ...buttonBase,
  backgroundColor: colors.primary,
  color: colors.white,
};

export const buttonSecondaryStyle = {
  ...buttonBase,
  backgroundColor: colors.white,
  color: colors.text,
  border: `1px solid ${colors.border}`,
};

export const buttonDangerStyle = {
  ...buttonBase,
  backgroundColor: colors.error,
  color: colors.white,
};

// ─── FORM ────────────────────────────────────────────────────────────────────
export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: borderRadius.md,
  border: `1px solid ${colors.border}`,
  fontSize: typography.fontSize.base,
  color: colors.text,
  backgroundColor: colors.white,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
  fontFamily: typography.fontFamily,
};

export const labelStyle = {
  display: 'block',
  marginBottom: spacing.sm,
  fontWeight: typography.fontWeight.medium,
  fontSize: typography.fontSize.sm,
  color: colors.textMuted,
};

// ─── MODAL ───────────────────────────────────────────────────────────────────
export const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
};

export const modalContentStyle = {
  backgroundColor: colors.white,
  borderRadius: borderRadius.xl,
  boxShadow: colors.shadowLg,
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: spacing['3xl'],
};

export const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: spacing.xl,
  paddingBottom: spacing.lg,
  borderBottom: `1px solid ${colors.border}`,
};

export const modalTitleStyle = {
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.bold,
  color: colors.text,
  margin: 0,
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
export const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 10px',
  borderRadius: borderRadius.full,
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.semibold,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export const badgePrimaryStyle   = { ...badgeStyle, backgroundColor: colors.primaryLight, color: colors.primary };
export const badgeSuccessStyle   = { ...badgeStyle, backgroundColor: '#d1fae5', color: '#065f46' };
export const badgeWarningStyle   = { ...badgeStyle, backgroundColor: '#fef3c7', color: '#92400e' };
export const badgeErrorStyle     = { ...badgeStyle, backgroundColor: '#fee2e2', color: '#991b1b' };

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing['4xl'],
  textAlign: 'center',
  color: colors.textLight,
};

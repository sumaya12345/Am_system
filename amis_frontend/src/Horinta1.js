import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './H1Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { 
  LayoutDashboard, Bell, FileText, Users, Settings, LogOut, 
  PieChart, MessageSquare, Menu, X, Send, Paperclip, Search, User,
  Check, CheckCheck, Camera, Save, Shield, Lock, Monitor, Activity, ArrowUpRight, AlertCircle, ArrowLeft, Clock
} from 'lucide-react';
import FariimahaModal from './FariimahaModal';
import { useAuthUser, getProfilePicUrl } from './authSync';
import Sidebar from './components/Sidebar';
import { 
  colors, 
  cardStyle, 
  tableStyle, 
  tableHeaderStyle, 
  tableCellStyle, 
  buttonPrimaryStyle, 
  buttonSecondaryStyle, 
  badgeStyle, 
  borderRadius, 
  typography 
} from './designSystem';

function Horinta1({ user, onLogout }) {
  const [data, setData] = useState([]);
  const [medicalReports, setMedicalReports] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [activeRecords, setActiveRecords] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNotifyList, setShowNotifyList] = useState(false);
  const [viewedSarkaal, setViewedSarkaal] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);

  // Settings states
  const authUser = useAuthUser(user);
  const activeUser = authUser || user || {};
  const loggedInUser = activeUser;
  const [settingsUsername, setSettingsUsername] = useState(loggedInUser.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    totalPersonnel: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalReferred: 0,
    statusDistribution: [],
    monthlyActivity: []
  });

  const authConfig = () => {
    const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
    return sessionId ? { headers: { 'X-Session-ID': sessionId } } : {};
  };

  const fetchData = async () => {
    try {
      const [qRes, rRes, pRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/ballan/queue', authConfig()),
        axios.get('http://localhost:5000/api/medical-records', authConfig()),
        axios.get('http://localhost:5000/api/sarkaal-data', authConfig()),
        axios.get('http://localhost:5000/api/h1-analytics', authConfig())
      ]);

      const queue = Array.isArray(qRes.data) ? qRes.data : [];
      const records = Array.isArray(rRes.data) ? rRes.data : [];
      const people = Array.isArray(pRes.data) ? pRes.data : [];
      setPendingQueue(queue.filter(q => q.status === 'Pending'));
      setActiveRecords(records.filter(r => r.horinta === 'Horinta 1aad'));
      setPersonnel(people.filter(p => p.horinta === 'Horinta 1aad'));
      setData(people.filter(p => p.horinta === 'Horinta 1aad'));
      setMedicalReports(records);
      setAnalyticsData(analyticsRes.data || {});
    } catch (err) {
      console.error("Xogta lama soo xiriirin karno:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const saveProfileSettings = async () => {
    if (!loggedInUser.id || !settingsUsername.trim()) return alert('Username is required.');
    setSettingsSaving(true);
    try {
      const formData = new FormData();
      formData.append('userId', String(loggedInUser.id));
      formData.append('username', settingsUsername.trim());
      if (newProfilePic) formData.append('profile_pic', newProfilePic);
      const response = await axios.post('http://localhost:5000/api/update-profile', formData, authConfig());
      const updatedUser = { ...loggedInUser, username: settingsUsername.trim(), pic: response.data.pic || loggedInUser.pic };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setNewProfilePic(null);
      setPreviewUrl(null);
      alert('Profile updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const savePasswordSettings = async () => {
    if (!currentPassword || !newPassword) return alert('Buuxi labada password.');
    try {
      await axios.put(`http://localhost:5000/api/user/${loggedInUser.id}/password`, { currentPassword, newPassword }, authConfig());
      setCurrentPassword('');
      setNewPassword('');
      alert('Password updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Password update failed.');
    }
  };

  const flaggedAskar = data.filter(sarkaal => {
    const totalDays = medicalReports
      .filter(r => r.sarkaal_id === sarkaal.sarkaal_id && r.limitation === 'Yattak Istirihat')
      .reduce((sum, r) => sum + Number(r.days || 0), 0);
    return totalDays >= 45;
  });

  const hasNotifications = flaggedAskar.length > 0;
  const h1Reports = medicalReports;
  const chartColors = ['#0f2744', '#2563eb', '#64748b', '#94a3b8', '#cbd5e1'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      <Sidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeUser={activeUser}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        showMsgModal={showMsgModal}
        setShowMsgModal={setShowMsgModal}
        role="H1"
      />

      {/* ── MAIN CONTENT ── */}
      <main style={{
        flexGrow: 1,
        padding: '24px 32px',
        backgroundColor: colors.background,
        color: colors.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Top Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: `1px solid ${colors.border}`,
        }} className="no-print">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, color: colors.text, fontSize: '22px', fontWeight: '800' }}>
                Horinta 1aad
              </h1>
              <span style={{
                ...badgeStyle,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                border: `1px solid ${colors.primaryBorder}`,
                fontWeight: '700',
              }}>
                H1 Division Portal
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '13px' }}>
              Maamulka xogta caafimaadka iyo askarta Horinta 1aad.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifyList(!showNotifyList)}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: borderRadius.md,
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textSecondary,
              }}>
                <Bell size={18} />
              </div>

              {hasNotifications && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: colors.error,
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 5px',
                  borderRadius: '50%',
                  fontWeight: '700',
                  lineHeight: 1,
                  border: '2px solid white',
                }}>
                  {flaggedAskar.length}
                </span>
              )}

              {/* Notification Dropdown */}
              {showNotifyList && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: '0',
                  width: '320px',
                  background: colors.white,
                  boxShadow: colors.shadowLg,
                  borderRadius: borderRadius.lg,
                  zIndex: 1000,
                  overflow: 'hidden',
                  border: `1px solid ${colors.border}`,
                }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: colors.text }}>Ogeysiisyada Istiraxada</span>
                    <span style={{ ...badgeStyle, backgroundColor: colors.errorBg, color: colors.error, border: `1px solid ${colors.errorBorder}` }}>
                      {flaggedAskar.length} Qof
                    </span>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {flaggedAskar.length > 0 ? (
                      flaggedAskar.map((s) => (
                        <div
                          key={s.sarkaal_id}
                          onClick={() => {
                            setViewedSarkaal(s);
                            setActivePage('view');
                            setShowNotifyList(false);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderBottom: `1px solid ${colors.borderLight}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <img 
                            src={`http://localhost:5000/${s.profile_pic}`} 
                            alt="" 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>{s.name}</div>
                            <div style={{ fontSize: '11px', color: colors.error, fontWeight: '500' }}>⚠️ 45+ Maalmood Istiraxo</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
                        Ma jiraan ogeysiisyo cusub.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={fetchData} style={buttonPrimaryStyle}>
              <Check size={15} />
              <span>Refresh Data</span>
            </button>
          </div>
        </header>

        {/* ── DASHBOARD TAB ── */}
        {activePage === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ ...cardStyle, padding: '16px 20px', borderTop: `3px solid ${colors.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Safka Sugitaanka MO</span>
                  <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>{pendingQueue.length}</strong>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: borderRadius.md, backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '16px 20px', borderTop: `3px solid ${colors.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Baaritaannada Firfircoon</span>
                  <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>{activeRecords.length}</strong>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: borderRadius.md, backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCheck size={18} />
                </div>
              </div>

              <div style={{ ...cardStyle, padding: '16px 20px', borderTop: `3px solid ${colors.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wadarta Askarta H1</span>
                  <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>{personnel.length}</strong>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: borderRadius.md, backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
              </div>
            </div>

            {/* 1. Safka MO (Pending) */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>1. Safka MO (Pending)</h3>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>Wadarta: <strong>{pendingQueue.length}</strong></span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableHeaderStyle}>Sawir</th>
                      <th style={tableHeaderStyle}>Magaca</th>
                      <th style={tableHeaderStyle}>Sarkaal ID</th>
                      <th style={tableHeaderStyle}>Culays</th>
                      <th style={tableHeaderStyle}>Dhiig</th>
                      <th style={tableHeaderStyle}>Dhirir</th>
                      <th style={tableHeaderStyle}>Xaaladda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQueue.map(item => (
                      <tr key={item.sarkaal_data_id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={tableCellStyle}>
                          <img 
                            src={`http://localhost:5000/${item.profile_pic}`} 
                            width="34" 
                            height="34" 
                            style={{ borderRadius: '50%', objectFit: 'cover', border: `1px solid ${colors.border}` }} 
                            alt="profile"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                          />
                        </td>
                        <td style={{ ...tableCellStyle, fontWeight: '600' }}>{item.name}</td>
                        <td style={tableCellStyle}>{item.sarkaal_id}</td>
                        <td style={tableCellStyle}>{item.culays ?? '-'} kg</td>
                        <td style={tableCellStyle}>{item.dhiiga || '-'}</td>
                        <td style={tableCellStyle}>{item.dhirirka ?? '-'} cm</td>
                        <td style={tableCellStyle}>
                          <span style={{ ...badgeStyle, backgroundColor: colors.warningBg, color: colors.warning, border: `1px solid ${colors.warningBorder}` }}>
                            Pending for H1
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingQueue.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
                    Safka MO waa maran yahay.
                  </div>
                )}
              </div>
            </div>

            {/* 2. Active Records Table */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>2. Warbixinnada Baaritaanka (Active Records)</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableHeaderStyle}>Sawir</th>
                      <th style={tableHeaderStyle}>ID</th>
                      <th style={tableHeaderStyle}>Magaca</th>
                      <th style={tableHeaderStyle}>Xaddidaadda</th>
                      <th style={tableHeaderStyle}>Maalmaha Hadhay</th>
                      <th style={tableHeaderStyle}>Xaaladda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRecords.reduce((acc, current) => {
                      const xogtaHore = acc.find(item => item.sarkaal_id === current.sarkaal_id);
                      if (xogtaHore) {
                        xogtaHore.days = parseInt(xogtaHore.days) + parseInt(current.days);
                        return acc;
                      } else {
                        return [...acc, { ...current }];
                      }
                    }, []).map((report) => {
                      const maanta = new Date();
                      const taariikhdaLaQoray = new Date(report.created_at);
                      const dhamaadka = new Date(taariikhdaLaQoray);
                      dhamaadka.setDate(dhamaadka.getDate() + parseInt(report.days));
                      const maalmahaHadhay = Math.ceil((dhamaadka - maanta) / (1000 * 60 * 60 * 24));

                      if (maalmahaHadhay <= 0) return null;

                      return (
                        <tr key={report.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                          <td style={tableCellStyle}>
                            <img 
                              src={`http://localhost:5000/${report.profile_pic}`} 
                              width="34" 
                              height="34" 
                              style={{ borderRadius: '50%', objectFit: 'cover', border: `1px solid ${colors.border}` }} 
                              alt="profile"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                            />
                          </td>
                          <td style={{ ...tableCellStyle, fontWeight: '600' }}>{report.sarkaal_id}</td>
                          <td style={tableCellStyle}>{report.name}</td>
                          <td style={tableCellStyle}><strong>{report.limitation}</strong></td>
                          <td style={tableCellStyle}>
                            <span style={{
                              ...badgeStyle,
                              backgroundColor: maalmahaHadhay <= 1 ? colors.errorBg : colors.primaryLight,
                              color: maalmahaHadhay <= 1 ? colors.error : colors.primary,
                              border: `1px solid ${maalmahaHadhay <= 1 ? colors.errorBorder : colors.primaryBorder}`,
                              fontWeight: '700',
                            }}>
                              {maalmahaHadhay} Maalmood
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{ ...badgeStyle, backgroundColor: colors.successBg, color: colors.success, border: `1px solid ${colors.successBorder}` }}>
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {activePage === 'reports' && (
          <div className="h1-page">
            <div className="h1-page-title">
              <div>
                <h1>Warbixinnada H1</h1>
                <p>Xogta caafimaadka iyo diiwaanka askarta Horinta 1aad.</p>
              </div>
              <button className="h1-secondary-button" onClick={fetchData}><Check size={16} /> Refresh</button>
            </div>
            <div className="h1-summary-grid">
              <div className="h1-summary-card"><span className="h1-summary-card__icon"><LayoutDashboard size={18} /></span><span className="h1-summary-card__label">Pending</span><strong className="h1-summary-card__value">{pendingQueue.length}</strong></div>
              <div className="h1-summary-card"><span className="h1-summary-card__icon"><FileText size={18} /></span><span className="h1-summary-card__label">Processed</span><strong className="h1-summary-card__value">{h1Reports.length}</strong></div>
              <div className="h1-summary-card"><span className="h1-summary-card__icon"><Users size={18} /></span><span className="h1-summary-card__label">Personnel</span><strong className="h1-summary-card__value">{personnel.length}</strong></div>
              <div className="h1-summary-card"><span className="h1-summary-card__icon"><ArrowUpRight size={18} /></span><span className="h1-summary-card__label">Referred</span><strong className="h1-summary-card__value">{h1Reports.filter(r => r.referrals === 'Yes').length}</strong></div>
            </div>
            <div className="h1-panel">
              <div className="h1-panel__heading">
                <h2>Diiwaanka Baaritaannada</h2>
                <span className="h1-status h1-status--neutral">{h1Reports.length} records</span>
              </div>
              {h1Reports.length === 0 ? (
                <div className="h1-empty"><FileText size={34} /><p>No H1 medical reports have been recorded yet.</p></div>
              ) : (
                <div className="h1-table-wrap">
                  <table className="h1-table">
                    <thead>
                      <tr><th>Askari</th><th>Baaritaanka</th><th>Xaddidaadda</th><th>Maalmaha</th><th>Referral</th><th>Taariikh</th></tr>
                    </thead>
                    <tbody>
                      {h1Reports.map(report => (
                        <tr key={report.id}>
                          <td><strong>{report.name || 'Unnamed'}</strong><br /><small>{report.sarkaal_id}</small></td>
                          <td>{report.diagnosis || 'Not specified'}</td>
                          <td>{report.limitation || 'None'}</td>
                          <td>{report.days || 0}</td>
                          <td>
                            <span className={`h1-status ${report.referrals === 'Yes' ? 'h1-status--referred' : 'h1-status--complete'}`}>
                              {report.referrals === 'Yes' ? 'Referred' : 'Processed'}
                            </span>
                          </td>
                          <td>{report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activePage === 'analytics' && (
          <div className="h1-page">
            <div className="h1-page-title">
              <div>
                <h1>Analytics Horinta 1aad</h1>
                <p>Muuqaal guud oo ku saabsan culeyska shaqo iyo dhaqdhaqaaqa caafimaadka.</p>
              </div>
            </div>
            <div className="h1-summary-grid">
              {[
                ['Pending', analyticsData.totalPending || 0, LayoutDashboard],
                ['Processed', analyticsData.totalProcessed || 0, CheckCheck],
                ['Personnel', analyticsData.totalPersonnel || 0, Users],
                ['Referred', analyticsData.totalReferred || 0, ArrowUpRight]
              ].map(([label, value, Icon]) => (
                <div className="h1-summary-card" key={label}>
                  <span className="h1-summary-card__icon"><Icon size={18} /></span>
                  <span className="h1-summary-card__label">{label}</span>
                  <strong className="h1-summary-card__value">{value}</strong>
                </div>
              ))}
            </div>
            <div className="h1-chart-grid">
              <div className="h1-panel">
                <div className="h1-panel__heading">
                  <h3>Dhaqdhaqaaqa Billeed</h3>
                  <FileText size={18} color={colors.primary} />
                </div>
                <div className="h1-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Reports" fill={colors.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="h1-panel">
                <div className="h1-panel__heading">
                  <h3>Xaaladda Safka</h3>
                  <Activity size={18} color={colors.primary} />
                </div>
                <div className="h1-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={analyticsData.statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={3}>
                        {(analyticsData.statusDistribution || []).map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ASKAR (PERSONNEL) TAB ── */}
        {activePage === 'askar' && (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: colors.text, fontSize: '16px', fontWeight: '700' }}>Xogta Guud ee Askarta</h2>
              <span style={{ fontSize: '12px', color: colors.textMuted }}>Wadarta: <strong>{data.length}</strong></span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={tableHeaderStyle}>No</th>
                    <th style={tableHeaderStyle}>Sawir</th>
                    <th style={tableHeaderStyle}>ID</th>
                    <th style={tableHeaderStyle}>Magaca</th>
                    <th style={tableHeaderStyle}>Culays</th>
                    <th style={tableHeaderStyle}>Dhiig</th>
                    <th style={tableHeaderStyle}>Ficil</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td style={tableCellStyle}>{index + 1}</td>
                      <td style={tableCellStyle}>
                        <img 
                          src={`http://localhost:5000/${item.profile_pic}`} 
                          alt="profile" 
                          style={{ width: '34px', height: '34px', borderRadius: borderRadius.sm, objectFit: 'cover', border: `1px solid ${colors.border}` }}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                        />
                      </td>
                      <td style={{ ...tableCellStyle, fontWeight: '600' }}>{item.sarkaal_id}</td>
                      <td style={tableCellStyle}>{item.name}</td>
                      <td style={tableCellStyle}>{item.culays} kg</td>
                      <td style={tableCellStyle}>
                        <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: colors.error, border: '1px solid #fecdd3' }}>
                          {item.dhiiga}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => { setViewedSarkaal(item); setActivePage('view'); }}
                          style={{ ...buttonSecondaryStyle, padding: '5px 12px', fontSize: '12px' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VIEW SINGLE SARKAL TAB ── */}
        {activePage === 'view' && viewedSarkaal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(() => {
              const totalRestDays = medicalReports
                .filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id && r.limitation === 'Yattak Istirihat')
                .reduce((sum, report) => sum + Number(report.days || 0), 0);

              return (
                <>
                  <button
                    onClick={() => setActivePage('askar')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: colors.primary,
                      fontWeight: '700',
                      fontSize: '14px',
                      padding: 0,
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Ka Noqo (Ku noqo Liiska)</span>
                  </button>
                  
                  <div style={{
                    ...cardStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    padding: '24px',
                  }}>
                    <img 
                      src={`http://localhost:5000/${viewedSarkaal.profile_pic}`} 
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: borderRadius.lg,
                        objectFit: 'cover',
                        border: `2px solid ${colors.border}`,
                      }} 
                      alt="profile" 
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                    />
                    <div>
                      <h2 style={{ margin: 0, color: colors.text, fontSize: '20px', fontWeight: '800' }}>{viewedSarkaal.name}</h2>
                      <p style={{ margin: '4px 0 10px', color: colors.textMuted, fontSize: '13px' }}>
                        Sarkaal ID: <strong>{viewedSarkaal.sarkaal_id}</strong>
                      </p>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ ...badgeStyle, backgroundColor: colors.primaryLight, color: colors.primary, border: `1px solid ${colors.primaryBorder}` }}>
                          Visits: {medicalReports.filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id).length}
                        </span>
                        <span style={{
                          ...badgeStyle,
                          backgroundColor: totalRestDays >= 40 ? '#fef2f2' : '#f8fafc',
                          color: totalRestDays >= 40 ? colors.error : colors.textSecondary,
                          border: `1px solid ${totalRestDays >= 40 ? '#fecdd3' : colors.border}`,
                          fontWeight: '700',
                        }}>
                          Total Rest: {totalRestDays} Maalmood {totalRestDays >= 40 && "⚠️"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>Taariikhda Baaritaannada</h3>
                    </div>
                    <table style={tableStyle}>
                      <thead>
                        <tr style={tableHeaderStyle}>
                          <th style={tableHeaderStyle}>Taariikh</th>
                          <th style={tableHeaderStyle}>Diagnosis</th>
                          <th style={tableHeaderStyle}>Limitation</th>
                          <th style={tableHeaderStyle}>Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicalReports.filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id).map((r, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                            <td style={tableCellStyle}>{new Date(r.created_at).toLocaleDateString()}</td>
                            <td style={{ ...tableCellStyle, color: colors.error, fontWeight: '600' }}>{r.diagnosis}</td>
                            <td style={tableCellStyle}>{r.limitation}</td>
                            <td style={tableCellStyle}>{r.days} Maalmood</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activePage === 'settings' && (
          <div className="h1-page">
            <div className="h1-page-title">
              <div>
                <h1>Habaynta Akoonka (H1)</h1>
                <p>Maamul faahfaahinta akoonkaaga iyo amniga.</p>
              </div>
            </div>
            <div className="h1-settings-grid">
              <div className="h1-panel h1-profile-card">
                <img 
                  className="h1-profile-image" 
                  src={previewUrl || (loggedInUser.pic ? `http://localhost:5000/uploads/${loggedInUser.pic}` : '/assets/profiles/default.svg')} 
                  alt="H1 profile" 
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                />
                <strong>{settingsUsername || 'H1 User'}</strong>
                <label className="h1-secondary-button">
                  <Camera size={16} /> Bedel Sawirka
                  <input type="file" hidden accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) { setNewProfilePic(file); setPreviewUrl(URL.createObjectURL(file)); } }} />
                </label>
              </div>

              <div className="h1-panel">
                <div className="h1-panel__heading">
                  <h3>Xogta Guud</h3>
                  <User size={18} color={colors.primary} />
                </div>
                <div className="h1-form">
                  <label htmlFor="h1-username">Username</label>
                  <input id="h1-username" value={settingsUsername} onChange={event => setSettingsUsername(event.target.value)} />
                  <button className="h1-primary-button" onClick={saveProfileSettings} disabled={settingsSaving}>
                    <Save size={16} />{settingsSaving ? 'Keydinaya...' : 'Keydi Isbedelka'}
                  </button>
                </div>

                <div className="h1-panel__heading" style={{ marginTop: 30 }}>
                  <h3>Password-ka & Amniga</h3>
                  <Shield size={18} color={colors.primary} />
                </div>
                <div className="h1-form">
                  <input type="password" placeholder="Password-ka hadda" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} />
                  <input type="password" placeholder="Password-ka cusub" value={newPassword} onChange={event => setNewPassword(event.target.value)} />
                  <button className="h1-secondary-button" onClick={savePasswordSettings}>
                    <Lock size={16} /> Cusboonaysii Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={activeUser} />
    </div>
  );
}

export default Horinta1;
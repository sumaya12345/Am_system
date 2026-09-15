import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FariimahaModal from './FariimahaModal';
import { useAuthUser, getProfilePicUrl } from './authSync';
import HRoleOverview from './HRoleOverview';
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
  borderRadius 
} from './designSystem';
import { RotateCw, Printer, ArrowLeft, Users, CheckCircle, Clock } from 'lucide-react';

function Horinta4Dashboard({ user, onLogout }) {
  const authUser = useAuthUser(user);
  const activeUser = authUser || user || {};
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingQueue, setPendingQueue] = useState([]);
  const [activeRecords, setActiveRecords] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchData = async () => {
    try {
      const [qRes, rRes, pRes] = await Promise.all([
        axios.get('http://localhost:5000/api/ballan/queue?user_id=4'),
        axios.get('http://localhost:5000/api/medical-records?user_id=4'),
        axios.get('http://localhost:5000/api/s4-data')
      ]);

      setPendingQueue(qRes.data.filter(q => q.status === 'Pending'));
      setActiveRecords(rRes.data);
      setPersonnel(pRes.data);
    } catch (err) {
      console.error("Xogta Horinta 4aad lama soo xiriirin karno:", err);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = async (staff) => {
    setSelectedStaff(staff);
    try {
      const res = await axios.get(`http://localhost:5000/api/medical-records/${staff.id}`);
      setMedicalHistory(res.data);
      setActiveTab('history-view'); 
    } catch (err) {
      setMedicalHistory([]);
      setActiveTab('history-view');
    }
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      <Sidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeUser={activeUser}
        activePage={activeTab}
        setActivePage={setActiveTab}
        onLogout={handleLogout}
        showMsgModal={showMsgModal}
        setShowMsgModal={setShowMsgModal}
        role="H4"
      />

      {/* ── MAIN CONTENT ── */}
      <main style={{
        flex: 1,
        padding: '24px 32px',
        transition: 'all 0.25s ease',
        minHeight: '100vh',
        backgroundColor: colors.background,
        color: colors.text,
      }} className="main-content">
        
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${colors.border}`,
        }} className="no-print">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, color: colors.text, fontSize: '22px', fontWeight: '800' }}>
                Horinta 4aad
              </h1>
              <span style={{
                ...badgeStyle,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                border: `1px solid ${colors.primaryBorder}`,
                fontWeight: '700',
              }}>
                H4 Division Portal
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '13px' }}>
              Maamulka xogta caafimaadka iyo askarta Horinta 4aad.
            </p>
          </div>

          <button
            onClick={fetchData}
            style={buttonPrimaryStyle}
            title="Cusboonaysii Xogta"
          >
            <RotateCw size={15} />
            <span>Refresh Xogta</span>
          </button>
        </div>

        {/* HRoleOverview for reports and analytics */}
        {(activeTab === 'reports' || activeTab === 'analytics') && (
          <HRoleOverview
            view={activeTab}
            pendingQueue={pendingQueue}
            activeRecords={activeRecords}
            personnel={personnel}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Summary Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{
                ...cardStyle,
                padding: '16px 20px',
                borderTop: `3px solid ${colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Safka Sugitaanka MO
                  </span>
                  <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>
                    {pendingQueue.length}
                  </strong>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: borderRadius.md, backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
              </div>

              <div style={{
                ...cardStyle,
                padding: '16px 20px',
                borderTop: `3px solid ${colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Baaritaannada Diiwaangashan
                  </span>
                  <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>
                    {activeRecords.length}
                  </strong>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: borderRadius.md, backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} />
                </div>
              </div>

              <div style={{
                ...cardStyle,
                padding: '16px 20px',
                borderTop: `3px solid ${colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Wadarta Askarta H4
                  </span>
                  <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>
                    {personnel.length}
                  </strong>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: borderRadius.md, backgroundColor: colors.primaryLight, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
              </div>
            </div>

            {/* 1. Safka MO (Pending) */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
                  Safka Sugitaanka MO (Pending)
                </h3>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>
                  Wadarta: <strong>{pendingQueue.length}</strong>
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableHeaderStyle}>Sawir</th>
                      <th style={tableHeaderStyle}>Sarkaal ID</th>
                      <th style={tableHeaderStyle}>Magaca</th>
                      <th style={tableHeaderStyle}>Xaaladda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQueue.filter(item => item.status === 'Pending').map(item => (
                      <tr key={item.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
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
                        <td style={{ ...tableCellStyle, fontWeight: '600' }}>{item.sarkaal_id}</td>
                        <td style={tableCellStyle}>{item.name}</td>
                        <td style={tableCellStyle}>
                          <span style={{
                            ...badgeStyle,
                            backgroundColor: colors.warningBg,
                            color: colors.warning,
                            border: `1px solid ${colors.warningBorder}`,
                          }}>
                            Pending MO
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

            {/* 2. Warbixinnada Baaritaanka (Active Records) */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
                  Diiwaanka Baaritaanka ee Firfircoon
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableHeaderStyle}>Sawir</th>
                      <th style={tableHeaderStyle}>ID</th>
                      <th style={tableHeaderStyle}>Magaca</th>
                      <th style={tableHeaderStyle}>Nooca Xaddidaadda</th>
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
                      const maalmahaIskuDhafan = parseInt(report.days);
                      const dhamaadka = new Date(taariikhdaLaQoray);
                      dhamaadka.setDate(dhamaadka.getDate() + maalmahaIskuDhafan);
                      const farqigaTime = dhamaadka - maanta;
                      const maalmahaHadhay = Math.ceil(farqigaTime / (1000 * 60 * 60 * 24));
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
                              Completed
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

        {/* ── XOGTA GUUD (PERSONNEL) TAB ── */}
        {(activeTab === 'personnel' || activeTab === 'askar') && (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: colors.text, fontSize: '16px', fontWeight: '700' }}>
                Xogta Guud ee Askarta Horinta 4aad
              </h2>
              <span style={{ fontSize: '12px', color: colors.textMuted }}>
                Wadarta: <strong>{personnel.length}</strong>
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={tableHeaderStyle}>Sawir</th>
                    <th style={tableHeaderStyle}>Sarkaal ID</th>
                    <th style={tableHeaderStyle}>Magaca</th>
                    <th style={tableHeaderStyle}>Culayska</th>
                    <th style={tableHeaderStyle}>Dhiigga</th>
                    <th style={tableHeaderStyle}>Dhirirka</th>
                    <th style={tableHeaderStyle}>Goobta Dhalashada</th>
                    <th style={tableHeaderStyle}>Taariikhda Dhalashada</th>
                    <th style={tableHeaderStyle}>Ficil</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td style={tableCellStyle}>
                        <img 
                          src={`http://localhost:5000/${p.profile_pic}`} 
                          width="34" 
                          height="34" 
                          style={{ borderRadius: borderRadius.sm, objectFit: 'cover', border: `1px solid ${colors.border}` }} 
                          alt=""
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                        />
                      </td>
                      <td style={{ ...tableCellStyle, fontWeight: '600' }}>{p.sarkaal_id}</td>
                      <td style={tableCellStyle}>{p.name}</td>
                      <td style={tableCellStyle}>{p.culays} kg</td>
                      <td style={tableCellStyle}>
                        <span style={{ ...badgeStyle, backgroundColor: '#fef2f2', color: colors.error, border: '1px solid #fecdd3' }}>
                          {p.dhiiga}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{p.dhirirka} cm</td>
                      <td style={tableCellStyle}>{p.goobta_dhalashada}</td>
                      <td style={tableCellStyle}>{new Date(p.tariikhda_dhalashada).toLocaleDateString()}</td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => handleViewDetails(p)}
                          style={{
                            ...buttonSecondaryStyle,
                            padding: '6px 12px',
                            fontSize: '12px',
                          }}
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MEDICAL HISTORY VIEW ── */}
        {activeTab === 'history-view' && selectedStaff && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button
              onClick={() => setActiveTab('personnel')}
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
                src={`http://localhost:5000/${selectedStaff.profile_pic}`} 
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: borderRadius.lg,
                  objectFit: 'cover',
                  border: `2px solid ${colors.border}`,
                }} 
                alt=""
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
              />
              <div>
                <h2 style={{ margin: 0, color: colors.text, fontSize: '20px', fontWeight: '800' }}>
                  {selectedStaff.name}
                </h2>
                <p style={{ margin: '4px 0 10px', color: colors.textMuted, fontSize: '13px' }}>
                  Sarkaal ID: <strong>{selectedStaff.sarkaal_id}</strong>
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ ...badgeStyle, backgroundColor: colors.primaryLight, color: colors.primary, border: `1px solid ${colors.primaryBorder}` }}>
                    Dhiigga: {selectedStaff.dhiiga}
                  </span>
                  <span style={{ ...badgeStyle, backgroundColor: '#f1f5f9', color: colors.textSecondary, border: `1px solid ${colors.border}` }}>
                    Diiwaannada: {medicalHistory.length}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
                  Taariikhda Baaritaannada Caafimaad
                </h3>
                <button
                  onClick={handlePrint}
                  style={buttonPrimaryStyle}
                  className="no-print"
                >
                  <Printer size={15} />
                  <span>Daabac Warbixinta</span>
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableHeaderStyle}>Taariikh</th>
                      <th style={tableHeaderStyle}>Baaritaanka (Diagnosis)</th>
                      <th style={tableHeaderStyle}>Xaddidaadda</th>
                      <th style={tableHeaderStyle}>Maalmood</th>
                      <th style={tableHeaderStyle}>Referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistory.map((h, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={tableCellStyle}>{new Date(h.created_at).toLocaleDateString()}</td>
                        <td style={{ ...tableCellStyle, fontWeight: '600' }}>{h.diagnosis}</td>
                        <td style={tableCellStyle}>{h.limitations || 'None'}</td>
                        <td style={tableCellStyle}>
                          <span style={{ ...badgeStyle, backgroundColor: colors.primaryLight, color: colors.primary, border: `1px solid ${colors.primaryBorder}` }}>
                            {h.days} Maalmood
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            ...badgeStyle,
                            backgroundColor: h.referrals === 'Yes' ? colors.primaryLight : '#f1f5f9',
                            color: h.referrals === 'Yes' ? colors.primary : colors.textMuted,
                            border: `1px solid ${h.referrals === 'Yes' ? colors.primaryBorder : colors.border}`,
                          }}>
                            {h.referrals === 'Yes' ? 'Referral: Haa' : 'Maya'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={activeUser} />
    </div>
  );
}

export default Horinta4Dashboard;
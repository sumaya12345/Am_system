import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FariimahaModal from './FariimahaModal';
import { useAuthUser, getProfilePicUrl } from './authSync';
import HRoleOverview from './HRoleOverview';

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

  // --- STATE-KA EXPAND/COLLAPSE ---
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

  // --- DYNAMIC STYLES (Sidebar Control) ---
  const dynamicSidebarStyle = {
    width: isExpanded ? '250px' : '70px',
    background: '#1e3a8a',
    color: '#bfdbfe',
    position: 'fixed',
    height: '100vh',
    zIndex: 100,
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const dynamicMainContentStyle = {
    flex: 1,
    marginLeft: isExpanded ? '250px' : '70px',
    padding: '30px',
    transition: 'all 0.3s ease',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9'
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f9' }}>
      
      {/* SIDEBAR */}
      <aside className="no-print" style={dynamicSidebarStyle}>
        {/* Toggle Button (☰) */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)} 
          style={{ padding: '18px 20px', cursor: 'pointer', fontSize: '20px', textAlign: isExpanded ? 'right' : 'center', color: '#93c5fd' }}
        >
          {isExpanded ? '☰' : '☰'}
        </div>

        <div style={{ ...logoArea, padding: isExpanded ? '20px 15px' : '10px' }}>
          {isExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={getProfilePicUrl(activeUser.pic || activeUser.profile_pic)}
                alt="Profile" 
                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', objectFit: 'cover' }} 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
              />
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ color: '#ffffff', margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  {activeUser.username || "H4 Officer"}
                </h3>
                <p style={{ color: '#93c5fd', fontSize: '11px', margin: '2px 0 0 0', fontWeight: '600' }}>Role: {activeUser.role || 'H4'}</p>
              </div>
            </div>
          ) : (
            <h2 style={{ color: '#93c5fd', fontSize: '14px', fontWeight: '700' }}>H4</h2>
          )}
        </div>

        <nav style={{ marginTop: '20px' }}>
          <div onClick={() => setActiveTab('dashboard')} style={activeTab === 'dashboard' ? navActive : navItem}>
            <span style={{ fontSize: '20px' }}>📊</span> 
            {isExpanded && <span style={{ marginLeft: '15px' }}>Dashboard</span>}
          </div>
          <div onClick={() => setActiveTab('personnel')} style={activeTab === 'personnel' || activeTab === 'history-view' ? navActive : navItem}>
            <span style={{ fontSize: '20px' }}>👥</span> 
            {isExpanded && <span style={{ marginLeft: '15px' }}>Xogta Guud</span>}
          </div>
          <div onClick={() => setActiveTab('reports')} style={activeTab === 'reports' ? navActive : navItem}><span>📄</span>{isExpanded && <span style={{ marginLeft: '15px' }}>Reports</span>}</div>
          <div onClick={() => setActiveTab('analytics')} style={activeTab === 'analytics' ? navActive : navItem}><span>📊</span>{isExpanded && <span style={{ marginLeft: '15px' }}>Analytics</span>}</div>
          <div onClick={() => setShowMsgModal(true)} style={showMsgModal ? navActive : navItem}>
            <span style={{ fontSize: '20px' }}>💬</span> 
            {isExpanded && <span style={{ marginLeft: '15px' }}>Fariimaha</span>}
          </div>
        </nav>

        <button 
          style={{ 
            ...logoutBtn, 
            width: isExpanded ? '200px' : '45px', 
            left: isExpanded ? '25px' : '12px' 
          }} 
          onClick={handleLogout}
        >
          {isExpanded ? '🚪 Logout' : '🚪'}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={dynamicMainContentStyle} className="main-content">
        {(activeTab === 'reports' || activeTab === 'analytics') && <HRoleOverview view={activeTab} pendingQueue={pendingQueue} activeRecords={activeRecords} personnel={personnel} onViewDetails={handleViewDetails} />}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="no-print">
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: '22px', fontWeight: '700' }}>H4 Dashboard</h1>
            <button onClick={fetchData} style={refreshBtn}>🔄 Refresh H4 Data</button>
        </div>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* 1. Safka MO (Pending) */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: '#1e293b', marginTop: 0, fontWeight: '600' }}>Safka MO (Pending)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1d4ed8', color: 'white', textAlign: 'left' }}>
                      <th style={thStyle}>Pic</th><th style={thStyle}>ID</th><th style={thStyle}>Name</th><th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQueue.filter(item => item.status === 'Pending').map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tdStyle}><img src={`http://localhost:5000/${item.profile_pic}`} width="40" height="40" style={{ borderRadius: '50%' }} alt="profile" /></td>
                        <td style={tdStyle}>{item.sarkaal_id}</td>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={{ ...tdStyle, color: '#e67e22', fontWeight: 'bold' }}>Pending</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. Warbixinnada Baaritaanka (Active Records) */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginTop: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: '#1e293b', fontWeight: '600' }}>Warbixinnada Baaritaanka (Active Records)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1d4ed8', color: 'white' }}>
                      <th style={thStyle}>Pic</th><th style={thStyle}>ID</th><th style={thStyle}>Magaca</th><th style={thStyle}>Limitation Type</th><th style={thStyle}>Remaining</th><th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRecords.reduce((acc, current) => {
                      // SHAQADA 1: Iska hubi haddii qofku hore u jiray (Find duplicate)
                      const xogtaHore = acc.find(item => item.sarkaal_id === current.sarkaal_id);
                      
                      if (xogtaHore) {
                        // SHAQADA 2: Haddii uu jiro, maalmaha isku dar
                        xogtaHore.days = parseInt(xogtaHore.days) + parseInt(current.days);
                        return acc;
                      } else {
                        return [...acc, { ...current }];
                      }
                    }, []).map((report) => {
                      // Logic-ga Countdown-ka ee 24 saac
                      const maanta = new Date();
                      const taariikhdaLaQoray = new Date(report.created_at);
                      const maalmahaIskuDhafan = parseInt(report.days);

                      const dhamaadka = new Date(taariikhdaLaQoray);
                      dhamaadka.setDate(dhamaadka.getDate() + maalmahaIskuDhafan);

                      const farqigaTime = dhamaadka - maanta;
                      const maalmahaHadhay = Math.ceil(farqigaTime / (1000 * 60 * 60 * 24));

                      // Auto-delete haddii maalmuhu dhamaadaan
                      if (maalmahaHadhay <= 0) return null;

                      return (
                        <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={tdStyle}><img src={`http://localhost:5000/${report.profile_pic}`} width="40" height="40" style={{borderRadius: '50%'}} alt="profile" /></td>
                          <td style={tdStyle}>{report.sarkaal_id}</td>
                          <td style={tdStyle}>{report.name}</td>
                          <td style={tdStyle}><b>{report.limitation}</b></td>
                          <td style={tdStyle}>
                            <span style={{ 
                              color: maalmahaHadhay <= 1 ? 'red' : '#27ae60', 
                              fontWeight: 'bold' 
                            }}>
                              {maalmahaHadhay} Days
                            </span>
                          </td>
                          <td style={tdStyle}><span style={{ color: '#27ae60' }}>● Completed</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* --- XOGTA GUUD TAB --- */}
        {activeTab === 'personnel' && (
          <div style={cardStyle}>
            <h2 style={{ color: '#1a2a6c', marginBottom: '20px' }}>Xogta Guud ee Askarta Horinta 4aad</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead style={darkThead}>
                  <tr>
                    <th style={pad15}>Pic</th><th style={pad15}>ID</th><th style={pad15}>Name</th><th style={pad15}>Culays</th><th style={pad15}>Dhiiga</th><th style={pad15}>Dhirirka</th><th style={pad15}>Goobta Dhalashada</th><th style={pad15}>Taariikhda Dhalashada</th> <th style={pad15}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map(p => (
                    <tr key={p.id} style={trStyle}>
                      <td style={pad15}><img src={`http://localhost:5000/${p.profile_pic}`} width="40" height="40" style={{borderRadius:'5px'}} alt=""/></td>
                      <td style={pad15}>{p.sarkaal_id}</td>
                      <td style={pad15}>{p.name}</td>
                      <td style={pad15}>{p.culays} kg</td>
                      <td style={{ ...pad15, color: 'red', fontWeight: 'bold' }}>{p.dhiiga}</td>
                      <td style={pad15}>{p.dhirirka} cm</td>
                      <td style={pad15}>{p.goobta_dhalashada}</td>
                      <td style={pad15}>{new Date(p.tariikhda_dhalashada).toLocaleDateString()}</td>
                      <td style={pad15}><button onClick={() => handleViewDetails(p)} style={viewBtn}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- HISTORY VIEW --- */}
        {activeTab === 'history-view' && selectedStaff && (
          <div>
            <button onClick={() => setActiveTab('personnel')} style={{ marginBottom: '15px', border: 'none', background: 'none', cursor: 'pointer', color: '#1a2a6c', fontWeight: 'bold' }}>⬅ Ka Noqo</button>
            <div style={profileHeaderCard}>
              <img src={`http://localhost:5000/${selectedStaff.profile_pic}`} style={profileImageLg} alt=""/>
              <div style={{ marginLeft: '25px' }}>
                <h1 style={{ margin: 0, color: '#1a2a6c' }}>{selectedStaff.name}</h1>
                <p style={{ margin: '5px 0' }}>Sarkaal ID: <strong>{selectedStaff.sarkaal_id}</strong></p>
                <span style={visitBadge}>Visits Count: {medicalHistory.length}</span>
              </div>
            </div>

            <div style={{ ...cardStyle, marginTop: '20px' }}>
              <h3>Taariikhda Baaritaanada</h3>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={pad15}>Diagnosis</th><th style={pad15}>Limitation</th><th style={pad15}>Days</th><th style={pad15}>Date</th> <th style={pad15}>Referrals</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalHistory.map((h, i) => (
                    <tr key={i} style={trStyle}>
                      <td style={{ ...pad15, color: '#e74c3c', fontWeight: 'bold' }}>{h.diagnosis}</td>
                      <td style={pad15}>{h.limitations || 'N/A'}</td>
                      <td style={pad15}><span style={daysLabel}>{h.days} Days</span></td>
                      <td style={pad15}>{new Date(h.created_at).toLocaleDateString()}</td>
                     <td style={pad15}>
  {h.referrals === 'Yes' ? (
    <span style={{ 
      color: '#5bc0de', 
      fontWeight: 'bold', 
      
      padding: '4px 10px', 
      borderRadius: '12px',
      fontSize: '14px' 
    }}>
      Yes
    </span>
  ) : (
    <span style={{ 
      color: '#5cb85c', 
      fontWeight: 'bold', 
   
      padding: '4px 10px', 
      borderRadius: '12px',
      fontSize: '14px' 
    }}>
      No
    </span>
  )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handlePrint} style={{ ...printBtn, marginTop: '25px' }} className="no-print">🖨️ Daabac Warbixinta</button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @media print { 
          .no-print { display: none !important; } 
          .main-content { margin-left: 0 !important; width: 100% !important; padding: 0 !important; } 
        }
      `}</style>
      {/* Standardized Fariimaha Modal */}
      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={activeUser} />
    </div>
  );
}

// --- STYLES ---
const logoArea = { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' };
const navItem = { padding: '10px 14px', margin: '2px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#bfdbfe', borderRadius: '8px', transition: '0.2s', fontSize: '14px', fontWeight: '500' };
const navActive = { ...navItem, backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600' };
const cardStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const darkThead = { backgroundColor: '#1d4ed8', color: 'white' };
const thRow = { textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const pad15 = { padding: '12px 16px' };
const viewBtn = { backgroundColor: '#1d4ed8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const refreshBtn = { backgroundColor: '#1d4ed8', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const profileHeaderCard = { backgroundColor: 'white', padding: '25px 30px', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' };
const profileImageLg = { width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '3px solid #dbeafe' };
const visitBadge = { backgroundColor: '#dbeafe', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', color: '#1d4ed8', fontWeight: '600', marginTop: '10px', display: 'inline-block' };
const daysLabel = { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '13px' };
const printBtn = { backgroundColor: '#1d4ed8', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const logoutBtn = { padding: '10px 14px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', transition: '0.2s', width: 'calc(100% - 16px)' };
const thStyle = { padding: '12px 16px', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#1e293b' };
export default Horinta4Dashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Settings, Bell } from 'lucide-react';
import FariimahaModal from './FariimahaModal';
import { SettingsPage } from './S1Dashboard';
import ProfileImage from './ProfileImage';
import { useAuthUser, getProfilePicUrl } from './authSync';
import Sidebar from './components/Sidebar';
import { colors, cardStyle, tableStyle, tableHeaderStyle, tableCellStyle, buttonPrimaryStyle, buttonSecondaryStyle, buttonDangerStyle, inputStyle, labelStyle, emptyStateStyle } from './designSystem';

function S3Dashboard({ user, onLogout }) {
  const authUser = useAuthUser(user);
  const activeUser = authUser || user || {};
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  // --- 1. STATES ---
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [editingSarkaal, setEditingSarkaal] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    sarkaal_id: '', name: '', culays: '', dhiiga: '', 
    dhirirka: '', goobta_dhalashada: '', tariikhda_dhalashada: ''
  });
  const [medicalReports, setMedicalReports] = useState([]);
  const [file, setFile] = useState(null);
  const [initiatedList, setInitiatedList] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewedSarkaal, setViewedSarkaal] = useState(null); 
const [darkMode, setDarkMode] = useState(() => localStorage.getItem(`amis_theme_${user?.id}`) === 'dark'); 
// 'false' waxay ka dhigan tahay inuu markii hore yahay Light Mode.
  // --- STATE-KA CUSUB: EXPAND/COLLAPSE ---
  const [isExpanded, setIsExpanded] = useState(true);

  // --- TOAST HELPER ---
  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- EXECUTE CANCEL ACTION ---
  const executeCancelAction = () => {
    if (!itemToCancel) return;
    const id = itemToCancel.id;
    axios.delete(`http://localhost:5000/api/ballan/${id}`)
      .then(() => {
        showToast('Sarkaalka waa laga saaray safka! ✅');
        fetchQueue();
        setShowCancelModal(false);
        setItemToCancel(null);
      })
      .catch(err => {
        showToast('Khalad ayaa dhacay: ' + err.message, 'error');
      });
  };

  // --- SIMPLE SVG ICONS (Naqshadda Sawirka) ---
  const Icons = {
    Dashboard: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
    ),
    Reports: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ),
    Users: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    ),
    Logout: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    ),
    Menu: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    )
  };

  const handleEditClick = (item) => {
    setEditingSarkaal({ ...item }); 
    setShowEditForm(true);   
  };
const handleUpdate = (e) => {
  e.preventDefault();
  const updateData = new FormData();

  // 1. Ku dar xogta qoraalka ah
  updateData.append('sarkaal_id', editingSarkaal.sarkaal_id);
  updateData.append('name', editingSarkaal.name);
  updateData.append('culays', editingSarkaal.culays);
  updateData.append('dhiiga', editingSarkaal.dhiiga);
  updateData.append('dhirirka', editingSarkaal.dhirirka);
  updateData.append('goobta_dhalashada', editingSarkaal.goobta_dhalashada);
  updateData.append('tariikhda_dhalashada', editingSarkaal.tariikhda_dhalashada);
  
  // 2. Ku dar sawirka (haddii uu yahay file dhab ah oo la soo doortay)
  if (editingSarkaal.profile_pic instanceof File) {
    updateData.append('profile_pic', editingSarkaal.profile_pic);
  } else if (editingSarkaal.new_profile_pic instanceof File) {
    updateData.append('profile_pic', editingSarkaal.new_profile_pic);
  }

  axios.put(`http://localhost:5000/api/s3-data/${editingSarkaal.id}`, updateData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  .then(res => {
    showToast("Si guul leh ayaa loo beddelay! ✅");
    fetchTable();           
    setShowEditForm(false); 
  })
  .catch(err => {
    console.error("Error:", err);
    showToast(`Edit failed (${err.response?.status || 'network'}): ${err.response?.data?.message || err.message}`);
  });
};

  // --- 2. DATA FETCHING ---
  const fetchTable = () => {
    axios.get('http://localhost:5000/api/s3-data').then(res => setData(res.data));
  };

  const fetchMedicalReports = () => {
    axios.get('http://localhost:5000/api/medical-records?user_id=3')
        .then(res => setMedicalReports(res.data))
        .catch(err => console.log("Error fetching reports:", err));
  };
  
  const fetchQueue = () => {
    axios.get('http://localhost:5000/api/ballan/queue?user_id=3').then(res => setInitiatedList(res.data));
  };

  
  useEffect(() => {
    fetchTable();
    fetchQueue();
    fetchMedicalReports();

    const interval = setInterval(() => {
      fetchTable();
      fetchQueue();
      fetchMedicalReports();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // --- 3. FUNCTIONS ---
  const toggleInitiate = (item) => {
    const queueData = {
      sarkaal_data_id: item.id
    };
    axios.post('http://localhost:5000/api/ballan', queueData).then(() => {
        fetchQueue();
        showToast(`Leyli sarkaal ${item.name} waa la diray (Pending)!`);
    }).catch((err) => showToast(`Initiate failed (${err.response?.status || 'network'}): ${err.response?.data?.message || err.message}`));
  };

  const validateForm = (data) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(data.name)) {
      alert("Khalad: Magaca waa inuu xarfo kaliya noqdaa!");
      return false;
    }
    if (isNaN(data.sarkaal_id)) {
      alert("Khalad: Sarkaal ID waa inuu nambar noqdaa!");
      return false;
    }
    if (Number(data.culays) <= 0 || Number(data.dhirirka) <= 0) {
      alert("Khalad: Culayska iyo Dhirirka waa inay ka weyn yihiin 0!");
      return false;
    }
    return true;
  };


 const handleSubmit = (e) => {
    e.preventDefault();
    const sendData = new FormData();
    if (file) sendData.append('profile_pic', file);
    Object.keys(formData).forEach(key => sendData.append(key, formData[key]));
    
    axios.post('http://localhost:5000/api/s3-data', sendData).then(() => {
        fetchTable();
        showToast("Xogta S1 waa la keydiyey!");
        setFormData({ sarkaal_id: '', name: '', culays: '', dhiiga: '', dhirirka: '', goobta_dhalashada: '', tariikhda_dhalashada: '' });
        setFile(null);
    }).catch(err => alert("Error: " + err.message));
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const executeDelete = () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id; 
    axios.delete(`http://localhost:5000/api/s3-data/${id}`)
      .then(() => {
         alert("Waa la tirtiray! ✅");
         fetchTable();
         setShowDeleteModal(false);
         setItemToDelete(null);
      })
      .catch(err => {
         console.error("Ciladda tirtirista:", err);
         alert("Cilad ayaa dhacday: " + err.message);
      });
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sarkaal_id.toString().includes(searchTerm)
  );

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const loggedInUser = JSON.parse(localStorage.getItem('user')) || { 
    username: 'Guest', 
    profile_pic: 'default_profile.jpg' 
  };
  const [currentUser, setCurrentUser] = useState(loggedInUser);
  
  // Listen for localStorage changes to sync profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        role="S3"
      />
      
      {/* MAIN CONTENT */}
      <main style={{
        flexGrow: 1,
        padding: '24px',
        color: colors.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* DASHBOARD PAGE */}
        {activePage === 'dashboard' && (
          <>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: colors.text, fontSize: '28px', fontWeight: '700' }}>S3 Dashboard</h2>
              <p style={{ color: colors.textMuted }}>Maareynta iyo xareynta xogta sarkaalada.</p>
            </div>

            {showForm && (
              <div style={{ background: colors.backgroundAlt, padding: '30px', borderRadius: '16px', border: `1px solid ${colors.border}`, marginBottom: '30px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ gridColumn: '1/-1' }} />
                  <div style={inputGroup}><label style={labelStyle}>Sarkaal ID</label><input type="text" value={formData.sarkaal_id || ''} style={inputStyle} placeholder="Lambar..." onChange={e => setFormData({...formData, sarkaal_id: e.target.value})} /></div>
                  <div style={inputGroup}><label style={labelStyle}>Magaca Dhammaystiran</label><input type="text" value={formData.name || ''} style={inputStyle} placeholder="Magaca..." onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div style={inputGroup}><label style={labelStyle}>Culayska (kg)</label><input type="text" value={formData.culays || ''} style={inputStyle} placeholder="70" onChange={e => setFormData({...formData, culays: e.target.value})} /></div>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Nooca Dhiigga</label>
                    <select value={formData.dhiiga || ""} onChange={e => setFormData({...formData, dhiiga: e.target.value})} style={inputStyle}>
                      <option value="" disabled>Dooro...</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div style={inputGroup}><label style={labelStyle}>Dhirirka (cm)</label><input type="text" value={formData.dhirirka || ''} style={inputStyle} placeholder="175" onChange={e => setFormData({...formData, dhirirka: e.target.value})} /></div>
                  <div style={inputGroup}><label style={labelStyle}>Goobta Dhalashada</label><input type="text" value={formData.goobta_dhalashada || ''} style={inputStyle} placeholder="Magaalada..." onChange={e => setFormData({...formData, goobta_dhalashada: e.target.value})} /></div>
                  <div style={inputGroup}><label style={labelStyle}>Taariikhda Dhalashada</label><input type="date" value={formData.tariikhda_dhalashada || ''} style={inputStyle} onChange={e => setFormData({...formData, tariikhda_dhalashada: e.target.value})} /></div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 1, background: colors.success, color: colors.white, border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Keydi Xogta</button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '12px 25px', background: colors.backgroundAlt, color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: '10px', cursor: 'pointer' }}>Xir Foomka</button>
                  </div>
                </form>
              </div>
            )}
            
            <div style={{ background: colors.backgroundAlt, padding: '30px', borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>Liiska Guud</h3>
                <input type="text" placeholder="Raadi magac ama ID..." onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 15px', width: '250px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none' }} />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: colors.backgroundAlt, textAlign: 'left', color: colors.textMuted, fontSize: '13px' }}>
                    <th style={thStyle}>Sawir</th><th style={thStyle}>Sarkaal ID</th><th style={thStyle}>Magaca</th><th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(item => {
                    const isSent = initiatedList.some(i => i.sarkaal_data_id === item.id);
                    return (
                      <tr key={item.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={tdStyle}><img src={`http://localhost:5000/${item.profile_pic}`} width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.primaryLight}` }} alt="profile" /></td>
                        <td style={tdStyle}>{item.sarkaal_id}</td>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => toggleInitiate(item)} disabled={isSent} style={{ background: isSent ? colors.backgroundAlt : colors.success, color: isSent ? colors.textMuted : colors.white, border: 'none', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{isSent ? 'Sent to MO' : 'Initiate'}</button>
                            {isSent && <button 
                            onClick={() => {
                              setItemToCancel(item);
                              setShowCancelModal(true);
                            }} 
                            style={{ 
                              padding: '6px 15px', 
                              background: '#fee2e2', 
                              color: colors.error, 
                              border: `1px solid ${colors.error}`,
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            Cancel
                          </button>}
                          <button onClick={() => handleEditClick(item)} style={{ padding: '6px 15px', background: colors.primaryLight, color: colors.primary, border: `1px solid ${colors.primary}`, borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            Edit
                          </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
         {activePage === 'reports' && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #edf2f0' }}>
              <h3 style={{ color: '#e67e22', marginTop: 0, fontSize: '18px' }}>1. Safka MO (Pending)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fcfdfc', textAlign: 'left', color: '#889891' }}>
                    <th style={thStyle}>Sawir</th><th style={thStyle}>ID</th><th style={thStyle}>Magaca</th><th style={thStyle}>Xaaladda</th>
                  </tr>
                </thead>
                        <tbody>
                          {initiatedList.filter(item => item.status === 'Pending').map(item => (
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
                    <div style={{ background: 'white', padding: '25px', borderRadius: '15px', marginTop: '30px' }}>
                      <h3 style={{ color: '#27ae60' }}>Warbixinnada Baaritaanka (Active Records)</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#1a2a6c', color: 'white' }}>
                            <th style={thStyle}>Pic</th><th style={thStyle}>ID</th><th style={thStyle}>Magaca</th><th style={thStyle}>Limitation Type</th><th style={thStyle}>Remaining</th><th style={thStyle}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicalReports.reduce((acc, current) => {
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

        {/* ASKAR PAGE */}
        {activePage === 'askar' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #edf2f0' }}>
            <h2 style={{ color: '#1a2e26', marginBottom: '25px' }}>Xogta Guud ee Askarta</h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fcfdfc', color: '#889891', textAlign: 'left' }}>
                    <th style={thStyle}>Pic</th><th style={thStyle}>ID</th><th style={thStyle}>Name</th><th style={thStyle}>Culays</th><th style={thStyle}>Dhiiga</th> <th style={thStyle}>Dhirirka </th> <th style={thStyle}>T_Dhalashada</th><th style={thStyle}>G_Dhlashada</th><th style={thStyle}>Action</th>
                  </tr> 
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f8faf9' }}>
                      <td style={tdStyle}><img src={`http://localhost:5000/${item.profile_pic}`} width="45" height="45" style={{ borderRadius: '8px' }} alt="profile" /></td>
                      <td style={tdStyle}>{item.sarkaal_id}</td>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>{item.culays} kg</td>
                      <td style={tdStyle}>{item.dhiiga}</td>
                      <td style={tdStyle}>{item.dhirirka}</td>
                      <td style={tdStyle}>{item.tariikhda_dhalashada ? new Date(item.tariikhda_dhalashada).toLocaleDateString() : 'N/A'}</td>
                      <td style={tdStyle}>{item.goobta_dhalashada}</td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setViewedSarkaal(item); setActivePage('view'); }} style={{ background: '#f0f7ff', color: '#007bff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>View</button>
                          <button onClick={() => handleEditClick(item)} style={{ background: '#fcfdfc', border: '1px solid #edf2f0', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>✏️</button>
                          <button onClick={() => handleDeleteClick(item)} style={{ background: '#fff1f0', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      
      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '350px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Ma hubtaa?</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Xogta {itemToDelete?.name} si joogto ah ayaa loo tirtirayaa.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button onClick={executeDelete} style={{ flex: 1, padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Haye, Tirtir</button>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '12px', background: '#f0f2f1', color: '#666', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Iska dhaaf</button>
            </div>
          </div>
        </div>
      )}
      {/* VIEW PAGE */}
               {activePage === 'view' && viewedSarkaal && (
                 <div style={{ padding: '20px' }}>
                   <button onClick={() => setActivePage('askar')} style={{ marginBottom: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬅ Back to List</button>
                   <div style={{ display: 'flex', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', alignItems: 'center', gap: '40px', marginBottom: '30px' }}>
                     <img src={`http://localhost:5000/${viewedSarkaal.profile_pic}`} style={{ width: '150px', height: '150px', borderRadius: '15px', objectFit: 'cover', border: '5px solid #1a2a6c' }} alt="profile" />
                     <div>
                       <h1 style={{ margin: '0 0 10px 0', color: '#1a2a6c', fontSize: '32px' }}>{viewedSarkaal.name}</h1>
                       <p style={{ margin: '5px 0', fontSize: '18px', color: '#555' }}>Sarkaal ID: <b style={{ color: '#1a2a6c' }}>{viewedSarkaal.sarkaal_id}</b></p>
                       <div style={{ marginTop: '15px', padding: '10px 20px', background: '#e8f4fd', borderRadius: '10px', display: 'inline-block' }}>
                         <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a2a6c' }}>Visits Count: {medicalReports.filter(r => r.sarkaal_data_id === viewedSarkaal.id).length} Jeer</span>
                       </div>
                     </div>
                   </div>
                  <div style={{ background: 'white', padding: '30px', borderRadius: '15px' }}>
                     <h3 style={{ color: '#1a2a6c', borderBottom: '3px solid #fdbb2d', paddingBottom: '10px', marginBottom: '20px' }}>Medical History</h3>
                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                       <thead>
                         <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #1a2a6c' }}>
                           <th style={thStyle}>Date</th> <th style={thStyle}>Diagnosis</th><th style={thStyle}>Limitation</th><th style={thStyle}>Days</th> <th style={thStyle}>Referral </th>
                         </tr>
                       </thead>
                       <tbody>
                         {medicalReports.filter(report => report.sarkaal_data_id === viewedSarkaal.id).map((report, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                             <td style={tdStyle}>{new Date(report.created_at).toLocaleDateString()}</td>
                             <td style={{ ...tdStyle, fontWeight: 'bold', color: '#d9534f' }}>{report.diagnosis}</td>
                             <td style={tdStyle}>{report.limitation}</td>
                             <td style={tdStyle}><span style={{ background: '#fcf8e3', padding: '4px 10px', borderRadius: '5px', color: '#8a6d3b' }}>{report.days} Maalmood</span></td>
                             <td style={pad15}>
                             {report.referrals === 'Yes' ? (
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
                         {medicalReports.filter(r => r.sarkaal_data_id === viewedSarkaal.id).length === 0 && (
                           <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Ma jiro baaritaan hore.</td></tr>
                        )}
                        
                      </tbody>
                     </table>
                   </div>
                 </div>
               )}
             {activePage === 'settings' && <SettingsPage user={activeUser} onThemeChange={setDarkMode} />}
             </main>
                     {/* Dhammaadka Main */}

                     {/* MODAL-KA TIRTIRISTA (Halkan dhig si uu meel walba uga shaqeeyo) */}
                     {showDeleteModal && (
                       <div style={{
                         position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                         backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
                         alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
                       }}>
                         <div style={{
                           background: 'white', padding: '30px', borderRadius: '15px',
                           width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                         }}>
                           <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
                          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Ma hubtaa?</h3>
                           <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>
                             Sarkaalka <b>{itemToDelete?.name}</b> xogtiisa si joogto ah ayaad u tirtiraysaa.
                           </p>
                           <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                             <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', background: '#eee', border: 'none' }}>Maya</button>
                             <button onClick={executeDelete} style={{ padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', background: '#e74c3c', color: 'white', fontWeight: 'bold', border: 'none' }}>Haye, Tirtir</button>
                           </div>
                         </div>
                       </div>
                     )}
                     {notification.show && (
                      <div style={{
                        position: 'fixed',
                        top: '300px',
                        right: '500px',
                        padding: '15px 25px',
                        backgroundColor: notification.type === 'success' ? '#2ecc71' : '#e74c3c',
                        color: '#000',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        animation: 'slideIn 0.5s ease-out'
                      }}>
                        {notification.type === 'success' ? '✅' : '❌'}
                        <span style={{ fontWeight: '500' }}>{notification.message}</span>
                      </div>
                    )}
                    {showEditForm && editingSarkaal && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(4px)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000,
                      padding: '20px'
                    }}>
                      <div style={{
                        background: 'white', padding: '35px', borderRadius: '24px',
                        width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                          <h3 style={{ margin: 0, color: '#1a2e26', fontSize: '20px', fontWeight: '700' }}>Wax ka beddelka Xogta Sarkaalka</h3>
                          <button 
                            type="button" 
                            onClick={() => setShowEditForm(false)} 
                            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#889891', lineHeight: 1 }}
                          >
                            ✕
                          </button>
                        </div>
                        <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                          {/* Profile Pic */}
                          <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Beddel Sawirka Profile-ka</span>
                            <input 
                              type="file" 
                              onChange={(e) => setEditingSarkaal({...editingSarkaal, profile_pic: e.target.files[0], new_profile_pic: e.target.files[0]})} 
                            />
                          </div>                 

                          {/* ID Number */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>ID Nambarka</span>
                            <input type="text" value={editingSarkaal.sarkaal_id || ''} onChange={e => setEditingSarkaal({...editingSarkaal, sarkaal_id: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9' }} />
                          </div>

                          {/* Magaca */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Magaca</span>
                            <input type="text" value={editingSarkaal.name || ''} onChange={e => setEditingSarkaal({...editingSarkaal, name: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9' }} />
                          </div>

                          {/* Culayska */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Culayska</span>
                            <input type="text" value={editingSarkaal.culays || ''} onChange={e => setEditingSarkaal({...editingSarkaal, culays: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9' }} />
                          </div>

                          {/* Dhiiga */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Nooca dhiiga</span>
                            <select value={editingSarkaal.dhiiga || ''} onChange={e => setEditingSarkaal({...editingSarkaal, dhiiga: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9' }}>
                              <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                              <option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                            </select>
                          </div>

                          {/* Dhirirka */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Dhirir</span>
                            <input type="text" value={editingSarkaal.dhirirka || ''} onChange={e => setEditingSarkaal({...editingSarkaal, dhirirka: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9' }} />
                          </div>

                          {/* Goobta Dhalashada */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Goobta Dhalashada</span>
                            <input type="text" value={editingSarkaal.goobta_dhalashada || ''} onChange={e => setEditingSarkaal({...editingSarkaal, goobta_dhalashada: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9' }} />
                          </div>

                          {/* Taariikhda */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Tariikhda Dhalashada</span>
                            <input type="date" value={editingSarkaal.tariikhda_dhalashada ? String(editingSarkaal.tariikhda_dhalashada).split('T')[0] : ''} onChange={e => setEditingSarkaal({...editingSarkaal, tariikhda_dhalashada: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9' }} />
                          </div>

                          {/* Badhamada Action-ka */}
                          <div style={{ gridColumn: '1/-1', display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button type="submit" style={{ padding: '12px 30px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>
                              Save
                            </button>
                            <button type="button" onClick={() => setShowEditForm(false)} style={{ padding: '12px 30px', background: '#f0f2f1', color: '#666', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                    {showCancelModal && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', zIndex: 11000, backdropFilter: 'blur(3px)'
                    }}>
                      <div style={{
                        background: 'white', padding: '35px', borderRadius: '24px',
                        width: '380px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                      }}>
                        <div style={{ 
                          background: '#fff9db', width: '70px', height: '70px', 
                          borderRadius: '50%', display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', margin: '0 auto 20px' 
                        }}>
                          <span style={{ fontSize: '35px' }}>⚠️</span>
                        </div>

                        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Ma hubtaa?</h3>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                          Ma rabtaa inaad ka saarto safka sarkaalka <strong>{itemToCancel?.name}</strong>?
                        </p>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                          <button 
                            onClick={executeCancelAction} 
                            style={{ flex: 1, padding: '14px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Haye, Ka saar
                          </button>
                          <button 
                            onClick={() => setShowCancelModal(false)} 
                            style={{ flex: 1, padding: '14px', background: '#f8faf9', color: '#666', border: '1px solid #edf2f0', borderRadius: '12px', cursor: 'pointer' }}
                          >
                            Iska dhaaf
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                
                  
      {/* Standardized Fariimaha Modal */}
      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={activeUser} darkMode={darkMode} />
    </div>
  );
}

// STYLES
const thStyle = { padding: '15px 20px', fontWeight: '600', fontSize: '13px' };
const tdStyle = { padding: '12px 20px', fontSize: '14px', color: '#1a2e26' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const pad15 = { padding: '15px' };

export default S3Dashboard;

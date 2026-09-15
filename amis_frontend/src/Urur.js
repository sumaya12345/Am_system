import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  MessageSquare,
  PieChart,
  BarChart,
  ChevronDown,
  ChevronUp,
  Bell
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import FariimahaModal from './FariimahaModal';
import { useAuthUser, updateAuthUser, getProfilePicUrl, getAuthConfig } from './authSync';
import Sidebar from './components/Sidebar';
import RoleCards from './components/RoleCards';
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

function UrurDashboard({ user, onLogout }) {
  const [viewMode, setViewMode] = useState('reports'); // 'reports', 'personnel', 'history', 'analytics', 'settings', 'messages'
  const [selectedHorinta, setSelectedHorinta] = useState(null); 
  
  const [allQueue, setAllQueue] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Messages state
  const [showMsgModal, setShowMsgModal] = useState(false);
  
  // Settings state
  const [activeTab, setActiveTab] = useState('profile');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const authUser = useAuthUser(user);
  const [activeUser, setActiveUser] = useState(authUser || user || null);
  const [modalMode, setModalMode] = useState('add');
  const [userData, setUserData] = useState({ username: '', pic: '' });
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Sync activeUser whenever authUser changes
  useEffect(() => {
    if (authUser) {
      setActiveUser(authUser);
      setNewUsername(authUser.username || "");
    }
  }, [authUser]);
  
  // Additional Settings states from S1
  const [isLoading, setIsLoading] = useState(false);
  const [userContacts, setUserContacts] = useState(activeUser?.contacts || []);
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [securitySubTab, setSecuritySubTab] = useState('menu');

  const userXogta = activeUser || {};
  const magacaDB = userXogta.username || "Magaca lama helin";
  const profilePic = userXogta.pic || userXogta.profile_pic;
  const sawirkaDB = getProfilePicUrl(profilePic);

  const fetchData = async () => {
    if (!selectedHorinta) return;
    
    try {
      const [qRes, rRes, pRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/ballan/queue?user_id=${selectedHorinta}`),
        axios.get(`http://localhost:5000/api/medical-records?user_id=${selectedHorinta}`),
        axios.get(`http://localhost:5000/api/s${selectedHorinta}-data`)
      ]);
      setAllQueue(qRes.data.filter(q => q.status === 'Pending'));
      setAllRecords(rRes.data);
      setPersonnel(pRes.data);
    } catch (err) {
      console.error("Xogta lama soo heli karo:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics');
      setAnalyticsData(response.data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const fetchUserData = async () => {
    if (user && user.id) {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${user.id}`);
        setUserData(response.data);
      } catch (err) {
        console.error("User data error:", err);
      }
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  useEffect(() => { fetchData(); }, [selectedHorinta]);
  useEffect(() => { fetchAnalytics(); fetchUserData(); }, []);
  
  // Settings functions

  const handleUpdatePassword = async () => {
    try {
      await axios.put(`http://localhost:5000/api/user/${user.id}/password`, { 
        currentPassword, 
        newPassword 
      });
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error("Password update error:", err);
      alert('Failed to update password. Check your current password.');
    }
  };

  const handleViewDetails = async (staff) => {
    setSelectedStaff(staff);
    try {
      const res = await axios.get(`http://localhost:5000/api/medical-records/${staff.sarkaal_id}`);
      setMedicalHistory(res.data);
      setViewMode('history');
    } catch (err) {
      setMedicalHistory([]);
      setViewMode('history');
    }
  };

  const handlePrint = () => window.print();

  // Settings functions from S1
  const fetchUserContacts = (userId) => {
    axios.get(`http://localhost:5000/api/get-contacts/${userId}`)
        .then(res => { 
          if(res.data.success) {
            setUserContacts(res.data.contacts);
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            currentUser.contacts = res.data.contacts;
            localStorage.setItem('user', JSON.stringify(currentUser));
          } 
        }).catch(err => console.error("Error fetching contacts:", err));
  };

  useEffect(() => {
    if (activeUser?.id) {
      fetchUserContacts(activeUser.id);
    }
  }, [activeUser?.id]);

  useEffect(() => {
    if (!newEmail.trim()) {
      setEmailError("");
      setIsEmailValid(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsCheckingEmail(true);
      setEmailError("");
      try {
        const res = await axios.post('http://localhost:5000/api/validate-and-save-email', {
          email: newEmail,
          userId: activeUser?.id,
          action: 'validate'
        });

        if (res.data.success) {
          setEmailError("Email verified successfully.");
          setIsEmailValid(true);
        }
      } catch (err) {
        setEmailError(err.response?.data?.message || "Please enter a real Gmail address that exists and is currently in use.");
        setIsEmailValid(false);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [newEmail, activeUser?.id]);

  const validateEmailRealtime = (email) => {
    setNewEmail(email);
    setIsEmailValid(false);
  };

  const handleSaveSettings = async () => {
    if (!activeUser?.id) return alert('Cilad: User ID lama helin.');
    setIsLoading(true);
    const formData = new FormData();
    formData.append('username', newUsername);
    formData.append('userId', activeUser.id);
    if (newProfilePic) formData.append('profile_pic', newProfilePic);

    try {
      const response = await axios.post('http://localhost:5000/api/update-profile', formData, getAuthConfig());
      if (response.data.success) {
        const updatedUser = updateAuthUser({ username: newUsername, pic: response.data.pic || activeUser.pic });
        setActiveUser(updatedUser);
        alert("Waa la cusboonaysiiyay");
      }
    } catch (err) {
      alert("Cillad ayaa dhacday");
    } finally { setIsLoading(false); }
  };

  const handleDeleteContact = async (type) => {
    if (!selectedContactId) return alert("Cilad: Xogta la tirtirayo lama aqoonsan!");
    if (!window.confirm(`Ma hubtaa inaad rabto inaad tirtirto ${type}-kaan?`)) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/delete-contact', {
        contactId: selectedContactId,
        userId: activeUser?.id
      });

      if (response.data.success) {
        type === 'email' ? setShowEmailModal(false) : setShowPhoneModal(false);
        setSelectedContactId(null);
        alert(`Si guul leh ayaa loo tirtiray!`);
        fetchUserContacts(activeUser.id);
      } else {
        alert(response.data.message || "Xogta lama tirtiri karo.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Cilad ayaa dhacday intii tirtirista lagu guda jiray.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async (type) => {
    if (type === 'email' && !isEmailValid) {
      alert("Please enter a real Gmail address that exists and is currently in use.");
      return;
    }

    if (!selectedContactId) return alert("Cilad: Fadlan dooro contact-ka aad rabto inaad wax ka beddesho!");
    const value = type === 'email' ? newEmail : newPhone;
    if (!value) return alert(`Fadlan buuxi meesha banaan!`);

    setIsLoading(true);
    try {
        const response = await axios.post('http://localhost:5000/api/update-contact', {
            contactId: selectedContactId, 
            value: value,
            type: type
        });

        if (response.data.success) {
            type === 'email' ? setShowEmailModal(false) : setShowPhoneModal(false);
            setSelectedContactId(null);
            setEmailError("");
            alert("Xogta si guul leh ayaa loo beddelay!");
            fetchUserContacts(activeUser.id);
        } else {
            alert(response.data.message || "Xogta lama kaydin karo.");
        }
    } catch (error) {
        alert("Cilad! Xogta lama kaydin karo.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddContact = async (type) => {
    if (type === 'email' && !isEmailValid) {
      alert("Please enter a real Gmail address that exists and is currently in use.");
      return;
    }

    const value = type === 'email' ? newEmail : newPhone;
    if (!value) return alert(`Fadlan buuxi meesha banaan ee ${type}-ka!`);

    setIsLoading(true);
    try {
        const response = await axios.post('http://localhost:5000/api/add-contact', {
            userId: activeUser?.id, 
            type: type,
            value: value
        });

        if (response.data.success) {
            type === 'email' ? setShowEmailModal(false) : setShowPhoneModal(false);
            setEmailError("");
            alert(`Si guul leh ayaa loo daray ${type}-ka cusub!`);
            fetchUserContacts(activeUser.id); 
        } else {
            alert(response.data.message || "Xogta lama dhalin karo.");
        }
    } catch (error) {
        alert("Cilad ayaa dhacday intii xogta la kaydinayay.");
    } finally {
        setIsLoading(false);
    }
  };

  const profilePicUrl = sawirkaDB;

  // S1 Styles
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', fontSize: '15px' };
  const tabButtonStyle = (tab) => ({
    padding: '12px 25px',
    cursor: 'pointer',
    border: 'none',
    background: activeTab === tab ? '#0f1f38' : 'transparent',
    color: activeTab === tab ? '#fff' : '#475569',
    borderRadius: '8px',
    fontWeight: '600',
    transition: '0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  // --- S1 STYLE FUNCTIONS ---
  const sidebarStyle = {
    width: isExpanded ? '260px' : '80px',
    height: '100vh',
    backgroundColor: '#1e3a8a',
    color: '#bfdbfe',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    borderRight: 'none',
    fontFamily: 'Inter, sans-serif'
  };

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    cursor: 'pointer',
    gap: '10px',
    color:           isActive ? '#ffffff'  : '#bfdbfe',
    backgroundColor: isActive ? '#2563eb' : 'transparent',
    borderRadius: '8px',
    margin: '2px 8px',
    fontWeight: isActive ? '600' : '500',
    fontSize: '14px',
    transition: 'all 0.15s ease'
  });

  const dynamicMainContentStyle = {
    flex: 1,
    padding: '24px',
    transition: 'all 0.3s ease',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      
      {/* --- UNIFIED SIDEBAR --- */}
      <Sidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeUser={activeUser}
        activePage={viewMode === 'personnel' || viewMode === 'history' ? 'askar' : viewMode}
        setActivePage={(page) => {
          if (page === 'askar') setViewMode('personnel');
          else setViewMode(page);
        }}
        onLogout={handleLogout}
        showMsgModal={showMsgModal}
        setShowMsgModal={setShowMsgModal}
        role="Urur"
      />

      {/* --- MAIN CONTENT --- */}
      <main style={{
        flex: 1,
        padding: '24px 32px',
        transition: 'all 0.25s ease',
        minHeight: '100vh',
        backgroundColor: colors.background,
        color: colors.text,
      }} className="main-content">
        
        {/* Horinta cards only for Reports and Xogta Askarta */}
        {(viewMode === 'reports' || viewMode === 'personnel') && viewMode !== 'history' && (
          <header style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border}` }} className="no-print">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ color: colors.text, fontSize: '22px', fontWeight: '800', margin: 0 }}>
                  {viewMode === 'reports' ? 'Warbixinnada Guud ee Ururka' : 'Maamulka Xogta Askarta'}
                </h1>
                <span style={{
                  ...badgeStyle,
                  backgroundColor: colors.primaryLight,
                  color: colors.primary,
                  border: `1px solid ${colors.primaryBorder}`,
                  fontWeight: '700',
                }}>
                  Taliska Ururka
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '13px' }}>
                Dooro Horinta aad doonayso inaad xogteeda kormeerto.
              </p>
            </div>

            <RoleCards
              roles={['1', '2', '3', '4']}
              selectedRole={selectedHorinta}
              onSelectRole={(h) => setSelectedHorinta(h)}
            />
          </header>
        )}

        {/* Page titles for other pages without Horinta cards */}
        {viewMode === 'analytics' && (
          <header style={{ marginBottom: '20px' }}>
            <h1 style={{ color: darkMode ? '#ffffff' : '#1a2a6c', fontSize: '28px', fontWeight: '700' }}>Analytics</h1>
          </header>
        )}

        {viewMode === 'messages' && (
          <header style={{ marginBottom: '20px' }}>
            <h1 style={{ color: darkMode ? '#ffffff' : '#1a2a6c', fontSize: '28px', fontWeight: '700' }}>Fariimaha</h1>
          </header>
        )}

        {viewMode === 'settings' && (
          <header style={{ marginBottom: '20px' }}>
            <h1 style={{ color: darkMode ? '#ffffff' : '#1a2a6c', fontSize: '28px', fontWeight: '700' }}>Settings</h1>
          </header>
        )}

        {/* --- VIEW 1: REPORTS --- */}
{viewMode === 'reports' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
    {!selectedHorinta ? (
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px', 
        color: darkMode ? '#b3b3b3' : '#999999',
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        borderRadius: '12px',
        border: darkMode ? '1px solid #333' : '1px solid #f0f0f0'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
        <h3 style={{ fontSize: '18px', marginBottom: '10px', color: darkMode ? '#ffffff' : '#333333' }}>Fadlan dooro Horinta</h3>
        <p style={{ color: darkMode ? '#b3b3b3' : '#666666' }}>Si aad u arko warbixinnada, dooro Horinta 1aad, 2aad, 3aad, ama 4aad</p>
      </div>
    ) : (
      <>
        {/* 1. Safka Sugitaanka - Dhammaan dadka safka ku jira */}
        <div style={{
          backgroundColor: darkMode ? '#252545' : '#ffffff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: darkMode ? '1px solid #333' : '1px solid #f0f0f0'
        }}>
          <h3 style={{ color: '#e67e22', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
            ⌛ Safka Sugitaanka (Horinta {selectedHorinta}aad)
          </h3>
          <TableData data={allQueue} type="pending" darkMode={darkMode} />
        </div>

        {/* 2. Baaritaanada la Dhamaystiray - Isku-darka maalmaha iyo Countdown-ka */}
        <div style={{
          backgroundColor: darkMode ? '#252545' : '#ffffff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: darkMode ? '1px solid #333' : '1px solid #f0f0f0'
        }}>
          <h3 style={{ color: '#27ae60', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
            ✅ Baaritaanada la Dhamaystiray (Horinta {selectedHorinta}aad)
          </h3>
          <TableData 
            data={allRecords
              // A. Isku-dar maalmaha haddii qofku dhowr jeer soo galay
              .reduce((acc, current) => {
                const xogtaHore = acc.find(item => item.sarkaal_id === current.sarkaal_id);
                if (xogtaHore) {
                  xogtaHore.days = parseInt(xogtaHore.days) + parseInt(current.days);
                  return acc;
                }
                return [...acc, { ...current }];
              }, [])
              // B. Xisaabi maalmaha dhimanaya (24 Hours Logic)
              .map(report => {
                const maanta = new Date();
                const bilow = new Date(report.created_at);
                const maalmahaWadarta = parseInt(report.days) || 0;

                const dhamaadka = new Date(bilow);
                dhamaadka.setDate(dhamaadka.getDate() + maalmahaWadarta);

                const farqigaTime = dhamaadka - maanta;
                const maalmahaHadhay = Math.ceil(farqigaTime / (1000 * 60 * 60 * 24));

                return { ...report, remainingDays: maalmahaHadhay };
              })
              // C. Kaliya soo daa dadka maalmuhu u hadheen
              .filter(report => {
                return isNaN(report.remainingDays) ? true : report.remainingDays > 0;
              })
            } 
            type="active" 
            darkMode={darkMode}
          />
        </div>
      </>
    )}
  </div>
)}

        {/* --- VIEW 2: PERSONNEL --- */}
        {viewMode === 'personnel' && (
          <div style={{
            backgroundColor: darkMode ? '#252545' : '#ffffff',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: darkMode ? '1px solid #333' : '1px solid #f0f0f0'
          }}>
            {!selectedHorinta ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 20px', 
                color: darkMode ? '#b3b3b3' : '#999999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
                <h3 style={{ fontSize: '18px', marginBottom: '10px', color: darkMode ? '#ffffff' : '#333333' }}>Fadlan dooro Horinta</h3>
                <p style={{ color: darkMode ? '#b3b3b3' : '#666666' }}>Si aad u arko xogta askarta, dooro Horinta 1aad, 2aad, 3aad, ama 4aad</p>
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: '20px', color: darkMode ? '#ffffff' : '#333333', fontSize: '18px', fontWeight: '600' }}>
                  Liiska Askarta Horinta {selectedHorinta}aad (READ-ONLY)
                </h3>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  backgroundColor: darkMode ? '#1a1a1a' : '#ffffff'
                }}>
                  <thead style={{ 
                    backgroundColor: darkMode ? '#252545' : '#f8f9fa', 
                    color: darkMode ? '#ffffff' : '#333333',
                    textAlign: 'left'
                  }}>
                    <tr>
                      <th style={{ padding: '12px 15px' }}>Profile</th>
                      <th style={{ padding: '12px 15px' }}>ID</th>
                      <th style={{ padding: '12px 15px' }}>Name</th>
                      <th style={{ padding: '12px 15px' }}>Culays</th>
                      <th style={{ padding: '12px 15px' }}>Dhiiga</th>
                      <th style={{ padding: '12px 15px' }}>Dhirirka</th>
                      <th style={{ padding: '12px 15px' }}>Goobta Dhalashada</th>
                      <th style={{ padding: '12px 15px' }}>Tariikhda Dhalashada</th>
                      <th style={{ padding: '12px 15px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnel.length > 0 ? personnel.map(p => (
                      <tr key={p.id} style={{ 
                        borderBottom: darkMode ? '1px solid #333' : '1px solid #eee',
                        color: darkMode ? '#ffffff' : '#333333'
                      }}>
                        <td style={{ padding: '12px 15px' }}>
                          <img 
                            src={`http://localhost:5000/${p.profile_pic}`} 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              objectFit: 'cover' 
                            }} 
                            alt=""
                          />
                        </td>
                        <td style={{ padding: '12px 15px' }}>{p.sarkaal_id}</td>
                        <td style={{ padding: '12px 15px' }}>{p.name}</td>
                        <td style={{ padding: '12px 15px' }}>{p.culays} kg</td>
                        <td style={{ padding: '12px 15px', color: '#e74c3c', fontWeight: 'bold' }}>{p.dhiiga}</td>
                        <td style={{ padding: '12px 15px' }}>{p.dhirirka}</td>
                        <td style={{ padding: '12px 15px' }}>{p.goobta_dhalashada}</td>
                        <td style={{ padding: '12px 15px' }}>{new Date(p.tariikhda_dhalashada).toLocaleDateString()}</td>
                        
                        <td style={{ padding: '12px 15px' }}>
                          <button 
                            onClick={() => handleViewDetails(p)} 
                            style={{ 
                              backgroundColor: '#3498db', 
                              color: 'white', 
                              border: 'none', 
                              padding: '7px 15px', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              fontWeight: '500'
                            }}
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#b3b3b3' : '#666666' }}>
                          Ma jiro wax askar ah Horintaan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* --- VIEW 3: MEDICAL HISTORY --- */}
        {viewMode === 'history' && selectedStaff && (
          <div>
            <button 
              className="no-print" 
              onClick={() => setViewMode('personnel')} 
              style={{ 
                marginBottom: '16px', 
                padding: '8px 16px', 
                border: 'none', 
                backgroundColor: '#0f1f38', 
                color: 'white', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ⬅ Ka Noqo
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: darkMode ? '#252545' : '#ffffff',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              marginBottom: '20px',
              border: darkMode ? '1px solid #333' : '1px solid #f0f0f0'
            }}>
              <img 
                src={`http://localhost:5000/${selectedStaff.profile_pic}`} 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '10px', 
                  objectFit: 'cover', 
                  border: '2px solid #0f1f38' 
                }} 
                alt=""
              />
              <div style={{ marginLeft: '25px' }}>
                <h1 style={{ margin: 0, color: darkMode ? '#ffffff' : '#1a2a6c', fontSize: '24px', fontWeight: '700' }}>
                  {selectedStaff.name}
                </h1>
                <p style={{ color: darkMode ? '#b3b3b3' : '#666666', margin: '5px 0' }}>
                  Sarkaal ID: <strong>{selectedStaff.sarkaal_id}</strong> | Horinta: <strong>{selectedHorinta}aad</strong>
                </p>
                <button 
                  onClick={handlePrint} 
                  style={{ 
                    marginTop: '10px', 
                    padding: '8px 20px', 
                    backgroundColor: '#27ae60', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: '500' 
                  }} 
                  className="no-print"
                >
                  🖨️ Daabac Taariikhda
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: darkMode ? '#252545' : '#ffffff',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              border: darkMode ? '1px solid #333' : '1px solid #f0f0f0'
            }}>
              <h3 style={{ color: darkMode ? '#ffffff' : '#333333', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Taariikhda Baaritaanada Caafimaadka
              </h3>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                backgroundColor: darkMode ? '#1a1a1a' : '#ffffff'
              }}>
                <thead style={{ 
                  backgroundColor: darkMode ? '#252545' : '#f8f9fa', 
                  color: darkMode ? '#ffffff' : '#333333',
                  textAlign: 'left'
                }}>
                  <tr>
                    <th style={{ padding: '12px 15px' }}>Taariikhda</th>
                    <th style={{ padding: '12px 15px' }}>Diagnosis</th>
                    <th style={{ padding: '12px 15px' }}>Limitations</th>
                    <th style={{ padding: '12px 15px' }}>Days</th>
                    <th style={{ padding: '12px 15px' }}>Referrals</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalHistory.length > 0 ? medicalHistory.map((h, i) => (
                    <tr key={i} style={{ 
                      borderBottom: darkMode ? '1px solid #333' : '1px solid #eee',
                      color: darkMode ? '#ffffff' : '#333333'
                    }}>
                      <td style={{ padding: '12px 15px' }}>{new Date(h.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{h.diagnosis}</td>
                      <td style={{ padding: '12px 15px' }}>{h.limitations || 'None'}</td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{ 
                          backgroundColor: darkMode ? '#1a2a6c' : '#e1f5fe', 
                          color: darkMode ? '#ffffff' : '#01579b', 
                          padding: '4px 10px', 
                          borderRadius: '5px', 
                          fontSize: '12px', 
                          fontWeight: 'bold' 
                        }}>
                          {h.days} Days
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px' }}>
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
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: darkMode ? '#b3b3b3' : '#666666' }}>
                        Ma jiro wax taariikh ah.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- VIEW 4: ANALYTICS --- */}
        {viewMode === 'analytics' && (
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '25px', color: darkMode ? '#fff' : '#2c3e50' }}>
              Analytics & Overview
            </h2>

            {/* --- STATS CARDS --- */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              {[
                { title: 'Total Personnel', value: analyticsData.totalPersonnel || 0, icon: <Users size={22}/>, color: '#0f1f38' },
                { title: 'In Queue', value: analyticsData.totalQueue || 0, icon: <LayoutDashboard size={22}/>, color: '#162a4a' },
                { title: 'Medical Reports', value: analyticsData.totalMedicalRecords || 0, icon: <FileText size={22}/>, color: '#1e3a66' },
                { title: 'Recent Reports', value: analyticsData.recentReports || 0, icon: <Bell size={22}/>, color: '#334155' }
              ].map((card, i) => (
                <div key={i} style={{
                  background: darkMode ? '#1e1e1e' : '#fff',
                  padding: '20px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  borderLeft: `5px solid ${card.color}`
                }}>
                  <div style={{ backgroundColor: `${card.color}22`, padding: '10px', borderRadius: '12px', color: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: '600' }}>{card.title}</p>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>{card.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* --- CHARTS SECTION --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              
              {/* Monthly Activity Chart */}
              <div style={{ background: darkMode ? '#1e1e1e' : '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: darkMode ? '#fff' : '#333' }}>Monthly Medical Activity</h4>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px', padding: '10px 0' }}>
                  {(analyticsData.monthlyActivity || []).map((item, i) => {
                    const maxValue = Math.max(...(analyticsData.monthlyActivity || []).map(d => d.value), 1);
                    const height = item.value > 0 ? (item.value / maxValue) * 100 : 5;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                          flex: 1, 
                          backgroundColor: '#0f1f38', 
                          height: `${height}%`, 
                          borderRadius: '4px 4px 0 0', 
                          opacity: 0.9,
                          width: '100%',
                          minHeight: '5px'
                        }}></div>
                        <span style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- RECENT ACTIVITY SECTION --- */}
              <div style={{ 
                background: darkMode ? '#1e1e1e' : '#fff', 
                padding: '25px', 
                borderRadius: '20px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: darkMode ? '#fff' : '#333' }}>Dhaqdhaqaaqii Ugu Dambeeyay</h4>
                  <button style={{ background: 'none', border: 'none', color: '#0f1f38', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Arag dhamaan
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(analyticsData.recentActivity || []).map((person, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      backgroundColor: darkMode ? '#252525' : '#fcfcfc',
                      border: darkMode ? '1px solid #333' : '1px solid #f0f0f0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '8px', 
                          backgroundColor: '#f1f5f9', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          color: '#0f1f38',
                          fontWeight: '700',
                          fontSize: '14px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: darkMode ? '#fff' : '#333' }}>{person.name}</h5>
                          <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>ID: {person.sarkaal_id}</p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          backgroundColor: '#27ae6022', 
                          color: '#27ae60',
                          fontWeight: '600'
                        }}>
                          Diiwaangashan
                        </span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#aaa' }}>
                          {new Date(person.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {!analyticsData.recentActivity || analyticsData.recentActivity.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>Wali wax dhaqdhaqaaq ah ma jiro.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 5: MESSAGES MODAL --- */}
        <FariimahaModal 
          isOpen={showMsgModal || viewMode === 'messages'} 
          onClose={() => {
            setShowMsgModal(false);
            if (viewMode === 'messages') setViewMode('reports');
          }}
          currentUser={activeUser}
          darkMode={darkMode}
        />

        {/* --- VIEW 6: SETTINGS (S1 STYLE) --- */}
        {viewMode === 'settings' && (
          <div style={{ padding: '30px' }}>
            <h1 style={{ color: darkMode ? '#ffffff' : '#1a2a6c', marginBottom: '10px' }}>Settings</h1>
            <p style={{ color: darkMode ? '#b3b3b3' : '#666', marginBottom: '30px' }}>Maareeyo macluumaadka akoonkaaga iyo amnigaaga.</p>

            {/* TABS MENU */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', backgroundColor: darkMode ? '#1a1a1a' : '#f0f2f5', padding: '10px', borderRadius: '12px', width: 'fit-content' }}>
              <button style={tabButtonStyle('profile')} onClick={() => setActiveTab('profile')}>Profile</button>
              <button style={tabButtonStyle('security')} onClick={() => setActiveTab('security')}>Security</button>
              <button style={tabButtonStyle('display')} onClick={() => setActiveTab('display')}>Appearance</button>
            </div>

            <div style={{ background: darkMode ? '#252545' : '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
              
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={previewUrl || profilePicUrl} style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0f1f38' }} alt="Profile" />
                    <label htmlFor="pic-upload" style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#0f1f38', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>📸</label>
                    <input id="pic-upload" type="file" hidden accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setNewProfilePic(file); setPreviewUrl(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#b3b3b3' : '#333' }}>Username</label>
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ ...inputStyle, backgroundColor: darkMode ? '#1a1a1a' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #333' : '1px solid #ddd' }} />
                    <button onClick={handleSaveSettings} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#0f1f38', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isLoading ? "Saving..." : "Save Changes"}</button>
                  </div>
                </div>
              )}

              {/* TAB 2: SECURITY */}
              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {securitySubTab === 'menu' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div onClick={() => setSecuritySubTab('contact')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: darkMode ? '#1a1a1a' : '#f8f9fa', borderRadius: '10px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>👤</span> <strong style={{ color: darkMode ? '#fff' : '#333' }}>Contact info</strong></div>
                        <span style={{ color: darkMode ? '#b3b3b3' : '#666' }}>›</span>
                      </div>
                      <div onClick={() => setSecuritySubTab('pass')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: darkMode ? '#1a1a1a' : '#f8f9fa', borderRadius: '10px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>🛡️</span> <strong style={{ color: darkMode ? '#fff' : '#333' }}>Password and security</strong></div>
                        <span style={{ color: darkMode ? '#b3b3b3' : '#666' }}>›</span>
                      </div>
                    </div>
                  )}

                  {securitySubTab === 'contact' && (
                    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <button onClick={() => setSecuritySubTab('menu')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '10px', color: darkMode ? '#fff' : '#333' }}>←</button>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: darkMode ? '#fff' : '#333' }}>Contact information</h3>
                      </div>
                      
                      <div style={{ background: darkMode ? '#1a1a1a' : '#fff', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden', border: darkMode ? '1px solid #333' : '1px solid #ddd', marginBottom: '20px' }}>
                        {/* EMAILS MAP */}
                        {userContacts && userContacts.filter(c => c.contact_type === 'email').map((email) => (
                          <div 
                            key={`email-${email.id}`} 
                            onClick={() => {
                              setModalMode('update'); 
                              setNewEmail(email.contact_value); 
                              setSelectedContactId(email.id); 
                              setIsEmailValid(true); 
                              setEmailError("");
                              setShowEmailModal(true);
                            }}
                            style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box', cursor: 'pointer', borderBottom: darkMode ? '1px solid #333' : '1px solid #f0f2f5' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span style={{ fontSize: '20px' }}>✉️</span>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '500', fontSize: '15px', wordBreak: 'break-word', color: darkMode ? '#fff' : '#333' }}>{email.contact_value}</div>
                                <div style={{ fontSize: '12px', color: darkMode ? '#b3b3b3' : '#65676b' }}>Email address</div>
                              </div>
                            </div>
                            <span style={{ color: darkMode ? '#b3b3b3' : '#bcc0c4', fontSize: '18px', paddingLeft: '10px' }}>›</span>
                          </div>
                        ))}

                        {/* PHONE MAP */}
                        {userContacts && userContacts.filter(c => c.contact_type === 'phone').map((phone) => (
                          <div 
                            key={`phone-${phone.id}`}
                            onClick={() => {
                              setModalMode('update'); 
                              setNewPhone(phone.contact_value); 
                              setSelectedContactId(phone.id); 
                              setShowPhoneModal(true);
                            }}
                            style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box', cursor: 'pointer', borderBottom: darkMode ? '1px solid #333' : '1px solid #f0f2f5' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span style={{ fontSize: '20px' }}>📱</span>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '500', fontSize: '15px', color: darkMode ? '#fff' : '#333' }}>{phone.contact_value}</div>
                                <div style={{ fontSize: '12px', color: darkMode ? '#b3b3b3' : '#65676b' }}>Mobile number</div>
                              </div>
                            </div>
                            <span style={{ color: darkMode ? '#b3b3b3' : '#bcc0c4', fontSize: '18px', paddingLeft: '10px' }}>›</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => { setModalMode('add'); setNewEmail(""); setIsEmailValid(false); setEmailError(""); setSelectedContactId(null); setShowEmailModal(true); }} style={{ padding: '14px', borderRadius: '10px', background: darkMode ? '#1a1a1a' : '#f0f2f5', border: darkMode ? '1px solid #333' : 'none', fontWeight: '600', cursor: 'pointer', color: darkMode ? '#fff' : '#333' }}>Add new email</button>
                        <button onClick={() => { setModalMode('add'); setNewPhone(""); setSelectedContactId(null); setShowPhoneModal(true); }} style={{ padding: '14px', borderRadius: '10px', background: darkMode ? '#1a1a1a' : '#f0f2f5', border: darkMode ? '1px solid #333' : 'none', fontWeight: '600', cursor: 'pointer', color: darkMode ? '#fff' : '#333' }}>Add new mobile number</button>
                      </div>

                      {/* EMAIL MODAL */}
                      {showEmailModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                          <div style={{ background: darkMode ? '#252545' : '#fff', padding: '25px', borderRadius: '15px', width: '350px' }}>
                            <h4 style={{ color: darkMode ? '#fff' : '#333' }}>{modalMode === 'add' ? "Add New Email" : "Update Email"}</h4>
                            <div style={{ textAlign: 'left' }}>
                              <input 
                                type="email" 
                                placeholder="Gali email-kaaga (Tusaale: ahmed@gmail.com)" 
                                style={{
                                  ...inputStyle,
                                  border: newEmail === "" ? '1px solid #ddd' : (isEmailValid ? '2px solid #28a745' : '2px solid #dc3545'),
                                  outline: 'none',
                                  transition: 'border 0.2s ease-in-out',
                                  backgroundColor: darkMode ? '#1a1a1a' : '#fff',
                                  color: darkMode ? '#fff' : '#333'
                                }} 
                                value={newEmail} 
                                onChange={(e) => validateEmailRealtime(e.target.value)} 
                              />
                              
                              {emailError && (
                                <div style={{ 
                                  color: isEmailValid ? '#28a745' : '#dc3545', 
                                  fontSize: '13px', 
                                  marginTop: '6px', 
                                  fontWeight: '500' 
                                }}>
                                  {isEmailValid ? '✅' : '⚠️'} {emailError}
                                </div>
                              )}

                              {isCheckingEmail && (
                                <div style={{ color: '#0f1f38', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>
                                  🔄 Checking email legitimacy...
                                </div>
                              )}

                              <button 
                                onClick={() => modalMode === 'add' ? handleAddContact('email') : handleUpdateContact('email')} 
                                style={{ 
                                  width: '100%', 
                                  marginTop: '20px', 
                                  padding: '12px', 
                                  background: isEmailValid ? '#1a2a6c' : '#ccc', 
                                  color: '#fff', 
                                  border: 'none', 
                                  borderRadius: '8px', 
                                  fontWeight: '600',
                                  cursor: isEmailValid ? 'pointer' : 'not-allowed' 
                                }}
                                disabled={isLoading || !isEmailValid || isCheckingEmail} 
                              >
                                {isLoading ? "Saving..." : (modalMode === 'add' ? "Save Email" : "Update Email")}
                              </button>

                              {modalMode === 'update' && (
                                <button 
                                  onClick={() => handleDeleteContact('email')}
                                  style={{ width: '100%', marginTop: '10px', padding: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Deleting..." : "Delete Email"}
                                </button>
                              )}
                              <button onClick={() => { setShowEmailModal(false); setSelectedContactId(null); setEmailError(""); }} style={{ width: '100%', marginTop: '10px', background: darkMode ? '#1a1a1a' : '#eee', border: 'none', padding: '8px', cursor: 'pointer', color: darkMode ? '#fff' : '#333' }}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PHONE MODAL */}
                      {showPhoneModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                          <div style={{ background: darkMode ? '#252545' : '#fff', padding: '25px', borderRadius: '15px', width: '350px' }}>
                            <h4 style={{ color: darkMode ? '#fff' : '#333' }}>{modalMode === 'add' ? "Add Phone Number" : "Update Phone Number"}</h4>
                            <input type="text" placeholder="+252..." style={{ ...inputStyle, backgroundColor: darkMode ? '#1a1a1a' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #333' : '1px solid #ddd' }} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                            <button 
                              onClick={() => modalMode === 'add' ? handleAddContact('phone') : handleUpdateContact('phone')} 
                              style={{ width: '100%', marginTop: '15px', padding: '12px', background: '#1a2a6c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                              disabled={isLoading}
                            >
                              {isLoading ? "Saving..." : (modalMode === 'add' ? "Save Phone" : "Update Phone")}
                            </button>
                            {modalMode === 'update' && (
                              <button onClick={() => handleDeleteContact('phone')} style={{ width: '100%', marginTop: '10px', padding: '12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }} disabled={isLoading}>
                                {isLoading ? "Deleting..." : "Delete Phone Number"}
                              </button>
                            )}
                            <button onClick={() => { setShowPhoneModal(false); setSelectedContactId(null); }} style={{ width: '100%', marginTop: '10px', background: darkMode ? '#1a1a1a' : '#eee', border: 'none', padding: '8px', cursor: 'pointer', color: darkMode ? '#fff' : '#333' }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {securitySubTab === 'pass' && (
                    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <button onClick={() => setSecuritySubTab('menu')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '10px', color: darkMode ? '#fff' : '#333' }}>←</button>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: darkMode ? '#fff' : '#333' }}>Password and security</h3>
                      </div>
                      <div style={{ padding: '20px', background: darkMode ? '#1a1a1a' : '#f8f9fa', borderRadius: '12px' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#b3b3b3' : '#333' }}>Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            style={{ ...inputStyle, backgroundColor: darkMode ? '#252545' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #333' : '1px solid #ddd' }}
                          />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: darkMode ? '#b3b3b3' : '#333' }}>New Password</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            style={{ ...inputStyle, backgroundColor: darkMode ? '#252545' : '#fff', color: darkMode ? '#fff' : '#333', border: darkMode ? '1px solid #333' : '1px solid #ddd' }}
                          />
                        </div>
                        <button 
                          onClick={handleUpdatePassword} 
                          style={{ 
                            padding: '12px 24px', 
                            background: '#27ae60', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: APPEARANCE */}
              {activeTab === 'display' && (
                <div style={{ padding: '20px' }}>
                  <h3 style={{ marginBottom: '20px', color: darkMode ? '#fff' : '#333', fontSize: '18px', fontWeight: '600' }}>Appearance</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: darkMode ? '#1a1a1a' : '#f8f9fa', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: darkMode ? '#fff' : '#333' }}>Dark Mode</div>
                      <div style={{ fontSize: '12px', color: darkMode ? '#b3b3b3' : '#666' }}>Toggle dark theme</div>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      style={{ 
                        padding: '8px 16px', 
                        background: '#0f1f38', 
                        color: darkMode ? 'white' : '#333', 
                        border: 'none', 
                        borderRadius: '20px', 
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {darkMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @media print { 
          .no-print { display: none !important; } 
          .main-content { margin-left: 0 !important; padding: 0 !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENT FOR REPORTS ---
const TableData = ({ data, type, darkMode }) => (
  <table style={tableStyle}>
    <thead>
      <tr style={tableHeaderStyle}>
        <th style={tableHeaderStyle}>ID</th>
        <th style={tableHeaderStyle}>Magaca</th>
        {type === 'pending' ? (
          <th style={tableHeaderStyle}>Xaaladda</th>
        ) : (
          <>
            <th style={tableHeaderStyle}>Baaritaanka</th>
            <th style={tableHeaderStyle}>Xaddidaadda</th>
            <th style={tableHeaderStyle}>Maalmaha</th>
          </>
        )}
      </tr>
    </thead>
    <tbody>
      {data.length > 0 ? data.map(d => (
        <tr key={d.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
          <td style={{ ...tableCellStyle, fontWeight: '600' }}>{d.sarkaal_id}</td>
          <td style={tableCellStyle}>{d.name}</td>
          {type === 'pending' ? (
            <td style={tableCellStyle}>
              <span style={{
                ...badgeStyle,
                backgroundColor: colors.warningBg,
                color: colors.warning,
                border: `1px solid ${colors.warningBorder}`,
              }}>
                Pending
              </span>
            </td>
          ) : (
            <>
              <td style={{ ...tableCellStyle, fontWeight: '600', color: colors.text }}>{d.diagnosis}</td>
              <td style={tableCellStyle}>{d.limitation || 'N/A'}</td>
              <td style={tableCellStyle}>
                <span style={{
                  ...badgeStyle,
                  backgroundColor: colors.primaryLight,
                  color: colors.primary,
                  border: `1px solid ${colors.primaryBorder}`,
                  fontWeight: '700',
                }}>
                  {d.days} Maalmood
                </span>
              </td>
            </>
          )}
        </tr>
      )) : (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: colors.textMuted, fontSize: '13px' }}>
            Xog lama hayo
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

export default UrurDashboard;
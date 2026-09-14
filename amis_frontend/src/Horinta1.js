import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './H1Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { 
  LayoutDashboard, Bell, FileText, Users, Settings, LogOut, 
  PieChart, MessageSquare, Moon, Menu, X, Send, Paperclip, Search, User,
  Check, CheckCheck, Camera, Save, Shield, Lock, Monitor, Activity, ArrowUpRight
} from 'lucide-react';
import FariimahaModal from './FariimahaModal';
import { useAuthUser, getProfilePicUrl } from './authSync';

// --- 1. MESSENGER COMPONENT ---
function MessengerH1({ isOpen, onClose, activeUser }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    axios.get('http://localhost:5000/api/users')
      .then(res => setContacts((res.data || []).map((contact, index) => ({
        ...contact,
        name: contact.role === 'Urur' ? 'Taliyaha Urur' : contact.username,
        color: ['#2ecc71', '#e74c3c', '#34495e', '#5d5fef'][index % 4]
      }))))
      .catch(err => console.error('H1 message users error:', err));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !activeUser?.id || !selectedUser?.id) return;
    const fetchConversation = () => axios.get(`http://localhost:5000/api/messages/chat/${activeUser.id}/${selectedUser.id}`)
      .then(res => setMessages(res.data || []))
      .catch(err => console.error('H1 conversation error:', err));
    fetchConversation();
    const interval = setInterval(fetchConversation, 3000);
    return () => clearInterval(interval);
  }, [isOpen, activeUser?.id, selectedUser?.id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setMessage('');
      setMessages([]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || !activeUser?.id || !selectedUser?.id) return;
    const formData = new FormData();
    formData.append('message', message.trim());
    formData.append('sender', String(activeUser.id));
    formData.append('receiver', String(selectedUser.id));
    try {
      await axios.post('http://localhost:5000/api/messages', formData);
      setMessage('');
      const res = await axios.get(`http://localhost:5000/api/messages/chat/${activeUser.id}/${selectedUser.id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('H1 message send error:', err);
      alert(err.response?.data?.error || 'Cilad ayaa dhacday markii fariinta la dirayey.');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', 
      alignItems: 'center', zIndex: 3000 
    }}>
      <div style={{ 
        width: '850px', height: '580px', backgroundColor: '#fff', 
        borderRadius: '15px', display: 'flex', overflow: 'hidden', 
        boxShadow: '0 15px 40px rgba(0,0,0,0.3)' 
      }}>
        
        {/* Sidebar */}
        <div style={{ width: '280px', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
          <div style={{ padding: '25px 20px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Fariimaha</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                onClick={() => setSelectedUser(contact)} 
                style={{
                  padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                  backgroundColor: selectedUser?.id === contact.id ? '#5d5fef' : 'transparent',
                  color: selectedUser?.id === contact.id ? 'white' : '#333',
                  transition: '0.2s'
                }}
              >
                <div style={{ 
                  width: '45px', height: '45px', borderRadius: '50%', 
                  backgroundColor: selectedUser?.id === contact.id ? 'rgba(255,255,255,0.2)' : contact.color, 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' 
                }}>
                  <User size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px' }}>{contact.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>{contact.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {selectedUser ? (
            <>
              <div style={{ padding: '18px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2ecc71' }}></div>
                   <span style={{ fontWeight: 'bold', fontSize: '17px' }}>{selectedUser.name}</span>
                </div>
                <X size={22} style={{ cursor: 'pointer', color: '#888' }} onClick={onClose} />
              </div>

              <div style={{ flex: 1, padding: '25px', backgroundColor: '#f0f2f5', overflowY: 'auto' }}>
                 {messages.map(msg => (
                   <div key={msg.id} style={{ textAlign: Number(msg.sender) === Number(activeUser?.id) ? 'right' : 'left', marginBottom: '8px' }}>
                     <span style={{ display: 'inline-block', padding: '8px 12px', borderRadius: '12px', background: Number(msg.sender) === Number(activeUser?.id) ? '#5d5fef' : '#fff', color: Number(msg.sender) === Number(activeUser?.id) ? '#fff' : '#333' }}>{msg.message}</span>
                   </div>
                 ))}
              </div>

              <div style={{ padding: '20px', backgroundColor: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Paperclip size={24} style={{ color: '#5d5fef', cursor: 'pointer' }} />
                <textarea 
                  style={{ 
                    flex: 1, border: '1px solid #e1e1e1', borderRadius: '10px', padding: '12px', 
                    height: '45px', outline: 'none', resize: 'none', fontSize: '14px', background: '#f8f9fa' 
                  }} 
                  placeholder="Qor fariin..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button 
                  onClick={handleSend}
                  style={{ 
                    background: '#5d5fef', color: '#fff', border: 'none', 
                    padding: '12px', borderRadius: '50%', cursor: 'pointer', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
               <MessageSquare size={60} strokeWidth={1} style={{ marginBottom: '15px', color: '#ddd' }} />
               <p style={{ fontSize: '18px' }}>Dooro qof aad la hadashid</p>
               <X size={24} style={{ position: 'absolute', right: '20px', top: '20px', cursor: 'pointer' }} onClick={onClose} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function Horinta1Dashboard({ user, onLogout }) {
  const authUser = useAuthUser(user);
  const activeUser = authUser || user || JSON.parse(localStorage.getItem('user')) || {};
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState([]);
  const [activePage, setActivePage] = useState('dashboard'); 
  const [showNotifyList, setShowNotifyList] = useState(false);
  const [viewedSarkaal, setViewedSarkaal] = useState(null);    
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [medicalReports, setMedicalReports] = useState([]);  
  const [editingSarkaal, setEditingSarkaal] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingQueue, setPendingQueue] = useState([]);
  const [activeRecords, setActiveRecords] = useState([]);
  const [personnel, setPersonnel] = useState([]);  
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [errors, setErrors] = useState({}); // Waxaan ku daray state-ka errors-ka
  const [isExpanded, setIsExpanded] = useState(true);
  const [initiatedList, setInitiatedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const authConfig = () => ({ headers: { 'X-Session-ID': sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId') || '' } });
  const loggedInUser = user || JSON.parse(localStorage.getItem('user')) || {};
  const [settingsUsername, setSettingsUsername] = useState(loggedInUser.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalPersonnel: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalReferred: 0,
    statusDistribution: [],
    monthlyActivity: []
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const textAreaStyle = {
  width: '100%',
  height: '120px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  padding: '12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  backgroundColor: '#fff',
  marginBottom: '10px'
};

const sendBtnStyle = {
  background: '#5d5fef',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: '0.2s'
};
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
  // --- FETCH DATA FROM API ---
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

  // --- HANDLERS ---
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in editingSarkaal) {
        formData.append(key, editingSarkaal[key]);
      }
      await axios.put(`http://localhost:5000/api/sarkaal-data/${editingSarkaal.id}`, formData);
      setShowEditForm(false);
      fetchData();
      alert("Xogta waa la cusubaysiiyey!");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

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
  // --- DYNAMIC STYLES ---
  const dynamicSidebarStyle = {
    width: isExpanded ? '200px' : '80px',
    background: '#eafaf1',
    color: '#333',
    padding: '20px 0',
    position: 'fixed',
    height: '100vh',
    transition: 'all 0.3s ease',
    zIndex: 100,
    borderRight: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column'
  };

  const fetchMedicalReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medical-records');
      setMedicalReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Khalad caafimaadka:", error);
    }
  };

  // 4. useEffect: Auto-refresh 3-dii ilbiriqsi kasta
  useEffect(() => {
    // Isla markii bogga la furo wac
    fetchTable();
    fetchMedicalReports();
    setLoading(false);

    // Samee Interval 3 seconds ah
    const interval = setInterval(() => {
      fetchTable();
      fetchMedicalReports();
    }, 3000);

    // Nadiifi interval-ka markii bogga laga baxo
    return () => clearInterval(interval);
  }, []);
    // Function-ka soo kaxaynaya xogta askarta
const fetchTable = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/sarkaal-data');
    setData(Array.isArray(response.data) ? response.data : []); 
  } catch (error) {
    console.error("Khalad ayaa dhacay markii xogta la soo kaxaynayay:", error);
  }
};

// Function-ka soo kaxaynaya warbixinada caafimaadka

  const dynamicMainContentStyle = {
    flex: 1,
    marginLeft: isExpanded ? '260px' : '80px',
    padding: '24px',
    transition: 'all 0.3s ease',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9'
  };
  const flaggedAskar = data.filter(sarkaal => {
  const totalDays = medicalReports
    .filter(r => r.sarkaal_id === sarkaal.sarkaal_id && r.limitation === 'Yattak Istirihat')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);
  return totalDays >= 45;
});
  const colors = {
  bg: darkMode ? '#121212' : '#f8faf9',      // Midabka dhabarka (Background)
  sidebar: darkMode ? '#1e1e1e' : '#ffffff', // Midabka dhinac-ka
  text: darkMode ? '#ffffff' : '#333333',    // Midabka qoraalka
  border: darkMode ? '#333333' : '#edf2f0'   // Midabka xariiqyada
};
const hasNotifications = flaggedAskar.length > 0;
const h1Reports = medicalReports;
const statusColors = ['#5d5fef', '#27ae60', '#f1c40f', '#e76f51', '#8b98a8'];
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
    transition: '0.15s'
  });
  const [showMsgModal, setShowMsgModal] = useState(false);

const [messageBody, setMessageBody] = useState('');

const [messageFile, setMessageFile] = useState(null);
  const sendMessageToH1 = async () => {
    if (!messageBody.trim()) {
        alert("Fariinta ma noqon karto mid maran!");
        return;
    }

    try {
        const formData = new FormData();
        // MUHIIM: U bixi 'message' si uu Backend-ka u garto
        formData.append('message', messageBody); 
        formData.append('sender', 'S1');
        formData.append('receiver', 'H1');
        
        if (messageFile) {
            formData.append('attachment', messageFile);
        }

        // 1. Line-kan ka saar comment-ka si uu xogta u diro
        // 2. Hubi in axios uu kuu dhex jiro (import axios from 'axios')
        const response = await axios.post('http://localhost:5000/api/messages', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status === 200) {
            console.log("Database-ka waa lagu shubay!");
            alert("Fariinta si guul leh ayaa loogu diray H1!");
            
            // Nadiifi foomka
            setMessageBody('');
            setMessageFile(null);
            setShowMsgModal(false);
        }
    } catch (error) {
        console.error("Ciladda dhabta ah:", error.response?.data || error.message);
        alert("Cilad ayaa dhacday: " + (error.response?.data?.error || "Server-ka lama heli karo"));
    }
};

const sendMessage = async (receiverId) => {
  if (!messageBody.trim()) return alert("Fariinta ma noqon karto mid maran!");

  try {
    const formData = new FormData();
    formData.append('message', messageBody);
    formData.append('sender', 'H1'); // Adiga (Horinta 1aad)
    formData.append('receiver', receiverId); // Qofka la doortay
    if (messageFile) formData.append('attachment', messageFile);

    await axios.post('http://localhost:5000/api/messages', formData);
    
    alert(`Fariinta waa loo diray ${receiverId}`);
    setMessageBody('');
    setMessageFile(null);
    // Waxaad kaloo xiri kartaa modal-ka ama waad iska deyn kartaa
  } catch (error) {
    alert("Cilad ayaa dhacday markii fariinta la dirayey.");
  }
};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={activeUser} darkMode={darkMode} />
      {/* SIDEBAR */}
      <aside style={{
                ...sidebarStyle,
                height: '100vh', 
                position: 'sticky', 
                top: 0, 
                background: '#1e3a8a', 
                borderRight: 'none',
                display: 'flex',
                flexDirection: 'column'
              }}>

                {/* Profile Section */}
                <div style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={getProfilePicUrl(activeUser.pic)} 
                      alt="Profile" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = "/assets/profiles/default.png"; }}
                    />
                    {isExpanded && (
                      <div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                          {activeUser.username || "H1 Officer"} 
                        </h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#93c5fd', fontWeight: '600' }}>Role: {activeUser.role || 'H1'}</p>
                      </div>
                    )}
                  </div>
                  <div onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer', color: '#93c5fd', flexShrink: 0 }}>
                    <Menu size={20} />
                  </div>
                </div>

                {/* Navigation */}
                <nav style={{ flexGrow: 1 }}>
                  <div onClick={() => setActivePage('dashboard')} style={navItemStyle(activePage === 'dashboard')}>
                    <LayoutDashboard size={22} />
                    {isExpanded && <span>Dashboard</span>}
                  </div>
                  
                  <div onClick={() => setActivePage('reports')} style={navItemStyle(activePage === 'reports')}>
                    <FileText size={22} />
                    {isExpanded && <span>Reports</span>}
                  </div>
                  
                  <div onClick={() => setActivePage('askar')} style={navItemStyle(activePage === 'askar')}>
                    <Users size={22} />
                    {isExpanded && <span>Xogta Askar</span>}
                  </div>

                  <div onClick={() => setActivePage('analytics')} style={navItemStyle(activePage === 'analytics')}>
                    <PieChart size={22} />
                    {isExpanded && <span>Analytics</span>}
                  </div>
                  
                  <div onClick={() => setActivePage('settings')} style={navItemStyle(activePage === 'settings')}>
                    <Settings size={22} />
                    {isExpanded && <span>Settings</span>}
                  </div>
                </nav>

                {/* Bottom Actions */}
                <div style={{ padding: '15px', borderTop: darkMode ? '1px solid #333' : '1px solid #f5f7fb' }}>
                  
                  {/* MESSAGES SECTION */}
                  <div onClick={() => setShowMsgModal(true)} style={navItemStyle(showMsgModal)}>
   <MessageSquare size={20} /> {isExpanded && <span>Fariimaha</span>}
</div>

                  <div onClick={handleLogout} style={{ ...navItemStyle(false), color: '#e74c3c' }}>
                    <LogOut size={20} />
                    {isExpanded && <span>Logout</span>}
                  </div>
                  
                  <div style={{ ...navItemStyle(false), justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <Moon size={20} />
                      {isExpanded && <span>Night Mode</span>}
                    </div>
                    {isExpanded && (
                      <div onClick={() => setDarkMode(!darkMode)} style={{ width: '36px', height: '18px', backgroundColor: darkMode ? '#5d5fef' : '#ddd', borderRadius: '20px', cursor: 'pointer', position: 'relative' }}>
                        <div style={{ width: '14px', height: '14px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: darkMode ? '20px' : '2px', transition: '0.3s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </aside>

      {/* MAIN CONTENT */}
       <main style={{ 
          flexGrow: 1, 
          padding: '20px',             // Padding-ka yaree si uu Sidebarka ugu dhowaado
          backgroundColor: darkMode ? '#121212' : '#f8faf9', 
          color: darkMode ? '#000001' : '#000',
          minHeight: '100vh',
          marginLeft: '0px',           // Hubi inaanu jirin margin bidix ah oo riixaya
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
        
        <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 30px',
                    marginLeft: '0px',
                    background: 'white',
                    borderBottom: '1px solid #eee'
                  }}>
                    <h2 style={{ margin: 0, color: '#1a2a6c', fontWeight: '700' }}>H1 Dashboard</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                      {/* --- NOTIFICATION ICON --- */}
                      {hasNotifications && (
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifyList(!showNotifyList)}>
                          
                          {/* Lucide Icon: Bell */}
                          <Bell size={24} />

                          {/* Counter-ka Casaanka ah */}
                          <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: '#e74c3c',
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '50%',
                            fontWeight: 'bold',
                            border: '2px solid white'
                          }}>
                            {flaggedAskar.length}
                          </span>

                          {/* --- DROPDOWN LIST --- */}
                          {showNotifyList && (
                            <div style={{
                              position: 'absolute',
                              top: '35px',
                              right: '0',
                              width: '300px',
                              background: 'white',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                              borderRadius: '12px',
                              zIndex: 1000,
                              overflow: 'hidden',
                              border: '1px solid #eee'
                            }}>
                              <div style={{ 
                                padding: '12px', 
                                background: '#f8f9fa', 
                                borderBottom: '1px solid #eee', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                              }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Ogeysiiska Caafimaadka</span>
                                <span style={{ 
                                  background: '#eafaf1', 
                                  color: '#27ae60', 
                                  padding: '4px 12px', 
                                  borderRadius: '20px', 
                                  fontSize: '12px', 
                                  fontWeight: 'bold' 
                                }}>
                                  {flaggedAskar.length} QOF
                                </span>
                              </div>

                              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
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
                                        padding: '12px',
                                        borderBottom: '1px solid #f9f9f9',
                                        cursor: 'pointer',
                                        transition: '0.2s'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px'
                                      }}>
                                        <img 
                                          src={`http://localhost:5000/${s.profile_pic}`} 
                                          alt="" 
                                          style={{ 
                                            width: '45px', 
                                            height: '45px', 
                                            borderRadius: '10px', 
                                            objectFit: 'cover',
                                            border: '1px solid #eee' 
                                          }} 
                                        />

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                          <h4 style={{ 
                                            margin: 0, 
                                            fontSize: '14px', 
                                            fontWeight: '600', 
                                            color: '#2c3e50' 
                                          }}>
                                            {s.name}
                                          </h4>
                                          <span style={{ fontSize: '11px', color: '#7f8c8d' }}>
                                            ID: {s.sarkaal_id}
                                          </span>
                                          <p style={{ 
                                            margin: 0, 
                                            fontSize: '10px', 
                                            color: '#e74c3c', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '3px' 
                                          }}>
                                            ⚠️ Wuxuu dhaafay Xadka Yattaka
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    Ma jiraan ogeysiisyo cusub
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </header>

        {/* DASHBOARD PAGE */}
        {activePage === 'reports' && (
          <div className="h1-page">
            <div className="h1-page-title"><div><h1>H1 Reports</h1><p>Medical activity and personnel records for Horinta 1aad.</p></div><button className="h1-secondary-button" onClick={fetchData}><Check size={16} /> Refresh</button></div>
            <div className="h1-summary-grid">
              <div className="h1-summary-card" style={{ '--accent': '#f1c40f', '--tint': '#fff8dd' }}><span className="h1-summary-card__icon"><LayoutDashboard size={18} /></span><span className="h1-summary-card__label">Pending</span><strong className="h1-summary-card__value">{pendingQueue.length}</strong></div>
              <div className="h1-summary-card" style={{ '--accent': '#27ae60', '--tint': '#eafaf1' }}><span className="h1-summary-card__icon"><FileText size={18} /></span><span className="h1-summary-card__label">Processed</span><strong className="h1-summary-card__value">{h1Reports.length}</strong></div>
              <div className="h1-summary-card" style={{ '--accent': '#5d5fef', '--tint': '#eeefff' }}><span className="h1-summary-card__icon"><Users size={18} /></span><span className="h1-summary-card__label">Personnel</span><strong className="h1-summary-card__value">{personnel.length}</strong></div>
              <div className="h1-summary-card" style={{ '--accent': '#e76f51', '--tint': '#fff0ec' }}><span className="h1-summary-card__icon"><ArrowUpRight size={18} /></span><span className="h1-summary-card__label">Referred</span><strong className="h1-summary-card__value">{h1Reports.filter(report => report.referrals === 'Yes').length}</strong></div>
            </div>
            <div className="h1-panel"><div className="h1-panel__heading"><h2>Medical reports</h2><span className="h1-status h1-status--neutral">{h1Reports.length} records</span></div>
              {h1Reports.length === 0 ? <div className="h1-empty"><FileText size={34} /><p>No H1 medical reports have been recorded yet.</p></div> : <div className="h1-table-wrap"><table className="h1-table"><thead><tr><th>Personnel</th><th>Diagnosis</th><th>Limitation</th><th>Days</th><th>Referral</th><th>Date</th></tr></thead><tbody>{h1Reports.map(report => <tr key={report.id}><td><strong>{report.name || 'Unnamed'}</strong><br /><small>{report.sarkaal_id}</small></td><td>{report.diagnosis || 'Not specified'}</td><td>{report.limitation || 'None'}</td><td>{report.days || 0}</td><td><span className={`h1-status ${report.referrals === 'Yes' ? 'h1-status--referred' : 'h1-status--complete'}`}>{report.referrals === 'Yes' ? 'Referred' : 'Processed'}</span></td><td>{report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}</td></tr>)}</tbody></table></div>}
            </div>
          </div>
        )}

        {activePage === 'analytics' && (
          <div className="h1-page"><div className="h1-page-title"><div><h1>H1 Analytics</h1><p>A clear view of Horinta 1aad workload and medical activity.</p></div></div>
            <div className="h1-summary-grid">
              {[['Pending', analyticsData.totalPending, '#f1c40f', LayoutDashboard], ['Processed', analyticsData.totalProcessed, '#27ae60', CheckCheck], ['Personnel', analyticsData.totalPersonnel, '#5d5fef', Users], ['Referred', analyticsData.totalReferred, '#e76f51', ArrowUpRight]].map(([label, value, color, Icon]) => <div className="h1-summary-card" key={label} style={{ '--accent': color, '--tint': `${color}18` }}><span className="h1-summary-card__icon"><Icon size={18} /></span><span className="h1-summary-card__label">{label}</span><strong className="h1-summary-card__value">{value || 0}</strong></div>)}
            </div>
            <div className="h1-chart-grid"><div className="h1-panel"><div className="h1-panel__heading"><h3>Medical activity by month</h3><FileText size={18} color="#5d5fef" /></div><div className="h1-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsData.monthlyActivity}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" name="Reports" fill="#5d5fef" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
              <div className="h1-panel"><div className="h1-panel__heading"><h3>Queue status</h3><Activity size={18} color="#27ae60" /></div><div className="h1-chart"><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={analyticsData.statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={3}>{(analyticsData.statusDistribution || []).map((entry, index) => <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />)}</Pie><Tooltip /></RechartsPieChart></ResponsiveContainer></div>{(analyticsData.statusDistribution || []).length === 0 && <div className="h1-empty">No queue activity recorded.</div>}</div>
            </div>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="h1-page"><div className="h1-page-title"><div><h1>H1 Settings</h1><p>Manage your H1 account, security, and appearance.</p></div></div><div className="h1-settings-grid"><div className="h1-panel h1-profile-card"><img className="h1-profile-image" src={previewUrl || (loggedInUser.pic ? `http://localhost:5000/uploads/${loggedInUser.pic}` : '/assets/profiles/default.png')} alt="H1 profile" /><strong>{settingsUsername || 'H1 user'}</strong><label className="h1-secondary-button"><Camera size={16} /> Change picture<input type="file" hidden accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) { setNewProfilePic(file); setPreviewUrl(URL.createObjectURL(file)); } }} /></label></div><div className="h1-panel"><div className="h1-panel__heading"><h3>Profile details</h3><User size={18} color="#5d5fef" /></div><div className="h1-form"><label htmlFor="h1-username">Username</label><input id="h1-username" value={settingsUsername} onChange={event => setSettingsUsername(event.target.value)} /><button className="h1-primary-button" onClick={saveProfileSettings} disabled={settingsSaving}><Save size={16} />{settingsSaving ? 'Saving...' : 'Save changes'}</button></div><div className="h1-panel__heading" style={{ marginTop: 30 }}><h3>Password and security</h3><Shield size={18} color="#5d5fef" /></div><div className="h1-form"><input type="password" placeholder="Current password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /><input type="password" placeholder="New password" value={newPassword} onChange={event => setNewPassword(event.target.value)} /><button className="h1-secondary-button" onClick={savePasswordSettings}><Lock size={16} /> Update password</button></div><div className="h1-panel__heading" style={{ marginTop: 30 }}><h3>Appearance</h3><Monitor size={18} color="#5d5fef" /></div><button className="h1-secondary-button" onClick={() => setDarkMode(value => !value)}><Moon size={16} /> {darkMode ? 'Use light mode' : 'Use dark mode'}</button></div></div></div>
        )}

        {activePage === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={cardStyle}>
              <h3 style={{ color: '#e67e22', marginTop: 0 }}>1. Safka MO (Pending)</h3>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                    <th style={thStyle}>Pic</th><th style={thStyle}>Personnel</th><th style={thStyle}>Sarkaal ID</th><th style={thStyle}>Weight</th><th style={thStyle}>Blood</th><th style={thStyle}>Height</th><th style={thStyle}>Workflow</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQueue.map(item => (
                    <tr key={item.sarkaal_data_id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tdStyle}><img src={`http://localhost:5000/${item.profile_pic}`} width="40" height="40" style={{ borderRadius: '50%' }} alt="profile" /></td>
                      <td style={tdStyle}><strong>{item.name}</strong><br /><small>Record #{item.sarkaal_data_id}</small></td>
                      <td style={tdStyle}>{item.sarkaal_id}</td>
                      <td style={tdStyle}>{item.culays ?? '-'} kg</td>
                      <td style={tdStyle}>{item.dhiiga || '-'}</td>
                      <td style={tdStyle}>{item.dhirirka ?? '-'}</td>
                      <td style={{ ...tdStyle, color: '#e67e22', fontWeight: 'bold' }}>Pending for H1</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={cardStyle}>
              <h3 style={{ color: '#27ae60' }}>Warbixinnada Baaritaanka (Active Records)</h3>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#1a2a6c', color: 'white' }}>
                    <th style={thStyle}>Pic</th><th style={thStyle}>ID</th><th style={thStyle}>Magaca</th><th style={thStyle}>Limitation</th><th style={thStyle}>Remaining</th><th style={thStyle}>Status</th>
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
                      <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tdStyle}><img src={`http://localhost:5000/${report.profile_pic}`} width="40" height="40" style={{borderRadius: '50%'}} alt="profile" /></td>
                        <td style={tdStyle}>{report.sarkaal_id}</td>
                        <td style={tdStyle}>{report.name}</td>
                        <td style={tdStyle}><b>{report.limitation}</b></td>
                        <td style={tdStyle}>
                          <span style={{ color: maalmahaHadhay <= 1 ? 'red' : '#27ae60', fontWeight: 'bold' }}>
                            {maalmahaHadhay} Days
                          </span>
                        </td>
                        <td style={tdStyle}><span style={{ color: '#27ae60' }}>● Active</span></td>
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
          <div style={cardStyle}>
            <h2 style={{ color: '#1a2e26', marginBottom: '25px' }}>Xogta Guud ee Askarta</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: '#1a2a6c', color: '#fff', textAlign: 'left' }}>
                    <th style={thStyle}>No</th><th style={thStyle}>Pic</th><th style={thStyle}>ID</th><th style={thStyle}>Name</th><th style={thStyle}>Culays</th><th style={thStyle}>Dhiiga</th><th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const isHovered = hoveredRowId === item.id;
                    return (
                      <tr 
                        key={item.id} 
                        onMouseEnter={() => setHoveredRowId(item.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        style={{ ...rowStyle, transform: isHovered ? 'scale(1.005)' : 'scale(1)' }}
                      >
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdStyle}>
  <img 
    src={`http://localhost:5000/${item.profile_pic}`} 
    alt="profile" 
    style={{ 
      width: '45px', 
      height: '45px',     // Fixed height
      borderRadius: '8px',
      objectFit: 'cover', // Sawirku inuu isku dhelli tirnaado
      transition: '0.3s',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      border: isHovered ? '2px solid #27ae60' : '2px solid transparent'
    }} 
  />
</td>
                        <td style={tdStyle}>{item.sarkaal_id}</td>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={tdStyle}>{item.culays} kg</td>
                        <td style={tdStyle}>{item.dhiiga}</td>
                        <td style={tdStyle}>
                          <button onClick={() => { setViewedSarkaal(item); setActivePage('view'); }} style={viewBtn}>View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW PAGE */}
        {activePage === 'view' && viewedSarkaal && (
          <div style={{ padding: '20px' }}>
            {(() => {
              const totalRestDays = medicalReports
                .filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id && r.limitation === 'Yattak Istirihat')
                .reduce((sum, report) => sum + Number(report.days || 0), 0);

              return (
                <>
                  <button onClick={() => setActivePage('askar')} style={backBtn}>⬅ Back to List</button>
                  
                  <div style={profileHeaderCard}>
                    <img src={`http://localhost:5000/${viewedSarkaal.profile_pic}`} style={profileImageLg} alt="profile" />
                    <div>
                      <h1 style={{ color: '#1a2a6c', margin: 0 }}>{viewedSarkaal.name}</h1>
                      <p>Sarkaal ID: <b>{viewedSarkaal.sarkaal_id}</b></p>
                      
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={visitBadge}>Visits: {medicalReports.filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id).length}</div>
                        <div style={{ ...daysLabel, background: totalRestDays >= 40 ? '#f8d7da' : '#fef9e7' }}>
                          Total Rest: {totalRestDays} Maalmood {totalRestDays >= 40 && "⚠️"}
                        </div>
                      </div>
                      
                      {totalRestDays >= 45 && (
                        <div style={alertBox} onClick={() => alert("Notification sent to Commander")}>
                          🔔 Ogeysiis: Sarkaalkaan wuxuu gaaray xadkii loogu talagalay.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ ...cardStyle, marginTop: '20px' }}>
                    <h3 style={{ borderBottom: '2px solid #fdbb2d', paddingBottom: '10px' }}>Medical History</h3>
                    <table style={tableStyle}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th style={thStyle}>Date</th><th style={thStyle}>Diagnosis</th><th style={thStyle}>Limitation</th><th style={thStyle}>Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicalReports.filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id).map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tdStyle}>{new Date(r.created_at).toLocaleDateString()}</td>
                            <td style={{ ...tdStyle, color: 'red', fontWeight: 'bold' }}>{r.diagnosis}</td>
                            <td style={tdStyle}>{r.limitation}</td>
                            <td style={tdStyle}>{r.days} Maalmood</td>
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
      </main>
             {false && showMsgModal && (
  <div style={modalOverlayStyle}>
    <div style={{ ...cardStyle, width: '600px', display: 'flex', height: '450px', padding: 0, overflow: 'hidden' }}>
      
      {/* DHINACA BIDIX: Liiska Dadka */}
      <div style={{ width: '200px', borderRight: '1px solid #eee', background: '#f9f9f9', padding: '15px' }}>
        <h4 style={{ marginBottom: '15px' }}>Xiriirada</h4>
        {[].map(user => (
          <div 
            key={user.id}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: selectedUser?.id === user.id ? '#5d5fef' : 'transparent',
              color: selectedUser?.id === user.id ? 'white' : '#333',
              marginBottom: '5px',
              fontSize: '14px',
              transition: '0.3s'
            }}
          >
            {user.name}
          </div>
        ))}
      </div>

      {/* DHINACA MIDIG: Meesha Fariinta */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative' }}>
        <X 
          size={20} 
          style={{ position: 'absolute', right: '15px', top: '15px', cursor: 'pointer' }} 
          onClick={() => { setShowMsgModal(false); setSelectedUser(null); }} 
        />
        
        {selectedUser ? (
          <>
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Ku: {selectedUser.name}</h3>
              <small style={{ color: '#888' }}>{selectedUser.role}</small>
            </div>

            <textarea 
              style={{ ...textAreaStyle, flex: 1, border: 'none', outline: 'none', resize: 'none' }} 
              placeholder={`U dir fariin ${selectedUser.name}...`}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ cursor: 'pointer', color: '#5d5fef' }}>
                  <Paperclip size={22} />
                  <input type="file" style={{ display: 'none' }} onChange={(e) => setMessageFile(e.target.files[0])} />
                </label>
              </div>
              <button 
                onClick={() => sendMessage(selectedUser.id)} 
                style={{ ...sendBtnStyle, padding: '10px 25px' }}
              >
                <Send size={18} /> Dir
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
            Fadlan dooro qofka aad fariinta u dirayso
          </div>
        )}
      </div>

    </div>
  </div>
)}
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        @media print { .no-print { display: none !important; } .main-content { margin-left: 0 !important; width: 100% !important; } }
      `}</style>
    </div>
  );
}

// --- REFINED STYLES ---
const logoArea = { textAlign: 'center', borderBottom: '1px solid #2e3b6e', marginBottom: '10px' };
const navItem = { padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#a0aec0', transition: '0.3s' };
const navActive = { ...navItem, backgroundColor: '#2d3748', color: 'white', borderLeft: '4px solid #4a90e2' };
const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const headerCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const badgeStyle = { background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #fecaca' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '12px', borderBottom: '1px solid #eee', textAlign: 'left' };
const tdStyle = { padding: '12px', borderBottom: '1px solid #f1f1f1' };
const rowStyle = { transition: '0.3s', cursor: 'default' };
const viewBtn = { background: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' };
const refreshBtn = { background: '#1e2a5a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer' };
const backBtn = { marginBottom: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const profileHeaderCard = { display: 'flex', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', alignItems: 'center', gap: '40px', marginBottom: '30px' };
const profileImageLg = { width: '150px', height: '150px', borderRadius: '15px', objectFit: 'cover', border: '5px solid #1a2a6c' };
const visitBadge = { padding: '10px 20px', background: '#e8f4fd', borderRadius: '10px', fontWeight: 'bold', color: '#1a2a6c' };
const daysLabel = { padding: '10px 20px', borderRadius: '10px', border: '1px solid #f39c12', fontWeight: 'bold' };
const alertBox = { marginTop: '15px', padding: '15px', background: '#dc3545', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', animation: 'pulse 2s infinite' };
const logoutBtn = { background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', position: 'absolute', transition: '0.3s' };

export default Horinta1Dashboard;
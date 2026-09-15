import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Settings, Bell } from 'lucide-react';
import FariimahaModal from './FariimahaModal';
import { SettingsPage } from './S1Dashboard';
import ProfileImage from './ProfileImage';
import { useAuthUser, getProfilePicUrl } from './authSync';
import Sidebar from './components/Sidebar';
import { colors, cardStyle, tableStyle, tableHeaderStyle, tableCellStyle, buttonPrimaryStyle, buttonSecondaryStyle, buttonDangerStyle, inputStyle, labelStyle, emptyStateStyle, badgeStyle, borderRadius } from './designSystem';



function S4Dashboard({ user, onLogout }) {

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

  const authUser = useAuthUser(user);
  const activeUser = authUser || user || {};
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);



  const handleEditClick = (item) => {

    setEditingSarkaal(item); 

    setShowEditForm(true);   

  };

const handleUpdate = (e) => {

  e.preventDefault();

  const updateData = new FormData();



  // 1. Ku dar xogta qoraalka ah

  updateData.append('profile_pic', editingSarkaal.new_profile_pic);

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

  }



  axios.put(`http://localhost:5000/api/s4-data/${editingSarkaal.id}`, updateData, {

    headers: { 'Content-Type': 'multipart/form-data' }

  })

  .then(res => {

    showToast("Si guul leh ayaa loo beddelay! ✅");

    fetchTable();           

    setShowEditForm(false); 

  })

  .catch(err => {

    console.error("Error:", err);

    showToast("Cilad: " + (err.response?.data?.message || err.message));

  });

};



  // --- 2. DATA FETCHING ---

  const fetchTable = () => {

    axios.get('http://localhost:5000/api/s4-data').then(res => setData(res.data));

  };



  const fetchMedicalReports = () => {

    axios.get('http://localhost:5000/api/medical-records?user_id=4')

        .then(res => setMedicalReports(res.data))

        .catch(err => console.log("Error fetching reports:", err));

  };

  

  const fetchQueue = () => {

    axios.get('http://localhost:5000/api/ballan/queue?user_id=4').then(res => setInitiatedList(res.data));

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

        sarkaal_data_id: item.id,

        user_id: 4,

        profile_pic: item.profile_pic,

        sarkaal_id: item.sarkaal_id,

        name: item.name,

        status: 'Pending'

    };

    axios.post('http://localhost:5000/api/ballan', queueData).then(() => {

        fetchQueue();

        showToast(`Leyli sarkaal ${item.name} waa la diray (Pending)!`);

    });

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

    

    axios.post('http://localhost:5000/api/s4-data', sendData).then(() => {

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

    axios.delete(`http://localhost:5000/api/s4-data/${id}`)

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

  const colors = {

  bg: darkMode ? '#121212' : '#f8faf9',      // Midabka dhabarka (Background)

  sidebar: darkMode ? '#1e1e1e' : '#ffffff', // Midabka dhinac-ka

  text: darkMode ? '#ffffff' : '#333333',    // Midabka qoraalka

  border: darkMode ? '#333333' : '#edf2f0'   // Midabka xariiqyada

};

  // --- DYNAMIC STYLES ---

  const dynamicSidebarStyle = {

    width: isExpanded ? '260px' : '80px',

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



  const dynamicMainStyle = {

    flex: 1,

    padding: '30px',

    marginLeft: isExpanded ? '260px' : '80px',

    transition: 'all 0.3s ease',

    backgroundColor: '#f8faf9'

  };



  const navItemStyle = {

    display: 'flex',

    alignItems: 'center',

    padding: '12px 20px',

    margin: '5px 15px',

    borderRadius: '8px',

    cursor: 'pointer',

    transition: '0.2s',

    fontSize: '14px',

    fontWeight: '500',

    color: '#666',

    gap: '15px'

  };



  const activeNavItemStyle = {

    ...navItemStyle,

    background: '#eafaf1',

    color: '#27ae60'

  };

  const executeCancelAction = () => {

  if (!itemToCancel) return;



  axios.delete(`http://localhost:5000/api/ballan/cancel/${itemToCancel.id}`)

    .then(res => {

      setShowCancelModal(false);

      showToast("Safka si guul leh ayaa looga saaray! ✅", "success");

      fetchTable();

      fetchQueue();

    })

    .catch(err => {

      console.error("Cancel Error:", err);

      // Haddii uu ku siiyo Error 500

      showToast("Cilad: Server-ka ayaa diiday codsiga (Error 500)", "error");

    });

};

  const initiateCancel = (item) => {

  setItemToCancel(item);

  setShowCancelModal(true);

};

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });



  // Function-kan ayaa loo isticmaali doonaa in lagu soo bandhigo alert-ka

  const showToast = (msg, type = 'success') => {

    setNotification({ show: true, message: msg, type: type });

    

    // Inuu iskiis u baaba'o 3 ilbidhiqsi ka dib

    setTimeout(() => {

      setNotification({ show: false, message: '', type: '' });

    }, 3000);

  };



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
        role="S4"
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ color: colors.text, fontSize: '22px', fontWeight: '800', margin: 0 }}>S4 Dashboard</h1>
                  <span style={{
                    ...badgeStyle,
                    backgroundColor: colors.primaryLight,
                    color: colors.primary,
                    border: `1px solid ${colors.primaryBorder}`,
                    fontWeight: '700',
                  }}>
                    S4 Division Portal
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '13px' }}>
                  Maareynta iyo xareynta xogta saraakiisha qeybta S4.
                </p>
              </div>

              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  style={buttonPrimaryStyle}
                >
                  + Ku Dar Sarkaal
                </button>
              )}
            </div>

            {showForm && (
              <div style={{ ...cardStyle, marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: `1px solid ${colors.borderLight}` }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>Foomka Xareynta Sarkaalka</h3>
                  <button type="button" onClick={() => setShowForm(false)} style={{ ...buttonSecondaryStyle, padding: '4px 10px', fontSize: '12px' }}>Xir Foomka</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Sawirka Sarkaalka (Profile Picture)</label>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ fontSize: '13px', color: colors.textMuted }} />
                  </div>
                  <div><label style={labelStyle}>Sarkaal ID</label><input type="text" value={formData.sarkaal_id || ''} style={inputStyle} placeholder="Lambar..." onChange={e => setFormData({...formData, sarkaal_id: e.target.value})} /></div>
                  <div><label style={labelStyle}>Magaca Dhammaystiran</label><input type="text" value={formData.name || ''} style={inputStyle} placeholder="Magaca..." onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div><label style={labelStyle}>Culayska (kg)</label><input type="text" value={formData.culays || ''} style={inputStyle} placeholder="70" onChange={e => setFormData({...formData, culays: e.target.value})} /></div>
                  <div>
                    <label style={labelStyle}>Nooca Dhiigga</label>
                    <select value={formData.dhiiga || ""} onChange={e => setFormData({...formData, dhiiga: e.target.value})} style={inputStyle}>
                      <option value="" disabled>Dooro...</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>Dhirirka (cm)</label><input type="text" value={formData.dhirirka || ''} style={inputStyle} placeholder="175" onChange={e => setFormData({...formData, dhirirka: e.target.value})} /></div>
                  <div><label style={labelStyle}>Goobta Dhalashada</label><input type="text" value={formData.goobta_dhalashada || ''} style={inputStyle} placeholder="Magaalada..." onChange={e => setFormData({...formData, goobta_dhalashada: e.target.value})} /></div>
                  <div><label style={labelStyle}>Taariikhda Dhalashada</label><input type="date" value={formData.tariikhda_dhalashada || ''} style={inputStyle} onChange={e => setFormData({...formData, tariikhda_dhalashada: e.target.value})} /></div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button type="submit" style={buttonPrimaryStyle}>Keydi Xogta</button>
                    <button type="button" onClick={() => setShowForm(false)} style={buttonSecondaryStyle}>Ka Noqo</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>Liiska Saraakiisha S4</h3>
                <input
                  type="text"
                  placeholder="Raadi magac ama ID..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    height: '34px',
                    width: '240px',
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`,
                    padding: '0 12px',
                    fontSize: '12.5px',
                    outline: 'none',
                    backgroundColor: colors.white,
                  }}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableHeaderStyle}>Sawir</th>
                      <th style={tableHeaderStyle}>Sarkaal ID</th>
                      <th style={tableHeaderStyle}>Magaca</th>
                      <th style={tableHeaderStyle}>Ficil / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(item => {
                      const isSent = initiatedList.some(i => i.sarkaal_data_id === item.id);
                      return (
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
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                onClick={() => toggleInitiate(item)}
                                disabled={isSent}
                                style={{
                                  ...(isSent ? buttonSecondaryStyle : buttonPrimaryStyle),
                                  padding: '5px 12px',
                                  fontSize: '12px',
                                  opacity: isSent ? 0.7 : 1,
                                }}
                              >
                                {isSent ? 'Sent to MO' : 'Initiate to MO'}
                              </button>
                              {isSent && (
                                <button 
                                  onClick={() => {
                                    setItemToCancel(item);
                                    setShowCancelModal(true);
                                  }} 
                                  style={{
                                    ...buttonDangerStyle,
                                    padding: '5px 10px',
                                    fontSize: '12px',
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                onClick={() => handleEditClick(item)}
                                style={{
                                  ...buttonSecondaryStyle,
                                  padding: '5px 12px',
                                  fontSize: '12px',
                                }}
                              >
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
            </div>
          </>
        )}

        {/* Standardized Fariimaha Modal */}
        <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={activeUser} darkMode={darkMode} />
      </main>
    </div>
  );
}

// STYLES
const thStyle = { padding: '15px 20px', fontWeight: '600', fontSize: '13px' };
const tdStyle = { padding: '12px 20px', fontSize: '14px', color: '#1a2e26' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const pad15 = { padding: '15px' };


export default S4Dashboard;

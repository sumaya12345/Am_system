import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MessageSquare, Bell, Users, LayoutDashboard, FileText } from 'lucide-react';
import FariimahaModal from './FariimahaModal';
import { SettingsPage } from './S1Dashboard';
import ProfileImage from './ProfileImage';
import { useAuthUser, getProfilePicUrl } from './authSync';
import Sidebar from './components/Sidebar';
import { colors, cardStyle, tableStyle, tableHeaderStyle, tableCellStyle, buttonPrimaryStyle, buttonSecondaryStyle, buttonDangerStyle, inputStyle, labelStyle, emptyStateStyle } from './designSystem';

function S2Dashboard({ user, onLogout }) {
  const authUser = useAuthUser(user);
  const activeUser = authUser || user || {};
  const [showMsgModal, setShowMsgModal] = useState(false);
  // --- 1. STATES ---
  const [data, setData] = useState([]);
  const [showNotifyList, setShowNotifyList] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [hoverSave, setHoverSave] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);
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
 // 1. Marka hore ku dar State cusub dusha sare ee function-kaaga
 const [hoveredRow, setHoveredRow] = useState(null); 
// 'false' waxay ka dhigan tahay inuu markii hore yahay Light Mode.
  // --- STATE-KA CUSUB: EXPAND/COLLAPSE ---
  const [isExpanded, setIsExpanded] = useState(true);

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
  let tempErrors = {}; // Waa inay noqoto Object {} si validation-ku u shaqeeyo

  // 1. Hubi in khaanadaha aysan bannaayn (Required)
  const fields = ['sarkaal_id', 'name', 'culays', 'dhiiga', 'dhirirka', 'goobta_dhalashada', 'tariikhda_dhalashada'];
  fields.forEach(field => {
    if (!editingSarkaal[field]) {
      tempErrors[field] = "Khaanaddan waa qasab (Required)";
    }
  });

  // 2. Hubi Magaca
  if (editingSarkaal.name) {
    const nameParts = editingSarkaal.name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      tempErrors.name = "Fadlan qor ugu yaraan 2 magac";
    }
  }

  // 3. Hubi Numbers-ka (Digits only)
  if (editingSarkaal.culays && !/^\d+$/.test(editingSarkaal.culays)) {
    tempErrors.culays = "Culayska waa inuu tiro (digits) keliya ahaadaa";
  }
  if (editingSarkaal.dhirirka && !/^\d+$/.test(editingSarkaal.dhirirka)) {
    tempErrors.dhirirka = "Dhirirka waa inuu tiro (digits) keliya ahaadaa";
  }

  // 4. Unique ID Check
  const idExists = data.find(sarkaal => 
    sarkaal.sarkaal_id === editingSarkaal.sarkaal_id && sarkaal.id !== editingSarkaal.id
  );
  if (idExists) {
    tempErrors.sarkaal_id = `ID-gan waxaa horey u lahaa ${idExists.name}`;
  }

  // Haddii ay jiraan khaladaad, ha gudbin foomka
  setErrors(tempErrors);
  
  // Haddii uu leeyahay wax ka badan 0 error, jooji halkan
  if (Object.keys(tempErrors).length > 0) return;

  // Haddii wax walba sax yihiin, sii wad dirista...
  const updateData = new FormData();
  updateData.append('sarkaal_id', editingSarkaal.sarkaal_id);
  updateData.append('name', editingSarkaal.name);
  updateData.append('culays', editingSarkaal.culays);
  updateData.append('dhiiga', editingSarkaal.dhiiga);
  updateData.append('dhirirka', editingSarkaal.dhirirka);
  updateData.append('goobta_dhalashada', editingSarkaal.goobta_dhalashada);
  updateData.append('tariikhda_dhalashada', editingSarkaal.tariikhda_dhalashada);
  
  if (editingSarkaal.profile_pic instanceof File) {
    updateData.append('profile_pic', editingSarkaal.profile_pic);
  }

  axios.put(`http://localhost:5000/api/s2-data/${editingSarkaal.id}`, updateData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  .then(res => {
    showToast("Si guul leh ayaa loo beddelay! ✅");
    fetchTable();           
    setShowEditForm(false); 
    setErrors({}); // Masax khaladaadka foomku markuu xirmo
  })
  .catch(err => {
    console.error("Error:", err);
    showToast("Cilad: " + (err.response?.data?.message || err.message));
  });
};


const [errors, setErrors] = useState({});

const validate = () => {
  let tempErrors = {};
  const nameParts = (formData.name || "").trim().split(/\s+/);
  const onlyLetters = /^[a-zA-Z\s]+$/;
  const onlyNumbers = /^[0-9]+$/;

  // 1. Required: Inaan meel banaan laga tagin
  if (!formData.sarkaal_id) tempErrors.sarkaal_id = "ID-ga waa loo baahanyahay";
  if (!formData.name) tempErrors.name = "Magaca waa loo baahanyahay";
    if (!formData.culays) tempErrors.culays = "Culayska waa loo baahanyahay";
    if (!formData.dhiiga) tempErrors.dhiiga = "Dhiigga waa loo baahanyahay";
    if (!formData.dhirirka) tempErrors.dhirirka = "Dhirirka waa loo baahanyahay";
    if (!formData.goobta_dhalashada) tempErrors.goobta_dhalashada = "Goobta dhalashada waa loo baahanyahay";
      if (!formData.tariikhda_dhalashada) tempErrors.tariikhda_dhalashada = "Tariikhda dhalashada waa loo baahanyahay";


  // 2. Sarkaal ID: 4 digit, nambar kaliya, iyo inaan hore loo isticmaalin
  if (formData.sarkaal_id) {
    if (formData.sarkaal_id.length !== 4 || !onlyNumbers.test(formData.sarkaal_id)) {
      tempErrors.sarkaal_id = "ID-ga waa inuu ahaadaa 4 nambar";
    } else if (filteredData.some(item => item.sarkaal_id === formData.sarkaal_id)) {
      tempErrors.sarkaal_id = "ID-gan horay ayaa loo isticmaalay";
    }
  }

  // 3. Magaca: 3 magac iyo kaliya xarfo
  if (formData.name) {
    if (!onlyLetters.test(formData.name)) {
      tempErrors.name = "Keliya xarfo ayaa la ogolyahay";
    } else if (nameParts.length < 3) {
      tempErrors.name = "Fadlan qor ugu yaraan 3 magac";
    }
  }

  // 4. Dhirirka: Ugu yaraan 3 digit
  if (formData.dhirirka && formData.dhirirka.length < 3) {
    tempErrors.dhirirka = "Dhirirka waa inuu ahaadaa 3 digit (tusaale: 175)";
  }
  if (formData.culays && Number(formData.culays) <= 0) {
    tempErrors.culays = "Culayska waa inuu ka weyn yahay 0!";
  }
  if (formData.dhiiga && !onlyLetters.test(formData.dhiiga)) {
    tempErrors.dhiiga = "Fadlan Dooro dhiig";
  }
    if (formData.goobta_dhalashada && !onlyLetters.test(formData.goobta_dhalashada)) {
    tempErrors.goobta_dhalashada = "Goobta dhalashada waa inay ka kooban tahay xarfo kaliya";
    }
    if (formData.tariikhda_dhalashada && !/^\d{4}-\d{2}-\d{2}$/.test(formData.tariikhda_dhalashada)) {
    }

  setErrors(tempErrors);
  return Object.keys(tempErrors).length === 0; // Haddii ay 0 tahay waa sax
};



  // --- 2. DATA FETCHING ---
  const fetchTable = () => {
    axios.get('http://localhost:5000/api/s2-data').then(res => setData(res.data));
  };

  const fetchMedicalReports = () => {
    axios.get('http://localhost:5000/api/medical-records?user_id=2')
        .then(res => setMedicalReports(res.data))
        .catch(err => console.log("Error fetching reports:", err));
  };
  
  const fetchQueue = () => {
    axios.get('http://localhost:5000/api/ballan/queue?user_id=2').then(res => setInitiatedList(res.data));
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
        user_id: 2,
        profile_pic: item.profile_pic,
        sarkaal_id: item.sarkaal_id,
        name: item.name,
        status: 'Pending'
    };
    axios.post('http://localhost:5000/api/ballan', queueData).then(() => {
        fetchQueue();
        showToast(`Leyli sarkaal ${item.name} waa la diray (Pending)!`);
    }).catch((err) => showToast(err.response?.data?.message || 'Initiate failed'));
  };

  const validateForm = (data) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(data.name)) {
      showToast("Khalad: Magaca waa inuu xarfo kaliya noqdaa!");
      return false;
    }
    if (isNaN(data.sarkaal_id)) {
      showToast("Khalad: Sarkaal ID waa inuu nambar noqdaa!");
      return false;
    }
    if (Number(data.culays) <= 0 || Number(data.dhirirka) <= 0) {
      showToast("Khalad: Culayska iyo Dhirirka waa inay ka weyn yihiin 0!");
      return false;
    }
    return true;
  };


const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Hubi in sawirka la doortay
    if (!file) {
        alert("Fadlan sawirka sarkaalka soo geli!");
        return;
    }

    const sendData = new FormData();
    sendData.append('profile_pic', file);

    // 2. Ku dar xogta kale
    Object.keys(formData).forEach(key => {
        if (formData[key]) {
            sendData.append(key, formData[key]);
        }
    });

    try {
        const response = await axios.post('http://localhost:5000/api/s2-data', sendData);
        console.log("Response:", response.data);
        showToast("Xogta S2 waa la keydiyey!");
        fetchTable();
        setFormData({ sarkaal_id: '', name: '', culays: '', dhiiga: '', dhirirka: '', goobta_dhalashada: '', tariikhda_dhalashada: '' });
        setFile(null);
    } catch (err) {
        console.error("Full Error Object:", err);
        alert("Cilad ayaa dhacday: " + (err.response?.data?.error || err.message));
    }
};

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const executeDelete = () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id; 
    axios.delete(`http://localhost:5000/api/s2-data/${id}`)
      .then(() => {
         showToast("Waa la tirtiray! ✅");
         fetchTable();
         setShowDeleteModal(false);
         setItemToDelete(null);
      })
      .catch(err => {
         console.error("Ciladda tirtirista:", err);
         showToast("Cilad ayaa dhacday: " + err.message);
      });
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sarkaal_id.toString().includes(searchTerm)
  );


const handleDeleteSarkaal = (id) => {
    // Isticmaal Swal.fire si aad u muujiso pop-up-ka dhexda ah
    Swal.fire({
        title: 'Ma hubtaa?',
        text: "Ma rabtaa inaad tirtirto sarkaalkan iyo xogtiisa oo dhan?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Midabka tirtirista (Casaan)
        cancelButtonColor: '#3085d6', // Midabka iska dhaaf (Bulug)
        confirmButtonText: 'Haye, tirtir',
        cancelButtonText: 'Iska dhaar',
        reverseButtons: true // Waxay badhamada u dhigaysaa sida sawirkaaga (Cancel dhanka midig)
    }).then((result) => {
        if (result.isConfirmed) {
            // Haddii uu qofku doorto "Haye, tirtir"
            axios.delete(`http://localhost:5000/api/sarkaal/delete/${id}`)
            .then(() => {
                  fetchTable(); // Refresh garee xogta si isbeddelka u muuqdo
                Swal.fire(
                    'La tirtiray!',
                    'Sarkaalka si guul leh ayaa loo tirtiray.',
                    'success'
                );
            })
            .catch(err => {
                console.error(err);
                Swal.fire(
                    'Cilad!',
                    'Laguma tirtiri karo sarkaalka xogtiisa meel kale oo furan darteed.',
                    'error'
                );
            });
        }
    });
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
  
  const colors = {
  bg: darkMode ? '#121212' : '#f8faf9',      // Midabka dhabarka (Background)
  sidebar: darkMode ? '#1e1e1e' : '#ffffff', // Midabka dhinac-ka
  text: darkMode ? '#ffffff' : '#333333',    // Midabka qoraalka
  border: darkMode ? '#333333' : '#edf2f0'   // Midabka xariiqyada
};
  // --- DYNAMIC STYLES ---
  const dynamicSidebarStyle = {
    width: isExpanded ? '200px' : '80px',
    background: '#ffffff',
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
    marginLeft: isExpanded ? '195px' : '80px',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8fafc'
  };

  const executeCancelAction = () => {
  if (!itemToCancel || !itemToCancel.id) {
    showToast("Cilad: Xogta sarkaalka lama helin!", "error");
    return;
  }

  // Waxaan u sheegaynaa backend-ka in status-ka laga dhigo mid madhan
  axios.delete(`http://localhost:5000/api/ballan/cancel/${itemToCancel.id}`)
    .then(res => {
      setShowCancelModal(false);
      showToast("Safka si guul leh ayaa looga saaray! ✅", "success");
      fetchTable();
      fetchQueue();
    })
    .catch(err => {
      console.error("Cancel Error:", err);
      showToast("Cilad: Server-ka ayaa diiday codsiga", "error");
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
  setTimeout(() => {
    setNotification({ show: false, message: '', type: '' });
  }, 4000); // 4 ilbiriqsi ka dib ha baxo
};
// 1. Soo saar dhammaan askarta 45 maalmood ka badan "Yatak Istirahat" helay
const flaggedAskar = data.filter(sarkaal => {
  const totalDays = medicalReports
    .filter(r => r.sarkaal_id === sarkaal.sarkaal_id && r.limitation === 'Yattak Istirihat')
    .reduce((sum, r) => sum + Number(r.days || 0), 0);
  return totalDays >= 45;
});

const hasNotifications = flaggedAskar.length > 0;
const sidebarStyle = {
    width: isExpanded ? '260px' : '80px',
    height: '100vh',
    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
    color: darkMode ? '#ffffff' : '#333333',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    borderRight: darkMode ? '1px solid #333' : '1px solid #f0f0f0',
    fontFamily: 'Inter, sans-serif'
  };

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    gap: '15px',
    color: isActive ? '#5d5fef' : (darkMode ? '#b3b3b3' : '#666'),
    backgroundColor: isActive ? (darkMode ? '#252545' : '#f0f2ff') : 'transparent',
    borderRadius: '12px',
    margin: '4px 10px',
    transition: '0.2s'
  });
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={activeUser} darkMode={darkMode} />
      
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
        role="S2"
      />
      {/* MAIN CONTENT */}
      <main style={{ 
          flexGrow: 1, 
          padding: '24px',
          backgroundColor: colors.background,
          color: colors.text,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: colors.white,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow
        }}>
          <h2 style={{ margin: 0, color: colors.text, fontWeight: '700', fontSize: '20px' }}>S2 Dashboard</h2>
        
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
                        background: '#eef2ff',
                        color: '#5d5fef',
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
        {activePage === 'dashboard' && (
          <>
            <div style={{ marginBottom: '24px'}}>
              <h2 style={{ color: colors.text, fontSize: '28px', fontWeight: '700' }}>S2 Dashboard</h2>
              <p style={{ color: colors.textMuted }}>Maareynta iyo xareynta xogta sarkaalada.</p>
            </div>

            {showForm && (
              <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <form onSubmit={(e) => { e.preventDefault(); if(validate()) handleSubmit(e); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              
              <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ gridColumn: '1/-1' }} />
              
              {/* Sarkaal ID */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Sarkaal ID</label>
                <input 
                  type="text" 
                  value={formData.sarkaal_id || ''} 
                  style={{...inputStyle, borderColor: errors.sarkaal_id ? colors.error : colors.border}} 
                  placeholder="4-digit ID..." 
                  onChange={e => setFormData({...formData, sarkaal_id: e.target.value})} 
                />
                {errors.sarkaal_id && <span style={{color: colors.error, fontSize: '11px', marginTop: '4px'}}>{errors.sarkaal_id}</span>}
              </div>

              {/* Magaca */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Magaca Dhammaystiran</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  style={{...inputStyle, borderColor: errors.name ? colors.error : colors.border}} 
                  placeholder="Saddexda magac..." 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                {errors.name && <span style={{color: colors.error, fontSize: '11px', marginTop: '4px'}}>{errors.name}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Culayska (kg)</label><input type="text" value={formData.culays || ''} style={inputStyle} placeholder="70" onChange={e => setFormData({...formData, culays: e.target.value})} /></div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Nooca Dhiigga</label>
                <select value={formData.dhiiga || ""} onChange={e => setFormData({...formData, dhiiga: e.target.value})} style={inputStyle}>
                  <option value="" disabled>Dooro...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* Dhirirka */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Dhirirka (cm)</label>
                <input 
                  type="text" 
                  value={formData.dhirirka || ''} 
                  style={{...inputStyle, borderColor: errors.dhirirka ? colors.error : colors.border}} 
                  placeholder="175" 
                  onChange={e => setFormData({...formData, dhirirka: e.target.value})} 
                />
                {errors.dhirirka && <span style={{color: colors.error, fontSize: '11px', marginTop: '4px'}}>{errors.dhirirka}</span>}
              </div>

              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Goobta Dhalashada</label><input type="text" value={formData.goobta_dhalashada || ''} style={inputStyle} placeholder="Magaalada..." onChange={e => setFormData({...formData, goobta_dhalashada: e.target.value})} /></div>
              
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Taariikhda Dhalashada</label><input type="date" value={formData.tariikhda_dhalashada || ''} style={inputStyle} onChange={e => setFormData({...formData, tariikhda_dhalashada: e.target.value})} /></div>

              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" onClick={handleSubmit} style={{ ...buttonPrimaryStyle, flex: 1 }}>Keydi Xogta</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ ...buttonDangerStyle, padding: '12px 24px' }}>Xir Foomka</button>
              </div>
            </form>
              </div>
            )}
            
             <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>Liiska Guud</h3>
                <input type="text" placeholder="Raadi magac ama ID..." onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 15px', width: '250px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none' }} />
              </div>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={{ ...tableCellStyle, color: colors.white }}>Sawir</th>
                    <th style={{ ...tableCellStyle, color: colors.white }}>Sarkaal ID</th>
                    <th style={{ ...tableCellStyle, color: colors.white }}>Magaca</th>
                    <th style={{ ...tableCellStyle, color: colors.white }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(item => {
                    const isSent = initiatedList.some(i => i.sarkaal_data_id === item.id);
                    return (
                      <tr key={item.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }} onMouseEnter={() => setHoveredRowId(item.id)} onMouseLeave={() => setHoveredRowId(null)}>
                        <td style={tableCellStyle}><img src={`http://localhost:5000/${item.profile_pic}`} width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.primaryLight}` }} alt="profile" /></td>
                        <td style={tableCellStyle}>{item.sarkaal_id}</td>
                        <td style={tableCellStyle}>{item.name}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => toggleInitiate(item)} disabled={isSent} style={{ background: isSent ? colors.backgroundAlt : colors.success, color: isSent ? colors.textMuted : colors.white, border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>{isSent ? 'Sent to MO' : 'Initiate'}</button>
                            {isSent && <button 
                            onClick={() => {
                              setItemToCancel(item);
                              setShowCancelModal(true);
                            }} 
                            style={{ 
                              padding: '6px 12px', 
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
                          <button onClick={() => handleEditClick(item)} style={{ padding: '6px 12px', background: colors.primaryLight, color: colors.primary, border: `1px solid ${colors.primary}`, borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <h3 style={{ color: colors.text, marginTop: 0, fontSize: '18px', fontWeight: '600' }}>1. WAITING LIST</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={{ ...tableCellStyle, color: colors.white }}>No.</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Sawir</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>ID</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Magaca</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Xaaladda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initiatedList.filter(item => item.status === 'Pending').map((item, index) => (
                      <tr key={item.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={tableCellStyle}>{index + 1}</td>
                        <td style={tableCellStyle}><img src={`http://localhost:5000/${item.profile_pic}`} width="40" height="40" style={{ borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.primaryLight}` }} alt="profile" /></td>
                        <td style={tableCellStyle}>{item.sarkaal_id}</td>
                        <td style={tableCellStyle}>{item.name}</td>
                        <td style={{ ...tableCellStyle, color: colors.success, fontWeight: '600' }}>Pending</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. Warbixinnada Baaritaanka (Active Records) */}
              <div style={{ ...cardStyle }}>
                <h3 style={{ color: colors.text, fontWeight: '600' }}>RECORDS</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={{ ...tableCellStyle, color: colors.white }}>No.</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Pic</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>ID</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Magaca</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Limitation Type</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Remaining</th>
                      <th style={{ ...tableCellStyle, color: colors.white }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalReports
                      .reduce((acc, current) => {
                        const xogtaHore = acc.find(item => item.sarkaal_id === current.sarkaal_id);
                        if (xogtaHore) {
                          xogtaHore.days = parseInt(xogtaHore.days) + parseInt(current.days);
                          return acc;
                        } else {
                          return [...acc, { ...current }];
                        }
                      }, [])
                      .filter(report => {
                        const maanta = new Date();
                        const taariikhdaLaQoray = new Date(report.created_at);
                        const maalmahaIskuDhafan = parseInt(report.days);
                        const dhamaadka = new Date(taariikhdaLaQoray);
                        dhamaadka.setDate(dhamaadka.getDate() + maalmahaIskuDhafan);
                        const farqigaTime = dhamaadka - maanta;
                        return Math.ceil(farqigaTime / (1000 * 60 * 60 * 24)) > 0;
                      })
                      .map((report, index) => {
                        const maanta = new Date();
                        const taariikhdaLaQoray = new Date(report.created_at);
                        const maalmahaIskuDhafan = parseInt(report.days);
                        const dhamaadka = new Date(taariikhdaLaQoray);
                        dhamaadka.setDate(dhamaadka.getDate() + maalmahaIskuDhafan);
                        const farqigaTime = dhamaadka - maanta;
                        const maalmahaHadhay = Math.ceil(farqigaTime / (1000 * 60 * 60 * 24));

                        const isHovered = hoveredRow === report.id;

                        return (
                          <tr 
                            key={report.id} 
                            onMouseEnter={() => setHoveredRow(report.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            style={{ 
                              borderBottom: `1px solid ${colors.borderLight}`,
                              transition: 'all 0.2s ease',
                              backgroundColor: isHovered ? colors.backgroundAlt : 'transparent',
                              borderLeft: isHovered ? `4px solid ${colors.primary}` : '4px solid transparent',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ ...tableCellStyle, fontWeight: isHovered ? '600' : '400' }}>{index + 1}</td> 
                            <td style={tableCellStyle}>
                              <img 
                                src={`http://localhost:5000/${report.profile_pic}`} 
                                width="40" height="40" 
                                style={{
                                  borderRadius: '50%', 
                                  border: isHovered ? `2px solid ${colors.primary}` : `2px solid ${colors.primaryLight}`,
                                  objectFit: 'cover',
                                  transition: '0.2s'
                                }} 
                                alt="profile" 
                              />
                            </td>
                            <td style={tableCellStyle}>{report.sarkaal_id}</td>
                            <td style={{ ...tableCellStyle, color: isHovered ? colors.primary : 'inherit', fontWeight: isHovered ? '600' : '400' }}>
                              {report.name}
                            </td>
                            <td style={tableCellStyle}><b>{report.limitation}</b></td>
                            <td style={tableCellStyle}>
                              <span style={{ 
                                color: maalmahaHadhay <= 1 ? colors.error : colors.success, 
                                fontWeight: '600',
                                background: isHovered ? colors.primaryLight : 'transparent',
                                padding: '4px 8px',
                                borderRadius: '6px'
                              }}>
                                {maalmahaHadhay} Days
                              </span>
                            </td>
                            <td style={tableCellStyle}>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                color: colors.success,
                                fontWeight: '500'
                              }}>
                                <span style={{ 
                                  width: '8px', 
                                  height: '8px', 
                                  backgroundColor: colors.success, 
                                  borderRadius: '50%',
                                  display: 'inline-block'
                                }}></span>
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
                  )}
                    {/* ASKAR PAGE */}
                    {activePage === 'askar' && (
                        <div style={{ 
                          background: '#fcfdfd', 
                          padding: '40px', 
                          borderRadius: '30px', 
                          minHeight: '80vh'
                        }}>
                          {/* Header-ka oo hadda leh Search Bar */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '35px',
                            background: 'white',
                            padding: '20px 30px',
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                          }}>
                            <div>
                            <h2 style={{ color: '#1a2e26', margin: 0, fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                              Xogta Guud ee Askarta
                            </h2>
                            <p style={{ color: '#889891', margin: '5px 0 0 0', fontSize: '14px' }}>Diiwaanka rasmiga ah ee ciidanka</p>
                          </div>
                            {/* SEARCH BAR CUSUB */}
                            <div style={{ position: 'relative', width: '400px' }}>
                            <input 
                              type="text" 
                              placeholder="Ku raadi Magaca ama ID-ga..." 
                              onChange={(e) => setSearchTerm(e.target.value)} // Hubi inaad haysato [searchTerm, setSearchTerm] = useState('')
                              style={{ 
                                width: '100%', 
                                padding: '12px 20px 12px 45px', 
                                borderRadius: '14px', 
                                border: '1px solid #edf2f0', 
                                background: '#f8faf9',
                                fontSize: '14px',
                                outline: 'none',
                                transition: '0.3s'
                              }} 
                            />
                                    
                             <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>
                                🔍
                              </span>
                            </div>
                          </div>


                          {/* Table-ka oo hadda la sifeeyay (Filtered) */}
                          <div style={{ overflowX: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                              <thead>
                                <tr style={{ textAlign: 'left' }}>
                                  <th style={{ padding: '10px 20px', color: '#000000', fontSize: '13px' }}>No</th>
                                  <th style={{ padding: '10px 20px', color: '#000000', fontSize: '13px' }}>Sarkaal</th>
                                  <th style={{ padding: '10px 20px', color: '#000000', fontSize: '13px' }}>Xogta Jirka</th>
                                  <th style={{ padding: '10px 20px', color: '#000000', fontSize: '13px' }}>Dhalashada</th>
                                  <th style={{ padding: '10px 20px', color: '#000000', fontSize: '13px', textAlign: 'center' }}>Maareynta</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data
                                  .filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.sarkaal_id.toString().includes(searchTerm)
                                  )
                                  .map((item, index) => {
                                    const isHovered = hoveredRowId === item.id;
                                    return (
                                      <tr 
                                        key={item.id} 
                                        onMouseEnter={() => setHoveredRowId(item.id)}
                                        onMouseLeave={() => setHoveredRowId(null)}
                                        style={{ 
                                          backgroundColor: 'white',
                                          boxShadow: isHovered ? '0 10px 30px rgba(0,0,0,0.05)' : 'none',
                                          transform: isHovered ? 'translateY(-2px)' : 'none',
                                          transition: '0.3s all ease'
                                        }}
                                      >
                                        <td style={{ padding: '20px', borderRadius: '18px 0 0 18px', fontWeight: '700', color: '#d1dbd6' }}>
                                          {index + 1}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <img 
                                              src={`http://localhost:5000/${item.profile_pic}`} 
                                              width="45" height="45" 
                                              style={{ borderRadius: '12px', objectFit: 'cover' }} 
                                              alt="" 
                                            />
                                            <div>
                                              <div style={{ fontWeight: '700', color: '#1a2e26' }}>{item.name}</div>
                                              <div style={{ fontSize: '12px', color: '#27ae60' }}>ID: {item.sarkaal_id}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{ background: '#f0f7ff', color: '#007bff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{item.culays}kg</span>
                                            <span style={{ background: '#fff1f0', color: '#e74c3c', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{item.dhiiga}</span>
                                          </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.goobta_dhalashada}</div>
                                          <div style={{ fontSize: '11px', color: '#889891' }}>{new Date(item.tariikhda_dhalashada).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '20px', borderRadius: '0 18px 18px 0', textAlign: 'center' }}>
                                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      {/* VIEW BUTTON - Super Minimal Text */}
                                      <button 
                                          onClick={() => { setViewedSarkaal(item); setActivePage('view'); }} 
                                          style={{ 
                                              background: 'none', 
                                              color: '#6b7280', 
                                              border: 'none', 
                                              padding: '4px 8px', 
                                              cursor: 'pointer', 
                                              fontSize: '12px', 
                                              fontWeight: '600',
                                              letterSpacing: '0.5px',
                                              textTransform: 'uppercase',
                                              transition: 'color 0.2s'
                                          }}
                                          onMouseOver={(e) => e.target.style.color = '#10b981'}
                                          onMouseOut={(e) => e.target.style.color = '#6b7280'}
                                      >
                                          View
                                      </button>

                                                {/* EDIT BUTTON - Minimalist SVG Icon */}
                                                <button 
                                                    onClick={() => handleEditClick(item)} 
                                                    style={{ 
                                                        border: 'none', 
                                                        background: 'none', 
                                                        padding: '5px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>

                                                {/* DELETE BUTTON - Minimalist SVG Icon */}
                                                <button 
                                                    onClick={() => handleDeleteSarkaal(item.id)} 
                                                    style={{ 
                                                        border: 'none', 
                                                        background: 'none', 
                                                        padding: '5px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                          </div>
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
                    {/* --- XISAABTA TOTAL REST (Halkan ayaan ku xisaabinaynaa si aan u isticmaallno) --- */}
                    {(() => {
                      const totalRestDays = medicalReports
                        .filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id && r.limitation === 'Yattak Istirihat')
                        .reduce((sum, report) => sum + Number(report.days || 0), 0);

                      // 1. Notification Logic: Haddii ay 45 gaarto
                      if (totalRestDays >= 45) {
                        // Tusaale ahaan: Waxaad isticmaali kartaa Window Alert ama Custom Notification
                        // alert(`Ogeysiis: Sarkaalka ${viewedSarkaal.name} ee Horinta 1aad wuxuu gaaray xadkii loogu talagalay (${totalRestDays} Maalmood). Fadlan la xiriir Taliyaha Ururka.`);
                      }

                      return (
                        <>
                          <button onClick={() => setActivePage('askar')} style={{ marginBottom: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬅ Back to List</button>
                          
                          <div style={{ display: 'flex', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', alignItems: 'center', gap: '40px', marginBottom: '30px' }}>
                            <img src={`http://localhost:5000/${viewedSarkaal.profile_pic}`} style={{ width: '150px', height: '150px', borderRadius: '15px', objectFit: 'cover', border: '5px solid #1a2a6c' }} alt="profile" />
                            <div>
                              <h1 style={{ margin: '0 0 10px 0', color: '#1a2a6c', fontSize: '32px' }}>{viewedSarkaal.name}</h1>
                              <p style={{ margin: '5px 0', fontSize: '18px', color: '#555' }}>Sarkaal ID: <b style={{ color: '#1a2a6c' }}>{viewedSarkaal.sarkaal_id}</b></p>
                              
                              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <div style={{ padding: '10px 20px', background: '#e8f4fd', borderRadius: '10px', display: 'inline-block' }}>
                                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a2a6c' }}>
                                    Visits Count: {medicalReports.filter(r => r.sarkaal_id === viewedSarkaal.sarkaal_id).length} Jeer
                                  </span>
                                </div>

                                {/* --- Qaybta Xadka (Color Change at 40) --- */}
                                <div style={{ 
                                  padding: '10px 20px', 
                                  // Haddii ay 40 gaarto wuxuu noqonayaa CAS (Red), haddii kale midabkii hore
                                  background: totalRestDays >= 40 ? '#f8d7da' : '#fef9e7', 
                                  borderRadius: '10px', 
                                  border: totalRestDays >= 40 ? '2px solid #dc3545' : '1px solid #f39c12', 
                                  display: 'inline-block' 
                                }}>
                                  <span style={{ 
                                    fontSize: '16px', 
                                    fontWeight: 'bold', 
                                    // Qoraalkana wuxuu isku beddelayaa Cas haddii ay 40 gaarto
                                    color: totalRestDays >= 40 ? '#721c24' : '#d35400' 
                                  }}>
                                    Total Rest: {totalRestDays} Maalmood {totalRestDays >= 40 && "⚠️"}
                                  </span>
                                </div>
                              </div>

                              {/* Notification Box: Kaliya soo baxaya haddii ay 45 gaarto */}
                              {totalRestDays >= 45 && (
                                <div 
                                  onClick={() => alert(`Sarkaalka: ${viewedSarkaal.name}\nHorinta: 1aad\nXaalka: Wuxuu dhaafay xadka caafimaadka!`)}
                                  style={{ 
                                    marginTop: '15px', 
                                    padding: '15px', 
                                    background: '#dc3545', 
                                    color: 'white', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    animation: 'pulse 2s infinite' // Waxaad ku dari kartaa animation haddii aad rabto
                                  }}
                                >
                                  🔔 Ogeysiis: Taliyaha Ururka! Sarkaalkaan wuxuu gaaray xadkii loogu talagalay.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Medical History Table (Koodhkaaga intiisa kale) */}
                          <div style={{ background: 'white', padding: '30px', borderRadius: '15px' }}>
                            <h3 style={{ color: '#1a2a6c', borderBottom: '3px solid #fdbb2d', paddingBottom: '10px', marginBottom: '20px' }}>Medical History</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #1a2a6c' }}>
                                  <th style={thStyle}>Date</th> <th style={thStyle}>Diagnosis</th><th style={thStyle}>Limitation</th><th style={thStyle}>Days</th> <th style={thStyle}>Referral </th>
                                </tr>
                              </thead>
                              <tbody>
                                {medicalReports.filter(report => report.sarkaal_id === viewedSarkaal.sarkaal_id).map((report, index) => (
                                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tdStyle}>{new Date(report.created_at).toLocaleDateString()}</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#d9534f' }}>{report.diagnosis}</td>
                                    <td style={tdStyle}>{report.limitation}</td>
                                    <td style={tdStyle}><span style={{ background: '#fcf8e3', padding: '4px 10px', borderRadius: '5px', color: '#8a6d3b' }}>{report.days} Maalmood</span></td>
                                    <td style={pad15}>
                                      {report.referrals === 'Yes' ? <span style={{ color: '#5bc0de', fontWeight: 'bold' }}>Yes</span> : <span style={{ color: '#5cb85c', fontWeight: 'bold' }}>No</span>}
                                    </td>
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
                {activePage === 'analytics' && (
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
                      { title: 'Total Personnel', value: data.length, icon: <Users size={24}/>, color: '#5d5fef' },
                      { title: 'In Queue', value: initiatedList.length, icon: <LayoutDashboard size={24}/>, color: '#f1c40f' },
                      { title: 'Medical Reports', value: medicalReports.length, icon: <FileText size={24}/>, color: '#27ae60' },
                      { title: 'New Alerts', value: '12', icon: <Bell size={24}/>, color: '#e74c3c' }
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

                  {/* --- CHARTS SECTION (Mockup) --- */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    
                    {/* Monthly Activity Chart */}
                    <div style={{ background: darkMode ? '#1e1e1e' : '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                      <h4 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Monthly Medical Activity</h4>
                      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px', padding: '10px 0' }}>
                        {/* Tusaale ahaan Garaaf fudud oo CSS ah */}
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                          <div key={i} style={{ flex: 1, backgroundColor: '#5d5fef', height: `${h}%`, borderRadius: '5px 5px 0 0', opacity: 0.8 }}></div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#888', fontSize: '12px' }}>
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                      </div>
                    </div>
                      {/* --- RECENT ACTIVITY SECTION --- */}
                      <div style={{ 
                        marginTop: '30px', 
                        background: darkMode ? '#1e1e1e' : '#fff', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Dhaqdhaqaaqii Ugu Dambeeyay</h4>
                          <button style={{ background: 'none', border: 'none', color: '#5d5fef', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                            Arag dhamaan
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {/* Waxaan soo qaadaynaa 5-ta qof ee ugu dambeysa ee liiska 'data' ku jira */}
                          {data.slice(-5).reverse().map((sarkaal, index) => (
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
                                  borderRadius: '10px', 
                                  backgroundColor: '#5d5fef22', 
                                  display: 'flex', 
                                  justifyContent: 'center', 
                                  alignItems: 'center',
                                  color: '#5d5fef',
                                  fontWeight: 'bold',
                                  fontSize: '14px'
                                }}>
                                  {sarkaal.name.charAt(0)}
                                </div>
                                <div>
                                  <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{sarkaal.name}</h5>
                                  <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>ID: {sarkaal.sarkaal_id} • {sarkaal.goobta_dhalashada}</p>
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
                                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#aaa' }}>Hadda</p>
                              </div>
                            </div>
                          ))}

                          {data.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>Wali wax dhaqdhaqaaq ah ma jiro.</p>
                          )}
                        </div>
                      </div>
                    
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
                        position: 'fixed', top: '25px', right: '25px', zIndex: 9999,
                        animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}>
                        <div style={{
                          minWidth: '320px', padding: '16px 20px', borderRadius: '16px',
                          display: 'flex', alignItems: 'center', gap: '15px',
                          boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
                          background: notification.type === 'success' ? '#ffffff' : '#ffffff',
                          borderLeft: `6px solid ${notification.type === 'success' ? '#27ae60' : '#e74c3c'}`,
                          color: '#1a2e26'
                        }}>
                          <div style={{
                            background: notification.type === 'success' ? '#eafaf1' : '#fff5f5',
                            borderRadius: '12px', padding: '8px', display: 'flex'
                          }}>
                            {notification.type === 'success' ? (
                              <svg width="22" height="22" viewBox="0 0 20 20" fill="#27ae60"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            ) : (
                              <svg width="22" height="22" viewBox="0 0 20 20" fill="#e74c3c"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>{notification.type === 'success' ? 'Guul' : 'Cilad'}</p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{notification.message}</p>
                          </div>
                        </div>
                        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
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
                            onClick={() => { setShowEditForm(false); setErrors({}); }} 
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
                              onChange={(e) => setEditingSarkaal({...editingSarkaal, profile_pic: e.target.files[0]})} 
                            />
                            {errors.profile_pic && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.profile_pic}</span>}
                          </div>                 

                          {/* ID Number */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>ID Nambarka</span>
                            <input type="text" value={editingSarkaal.sarkaal_id || ''} onChange={e => setEditingSarkaal({...editingSarkaal, sarkaal_id: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9', border: errors.sarkaal_id ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                            {errors.sarkaal_id && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.sarkaal_id}</span>}
                          </div>

                          {/* Magaca */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Magaca</span>
                            <input type="text" value={editingSarkaal.name || ''} onChange={e => setEditingSarkaal({...editingSarkaal, name: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9', border: errors.name ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                            {errors.name && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.name}</span>}
                          </div>

                          {/* Culayska */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Culayska</span>
                            <input type="text" value={editingSarkaal.culays || ''} onChange={e => setEditingSarkaal({...editingSarkaal, culays: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9', border: errors.culays ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                            {errors.culays && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.culays}</span>}
                          </div>

                          {/* Dhiiga */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Nooca dhiiga</span>
                            <input type="text" value={editingSarkaal.dhiiga || ''} onChange={e => setEditingSarkaal({...editingSarkaal, dhiiga: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9', border: errors.dhiiga ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                            {errors.dhiiga && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.dhiiga}</span>}
                          </div>

                          {/* Dhirirka */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Dhirir</span>
                            <input type="text" value={editingSarkaal.dhirirka || ''} onChange={e => setEditingSarkaal({...editingSarkaal, dhirirka: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9', border: errors.dhirirka ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                            {errors.dhirirka && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.dhirirka}</span>}
                          </div>

                          {/* Goobta Dhalashada */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Goobta Dhalashada</span>
                            <input type="text" value={editingSarkaal.goobta_dhalashada || ''} onChange={e => setEditingSarkaal({...editingSarkaal, goobta_dhalashada: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9', border: errors.goobta_dhalashada ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                            {errors.goobta_dhalashada && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.goobta_dhalashada}</span>}
                          </div>

                          {/* Taariikhda */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#889891' }}>Tariikhda Dhalashada</span>
                            <input type="date" value={editingSarkaal.tariikhda_dhalashada ? String(editingSarkaal.tariikhda_dhalashada).split('T')[0] : ''} onChange={e => setEditingSarkaal({...editingSarkaal, tariikhda_dhalashada: e.target.value})} style={{ ...inputStyle, background: '#f9f9f9', border: errors.tariikhda_dhalashada ? '1px solid #e74c3c' : '1px solid #ddd' }} />
                            {errors.tariikhda_dhalashada && <span style={{ color: '#e74c3c', fontSize: '11px' }}>{errors.tariikhda_dhalashada}</span>}
                          </div>

                          {/* Badhamada Action-ka */}
                          <div style={{ gridColumn: '1/-1', display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button type="submit" style={{ padding: '12px 30px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>
                              Save
                            </button>
                            <button type="button" onClick={() => {setShowEditForm(false); setErrors({});}} style={{ padding: '12px 30px', background: '#f0f2f1', color: '#666', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
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
                      backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                      <div style={{
                        background: 'white', padding: '40px', borderRadius: '24px',
                        width: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                      }}>
                        {/* Icon-ka Digniinta */}
                        <div style={{
                          width: '70px', height: '70px', background: '#fff5f5', borderRadius: '50%',
                          display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px'
                        }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </div>

                        <h2 style={{ margin: '0 0 10px', fontSize: '22px', color: '#1a2e26' }}>Ma hubtaa?</h2>
                        <p style={{ color: '#6b7c75', fontSize: '15px', lineHeight: '1.5', marginBottom: '30px' }}>
                          Ma rabtaa inaad ka saarto safka sarkaalka <br/>
                          <strong style={{ color: '#1a2e26' }}>{itemToCancel?.name}</strong>?
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button 
                            onClick={executeCancelAction}
                            style={{
                              padding: '14px', borderRadius: '12px', border: 'none',
                              background: '#e74c3c', color: 'white', fontWeight: '600',
                              cursor: 'pointer', fontSize: '15px', transition: '0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#c0392b'}
                            onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                          >
                            Haye, Ka saar
                          </button>

                          <button 
                            onClick={() => setShowCancelModal(false)}
                            style={{
                              padding: '14px', borderRadius: '12px', border: '1px solid #edf2f0',
                              background: 'white', color: '#666', fontWeight: '500',
                              cursor: 'pointer', fontSize: '15px'
                            }}
                          >
                            Iska dhaaaf
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

export default S2Dashboard;
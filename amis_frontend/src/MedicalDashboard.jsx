import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FariimahaModal from './FariimahaModal';
import { useAuthUser, getProfilePicUrl } from './authSync';

function MedicalDashboard({ user, onLogout }) {
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); 
  const [selectedHorin, setSelectedHorin] = useState(null); 
  const [allPersonnel, setAllPersonnel] = useState([]); 

  const [patientHistory, setPatientHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReferralSlip, setShowReferralSlip] = useState(false); 
  const [modalMessage, setModalMessage] = useState('');
  
  // Fariimaha state
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [selectedMsgUser, setSelectedMsgUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  // Profile sync state
  const authUser = useAuthUser(user);
  const currentUser = authUser || user || {};
  
  // Reset message state when modal closes
  useEffect(() => {
    if (!showMsgModal) {
      setSelectedMsgUser(null);
      setMessage('');
      setMessages([]);
    }
  }, [showMsgModal]);
  const filterExpiredQueue = (queueList) => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // Milliseconds ku jira 24 saac
  const now = new Date().getTime();

  return queueList.filter(item => {
    const entryTime = new Date(item.created_at).getTime();
    const timeDifference = now - entryTime;

    // Waxay soo celinaysaa oo kaliya kuwa ka yar 24 saac
    return timeDifference < TWENTY_FOUR_HOURS;
  });
};

// Sida loo isticmaalayo markaad xogta soo dhowaynayso
const currentQueue = filterExpiredQueue(queue);
  
  const [medicalData, setMedicalData] = useState({
    limitations: '',
    days: '',
    referrals: '',
    diagnosis: ''
  });

  // --- FUNCTIONS ---
  const fetchQueue = () => {
    axios.get('http://localhost:5000/api/ballan/queue')
      .then(res => {
        const pendingOnes = res.data.filter(p => p.status === 'Pending');
        setQueue(pendingOnes);
      })
      .catch(err => console.log("Queue Error:", err));
  };

  const fetchAllPersonnel = () => {
    axios.get('http://localhost:5000/api/sarkaal-data')
      .then(res => setAllPersonnel(res.data))
      .catch(err => console.error("Xogta Guud Error:", err));
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const handleViewHistory = (personId) => {
    axios.get(`http://localhost:5000/api/medical-records/${personId}`)
      .then(res => {
        setPatientHistory(res.data);
        setShowHistoryModal(true);
      })
      .catch(err => console.error("History Error:", err));
  };

  useEffect(() => {
    fetchQueue();
    fetchAllPersonnel();
    const interval = setInterval(() => { fetchQueue(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setMedicalData({ limitations: '', days: '', referrals: '', diagnosis: '' });
  };

  const executeSave = () => {
    const finalData = {
      queue_id: selectedPatient.id,
      sarkaal_data_id: selectedPatient.sarkaal_data_id,
      diagnosis: medicalData.diagnosis,
      limitation: medicalData.limitations,
      days: medicalData.days,
      referrals: medicalData.referrals
    };

    axios.post(`http://localhost:5000/api/complete-medical`, finalData)
      .then((res) => {
        setModalMessage(`Xogta ${selectedPatient.name} si guul leh ayaa loo keydiyay!`);
        setShowConfirmModal(false);
        // Halkan waa shaqada aad rabtay:
        if (medicalData.referrals === 'Yes') {
            setShowReferralSlip(true); // Fur modal-ka daabacaadda
        } else {
            setShowSuccessModal(true);
            setSelectedPatient(null);
        }
        fetchQueue();
      })
      .catch(err => alert("Khalad ayaa dhacay!"));
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handlePrint = () => {
    window.print();
    setShowReferralSlip(false);
    setSelectedPatient(null);
    setShowSuccessModal(true);
  };

  const filteredPersonnel = allPersonnel.filter(p => p.horinta === selectedHorin);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-slip, #printable-slip * { visibility: visible; }
            #printable-slip { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              padding: 40px; 
              background: white !important;
            }
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #d1d8d5; borderRadius: 10px; }
        `}
      </style>

      {/* SIDEBAR */}
      <aside style={sidebarStyle} className="no-print">
        <div style={{ padding: '25px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #edf2f0' }}>
          <img 
            src={getProfilePicUrl(currentUser.pic || currentUser.profile_pic)} 
            alt="Profile" 
            style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', objectFit: 'cover' }}
            onError={(e) => {
              if (!e.currentTarget.dataset.assetFallback && (currentUser.pic || currentUser.profile_pic)) {
                e.currentTarget.dataset.assetFallback = 'true';
                e.currentTarget.src = `http://localhost:5000/assets/profiles/${String(currentUser.pic || currentUser.profile_pic).replace(/\\/g, '/').split('/').pop()}`;
              } else {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/profiles/default.svg";
              }
            }}
          />
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>
              {currentUser.username || "Medical Officer"}
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#93c5fd', fontWeight: '600' }}>Role: {currentUser.role || 'medic'}</p>
          </div>
        </div>
        
        <nav style={{ padding: '10px' }}>
          <div onClick={() => setActiveTab('queue')} style={activeTab === 'queue' ? navItemActive : navItem}>
              👥 Safka Sugitaanka
          </div>
          <div onClick={() => { setActiveTab('history'); setSelectedHorin(null); }} style={activeTab === 'history' ? navItemActive : navItem}>
              📊 Xogta Guud
          </div>
          <div onClick={() => setShowMsgModal(true)} style={navItem}>
              💬 Fariimaha
          </div>
        </nav>

        <div onClick={handleLogout} style={logoutBtnStyle}>
          <span>➔</span> Logout
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px 60px', marginLeft: '260px' }}>
        
        {activeTab === 'queue' ? (
          <>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1a2e26', margin: 0 }}>Maareynta Baaritaanka Caafimaadka</h1>
                <span style={{ background: '#eafaf1', color: '#27ae60', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Medical Dashboard</span>
              </div>
              <p style={{ color: '#6b7c75', fontSize: '16px', margin: 0 }}>Fadlan ka xulo sarkaalka safka ku jira.</p>
            </div>

            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
              
              {/* QUEUE LIST */}
              <div style={cardStyle}>
              <div style={{ padding: '20px 25px', borderBottom: '1px solid #edf2f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Safka Hadda</h3>
                <span style={{ background: '#eafaf1', color: '#27ae60', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {currentQueue.length} QOF
                </span>
              </div>
              
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {currentQueue.length > 0 ? currentQueue.map(item => {
                  // Function yar oo xisaabinaya waqtiga safka uu ku jiro
                  const calculateTimeInQueue = (startTime) => {
                    const start = new Date(startTime).getTime();
                    const now = new Date().getTime();
                    const diffInMs = now - start;
                    
                    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return `${hours}h ${minutes}m`;
                  };

                  return (
                    <div key={item.id} onClick={() => handleSelectPatient(item)} style={selectedPatient?.id === item.id ? patientCardActive : patientCard}>
                      <img src={`http://localhost:5000/${item.profile_pic}`} width="45" height="45" style={{ borderRadius: '50%', objectFit: 'cover' }} alt="" />
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 3px 0', fontSize: '15px' }}>{item.name}</h4>
                        <span style={{ fontSize: '12px', color: '#889891' }}>ID: {item.sarkaal_id}</span>
                      </div>

                      {/* Halkan waxaan ku badalnay WAITING saacadda tirinaysa */}
                      <div style={{
                        background: '#fef9e7',
                        color: '#f39c12',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: '1px solid #fcf3cf'
                      }}>
                        <span style={{ fontSize: '14px' }}>⏱️</span> 
                        {calculateTimeInQueue(item.created_at)}
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#889891' }}>Safku waa maran yahay</div>
                )}
              </div>
            {/* </div> */}
              </div>

              {/* FORM SECTION */}
              <div style={{ ...cardStyle, flex: 1.4, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 25px', borderBottom: '1px solid #edf2f0' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Foomka Baaritaanka</h3>
                </div>
                
                {selectedPatient ? (
                  <div style={{ padding: '30px' }}>
                     <form onSubmit={handleSaveClick}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                           <div style={inputGroup}>
                              <label style={labelStyle}>Baaritaanka (Diagnosis)</label>
                              <input type="text" style={inputStyle} value={medicalData.diagnosis} onChange={e => setMedicalData({...medicalData, diagnosis: e.target.value})} placeholder="Qor baaritaanka..." required />
                           </div>
                           <div style={inputGroup}>
                              <label style={labelStyle}>Xaddidaadda Shaqada</label>
                              <select style={inputStyle} value={medicalData.limitations} onChange={e => setMedicalData({...medicalData, limitations: e.target.value})} required>
                                 <option value="">-- Dooro Nooca --</option>
                                 <option value="Terlik Istirihat">Terlik İstirahat</option>
                                 <option value="Egtim ve Spor Istirihat">Eğitim ve Spor</option>
                                 <option value="Yattak Istirihat">Yatak İstirahat</option>
                                 <option value="sakal Istirihat">Kulayn İstirahat</option>
                              </select>
                           </div>
                           <div style={inputGroup}>
                              <label style={labelStyle}>Maalmaha Fasaxa</label>
                                <select style={inputStyle} value={medicalData.days} onChange={e => setMedicalData({...medicalData, days: e.target.value})} required>
                                 <option value="">-- Dooro --</option>
                                 <option value="0">Fasax La'aan</option>
                                 <option value="1">1 Maalin</option>
                                 <option value="2">2 Maalin</option>
                                 <option value="3">3 Maalin</option>
                                 <option value="4">4 Maalin</option>
                                 <option value="5">5 Maalin</option>
                                 <option value="6">6 Maalin</option>
                                 <option value="7">7 Maalin</option>
                                 <option value="14">2 Todobaad</option>
                                 <option value="21">3 Todobaad</option>
                                 <option value="28">4 Todobaad</option>
                                 <option value="30">1 Bil</option>
                          
                              </select>
                           </div>
                           <div style={inputGroup}>
                              <label style={labelStyle}>U Gudbin Specialized?</label>
                              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                 <label style={{ cursor: 'pointer' }}><input type="radio" name="ref" value="Yes" checked={medicalData.referrals === 'Yes'} onChange={e => setMedicalData({...medicalData, referrals: e.target.value})} /> Haa</label>
                                 <label style={{ cursor: 'pointer' }}><input type="radio" name="ref" value="No" checked={medicalData.referrals === 'No'} onChange={e => setMedicalData({...medicalData, referrals: e.target.value})} /> Maya</label>
                              </div>
                           </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                           <button type="submit" style={saveBtn}>Keydi Xogta Baaritaanka</button>
                           <button type="button" onClick={() => setSelectedPatient(null)} style={cancelBtn}>Ka Noqo</button>
                        </div>
                     </form>
                  </div>
                ) : (
                  <div style={emptyStateStyle}>
                    <div style={{ background: '#f1f4f2', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>📄</div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1a2e26' }}>Ma jiro bukaan la doortay</h4>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* XOGTA GUUD SECTION */
          <div>
            <h1 style={{ marginBottom: '30px', fontWeight: '800' }}>Xogta Guud ee Askarta</h1>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
              {[1, 2, 3, 4].map(num => (
                <div key={num} onClick={() => setSelectedHorin(`Horinta ${num}aad`)} style={selectedHorin === `Horinta ${num}aad` ? horinCardActive : horinCardStyle}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>HORINTA {num}AAD</h3>
                </div>
              ))}
            </div>
            {selectedHorin && (
              <div style={cardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8faf9', color: '#6b7c75' }}>
                    <tr>
                      <th style={thStyle}>Profile</th>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPersonnel.map(person => (
                      <tr key={person.id} style={{ borderBottom: '1px solid #edf2f0' }}>
                        <td style={tdStyle}><img src={`http://localhost:5000/${person.profile_pic}`} width="35" height="35" style={{ borderRadius: '8px' }} alt="" /></td>
                        <td style={tdStyle}>{person.sarkaal_id}</td>
                        <td style={tdStyle}>{person.name}</td>
                        <td style={tdStyle}><button onClick={() => handleViewHistory(person.id)} style={viewActionBtn}>View History</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* 1. CONFIRM SAVE */}
      {showConfirmModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Ma hubtaa?</h3>
            <p>Ma hubtaa inaad kaydiso baaritaanka <strong>{selectedPatient?.name}</strong>?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={executeSave} style={saveBtn}>Haa, Keydi</button>
              <button onClick={() => setShowConfirmModal(false)} style={cancelBtn}>Maya</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REFERRAL SLIP (PRINTABLE) */}
      {showReferralSlip && (
        <div style={modalOverlayStyle}>
          <div id="printable-slip" style={{ background: 'white', padding: '40px', borderRadius: '15px', width: '600px', textAlign: 'left', border: '2px solid #27ae60' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>REFERRAL FORM</h2>
                <p style={{ margin: '5px 0' }}>RECEP TAYYIP ERDOGAN HOSPITAL</p>
                <small>Mogadishu, Somalia</small>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <p><strong>Patient Name:</strong> {selectedPatient?.name}</p>
                <p><strong>Officer ID:</strong> {selectedPatient?.sarkaal_id}</p>
                <p><strong>Diagnosis:</strong> {medicalData.diagnosis}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '150px', borderBottom: '1px solid black' }}></div>
                    <p style={{ fontSize: '12px' }}>Medical Officer Signature</p>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed #ccc' }}>
                    <p style={{ fontSize: '10px', color: '#ccc' }}>STAMP HERE</p>
                </div>
            </div>

            <div className="no-print" style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button onClick={handlePrint} style={{ ...saveBtn, background: '#27ae60', color: 'white' }}>🖨️ Daabac Referral-ka</button>
                <button onClick={() => setShowReferralSlip(false)} style={cancelBtn}>Xir</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUCCESS MODAL */}
      {showSuccessModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
             <h2 style={{ color: '#27ae60' }}>✓ Guul!</h2>
             <p>{modalMessage}</p>
             <button onClick={() => setShowSuccessModal(false)} style={saveBtn}>OK</button>
          </div>
        </div>
      )}

      {/* 4. HISTORY MODAL */}
      {showHistoryModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: '600px' }}>
            <h2 style={{ borderBottom: '2px solid #27ae60', paddingBottom: '10px' }}>Taariikhda Caafimaadka</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left', marginTop: '20px' }}>
              {patientHistory.map((h, i) => (
                <div key={i} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <p><strong>📅 {new Date(h.created_at).toLocaleDateString()}</strong></p>
                  <p>🩺 Diagnosis: {h.diagnosis}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHistoryModal(false)} style={cancelBtn}>Xir</button>
          </div>
        </div>
      )}

      {/* 5. FARIIMAHA MODAL */}
      {/* Standardized Fariimaha Modal */}
      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={currentUser} />
    </div>
  );
}

// STYLES
const sidebarStyle = { width: '260px', background: '#1e3a8a', position: 'fixed', height: '100vh', borderRight: 'none', display: 'flex', flexDirection: 'column' };
const navItem = { padding: '10px 14px', margin: '2px 8px', cursor: 'pointer', borderRadius: '8px', color: '#bfdbfe', transition: '0.2s', fontSize: '14px', fontWeight: '500' };
const navItemActive = { ...navItem, background: '#2563eb', color: '#ffffff', fontWeight: '600' };
const logoutBtnStyle = { padding: '10px 14px', margin: '8px', color: '#fca5a5', fontWeight: '600', cursor: 'pointer', background: 'rgba(239,68,68,0.15)', borderRadius: '8px', border: 'none', fontSize: '14px' };
const cardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e2e8f0' };
const patientCard = { display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: '0.2s' };
const patientCardActive = { ...patientCard, background: '#dbeafe', borderRight: '4px solid #1d4ed8' };
const statusBadge = { background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' };
const emptyStateStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8', padding: '40px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#475569' };
const inputStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '14px', color: '#1e293b' };
const saveBtn = { background: '#1d4ed8', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1 };
const cancelBtn = { background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' };
const horinCardStyle = { flex: 1, background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.2s' };
const horinCardActive = { ...horinCardStyle, borderColor: '#1d4ed8', background: '#dbeafe' };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle = { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', color: '#1e293b' };
const viewActionBtn = { background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { background: 'white', padding: '36px', borderRadius: '16px', textAlign: 'center', width: '420px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' };

export default MedicalDashboard;
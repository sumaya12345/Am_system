import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FariimahaModal from './FariimahaModal';
import { useAuthUser, getProfilePicUrl } from './authSync';
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
  inputStyle, 
  labelStyle, 
  badgeStyle, 
  modalOverlayStyle, 
  modalContentStyle, 
  modalHeaderStyle, 
  modalTitleStyle, 
  borderRadius, 
  typography 
} from './designSystem';
import { 
  Clock, 
  CheckCircle2, 
  Activity, 
  Printer, 
  RotateCw, 
  FileText, 
  User, 
  Shield, 
  X 
} from 'lucide-react';

function MedicalDashboard({ user, onLogout }) {
  const [queue, setQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'history'
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
  
  // Profile sync state
  const authUser = useAuthUser(user);
  const currentUser = authUser || user || {};

  const filterExpiredQueue = (queueList) => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    return queueList.filter(item => {
      const entryTime = new Date(item.created_at).getTime();
      return (now - entryTime) < TWENTY_FOUR_HOURS;
    });
  };

  const currentQueue = filterExpiredQueue(queue);
  
  const [medicalData, setMedicalData] = useState({
    limitations: '',
    days: '',
    referrals: '',
    diagnosis: ''
  });

  // --- API CALLS ---
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
      .then(() => {
        setModalMessage(`Xogta baaritaanka ee ${selectedPatient.name} si guul leh ayaa loo keydiyay!`);
        setShowConfirmModal(false);
        if (medicalData.referrals === 'Yes') {
          setShowReferralSlip(true);
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

  const calculateTimeInQueue = (startTime) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diffInMs = now - start;
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      <Sidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeUser={currentUser}
        activePage={activeTab}
        setActivePage={(tab) => {
          if (tab === 'dashboard' || tab === 'queue') setActiveTab('queue');
          else if (tab === 'askar' || tab === 'history') { setActiveTab('history'); setSelectedHorin(null); }
          else setActiveTab(tab);
        }}
        onLogout={handleLogout}
        showMsgModal={showMsgModal}
        setShowMsgModal={setShowMsgModal}
        role="medic"
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
                Xarunta Baaritaanka Caafimaadka
              </h1>
              <span style={{
                ...badgeStyle,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                border: `1px solid ${colors.primaryBorder}`,
                fontWeight: '700',
              }}>
                Medical Officer Portal
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: colors.textMuted, fontSize: '13px' }}>
              Maareynta safka bukaanka, diiwaangelinta natiijooyinka, iyo waraaqaha gudbinta (Referrals).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setActiveTab('queue'); }}
              style={{
                ...(activeTab === 'queue' ? buttonPrimaryStyle : buttonSecondaryStyle),
                padding: '8px 14px',
                fontSize: '13px',
              }}
            >
              <Clock size={15} />
              <span>Safka Sugitaanka ({currentQueue.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('history'); setSelectedHorin(null); }}
              style={{
                ...(activeTab === 'history' ? buttonPrimaryStyle : buttonSecondaryStyle),
                padding: '8px 14px',
                fontSize: '13px',
              }}
            >
              <FileText size={15} />
              <span>Xogta Guud & Taariikhda</span>
            </button>

            <button
              onClick={fetchQueue}
              style={buttonSecondaryStyle}
              title="Refresh Queue"
            >
              <RotateCw size={15} />
            </button>
          </div>
        </div>

        {/* ── ACTIVE TAB: QUEUE & DIAGNOSIS ── */}
        {activeTab === 'queue' && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            
            {/* LEFT: QUEUE LIST */}
            <div style={{ ...cardStyle, width: '360px', padding: 0, overflow: 'hidden', flexShrink: 0 }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: colors.text }}>
                  Safka Hadda
                </h3>
                <span style={{
                  ...badgeStyle,
                  backgroundColor: colors.primaryLight,
                  color: colors.primary,
                  border: `1px solid ${colors.primaryBorder}`,
                }}>
                  {currentQueue.length} Qof
                </span>
              </div>

              <div style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                {currentQueue.length > 0 ? (
                  currentQueue.map((item) => {
                    const isSelected = selectedPatient?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectPatient(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderBottom: `1px solid ${colors.borderLight}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          backgroundColor: isSelected ? colors.primaryLight : colors.white,
                          borderLeft: isSelected ? `4px solid ${colors.primary}` : '4px solid transparent',
                        }}
                      >
                        <img 
                          src={`http://localhost:5000/${item.profile_pic}`} 
                          width="40" 
                          height="40" 
                          style={{ borderRadius: '50%', objectFit: 'cover', border: `1px solid ${colors.border}` }} 
                          alt=""
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 2px', fontSize: '13.5px', fontWeight: isSelected ? '700' : '600', color: colors.text }}>
                            {item.name}
                          </h4>
                          <span style={{ fontSize: '11px', color: colors.textMuted }}>ID: {item.sarkaal_id}</span>
                        </div>
                        <div style={{
                          ...badgeStyle,
                          backgroundColor: '#f1f5f9',
                          color: colors.textSecondary,
                          border: `1px solid ${colors.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Clock size={11} />
                          <span>{calculateTimeInQueue(item.created_at)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
                    Safka baaritaanka waa maran yahay.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: EXAMINATION FORM */}
            <div style={{ ...cardStyle, flex: 1, padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '16px 22px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
                  {selectedPatient ? `Baaritaanka: ${selectedPatient.name}` : 'Foomka Baaritaanka'}
                </h3>
                {selectedPatient && (
                  <span style={{ fontSize: '12px', color: colors.textMuted }}>
                    Sarkaal ID: <strong>{selectedPatient.sarkaal_id}</strong>
                  </span>
                )}
              </div>

              {selectedPatient ? (
                <div style={{ padding: '24px' }}>
                  <form onSubmit={handleSaveClick}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Natiijada Baaritaanka (Diagnosis)</label>
                        <input
                          type="text"
                          style={inputStyle}
                          value={medicalData.diagnosis}
                          onChange={e => setMedicalData({ ...medicalData, diagnosis: e.target.value })}
                          placeholder="Qor cudurka ama xaaladda..."
                          required
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Xaddidaadda Shaqada (Limitations)</label>
                        <select
                          style={inputStyle}
                          value={medicalData.limitations}
                          onChange={e => setMedicalData({ ...medicalData, limitations: e.target.value })}
                          required
                        >
                          <option value="">-- Dooro Nooca --</option>
                          <option value="Terlik Istirihat">Terlik İstirahat</option>
                          <option value="Yattak Istirihat">Yattak İstirahat</option>
                          <option value="Ayahta Istirihat">Ayakta İstirahat</option>
                          <option value="Adeeg Fudud">Adeeg Fudud</option>
                          <option value="Shaqo Caadi">Shaqo Caadi</option>
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Maalmaha Istiraxada (Days)</label>
                        <input
                          type="number"
                          style={inputStyle}
                          value={medicalData.days}
                          onChange={e => setMedicalData({ ...medicalData, days: e.target.value })}
                          placeholder="Tusaale: 3"
                          min="0"
                          required
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Gudbin Isbitaal Weyn (Referral)?</label>
                        <select
                          style={inputStyle}
                          value={medicalData.referrals}
                          onChange={e => setMedicalData({ ...medicalData, referrals: e.target.value })}
                          required
                        >
                          <option value="">-- Dooro Haa ama Maya --</option>
                          <option value="Yes">Haa (Gudbi Isbitaalka Erdogan)</option>
                          <option value="No">Maya (Daaweyn Halkan ah)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: `1px solid ${colors.borderLight}` }}>
                      <button
                        type="button"
                        onClick={() => setSelectedPatient(null)}
                        style={buttonSecondaryStyle}
                      >
                        Ka Noqo
                      </button>
                      <button
                        type="submit"
                        style={buttonPrimaryStyle}
                      >
                        Keydi Baaritaanka
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: colors.textMuted }}>
                  <Activity size={36} style={{ color: colors.primaryBorder, margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '700', color: colors.text }}>
                    Qofna lama dooran
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    Fadlan liiska safka bidix ka dooro sarkaalka aad doonayso inaad baarto.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVE TAB: PERSONNEL & HISTORY VIEW ── */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Horinta 1-4 selection cards using RoleCards */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>Dooro Horinta aad rabto inaad xogteeda aragto:</label>
              <RoleCards
                roles={['1', '2', '3', '4']}
                selectedRole={selectedHorin ? selectedHorin.replace('Horinta ', '').replace('aad', '') : null}
                onSelectRole={(hNum) => setSelectedHorin(`Horinta ${hNum}aad`)}
              />
            </div>

            {selectedHorin && (
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
                    Askarta Diiwaangashan ({selectedHorin})
                  </h3>
                  <span style={{ fontSize: '12px', color: colors.textMuted }}>
                    Wadarta: <strong>{filteredPersonnel.length}</strong>
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={tableHeaderStyle}>
                        <th style={tableHeaderStyle}>Sawir</th>
                        <th style={tableHeaderStyle}>Sarkaal ID</th>
                        <th style={tableHeaderStyle}>Magaca</th>
                        <th style={tableHeaderStyle}>Ficil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersonnel.map(person => (
                        <tr key={person.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                          <td style={tableCellStyle}>
                            <img 
                              src={`http://localhost:5000/${person.profile_pic}`} 
                              width="34" 
                              height="34" 
                              style={{ borderRadius: borderRadius.sm, objectFit: 'cover', border: `1px solid ${colors.border}` }} 
                              alt=""
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
                            />
                          </td>
                          <td style={{ ...tableCellStyle, fontWeight: '600' }}>{person.sarkaal_id}</td>
                          <td style={tableCellStyle}>{person.name}</td>
                          <td style={tableCellStyle}>
                            <button
                              onClick={() => handleViewHistory(person.id)}
                              style={{ ...buttonSecondaryStyle, padding: '5px 12px', fontSize: '12px' }}
                            >
                              Fiiri Taariikhda
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPersonnel.length === 0 && (
                    <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
                      Lama helin askar ka tirsan {selectedHorin}.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}

      {/* 1. CONFIRM SAVE MODAL */}
      {showConfirmModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '420px', textAlign: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: colors.primaryLight,
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '800', color: colors.text }}>
              Xaqiiji Keydinta
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: colors.textMuted, lineHeight: 1.5 }}>
              Ma hubtaa inaad kaydiso baaritaanka sarkaalka <strong>{selectedPatient?.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setShowConfirmModal(false)} style={buttonSecondaryStyle}>
                Ka Noqo
              </button>
              <button onClick={executeSave} style={buttonPrimaryStyle}>
                Haa, Keydi Xogta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REFERRAL SLIP (PRINTABLE) */}
      {showReferralSlip && (
        <div style={modalOverlayStyle}>
          <div id="printable-slip" style={{
            background: 'white',
            padding: '40px',
            borderRadius: borderRadius.xl,
            width: '640px',
            maxWidth: '100%',
            textAlign: 'left',
            border: `2px solid ${colors.primary}`,
            boxShadow: colors.shadowXl,
          }}>
            <div style={{ textAlign: 'center', borderBottom: `2px solid ${colors.border}`, paddingBottom: '18px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                <Shield size={22} color={colors.primary} />
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.primary, letterSpacing: '0.04em' }}>
                  AMIS OFFICIAL REFERRAL SLIP
                </h2>
              </div>
              <p style={{ margin: '2px 0', fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>
                RECEP TAYYIP ERDOGAN HOSPITAL
              </p>
              <small style={{ color: colors.textMuted, fontSize: '11px' }}>Mogadishu, Somalia</small>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: borderRadius.md, border: `1px solid ${colors.border}` }}>
              <div><span style={{ fontSize: '11.5px', color: colors.textMuted }}>Patient Name:</span><div style={{ fontWeight: '700', fontSize: '14px', color: colors.text }}>{selectedPatient?.name}</div></div>
              <div><span style={{ fontSize: '11.5px', color: colors.textMuted }}>Officer ID:</span><div style={{ fontWeight: '700', fontSize: '14px', color: colors.text }}>{selectedPatient?.sarkaal_id}</div></div>
              <div><span style={{ fontSize: '11.5px', color: colors.textMuted }}>Diagnosis:</span><div style={{ fontWeight: '700', fontSize: '14px', color: colors.text }}>{medicalData.diagnosis}</div></div>
              <div><span style={{ fontSize: '11.5px', color: colors.textMuted }}>Date Issued:</span><div style={{ fontWeight: '700', fontSize: '14px', color: colors.text }}>{new Date().toLocaleDateString()}</div></div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '160px', borderBottom: '1px solid #0f172a' }} />
                <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>Medical Officer Signature</p>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 18px', border: `1px dashed ${colors.borderDark}`, borderRadius: borderRadius.sm }}>
                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0, letterSpacing: '0.05em' }}>OFFICIAL STAMP</p>
              </div>
            </div>

            <div className="no-print" style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReferralSlip(false)} style={buttonSecondaryStyle}>
                Xir
              </button>
              <button onClick={handlePrint} style={buttonPrimaryStyle}>
                <Printer size={15} />
                <span>Daabac Waraaqda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUCCESS MODAL */}
      {showSuccessModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '380px', textAlign: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: colors.successBg,
              color: colors.success,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: colors.text }}>
              Guul!
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: colors.textMuted }}>
              {modalMessage}
            </p>
            <button onClick={() => setShowSuccessModal(false)} style={buttonPrimaryStyle}>
              Fahmay (OK)
            </button>
          </div>
        </div>
      )}

      {/* 4. HISTORY MODAL */}
      {showHistoryModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '580px', padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
                Taariikhda Baaritaanka
              </h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '16px' }}>
              {patientHistory.length > 0 ? (
                patientHistory.map((h, i) => (
                  <div key={i} style={{ padding: '12px', borderBottom: `1px solid ${colors.borderLight}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: colors.text }}>
                        📅 {new Date(h.created_at).toLocaleDateString()}
                      </span>
                      <span style={{ ...badgeStyle, backgroundColor: colors.primaryLight, color: colors.primary }}>
                        {h.limitations || 'No restriction'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                      Baaritaanka: <strong>{h.diagnosis}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
                  Taariikh baaritaan hore lama helin.
                </div>
              )}
            </div>
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowHistoryModal(false)} style={buttonSecondaryStyle}>
                Xir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MESSENGER MODAL */}
      <FariimahaModal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} currentUser={currentUser} />
    </div>
  );
}

export default MedicalDashboard;
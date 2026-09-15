import React, { useState } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  KeyRound, 
  Mail, 
  Phone, 
  ArrowLeft, 
  X 
} from 'lucide-react';
import { 
  colors, 
  borderRadius, 
  typography, 
  inputStyle, 
  labelStyle, 
  buttonPrimaryStyle, 
  buttonSecondaryStyle,
  modalOverlayStyle,
  modalContentStyle,
  modalHeaderStyle,
  modalTitleStyle
} from './designSystem';

function LoginPage({ onLogin }) {
  // --- LOGIN STATES ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- FORGOT PASSWORD STATES ---
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Search, 2: Select Method, 3: Verify OTP, 4: Reset Password
  const [identifier, setIdentifier] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [resetMethod, setResetMethod] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');

  // 1. LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username: username,
        password: password
      });

      if (response.data.success) {
        setError('');
        const userData = {
          id: response.data.id,
          username: response.data.username,
          pic: response.data.pic,
          role: response.data.role,
          email: response.data.email, 
          phone: response.data.phone   
        };
        
        sessionStorage.setItem('sessionId', response.data.sessionId);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('currentUser', response.data.role);

        onLogin(response.data.role, userData, response.data.sessionId); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Username ama Password khaldan!');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. FORGOT PASSWORD: SEARCH USER
  const handleSearchUser = async () => {
    if (!identifier) return alert("Fadlan geli Username ama Email");
    try {
      const res = await axios.post('http://localhost:5000/api/search-user', { identifier });
      if (res.data.success) {
        setFoundUser(res.data.user);
        setForgotStep(2);
      }
    } catch (err) {
      alert("User-kaas nidaamka kuma jiro!");
    }
  };

  // 3. FORGOT PASSWORD: SEND OTP
  const handleSendOTP = async () => {
    if (!resetMethod) return alert("Fadlan dooro meesha code-ka laguugu soo dirayo");
    try {
      await axios.post('http://localhost:5000/api/send-otp', { 
        userId: foundUser.id, 
        method: resetMethod 
      });
      setForgotStep(3);
    } catch (err) {
      alert("Code-ka lama diri karo hadda!");
    }
  };

  // 4. FORGOT PASSWORD: VERIFY OTP
  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/verify-otp', {
        userId: foundUser.id,
        otp: otpInput
      });

      if (res.data.success) {
        setForgotStep(4); 
      }
    } catch (err) {
      alert(err.response?.data?.message || "Code-ku waa khalad!");
    }
  };

  // QUICK LOGIN (IF USER REMEMBERS PASSWORD)
  const handleQuickLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username: foundUser.username,
        password: password
      });
      if (res.data.success) {
        const userData = {
          id: res.data.id,
          username: res.data.username,
          pic: res.data.pic,
          role: res.data.role,
          email: res.data.email,
          phone: res.data.phone
        };
        sessionStorage.setItem('sessionId', res.data.sessionId);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('currentUser', res.data.role);

        onLogin(res.data.role, userData, res.data.sessionId);
      }
    } catch (err) {
      alert("Username ama Password-ka waa khalad!");
    }
  };

  // 5. RESET PASSWORD FINALIZE
  const handleResetFinal = async () => {
    if (!otpInput || !newPassword) return alert("Fadlan geli code-ka iyo password-ka cusub");

    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', {
        userId: foundUser.id,
        otp: otpInput, 
        newPassword: newPassword
      });

      if (res.data.success) {
        alert("Password-ka si guul leh ayaa loogu beddelay!");
        setShowForgot(false);
        setForgotStep(1);
      }
    } catch (err) {
      alert("Code-ku waa khaldan yahay ama wuu dhacay!");
    }
  };

  // --- FORGOT PASSWORD MODAL ---
  const renderForgotModal = () => (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, maxWidth: '480px' }}>
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {forgotStep > 1 && (
              <button
                type="button"
                onClick={() => setForgotStep(prev => prev - 1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: '4px' }}
                title="Dib u noqo"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 style={modalTitleStyle}>Dib u Helista Akoonka</h3>
          </div>
          <button
            type="button"
            onClick={() => { setShowForgot(false); setForgotStep(1); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: IDENTIFIER SEARCH */}
        {forgotStep === 1 && (
          <div>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>
              Geli email-kaaga ama username-kaaga si nidaamku u xaqiijiyo akoonkaaga.
            </p>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Email ama Username</label>
              <input 
                style={inputStyle} 
                placeholder="Tusaale: askar@amis.gov.so" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowForgot(false)} 
                style={buttonSecondaryStyle}
              >
                Ka Noqo
              </button>
              <button 
                type="button" 
                onClick={handleSearchUser} 
                style={buttonPrimaryStyle}
              >
                Raadi Akoonka
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RECOVERY METHOD */}
        {forgotStep === 2 && foundUser && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: colors.primaryLight,
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.primaryBorder}`,
              marginBottom: '18px',
            }}>
              <img 
                src={foundUser.pic ? `http://localhost:5000/uploads/${foundUser.pic}` : '/assets/profiles/default.svg'} 
                alt="user" 
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.primary}` }} 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/profiles/default.svg"; }}
              />
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: colors.text }}>{foundUser.username}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>AMIS System Officer</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Dooro habka code-ka laguugu soo dirayo:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  backgroundColor: resetMethod === 'email' ? colors.primaryLight : colors.white,
                }}>
                  <input type="radio" name="method" value="email" onChange={(e) => setResetMethod(e.target.value)} />
                  <Mail size={16} color={colors.primary} />
                  <span style={{ fontSize: '13px', color: colors.text }}>
                    Email: <strong>{foundUser.email || 'Lama helin'}</strong>
                  </span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  backgroundColor: resetMethod === 'phone' ? colors.primaryLight : colors.white,
                }}>
                  <input type="radio" name="method" value="phone" onChange={(e) => setResetMethod(e.target.value)} />
                  <Phone size={16} color={colors.primary} />
                  <span style={{ fontSize: '13px', color: colors.text }}>
                    SMS: <strong>{foundUser.phone || 'Lama helin'}</strong>
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setForgotStep(1)} 
                style={buttonSecondaryStyle}
              >
                Dib u Noqo
              </button>
              <button 
                type="button" 
                onClick={handleSendOTP} 
                style={buttonPrimaryStyle}
              >
                Dir Code-ka
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFY SECURITY CODE */}
        {forgotStep === 3 && (
          <div>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '14px' }}>
              Fadlan geli 6-da rambar ee laguugu soo diray <strong>{resetMethod.toUpperCase()}</strong>.
            </p>
            <div style={{ marginBottom: '18px' }}>
              <input 
                style={{
                  ...inputStyle,
                  height: '44px',
                  textAlign: 'center',
                  fontSize: '20px',
                  letterSpacing: '6px',
                  fontWeight: '700',
                }} 
                placeholder="------" 
                maxLength="6"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setForgotStep(2)} 
                style={buttonSecondaryStyle}
              >
                Dib u Noqo
              </button>
              <button 
                type="button" 
                onClick={handleVerifyOTP} 
                style={buttonPrimaryStyle}
              >
                Xaqiiji Code-ka
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SET NEW PASSWORD */}
        {forgotStep === 4 && (
          <div>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '14px' }}>
              Code-ka waa la xaqiijiyay. Hadda deji password cusub oo sugan.
            </p>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Password Cusub</label>
              <input 
                style={inputStyle} 
                type="password"
                placeholder="Geli password cusub" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                onClick={handleResetFinal} 
                style={buttonPrimaryStyle}
              >
                Cusboonaysii Password-ka
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.white,
      fontFamily: typography.fontFamily,
    }}>
      {/* ── LEFT SHOWCASE HERO ── */}
      <div style={{
        flex: '1 1 50%',
        backgroundColor: colors.sidebar,
        color: colors.white,
        padding: '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderRight: `1px solid ${colors.sidebarBorder}`,
      }}>
        {/* Subtle geometric background embellishment */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 58, 102, 0.4) 0%, rgba(11, 29, 51, 0) 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#16365c',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <Shield size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              AMIS SYSTEM
            </div>
            <div style={{ fontSize: '11px', color: '#93c5fd', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
              Healthcare & Personnel Management
            </div>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div style={{ maxWidth: '440px', margin: '40px 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '11px',
            fontWeight: '600',
            color: '#93c5fd',
            marginBottom: '20px',
          }}>
            <Activity size={13} />
            <span>Secure Enterprise Health Portal</span>
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            lineHeight: 1.25,
            color: '#ffffff',
            marginBottom: '16px',
          }}>
            Centralized Medical & Staff Operations
          </h1>

          <p style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#94a9c4',
            marginBottom: '28px',
          }}>
            AMIS provides unified, role-based records management, diagnostic queues, hospital referral tracking, and secure communications for all division personnel.
          </p>

          {/* Value points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#60a5fa" />
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>High-integrity encrypted personnel data</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#60a5fa" />
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Real-time medical queue synchronization</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#60a5fa" />
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Integrated multi-company reporting</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          &copy; {new Date().getFullYear()} AMIS System. Restricted official access only.
        </div>
      </div>

      {/* ── RIGHT LOGIN FORM CONTAINER ── */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        backgroundColor: colors.background,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: colors.white,
          borderRadius: borderRadius.xl,
          boxShadow: colors.shadowLg,
          border: `1px solid ${colors.border}`,
          padding: '36px 32px',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: colors.text,
              margin: '0 0 6px',
            }}>
              Sign In to AMIS
            </h2>
            <p style={{
              fontSize: '13px',
              color: colors.textMuted,
              margin: 0,
            }}>
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: colors.errorBg,
              border: `1px solid ${colors.errorBorder}`,
              borderRadius: borderRadius.md,
              color: colors.error,
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    ...inputStyle,
                    height: '42px',
                    paddingLeft: '36px',
                  }}
                  placeholder="Geli username..."
                  required
                />
                <User 
                  size={16} 
                  color={colors.textLight} 
                  style={{ position: 'absolute', left: '12px', top: '13px' }} 
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.primary,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    height: '42px',
                    paddingLeft: '36px',
                  }}
                  placeholder="Geli password..."
                  required
                />
                <Lock 
                  size={16} 
                  color={colors.textLight} 
                  style={{ position: 'absolute', left: '12px', top: '13px' }} 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...buttonPrimaryStyle,
                width: '100%',
                height: '42px',
                fontSize: '14px',
              }}
            >
              {isLoading ? 'Xaqiijinaya...' : 'Gal Nidaamka'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </div>

      {showForgot && renderForgotModal()}
    </div>
  );
}

export default LoginPage;
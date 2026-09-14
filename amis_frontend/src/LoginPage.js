import React, { useState } from 'react';
import axios from 'axios';

function LoginPage({ onLogin }) {
  // --- STATES-KA LOGIN-KA ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- STATES-KA FORGOT PASSWORD (TALLAABADA CUSUB) ---
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Search, 2: Select Method, 3: Verify & Reset
  const [identifier, setIdentifier] = useState(''); // Email ama Username
  const [foundUser, setFoundUser] = useState(null);
  const [resetMethod, setResetMethod] = useState(''); // 'email' ama 'phone'
  const [newPassword, setNewPassword] = useState('');
  const [otpInput, setOtpInput] = useState("");
  const [step, setStep] = useState(1); 

  // 1. FUNCTION-KA LOGIN-KA (SI GUUL LEH AYAA LOO KABAY)
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
        
        // Kaydi ka hor inta nidaamku uusan gudbin (sessionStorage only for per-tab isolation)
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

  // 2. FORGOT PASSWORD: RAADINTA USER-KA
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

  // 3. FORGOT PASSWORD: DIRISTA CODE-KA (OTP)
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

  const handleVerifyOTP = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/verify-otp', {
            userId: foundUser.id,
            otp: otpInput
        });

        if (res.data.success) {
            alert("Code-ka waa la xaqiijiyay! Hadda dooro password cusub.");
            setForgotStep(4); 
        }
    } catch (err) {
        alert(err.response?.data?.message || "Code-ku waa khalad!");
    }
  };

  // REFRESH COMPATIBLE FOR QUICK LOGIN
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
           // Kaydi ka hor inta nidaamku uusan gudbin (sessionStorage only for per-tab isolation)
           sessionStorage.setItem('sessionId', res.data.sessionId);
           sessionStorage.setItem('user', JSON.stringify(userData));
           sessionStorage.setItem('currentUser', res.data.role);

            onLogin(res.data.role, userData, res.data.sessionId);
        }
    } catch (err) {
        alert("Username ama Password-ka waa khalad!");
    }
  };

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

  // --- UI-GA MODAL-KA FORGOT PASSWORD ---
  const renderForgotModal = () => (
    <div style={modalOverlay}>
      <div style={modalContent}>
        {forgotStep === 1 && (
          <>
            <h3 style={{marginTop: 0}}>Find Your Account</h3>
            <hr />
            <p style={{fontSize: '14px', color: '#606770'}}>Geli email-kaaga ama username-kaaga si aad u raadiso account-kaaga.</p>
            <input 
              style={inputStyle} 
              placeholder="Email address or username" 
              onChange={(e) => setIdentifier(e.target.value)} 
            />
            <div style={btnGroup}>
              <button onClick={() => setShowForgot(false)} style={cancelBtn}>Cancel</button>
              <button onClick={handleSearchUser} style={searchBtn}>Search</button>
            </div>
          </>
        )}

        {/* STEP 2: DOORASHADA QAABKA CODE-KA LOO DIRAYO */}
        {forgotStep === 2 && foundUser && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <button 
                onClick={() => setForgotStep(1)} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#606770' }}
                title="Dib u noqo"
              >
                ←
              </button>
              <h3 style={{ margin: 0, color: '#1c1e21' }}>Reset Your Password</h3>
            </div>

            <hr style={{ border: '0.5px solid #ddd', marginBottom: '15px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '20px 0', padding: '10px', backgroundColor: '#f5f6f7', borderRadius: '8px' }}>
              <img 
                src={foundUser.pic ? `http://localhost:5000/uploads/${foundUser.pic}` : 'https://via.placeholder.com/50'} 
                alt="user" 
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1877f2' }} 
              />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{foundUser.username}</div>
                <div style={{ fontSize: '13px', color: '#606770' }}>AMIS System User</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: '#1c1e21', fontWeight: '600' }}>Xasuusataa Password-ka?</p>
                <input 
                  type="password" 
                  placeholder="Geli password-kaaga" 
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
                <button 
                  onClick={handleQuickLogin} 
                  style={{ marginTop: '10px', width: '100%', backgroundColor: '#42b72a', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Log In
                </button>
              </div>

              <p style={{ fontSize: '14px', textAlign: 'center', color: '#606770' }}>--- AMA ---</p>

              <p style={{ fontSize: '14px', fontWeight: '600' }}>Sidee jeceshahay inaan kuu soo dirno code-ka?</p>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="radio" name="method" value="email" onChange={(e) => setResetMethod(e.target.value)} />
                  <span style={{ fontSize: '14px' }}>Send code via email ({foundUser.email})</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '12px' }}>
                  <input type="radio" name="method" value="phone" onChange={(e) => setResetMethod(e.target.value)} />
                  <span style={{ fontSize: '14px' }}>Send code via SMS ({foundUser.phone})</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button 
                onClick={() => setForgotStep(1)} 
                style={{ padding: '10px 20px', backgroundColor: '#e4e6eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendOTP} 
                style={{ padding: '10px 25px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* STEP 3: XAQIIJINTA CODE-KA */}
        {forgotStep === 3 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <button 
                onClick={() => setForgotStep(2)} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#606770' }}
              >
                ←
              </button>
              <h3 style={{ margin: 0 }}>Enter Security Code</h3>
            </div>
            <hr style={{ border: '0.5px solid #ddd' }} />
            <p style={{ fontSize: '14px', margin: '15px 0' }}>
              Fadlan geli code-ka 6-da rambar ah ee laguugu soo diray <b>{resetMethod}</b>.
            </p>
            
            <input 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }} 
              placeholder="Geli Code-ka (6-digits)" 
              maxLength="6"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)} 
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={handleVerifyOTP} 
                style={{ padding: '10px 25px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Verify Code
              </button>
            </div>
          </>
        )}

        {forgotStep === 4 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <button 
                onClick={() => setForgotStep(3)} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#606770' }}
              >
                ←
              </button>
              <h3 style={{ margin: 0 }}>Reset Your Password</h3>
            </div>
            <hr style={{ border: '0.5px solid #ddd' }} />
            <p style={{ fontSize: '14px', margin: '15px 0' }}>
              Code-ka waa la xaqiijiyay. Geli password cusub.
            </p>

            <input 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
              type="password"
              placeholder="Geli Password cusub" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} 
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={handleResetFinal} 
                style={{ padding: '10px 25px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Update Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={titleStyle}>AMIS System Login</h2>

        {error && <p style={errorStyle}>{error}</p>}

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            placeholder="Geli Username"
            required
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="Geli Password"
            required
          />
        </div>

        <button type="submit" disabled={isLoading} style={buttonStyle}>
          {isLoading ? 'Loading...' : 'Login'}
        </button>

        <div style={{textAlign: 'center', marginTop: '15px'}}>
           <button 
             type="button" 
             onClick={() => setShowForgot(true)} 
             style={forgotLinkBtn}
           >
             Forgot password?
           </button>
        </div>
      </form>

      {showForgot && renderForgotModal()}
    </div>
  );
}

/* Styles ennui... (Koodhkaaga hoose sidiisii baa loo daayay) */
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' };
const formStyle = { background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)', width: '380px' };
const titleStyle = { textAlign: 'center', color: '#1c1e21', marginBottom: '20px', fontSize: '24px' };
const errorStyle = { color: '#f02849', textAlign: 'center', marginBottom: '15px', fontSize: '14px', background: '#ffebe8', padding: '10px', borderRadius: '4px' };
const inputGroupStyle = { marginBottom: '15px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#1c1e21', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '14px', border: '1px solid #dddfe2', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '12px', background: '#1a2a6c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' };
const forgotLinkBtn = { background: 'none', border: 'none', color: '#1877f2', fontSize: '14px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '20px', borderRadius: '8px', width: '450px', boxShadow: '0 12px 28px rgba(0,0,0,0.2)', textAlign: 'left' };
const btnGroup = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #dddfe2', paddingTop: '15px' };
const cancelBtn = { padding: '10px 20px', background: '#e4e6eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#4b4f56' };
const searchBtn = { padding: '10px 20px', background: '#1877f2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

export default LoginPage;
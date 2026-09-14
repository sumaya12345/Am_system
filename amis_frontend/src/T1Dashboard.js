import React, { useState } from 'react';

function T1Dashboard({ user }) {
    const [activePage, setActivePage] = useState('dashboard');

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Segoe UI' }}>
            
            {/* Sidebar-ka T1 */}
            <aside style={{ width: '220px', background: '#2c3e50', color: 'white', padding: '20px', position: 'fixed', height: '100vh' }}>
                <h2 style={{ textAlign: 'center', borderBottom: '1px solid #455a64', paddingBottom: '15px', fontSize: '20px' }}>T1 Panel</h2>
                <nav style={{ marginTop: '30px' }}>
                    <div style={navItemStyle(activePage === 'dashboard')} onClick={() => setActivePage('dashboard')}>📊 Dashboard</div>
                    <div style={navItemStyle(activePage === 'askar')} onClick={() => setActivePage('askar')}>🪖 Xogta Askarta</div>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '30px', marginLeft: '220px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>Dashboard-ka T1</h1>
                    <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Welcome, {user}</span>
                </header>

                {activePage === 'dashboard' && (
                    <div style={contentBoxStyle}>
                        <h3>T1 Dashboard Overview</h3>
                        <p>Ku soo dhawoow dashboard-ka T1. Halkan waxaad ka arki kartaa xogta kooban.</p>
                    </div>
                )}

                {activePage === 'askar' && (
                    <div style={contentBoxStyle}>
                        <h3>Xogta Askarta (T1 View)</h3>
                        <p>Halkan waxaa ka soo muuqan doona shaxda (table) xogta askarta.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

// STYLES
const navItemStyle = (isActive) => ({
    padding: '15px',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: isActive ? '#34495e' : 'transparent',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'background 0.3s',
    marginBottom: '10px',
    fontSize: '16px'
});

const contentBoxStyle = { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };

export default T1Dashboard;
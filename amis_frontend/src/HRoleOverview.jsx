import React from 'react';

const cardStyle = {
  background: '#fff',
  border: '1px solid #edf2f7',
  borderRadius: '14px',
  boxShadow: '0 5px 18px rgba(26, 42, 108, 0.06)',
  padding: '22px'
};

export default function HRoleOverview({ view, pendingQueue, activeRecords, personnel, onViewDetails }) {
  const flaggedPersonnel = personnel.filter((staff) => activeRecords
    .filter((record) => record.sarkaal_id === staff.sarkaal_id && record.limitation === 'Yattak Istirihat')
    .reduce((total, record) => total + Number(record.days || 0), 0) >= 45);

  if (view === 'reports') {
    return (
      <section style={cardStyle}>
        <h2 style={{ color: '#1a2a6c', marginTop: 0 }}>Reports</h2>
        {flaggedPersonnel.length > 0 && <div style={{ ...cardStyle, marginBottom: '18px', borderLeft: '4px solid #e74c3c', background: '#fff8f8' }}>
          <strong style={{ color: '#c53030' }}>Notifications</strong>
          {flaggedPersonnel.map((staff) => <button key={staff.id} onClick={() => onViewDetails(staff)} style={{ display: 'block', marginTop: '8px', padding: 0, border: 0, background: 'transparent', color: '#c53030', cursor: 'pointer' }}>Sarkaalka {staff.name} wuxuu gaaray 45 maalmood.</button>)}
        </div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '22px' }}>
          {[
            ['Pending', pendingQueue.length, '#fdbb2d'],
            ['Processed', activeRecords.length, '#5d5fef'],
            ['Personnel', personnel.length, '#27ae60'],
            ['Referred', activeRecords.filter((record) => record.referrals === 'Yes').length, '#e74c3c']
          ].map(([label, value, color]) => (
            <div key={label} style={{ ...cardStyle, padding: '16px', borderTop: `4px solid ${color}` }}>
              <span style={{ color: '#718096', fontSize: '12px', fontWeight: '700' }}>{label}</span>
              <strong style={{ display: 'block', marginTop: '8px', color: '#1a2a6c', fontSize: '26px' }}>{value}</strong>
            </div>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#1a2a6c', color: '#fff', textAlign: 'left' }}>
              {['Date', 'Name', 'ID', 'Diagnosis', 'Limitation', 'Days', 'Referral'].map((heading) => <th key={heading} style={{ padding: '12px' }}>{heading}</th>)}
            </tr></thead>
            <tbody>{activeRecords.map((record) => <tr key={record.id} style={{ borderBottom: '1px solid #edf2f7' }}>
              <td style={{ padding: '12px' }}>{record.created_at ? new Date(record.created_at).toLocaleDateString() : '-'}</td>
              <td style={{ padding: '12px' }}>{record.name || '-'}</td>
              <td style={{ padding: '12px' }}>{record.sarkaal_id || '-'}</td>
              <td style={{ padding: '12px' }}>{record.diagnosis || '-'}</td>
              <td style={{ padding: '12px' }}>{record.limitation || '-'}</td>
              <td style={{ padding: '12px' }}>{record.days || 0}</td>
              <td style={{ padding: '12px' }}>{record.referrals || 'No'}</td>
            </tr>)}</tbody>
          </table>
          {activeRecords.length === 0 && <div style={{ padding: '35px', color: '#718096', textAlign: 'center' }}>No reports available.</div>}
        </div>
      </section>
    );
  }

  if (view === 'analytics') {
    const referred = activeRecords.filter((record) => record.referrals === 'Yes').length;
    const restDays = activeRecords.reduce((total, record) => total + Number(record.days || 0), 0);
    return (
      <section>
        <h2 style={{ color: '#1a2a6c', marginTop: 0 }}>Analytics</h2>
        <h3 style={{ color: '#243447' }}>Analytics &amp; Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
          {[
            ['Total Personnel', personnel.length, '#5d5fef'],
            ['In Queue', pendingQueue.length, '#fdbb2d'],
            ['Medical Reports', activeRecords.length, '#27ae60'],
            ['Referred Reports', referred, '#e74c3c'],
            ['Recorded Days', restDays, '#3267a8']
          ].map(([label, value, color]) => <div key={label} style={{ ...cardStyle, borderLeft: `4px solid ${color}` }}>
            <span style={{ color: '#718096', fontSize: '12px' }}>{label}</span>
            <strong style={{ display: 'block', marginTop: '8px', color: '#1a2a6c', fontSize: '28px' }}>{value}</strong>
          </div>)}
        </div>
      </section>
    );
  }

  return null;
}

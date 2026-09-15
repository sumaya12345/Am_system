import React from 'react';
import { 
  colors, 
  cardStyle, 
  tableStyle, 
  tableHeaderStyle, 
  tableCellStyle, 
  typography, 
  borderRadius,
  badgeStyle
} from './designSystem';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight 
} from 'lucide-react';

export default function HRoleOverview({ view, pendingQueue, activeRecords, personnel, onViewDetails }) {
  const flaggedPersonnel = personnel.filter((staff) => activeRecords
    .filter((record) => record.sarkaal_id === staff.sarkaal_id && record.limitation === 'Yattak Istirihat')
    .reduce((total, record) => total + Number(record.days || 0), 0) >= 45);

  if (view === 'reports') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Flagged Alert Banner */}
        {flaggedPersonnel.length > 0 && (
          <div style={{
            ...cardStyle,
            padding: '14px 18px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderLeft: `4px solid ${colors.error}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.error, fontWeight: '700', fontSize: '13.5px' }}>
              <AlertCircle size={17} />
              <span>Ogeysiis: Saraakiisha Gaaray 45 Maalmood ee Istiraxada</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {flaggedPersonnel.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => onViewDetails(staff)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 0',
                    border: 0,
                    background: 'transparent',
                    color: colors.error,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    textAlign: 'left',
                  }}
                >
                  <ArrowUpRight size={14} />
                  <span>Sarkaalka <strong>{staff.name}</strong> wuxuu gaaray ama dhaafay 45 maalmood.</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metric Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Safka Sugaya', value: pendingQueue.length, icon: AlertCircle },
            { label: 'La Falanqeeyay', value: activeRecords.length, icon: CheckCircle },
            { label: 'Wadarta Askarta', value: personnel.length, icon: Users },
            { label: 'La Gudbiyey (Referral)', value: activeRecords.filter((r) => r.referrals === 'Yes').length, icon: FileText }
          ].map((item) => (
            <div key={item.label} style={{
              ...cardStyle,
              padding: '16px',
              borderTop: `3px solid ${colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </span>
                <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>
                  {item.value}
                </strong>
              </div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: borderRadius.md,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <item.icon size={18} />
              </div>
            </div>
          ))}
        </div>

        {/* Clean Reports Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: colors.text }}>
              Diiwaanka Baaritaannada
            </h3>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              Wadarta: <strong>{activeRecords.length}</strong>
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  {['Taariikh', 'Magaca', 'Sarkaal ID', 'Baaritaanka', 'Xaddidaadda', 'Maalmood', 'Referral'].map((heading) => (
                    <th key={heading} style={tableHeaderStyle}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <td style={tableCellStyle}>{record.created_at ? new Date(record.created_at).toLocaleDateString() : '-'}</td>
                    <td style={{ ...tableCellStyle, fontWeight: '600', color: colors.text }}>{record.name || '-'}</td>
                    <td style={tableCellStyle}>{record.sarkaal_id || '-'}</td>
                    <td style={tableCellStyle}>{record.diagnosis || '-'}</td>
                    <td style={tableCellStyle}>{record.limitation || '-'}</td>
                    <td style={{ ...tableCellStyle, fontWeight: '700' }}>{record.days || 0}</td>
                    <td style={tableCellStyle}>
                      <span style={{
                        ...badgeStyle,
                        backgroundColor: record.referrals === 'Yes' ? colors.primaryLight : '#f1f5f9',
                        color: record.referrals === 'Yes' ? colors.primary : colors.textMuted,
                        border: `1px solid ${record.referrals === 'Yes' ? colors.primaryBorder : colors.border}`,
                      }}>
                        {record.referrals === 'Yes' ? 'Referral: Haa' : 'Maya'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activeRecords.length === 0 && (
              <div style={{ padding: '36px', color: colors.textMuted, textAlign: 'center', fontSize: '13px' }}>
                Warbixinno diiwaangashan lama helin.
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (view === 'analytics') {
    const referred = activeRecords.filter((record) => record.referrals === 'Yes').length;
    const restDays = activeRecords.reduce((total, record) => total + Number(record.days || 0), 0);
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Wadarta Askarta', value: personnel.length, icon: Users },
            { label: 'Safka Sugitaanka', value: pendingQueue.length, icon: AlertCircle },
            { label: 'Warbixinno Caafimaad', value: activeRecords.length, icon: FileText },
            { label: 'La Gudbiyey (Referred)', value: referred, icon: ArrowUpRight },
            { label: 'Isku-darka Maalmaha', value: restDays, icon: CheckCircle }
          ].map((item) => (
            <div key={item.label} style={{
              ...cardStyle,
              padding: '16px',
              borderTop: `3px solid ${colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ color: colors.textMuted, fontSize: '11.5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </span>
                <strong style={{ display: 'block', marginTop: '6px', color: colors.text, fontSize: '24px', fontWeight: '800' }}>
                  {item.value}
                </strong>
              </div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: borderRadius.md,
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <item.icon size={18} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return null;
}

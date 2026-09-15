import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  Send, 
  Paperclip, 
  MessageSquare, 
  Search, 
  User, 
  ShieldCheck,
  Building,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { getAuthUser } from './authSync';
import { 
  colors, 
  modalOverlayStyle, 
  modalContentStyle, 
  borderRadius, 
  typography, 
  buttonPrimaryStyle 
} from './designSystem';

export default function FariimahaModal({ isOpen, onClose, currentUser, darkMode = false }) {
  const activeUser = currentUser || getAuthUser();
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [focusedUserIndex, setFocusedUserIndex] = useState(-1);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    urur: true,
    sarkaal: true,
    horinta: true,
    medical: true
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available users when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setFocusedUserIndex(-1);
      setMessageText('');
      setAttachment(null);
      setMessages([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        
        // Role-based filtering for messaging permissions
        let allowedRoles = [];
        if (activeUser?.role === 'S1') {
          allowedRoles = ['H1', 'Urur', 'medic', 'admin'];
        } else if (activeUser?.role === 'S2') {
          allowedRoles = ['H2', 'Urur', 'medic', 'admin'];
        } else if (activeUser?.role === 'S3') {
          allowedRoles = ['H3', 'Urur', 'medic', 'admin'];
        } else if (activeUser?.role === 'S4') {
          allowedRoles = ['H4', 'Urur', 'medic', 'admin'];
        } else {
          // For other roles (H1-H4, Urur, medic, admin), show all users
          allowedRoles = [];
        }
        
        const mapped = (res.data || [])
          .filter((u) => {
            // Don't show self
            if (u.id === activeUser?.id) return false;
            // Apply role-based filtering if allowedRoles is set
            if (allowedRoles.length > 0) {
              return allowedRoles.includes(u.role);
            }
            return true;
          })
          .map((u) => {
            let displayName = u.username;
            if (u.role === 'Urur') displayName = 'Taliyaha Urur';
            else if (u.role === 'medic') displayName = u.username || 'Sarkaalka Caafimaadka';
            
            return {
              ...u,
              displayName,
            };
          });

        setAvailableUsers(mapped);
      } catch (err) {
        console.error('Error fetching messaging users:', err);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // Poll chat messages for selected user
  useEffect(() => {
    if (!isOpen || !selectedUser || !activeUser?.id) return;

    let isMounted = true;

    const fetchChat = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/chat/${activeUser.id}/${selectedUser.id}`
        );
        if (isMounted) {
          setMessages(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, selectedUser, activeUser?.id]);

  // Send message handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!messageText.trim() && !attachment) || !selectedUser || !activeUser?.id || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('message', messageText.trim());
      formData.append('sender', String(activeUser.id));
      formData.append('receiver', String(selectedUser.id));
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await axios.post('http://localhost:5000/api/messages', formData);
      setMessageText('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Immediately refresh messages
      const res = await axios.get(
        `http://localhost:5000/api/messages/chat/${activeUser.id}/${selectedUser.id}`
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error('Send message error:', err);
      alert('Farriinta lama diri karin. Fadlan hubi xiriirka server-ka.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setMessageText('');
    setAttachment(null);
    setMessages([]);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  // Filter users by search
  const filteredUsers = availableUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const ururUsers = filteredUsers.filter((u) => ['Urur', 'admin'].includes(u.role));
  const sarkaalUsers = filteredUsers.filter((u) => ['S1', 'S2', 'S3', 'S4'].includes(u.role));
  const horintaUsers = filteredUsers.filter((u) => ['H1', 'H2', 'H3', 'H4'].includes(u.role));
  const medicUsers = filteredUsers.filter((u) => u.role === 'medic');
  const focusableUsers = [...ururUsers, ...sarkaalUsers, ...horintaUsers, ...medicUsers];

  const handleDirectoryKeyDown = (event) => {
    if (!focusableUsers.length) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setFocusedUserIndex((currentIndex) => (currentIndex + direction + focusableUsers.length) % focusableUsers.length);
      return;
    }

    if (event.key === 'Enter' && focusedUserIndex >= 0) {
      event.preventDefault();
      event.stopPropagation();
      setSelectedUser(focusableUsers[focusedUserIndex]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setExpandedGroups({ urur: false, sarkaal: false, horinta: false, medical: false });
    }
  };

  const renderUserItem = (u) => {
    const isSelected = selectedUser?.id === u.id;
    const userIndex = focusableUsers.findIndex((user) => user.id === u.id);
    const isFocused = focusedUserIndex === userIndex;
    return (
      <div
        key={u.id}
        onClick={() => {
          setSelectedUser(u);
          setFocusedUserIndex(focusableUsers.findIndex((user) => user.id === u.id));
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            setSelectedUser(u);
          }
        }}
        tabIndex={0}
        role="option"
        aria-selected={isSelected}
        style={{
          padding: '8px 12px',
          marginBottom: '4px',
          borderRadius: borderRadius.md,
          cursor: 'pointer',
          backgroundColor: isSelected ? colors.primaryLight : colors.white,
          borderLeft: isSelected ? `3px solid ${colors.primary}` : '3px solid transparent',
          borderTop: `1px solid ${colors.borderLight}`,
          borderRight: `1px solid ${colors.borderLight}`,
          borderBottom: `1px solid ${colors.borderLight}`,
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          outline: isFocused ? `2px solid ${colors.primary}` : 'none',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isSelected ? colors.primary : '#e2e8f0',
            color: isSelected ? colors.white : colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '12px',
            flexShrink: 0,
          }}
        >
          {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: isSelected ? '700' : '600',
              color: isSelected ? colors.primary : colors.text,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {u.displayName}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                color: isSelected ? colors.primary : colors.textSecondary,
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: '600',
              }}
            >
              {u.role}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={modalOverlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          ...modalContentStyle,
          width: '920px',
          maxWidth: '100%',
          height: '620px',
          maxHeight: '92vh',
          padding: 0,
          display: 'flex',
          overflow: 'hidden',
          borderRadius: borderRadius.xl,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* ── LEFT DIRECTORY PANEL ── */}
        <div
          style={{
            width: '300px',
            borderRight: `1px solid ${colors.border}`,
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.white,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white,
                }}
              >
                <MessageSquare size={15} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: colors.text }}>
                  Fariimaha
                </h3>
                <span style={{ fontSize: '10.5px', color: colors.textMuted }}>
                  Official Messaging
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              title="Xir"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: colors.textMuted,
                padding: '4px',
              }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius.md,
                padding: '6px 10px',
              }}
            >
              <Search size={14} color={colors.textMuted} />
              <input
                type="text"
                placeholder="Raadi sarkaal ama horin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '12px',
                  color: colors.text,
                }}
              />
              {searchQuery && (
                <X
                  size={14}
                  style={{ cursor: 'pointer', color: colors.textMuted }}
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>
          </div>

          {/* Continuous User Directory List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '4px 10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* GROUP: TALIYAHA URUR */}
            {ururUsers.length > 0 && (
              <div>
                <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Taliyaha Urur ({ururUsers.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }} onKeyDown={handleDirectoryKeyDown}>
                  {ururUsers.map(renderUserItem)}
                </div>
              </div>
            )}

            {/* GROUP: SARKAALKA (S1-S4) */}
            {sarkaalUsers.length > 0 && (
              <div>
                <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Saraakiisha S1–S4 ({sarkaalUsers.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }} onKeyDown={handleDirectoryKeyDown}>
                  {sarkaalUsers.map(renderUserItem)}
                </div>
              </div>
            )}

            {/* GROUP: TALIYAHA HORINTA (H1-H4) */}
            {horintaUsers.length > 0 && (
              <div>
                <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Taliyayaasha Horimaha ({horintaUsers.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }} onKeyDown={handleDirectoryKeyDown}>
                  {horintaUsers.map(renderUserItem)}
                </div>
              </div>
            )}

            {/* GROUP: CAAFIMAADKA (medic) */}
            {medicUsers.length > 0 && (
              <div>
                <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Qeybta Caafimaadka ({medicUsers.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }} onKeyDown={handleDirectoryKeyDown}>
                  {medicUsers.map(renderUserItem)}
                </div>
              </div>
            )}

            {availableUsers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: colors.textMuted, fontSize: '12px' }}>
                Lama helin xubno kale.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT CHAT CONVERSATION PANEL ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: colors.white,
            position: 'relative',
          }}
        >
          {selectedUser ? (
            <>
              {/* Active Header */}
              <div
                style={{
                  padding: '12px 18px',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: colors.white,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: colors.primary,
                      color: colors.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '13px',
                    }}
                  >
                    {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: colors.text }}>
                      {selectedUser.displayName}
                    </h4>
                    <span style={{ fontSize: '11px', color: colors.textMuted }}>
                      Role: {selectedUser.role} • Xarunta AMIS
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: borderRadius.sm,
                      padding: '5px 9px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: colors.textSecondary,
                      fontWeight: '600',
                    }}
                  >
                    Xir Qoraalka
                  </button>
                </div>
              </div>

              {/* Messages stream */}
              <div
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  backgroundColor: '#f8fafc',
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Wali farriin lama wadaagin.</p>
                    <p style={{ margin: 0, fontSize: '12px' }}>Ku qor farriinta hoose si aad u bilowdo wadahadalka.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = Number(msg.sender) === Number(activeUser?.id);
                    return (
                      <div
                        key={msg.id || idx}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '72%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: isMine ? colors.primary : colors.white,
                            color: isMine ? colors.white : colors.text,
                            padding: '9px 14px',
                            borderRadius: isMine ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                            fontSize: '13px',
                            lineHeight: '1.45',
                            boxShadow: colors.shadowSm,
                            border: isMine ? 'none' : `1px solid ${colors.border}`,
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.message}

                          {msg.attachment && (
                            <div style={{ marginTop: '6px' }}>
                              <a
                                href={`http://localhost:5000/uploads/${msg.attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: isMine ? 'rgba(255,255,255,0.18)' : '#f1f5f9',
                                  color: isMine ? colors.white : colors.primary,
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  textDecoration: 'none',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}
                              >
                                <Paperclip size={12} />
                                Fiiri Attachment
                              </a>
                            </div>
                          )}
                        </div>

                        {msg.created_at && (
                          <span style={{ fontSize: '9.5px', color: colors.textLight, marginTop: '2px', padding: '0 4px' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '12px 16px',
                  borderTop: `1px solid ${colors.border}`,
                  backgroundColor: colors.white,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachment(e.target.files[0]);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Lifaaq file"
                  style={{
                    background: attachment ? colors.primaryLight : '#f1f5f9',
                    color: attachment ? colors.primary : colors.textMuted,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Paperclip size={16} />
                </button>

                <input
                  type="text"
                  placeholder={attachment ? `File: ${attachment.name} (Geli qoraal...)` : 'Qor farriin rasmi ah...'}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  style={{
                    flex: 1,
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`,
                    fontSize: '13px',
                    color: colors.text,
                    outline: 'none',
                    backgroundColor: colors.white,
                  }}
                />

                <button
                  type="submit"
                  disabled={isSending || (!messageText.trim() && !attachment)}
                  style={{
                    ...buttonPrimaryStyle,
                    height: '36px',
                    padding: '0 14px',
                    fontSize: '13px',
                    opacity: (!messageText.trim() && !attachment) ? 0.6 : 1,
                  }}
                >
                  <Send size={15} />
                  <span>Dir</span>
                </button>
              </form>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                textAlign: 'center',
                color: colors.textMuted,
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary,
                  marginBottom: '14px',
                }}
              >
                <MessageSquare size={24} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: colors.text, fontWeight: '700' }}>
                Xarunta Fariimaha AMIS
              </h4>
              <p style={{ margin: 0, fontSize: '13px', maxWidth: '300px', lineHeight: 1.5 }}>
                Fadlan dhinaca bidix ka dooro qofka aad doonayso inaad la xiriirto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

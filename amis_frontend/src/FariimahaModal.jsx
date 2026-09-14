import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Paperclip, 
  MessageSquare, 
  Search, 
  User, 
  Shield 
} from 'lucide-react';
import { getAuthUser } from './authSync';
import { colors, modalOverlayStyle, modalContentStyle, modalHeaderStyle, modalTitleStyle, buttonPrimaryStyle, buttonSecondaryStyle, inputStyle } from './designSystem';

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
        const colorPalette = ['#5d5fef', '#27ae60', '#f39c12', '#1abc9c', '#e74c3c', '#8e44ad', '#2980b9'];
        
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
          .map((u, idx) => {
            let displayName = u.username;
            if (u.role === 'Urur') displayName = 'Taliyaha Urur';
            else if (u.role === 'medic') displayName = u.username || 'Sarkaalka Caafimaadka';
            
            return {
              ...u,
              displayName,
              color: colorPalette[idx % colorPalette.length]
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
    if ((!messageText.trim() && !attachment) || !selectedUser || !activeUser?.id) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('message', messageText.trim() || '(Attachment)');
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

  // Complete clean unmount: return null when not open
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
          padding: '10px 14px',
          marginBottom: '6px',
          borderRadius: '10px',
          cursor: 'pointer',
          backgroundColor: isSelected
            ? (darkMode ? '#1a2a6c' : '#eef2ff')
            : (darkMode ? '#1e1e2d' : '#ffffff'),
          borderLeft: isSelected ? `4px solid ${u.color || '#5d5fef'}` : '4px solid transparent',
          border: darkMode ? '1px solid #2d2d3f' : '1px solid #f1f3f7',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          outline: isFocused ? '2px solid #5d5fef' : 'none',
          outlineOffset: '-2px'
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: u.color || '#5d5fef',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '13px',
            flexShrink: 0
          }}
        >
          {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: isSelected ? '700' : '600',
              color: darkMode ? '#ffffff' : '#1e293b',
              fontSize: '13.5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {u.displayName}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: darkMode ? '#94a3b8' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span
              style={{
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                color: darkMode ? '#cbd5e1' : '#475569',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '600'
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
      style={{
        ...modalOverlayStyle,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          ...modalContentStyle,
          width: '920px',
          maxWidth: '100%',
          height: '640px',
          maxHeight: '92vh',
          padding: 0,
          display: 'flex',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* LEFT PANEL: DIRECTORY & CONTACTS */}
        <div
          style={{
            width: '320px',
            borderRight: `1px solid ${colors.border}`,
            backgroundColor: colors.backgroundAlt,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.white
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.white
                }}
              >
                <MessageSquare size={16} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: '700',
                    color: colors.text
                  }}
                >
                  Fariimaha
                </h3>
                <span style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                  AMIS Messaging
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              title="Xir Fariimaha (Close)"
              style={{
                background: colors.backgroundAlt,
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: colors.textMuted
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ padding: '12px 14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            >
              <Search size={14} color={colors.textMuted} />
              <input
                type="text"
                placeholder="Raadi qof ama role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '12.5px',
                  color: colors.text
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

          {/* Contact Directory Accordions */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: '0 12px 16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* GROUP: TALIYAHA URUR */}
            {ururUsers.length > 0 && (
              <div
                style={{
                  backgroundColor: colors.white,
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedGroups((p) => ({ ...p, urur: !p.urur }))}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: colors.primaryLight
                  }}
                >
                  <span
                    style={{
                      fontWeight: '700',
                      fontSize: '13px',
                      color: colors.primary
                    }}
                  >
                    Taliyaha Urur ({ururUsers.length})
                  </span>
                  {expandedGroups.urur ? (
                    <ChevronUp size={16} color={colors.textMuted} />
                  ) : (
                    <ChevronDown size={16} color={colors.textMuted} />
                  )}
                </div>
                {expandedGroups.urur && (
                    <div style={{ padding: '8px 10px', maxHeight: '230px', overflowY: 'auto', overscrollBehavior: 'contain' }} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} onKeyDown={handleDirectoryKeyDown}>
                    {ururUsers.map(renderUserItem)}
                  </div>
                )}
              </div>
            )}

            {/* GROUP: SARKAALKA (S1-S4) */}
            {sarkaalUsers.length > 0 && (
              <div
                style={{
                  backgroundColor: darkMode ? '#1e1e2d' : '#ffffff',
                  borderRadius: '10px',
                  border: darkMode ? '1px solid #2d2d3f' : '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedGroups((p) => ({ ...p, sarkaal: !p.sarkaal }))}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: darkMode ? '#252538' : '#f1f5f9'
                  }}
                >
                  <span
                    style={{
                      fontWeight: '700',
                      fontSize: '13px',
                      color: darkMode ? '#ffffff' : '#334155'
                    }}
                  >
                    Sarkaalka ({sarkaalUsers.length})
                  </span>
                  {expandedGroups.sarkaal ? (
                    <ChevronUp size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                  ) : (
                    <ChevronDown size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                  )}
                </div>
                {expandedGroups.sarkaal && (
                    <div style={{ padding: '8px 10px', maxHeight: '230px', overflowY: 'auto', overscrollBehavior: 'contain' }} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} onKeyDown={handleDirectoryKeyDown}>
                    {sarkaalUsers.map(renderUserItem)}
                  </div>
                )}
              </div>
            )}

            {/* GROUP: TALIYAHA HORINTA (H1-H4) */}
            {horintaUsers.length > 0 && (
              <div
                style={{
                  backgroundColor: darkMode ? '#1e1e2d' : '#ffffff',
                  borderRadius: '10px',
                  border: darkMode ? '1px solid #2d2d3f' : '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedGroups((p) => ({ ...p, horinta: !p.horinta }))}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: darkMode ? '#252538' : '#f1f5f9'
                  }}
                >
                  <span
                    style={{
                      fontWeight: '700',
                      fontSize: '13px',
                      color: darkMode ? '#ffffff' : '#334155'
                    }}
                  >
                    Taliyaha Horinta ({horintaUsers.length})
                  </span>
                  {expandedGroups.horinta ? (
                    <ChevronUp size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                  ) : (
                    <ChevronDown size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                  )}
                </div>
                {expandedGroups.horinta && (
                    <div style={{ padding: '8px 10px', maxHeight: '230px', overflowY: 'auto', overscrollBehavior: 'contain' }} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} onKeyDown={handleDirectoryKeyDown}>
                    {horintaUsers.map(renderUserItem)}
                  </div>
                )}
              </div>
            )}

            {/* GROUP: CAAFIMAADKA (medic) */}
            {medicUsers.length > 0 && (
              <div
                style={{
                  backgroundColor: darkMode ? '#1e1e2d' : '#ffffff',
                  borderRadius: '10px',
                  border: darkMode ? '1px solid #2d2d3f' : '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedGroups((p) => ({ ...p, medical: !p.medical }))}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: darkMode ? '#252538' : '#f1f5f9'
                  }}
                >
                  <span
                    style={{
                      fontWeight: '700',
                      fontSize: '13px',
                      color: darkMode ? '#ffffff' : '#334155'
                    }}
                  >
                    Caafimaadka ({medicUsers.length})
                  </span>
                  {expandedGroups.medical ? (
                    <ChevronUp size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                  ) : (
                    <ChevronDown size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                  )}
                </div>
                {expandedGroups.medical && (
                    <div style={{ padding: '8px 10px', maxHeight: '230px', overflowY: 'auto', overscrollBehavior: 'contain' }} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} onKeyDown={handleDirectoryKeyDown}>
                    {medicUsers.map(renderUserItem)}
                  </div>
                )}
              </div>
            )}

            {availableUsers.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px 10px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontSize: '13px'
                }}
              >
                Lama helin xubno kale oo la wadaagi karo fariimo.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT CONVERSATION */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: darkMode ? '#12121a' : '#ffffff',
            position: 'relative'
          }}
        >
          {selectedUser ? (
            <>
              {/* Active Chat Header */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: darkMode ? '1px solid #27273a' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: darkMode ? '#181824' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: selectedUser.color || '#5d5fef',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}
                  >
                    {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '700',
                        color: darkMode ? '#ffffff' : '#0f172a'
                      }}
                    >
                      {selectedUser.displayName}
                    </h4>
                    <span
                      style={{
                        fontSize: '11.5px',
                        color: darkMode ? '#94a3b8' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          display: 'inline-block'
                        }}
                      />
                      Role: {selectedUser.role} • Xog Dhaweyn
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedUser(null)}
                    title="Deselect user"
                    style={{
                      background: darkMode ? '#27273a' : '#f1f5f9',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: darkMode ? '#cbd5e1' : '#475569',
                      fontWeight: '600'
                    }}
                  >
                    Xir Wadahadalka
                  </button>
                  <button
                    onClick={handleClose}
                    title="Xir Fariimaha Guud"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: darkMode ? '#94a3b8' : '#64748b'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Flow */}
              <div
                style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: darkMode ? '#12121a' : '#f8fafc'
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      margin: 'auto',
                      textAlign: 'center',
                      color: darkMode ? '#94a3b8' : '#64748b',
                      fontSize: '13px'
                    }}
                  >
                    <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>Wali farriin lama wadaagin.</p>
                    <p style={{ margin: 0, fontSize: '12px' }}>Ku qor farriinta koowaad qeybta hoose.</p>
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
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: isMine
                              ? '#5d5fef'
                              : (darkMode ? '#222232' : '#ffffff'),
                            color: isMine
                              ? '#ffffff'
                              : (darkMode ? '#f1f5f9' : '#0f172a'),
                            padding: '10px 16px',
                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            fontSize: '13.5px',
                            lineHeight: '1.45',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                            border: isMine
                              ? 'none'
                              : (darkMode ? '1px solid #2e2e42' : '1px solid #e2e8f0'),
                            wordBreak: 'break-word'
                          }}
                        >
                          {msg.message}

                          {/* Render attachment if available */}
                          {msg.attachment && (
                            <div style={{ marginTop: '8px' }}>
                              <a
                                href={`http://localhost:5000/uploads/${msg.attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : (darkMode ? '#2c2c3e' : '#f1f5f9'),
                                  color: isMine ? '#ffffff' : '#5d5fef',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontSize: '11.5px',
                                  fontWeight: '600'
                                }}
                              >
                                <Paperclip size={13} />
                                Fiiri File-ka / Attachment
                              </a>
                            </div>
                          )}
                        </div>

                        {msg.created_at && (
                          <span
                            style={{
                              fontSize: '10px',
                              color: darkMode ? '#64748b' : '#94a3b8',
                              marginTop: '3px',
                              padding: '0 4px'
                            }}
                          >
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
                  padding: '14px 20px',
                  borderTop: darkMode ? '1px solid #27273a' : '1px solid #e2e8f0',
                  backgroundColor: darkMode ? '#181824' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
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
                  title="Ku lifaaq file / attachment"
                  style={{
                    background: attachment ? '#e0e7ff' : (darkMode ? '#27273a' : '#f1f5f9'),
                    color: attachment ? '#4338ca' : (darkMode ? '#cbd5e1' : '#64748b'),
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Paperclip size={17} />
                </button>

                <div style={{ flex: 1, position: 'relative' }}>
                  {attachment && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-32px',
                        left: 0,
                        backgroundColor: darkMode ? '#222232' : '#e0e7ff',
                        color: darkMode ? '#cbd5e1' : '#3730a3',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>File: {attachment.name}</span>
                      <X
                        size={12}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setAttachment(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Qor farriintaada..."
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '24px',
                      border: darkMode ? '1px solid #333348' : '1px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: darkMode ? '#222232' : '#f8fafc',
                      color: darkMode ? '#ffffff' : '#0f172a',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || (!messageText.trim() && !attachment)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '24px',
                    backgroundColor: (!messageText.trim() && !attachment)
                      ? (darkMode ? '#333348' : '#cbd5e1')
                      : '#5d5fef',
                    color: '#ffffff',
                    border: 'none',
                    cursor: (!messageText.trim() && !attachment) ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Send size={15} />
                  <span>{isSending ? 'Dirayaa...' : 'Dir'}</span>
                </button>
              </form>
            </>
          ) : (
            // No user selected state
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                textAlign: 'center',
                color: darkMode ? '#94a3b8' : '#64748b'
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: darkMode ? '#1f1f30' : '#eef2ff',
                  color: '#5d5fef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <MessageSquare size={32} />
              </div>
              <h3
                style={{
                  margin: '0 0 8px 0',
                  color: darkMode ? '#ffffff' : '#0f172a',
                  fontSize: '18px',
                  fontWeight: '700'
                }}
              >
                Wadahadalka AMIS System
              </h3>
              <p style={{ margin: '0 0 20px 0', maxWidth: '340px', fontSize: '13.5px', lineHeight: '1.5' }}>
                Fadlan dhinaca bidix ka dooro sarkaal, taliye ama qeybta caafimaadka si aad ula wadaagto fariimo toos ah.
              </p>
              <button
                onClick={handleClose}
                style={{
                  padding: '8px 18px',
                  backgroundColor: darkMode ? '#27273a' : '#f1f5f9',
                  color: darkMode ? '#cbd5e1' : '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                Xir Daaqadda (Close)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

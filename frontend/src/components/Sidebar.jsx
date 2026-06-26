import React, { useState } from 'react';
import { API_BASE } from '../config';

const Sidebar = ({ 
    sessions, activeSessionId, setActiveSessionId, setMessages, setSessions, 
    isAdmin, isLoggedIn, setIsLoggedIn, handleLogin,
    showDevPanel, setShowDevPanel, targetLanguage, setTargetLanguage, exportLog
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [password, setPassword] = useState('');

  const createNewChat = () => {
      const newSess = { id: Date.now(), name: "New Chat", messages: [{ role: 'assistant', text: "Ready! Upload a new PDF or talk to the Agent." }] };
      setSessions(prev => [newSess, ...prev]);
      setActiveSessionId(newSess.id);
      setMessages(newSess.messages);
  };

  const deleteSession = (id) => {
    const newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
        const blank = [{ id: Date.now(), name: "New Session", messages: [{ role: 'assistant', text: "Ready! Upload a new PDF or talk to the Agent." }] }];
        setSessions(blank);
        setActiveSessionId(blank[0].id);
        setMessages(blank[0].messages);
    } else {
        setSessions(newSessions);
        if (activeSessionId === id) {
            setActiveSessionId(newSessions[0].id);
            setMessages(newSessions[0].messages);
        }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    handleLogin(false);
  };

  return (
    <aside className="chat-history-sidebar glass-panel">
       <button className="new-chat-btn" onClick={createNewChat}>➕ New Chat</button>
       <p className="sidebar-title">Recent Threads</p>
       <div className="sessions-list">
          {sessions.map(s => (
             <div key={s.id} className={`session-item ${s.id === activeSessionId ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setActiveSessionId(s.id); setMessages(s.messages); }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💬 {s.name}</span>
                <span onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }} style={{ color: 'rgba(239, 68, 68, 0.8)', cursor: 'pointer', padding: '0 5px' }} title="Delete Chat">🗑️</span>
             </div>
          ))}
       </div>
       <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <button 
              className="action-btn"
              onClick={() => setShowSettings(!showSettings)}
              style={{ width: '100%', justifyContent: 'center', marginBottom: showSettings ? '0' : '10px' }}
          >
              ⚙️ Settings {showSettings ? '▲' : '▼'}
          </button>

          {showSettings && (
             <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="dev-toggle-btn" onClick={() => setShowDevPanel(!showDevPanel)} style={{ width: '100%' }}>
                  {showDevPanel ? "Close Analytics" : "⚙️ Diagnostics"}
                </button>
                <select className="lang-select" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} style={{ width: '100%' }}>
                   <option value="English">🇺🇸 English</option>
                   <option value="Spanish">🇪🇸 Español</option>
                   <option value="French">🇫🇷 Français</option>
                   <option value="Hindi">🇮🇳 Hindi</option>
                </select>
                <button className="action-btn" onClick={exportLog} style={{ width: '100%' }}>📥 Export Log</button>
             </div>
          )}

          {isLoggedIn ? (
              <button 
                  onClick={handleLogout} 
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px 15px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s', width: '100%' }}
                  onMouseOver={(e) => { e.target.style.background = 'rgba(192, 57, 43, 0.1)'; e.target.style.color = '#C0392B'; e.target.style.borderColor = 'rgba(192, 57, 43, 0.3)' }}
                  onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border-color)' }}
              >
                  🚪 Logout
              </button>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Access as Admin</span>
                  <input 
                      type="password" 
                      placeholder="Access Key" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && password === 'admin') { handleLogin(true); setPassword(''); } }}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem' }}
                  />
                  <button 
                      onClick={() => { if (password === 'admin') { handleLogin(true); setPassword(''); } else alert('Invalid key'); }}
                      className="send-btn"
                      style={{ width: '100%', height: '30px', borderRadius: '6px', fontSize: '0.8rem' }}
                  >
                      Sign In
                  </button>
              </div>
          )}

          <p style={{ textAlign: 'center' }}>Powered by FAISS RAG</p>
       </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../config';
import Sidebar from '../components/Sidebar';
import DevPanel from '../components/DevPanel';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import PdfViewer from '../components/PdfViewer';

const Dashboard = ({ isAdmin, isLoggedIn, setIsLoggedIn, handleLogin }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [messages, setMessages] = useState([]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistoryStr, setChatHistoryStr] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const handsFreeRef = useRef(false);

  const [targetLanguage, setTargetLanguage] = useState('English');
  const [searchMode, setSearchMode] = useState('pdf');
  
  const [metrics, setMetrics] = useState({ uptime: 0, vectors: 0, pdfs: 0, model: 'Llama 3.1' });
  const [showDevPanel, setShowDevPanel] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  // Initialization
  useEffect(() => {
      const key = isAdmin ? "rag_admin_sessions" : "rag_guest_sessions";
      const saved = localStorage.getItem(key);
      let initial = saved ? JSON.parse(saved) : null;
      if (!initial || initial.length === 0) {
          initial = [{ id: Date.now(), name: "First Chat", messages: [{ role: 'assistant', text: isAdmin ? 'Welcome back, Admin. All systems are online.' : 'Welcome Guest. How can I help you today?' }] }];
      }
      setSessions(initial);
      setActiveSessionId(initial[0].id);
      setMessages(initial[0].messages);
  }, [isAdmin]);

  useEffect(() => {
     if (sessions.length === 0) return;
     const sess = sessions.find(s => s.id === activeSessionId) || sessions[0];
     if (sess) {
         setMessages(sess.messages);
         let histStr = "";
         sess.messages.forEach(m => histStr += `${m.role}: ${m.text}\n`);
         setChatHistoryStr(histStr);
     }
  }, [activeSessionId, sessions]);

  useEffect(() => {
      if (messages.length === 0) return;
      setSessions(prev => {
          const updated = prev.map(s => {
              if (s.id === activeSessionId) {
                  return { ...s, messages };
              }
              return s;
          });
          const key = isAdmin ? "rag_admin_sessions" : "rag_guest_sessions";
          localStorage.setItem(key, JSON.stringify(updated));
          return updated;
      });
  }, [messages, activeSessionId, isAdmin]);

  useEffect(() => { endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, uploading]);

  useEffect(() => {
    const pollMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/metrics`);
        const data = await res.json();
        if (res.ok) setMetrics(data);
      } catch(e) {}
    };
    pollMetrics();
    const interval = setInterval(pollMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance();
      msg.text = text.replace(/[*#]/g, '');
      if(targetLanguage === "Spanish") msg.lang = 'es-ES';
      if(targetLanguage === "French") msg.lang = 'fr-FR';
      if(targetLanguage === "Hindi") msg.lang = 'hi-IN';
      
      msg.onend = () => {
         if (handsFreeRef.current) {
             toggleListening();
         }
      };
      window.speechSynthesis.speak(msg);
    }
  };

  const toggleListening = () => {
    if (!SpeechRecognition) return alert("Microphone unsupported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    if(targetLanguage === "Spanish") recognition.lang = 'es-ES';
    if(targetLanguage === "French") recognition.lang = 'fr-FR';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(prev => prev + (prev.endsWith(' ') ? '' : ' ') + transcript);
        if (handsFreeRef.current) {
            handleSend(transcript);
        }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const exportLog = () => {
    let logText = `📚 Document Chat Log (${sessions.find(s=>s.id===activeSessionId)?.name})\n===============================\n\n`;
    messages.forEach(m => { logText += `[${m.role.toUpperCase()}]:\n${m.text}\n\n--------------------\n`; });
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Document_Chat_Log.txt"; a.click(); URL.revokeObjectURL(url);
  };

  const handleSend = async (overrideText = null) => {
    const userMsg = overrideText || input.trim();
    if (!userMsg) return;
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    if(!overrideText) setInput('');
    setLoading(true);
    
    if (messages.length === 1) {
        fetch(`${API_BASE}/api/title`, {
           method: "POST", headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ query: userMsg })
        }).then(r=>r.json()).then(data => {
           setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, name: data.title } : s));
        }).catch(()=>{});
    }

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, chat_history: chatHistoryStr, language: targetLanguage, search_mode: searchMode })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Our backend server rejected the query.");
      
      setMessages(prev => [...prev, { 
        role: 'assistant', text: data.answer, sources: data.sources, suggestions: data.suggestions
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ API Error: ${err.message}` }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (sessions.length === 0) return null; // Wait for initialization

  return (
    <div className={`app-container ${isPdfOpen ? 'split-view' : ''}`}>
      <div className="blob blob-1"></div><div className="blob blob-2"></div>

      <Sidebar 
         sessions={sessions} activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId} 
         setMessages={setMessages} setSessions={setSessions} isAdmin={isAdmin} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handleLogin={handleLogin}
         showDevPanel={showDevPanel} setShowDevPanel={setShowDevPanel} targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage} exportLog={exportLog}
      />

      <DevPanel showDevPanel={showDevPanel} metrics={metrics} />

      <main className="glass-panel main-chat">
        <ChatHeader 
            searchMode={searchMode} setSearchMode={setSearchMode} isAdmin={isAdmin} 
            setUploading={setUploading} setMessages={setMessages} setLoading={setLoading} imageInputRef={imageInputRef} 
            fileInputRef={fileInputRef} uploading={uploading} loading={loading} selectedPdfUrl={selectedPdfUrl} 
            isPdfOpen={isPdfOpen} setIsPdfOpen={setIsPdfOpen} setSessions={setSessions} setActiveSessionId={setActiveSessionId} setSelectedPdfUrl={setSelectedPdfUrl}
        />
        
        <MessageList 
            messages={messages} loading={loading} handsFreeRef={handsFreeRef} 
            handleSpeak={handleSpeak} handleSend={handleSend} endOfMessagesRef={endOfMessagesRef}
            setIsPdfOpen={setIsPdfOpen}
        />

        <ChatInput 
            searchMode={searchMode} targetLanguage={targetLanguage} input={input} setInput={setInput} handleKeyDown={handleKeyDown} 
            handsFreeMode={handsFreeMode} setHandsFreeMode={setHandsFreeMode} handsFreeRef={handsFreeRef} 
            toggleListening={toggleListening} isListening={isListening} handleSend={handleSend} loading={loading}
        />
      </main>

      {(isPdfOpen && selectedPdfUrl) && (
        <PdfViewer selectedPdfUrl={selectedPdfUrl} setIsPdfOpen={setIsPdfOpen} />
      )}
    </div>
  );
};

export default Dashboard;

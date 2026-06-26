import React from 'react';
import { API_BASE } from '../config';

const ChatHeader = ({ 
    searchMode, setSearchMode, 
    isAdmin, setUploading, setMessages, setLoading, imageInputRef, fileInputRef, 
    uploading, loading, selectedPdfUrl, isPdfOpen, setIsPdfOpen, setSessions, setActiveSessionId, setSelectedPdfUrl
}) => {

  const resetDashboard = async () => {
    if (!window.confirm("WARNING: This destroys the AI FAISS Math engine and deletes all cached Chat Sessions completely. Continue?")) return;
    try { 
      const res = await fetch(`${API_BASE}/api/wipe`, { method: "POST" });
      if (!res.ok) alert("Backend Server error: You MUST restart your Python terminal server (Ctrl+C then python server.py) to enable the Wipe feature!");
    } catch (e) {
      alert("Network Error: Make sure your Python backend server is running.");
    }
    
    const key = isAdmin ? "rag_admin_sessions" : "rag_guest_sessions";
    localStorage.removeItem(key);
    const blank = [{ id: Date.now(), name: "New Session", messages: [{ role: 'assistant', text: "Memory Professionally wiped! Ready."}] }];
    setSessions(blank);
    setActiveSessionId(blank[0].id);
    setMessages(blank[0].messages);
    setSelectedPdfUrl(null);
    setIsPdfOpen(false);
  };

  const ingestYouTube = async () => {
    const link = prompt("Enter a standard YouTube URL (e.g. https://www.youtube.com/watch?v=...) to ingest its transcript into the AI FAISS Brain:");
    if (!link) return;
    
    setUploading(true);
    setMessages(prev => [...prev, { role: 'assistant', text: `⏳ Scraping mathematical transcript from YouTube Video and generating vector clusters...` }]);
    
    try {
      const formData = new FormData();
      formData.append("link", link);
      const res = await fetch(`${API_BASE}/api/youtube`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      
      setMessages(prev => [...prev, { role: 'assistant', text: `✅ Successfully multi-mapped YouTube Video into FAISS Vector Space! You can now cross-reference it with the PDFs.` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ Error during YouTube Ingestion: ${err.message}` }]);
    } finally {
      setUploading(false);
    }
  };

  const ingestWebsite = async () => {
    const link = prompt("Enter a Website URL (Wikipedia, Blog, etc.) to securely extract its text into the AI FAISS Brain:");
    if (!link) return;
    
    setUploading(true);
    setMessages(prev => [...prev, { role: 'assistant', text: `⏳ Deploying BeautifulSoup Scraper to extract HTML structure from ${link}...` }]);
    
    try {
      const formData = new FormData();
      formData.append("link", link);
      const res = await fetch(`${API_BASE}/api/scrape`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      
      setMessages(prev => [...prev, { role: 'assistant', text: `✅ Successfully ripped webpage text and structurally mapped it to the Vector Space!` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ Error during Web Scrape: ${err.message}` }]);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const imgUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, { role: 'user', text: "Please analyze this complex chart/diagram in extreme detail.", image: imgUrl }]);
    setLoading(true);

    const formData = new FormData(); 
    formData.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/api/vision`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Vision inference failed.");
      
      setMessages(prev => [...prev, { role: 'assistant', text: `👁️ **Vision Protocol Analysis:**\n\n${data.answer}` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ Vision Error: ${err.message}` }]);
    } finally {
      setLoading(false);
      if (imageInputRef.current) imageInputRef.current.value = null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedPdfUrl(URL.createObjectURL(file));
    setUploading(true);
    setMessages(prev => [...prev, { role: 'assistant', text: `⏳ Analyzing '${file.name}' into vector space...` }]);

    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `✅ **Success!** I have ingested *${file.name}*.\n\n**🤖 Executive Summary:**\n${data.summary}\n\nWhat questions do you have?`,
        pdfButton: true
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ Error: ${err.message}` }]);
      setSelectedPdfUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  return (
    <header className="chat-header">
      <h1>📚 Document Assistant</h1>
      
      <div className="action-bar header-tools">
        <select className="lang-select" value={searchMode} onChange={(e) => setSearchMode(e.target.value)}>
           <option value="pdf">📚 Search PDF Models</option>
           <option value="web">🌐 Explicit Internet Search</option>
        </select>
      </div>

      <div className="action-bar">
        <button className="action-btn danger-btn" onClick={resetDashboard}>🧠 Wipe All</button>
        
        {isAdmin && (
          <>
            <button className="action-btn" style={{color: '#f87171'}} onClick={ingestYouTube} disabled={uploading}>
              {uploading ? "⏳..." : "▶️ YouTube"}
            </button>
            <button className="action-btn" style={{color: '#34d399'}} onClick={ingestWebsite} disabled={uploading}>
              {uploading ? "⏳..." : "🔗 Web Link"}
            </button>
            <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
            <button className="action-btn" style={{color: '#c084fc'}} onClick={() => imageInputRef.current?.click()} disabled={uploading || loading}>
              {loading ? "⏳..." : "📸 Analyze Chart"}
            </button>
            <div className="upload-container">
              <input type="file" accept="application/pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button className="action-btn upload-btn" style={{color: '#60a5fa'}} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? "⏳ Analyzing..." : "➕ Upload Dynamic PDF"}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;

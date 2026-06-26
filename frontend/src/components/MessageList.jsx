import React from 'react';
import TypewriterMessage from './TypewriterMessage';

const MessageList = ({ messages, loading, handsFreeRef, handleSpeak, handleSend, endOfMessagesRef, setIsPdfOpen }) => {
  return (
    <div className="messages-container">
      {messages.map((msg, i) => (
         <div key={i} className={`message-wrapper ${msg.role === 'user' ? 'align-right' : 'align-left'}`}>
           <div className={`message-bubble ${msg.role}`}>
             
             {msg.role === 'assistant' ? (
               <TypewriterMessage msgObj={msg} onComplete={() => {
                   if (handsFreeRef.current) handleSpeak(msg.text);
               }} />
             ) : (
               <>
                 {msg.image && <img src={msg.image} alt="Upload" style={{maxWidth: '100%', borderRadius: '10px', display: 'block', marginBottom: '10px'}} />}
                 <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
               </>
             )}
            
             {msg.pdfButton && (
               <button 
                 className="action-btn"
                 style={{ marginTop: '15px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                 onClick={() => setIsPdfOpen(true)}
               >
                 📄 View Uploaded PDF
               </button>
             )}

             {msg.role === 'assistant' && (
               <div className="ai-buttons">
                 <button className="voice-btn" onClick={() => handleSpeak(msg.text)}>🔊 Translate & Speak</button>
               </div>
             )}

             {msg.suggestions && msg.suggestions.length > 0 && (
               <div className="suggestion-chips">
                  <p className="chip-title">✨ Predictive Follow-Ups:</p>
                  {msg.suggestions.map((sug, idx) => (
                     <button key={idx} className="chip-option" onClick={() => handleSend(sug)}>
                       {sug}
                     </button>
                  ))}
               </div>
             )}
           </div>
         </div>
      ))}
      {loading && (
        <div className="message-wrapper align-left">
          <div className="message-bubble assistant loading-indicator"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;

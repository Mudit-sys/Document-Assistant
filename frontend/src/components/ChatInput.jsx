import React from 'react';

const ChatInput = ({ searchMode, targetLanguage, input, setInput, handleKeyDown, handsFreeMode, setHandsFreeMode, handsFreeRef, toggleListening, isListening, handleSend, loading }) => {
  return (
    <div className="input-area">
      <textarea placeholder={searchMode === 'web' ? 'Ask an open-ended Internet Question...' : `Ask your AI directly in ${targetLanguage}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} />
      
      <button onClick={() => {
         const val = !handsFreeMode;
         setHandsFreeMode(val); handsFreeRef.current = val;
         if(val) toggleListening(); else window.speechSynthesis.cancel();
      }} className={`mic-btn ${handsFreeMode ? 'listening' : ''}`} style={{ width: 'auto', padding: '0 15px', borderRadius: '15px' }} title="Continuous Conversation">
         {handsFreeMode ? "🛑 End Voice Mode" : "🎙️ Advanced Voice Mode"}
      </button>
      
      <button onClick={toggleListening} className={`mic-btn ${isListening && !handsFreeMode ? 'listening' : ''}`} title="Voice Dictation">🎤</button>
      <button onClick={() => handleSend(input)} disabled={!input.trim() || loading} className="send-btn">{loading ? "..." : "Send"}</button>
    </div>
  );
};

export default ChatInput;

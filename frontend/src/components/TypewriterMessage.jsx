import React, { useState, useRef, useEffect } from 'react';

const TypewriterMessage = ({ msgObj, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isStopped, setIsStopped] = useState(false);
  const typeRef = useRef(null);
  
  useEffect(() => {
    if (isStopped) return;
    
    let currentText = "";
    let i = 0;
    
    setDisplayedText("");
    
    const interval = setInterval(() => {
       if (i < msgObj.text.length) {
         currentText += msgObj.text.charAt(i);
         setDisplayedText(currentText);
         
         if(typeRef.current) typeRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
         i++;
       } else {
         clearInterval(interval);
         if (onComplete) onComplete();
       }
    }, 15);
    return () => clearInterval(interval);
  }, [msgObj.text, isStopped]);

  const isDone = displayedText.length === msgObj.text.length || isStopped;

  return (
    <div ref={typeRef}>
       <p style={{ whiteSpace: "pre-wrap" }}>
         {displayedText}{(displayedText.length < msgObj.text.length && !isStopped) ? " █" : ""}
       </p>
       
       {!isDone && (
         <button 
           onClick={() => { setIsStopped(true); if (onComplete) onComplete(); }}
           style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-secondary)', borderRadius: '10px', padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
           onMouseOver={(e) => { e.target.style.color = 'white'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
           onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
         >
           🛑 Stop Generation
         </button>
       )}
       
       {isDone && msgObj.sources && msgObj.sources.length > 0 && (
         <details className="citation-box" style={{ marginTop: '15px' }}>
           <summary>📄 View Source Citations</summary>
           <div className="citation-content">
             {msgObj.sources.map((s, idx) => (
               <div key={idx} className="source-item">
                 <strong>Source {idx + 1}: {s.source_file} (Page {s.page})</strong>
                 <p className="source-snippet">"{s.page_content}"</p>
               </div>
             ))}
           </div>
         </details>
       )}
    </div>
  );
};

export default TypewriterMessage;

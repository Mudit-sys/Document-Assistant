import React from 'react';

const PdfViewer = ({ selectedPdfUrl, setIsPdfOpen }) => {
  return (
    <aside className="pdf-viewer-pane" style={{ position: 'relative' }}>
      <button 
         onClick={() => setIsPdfOpen(false)}
         style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', zIndex: 50, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
      >
         ✖ Close PDF
      </button>
      <iframe src={selectedPdfUrl} title="PDF Viewer" width="100%" height="100%" frameBorder="0" />
    </aside>
  );
};

export default PdfViewer;

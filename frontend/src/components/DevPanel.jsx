import React from 'react';

const DevPanel = ({ showDevPanel, metrics }) => {
  return (
    <div className={`dev-sidebar glass-panel ${showDevPanel ? 'open' : ''}`}>
       <h3>📊 Live AI Metrics</h3>
       <ul>
          <li><strong>Engine:</strong> {metrics.model}</li>
          <li><strong>Vector Dims:</strong> {metrics.vectors} chunks</li>
          <li><strong>Memory Disks:</strong> {metrics.pdfs} Active PDFs</li>
          <li><strong>Uptime:</strong> {metrics.uptime} seconds</li>
          <li><strong>LLM Grounding:</strong> RAG + YouTube</li>
          <li><strong>Web Fallback Agent:</strong> DuckDuckGo</li>
       </ul>
    </div>
  );
};

export default DevPanel;

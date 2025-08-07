import React from 'react';

function AppMinimal() {
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1>🚀 Multi-Agent Dashboard</h1>
      <p>Dashboard is working!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>System Status:</h2>
        <ul>
          <li>✅ Frontend: Running</li>
          <li>✅ Backend: Connected</li>
          <li>✅ Database: Ready</li>
        </ul>
      </div>
    </div>
  );
}

export default AppMinimal;
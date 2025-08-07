import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiCpu, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChatTranscriptModal from './ChatTranscriptModal';
import ActivityPulse from './ActivityPulse';
import AgentManagement from './AgentManagement';
import AgentSetup from './AgentSetup';
import Analytics from './Analytics';
import FilterBar from './FilterBar';
import Documentation from './Documentation';
import NotificationPreferences from './NotificationPreferences';
import MobileNotifications from './MobileNotifications';
import Auth from './Auth';
import ApiKeys from './ApiKeys';
import { sanitizeText, sanitizeJSON, sanitizeSessionId, sanitizeAppName, sanitizeEventType } from './utils/security';

function AppDebug() {
  const [test, setTest] = useState('Testing imports...');
  
  useEffect(() => {
    setTest('✅ React hooks working');
  }, []);

  const testData = [
    { time: '22:50', count: 5 },
    { time: '22:55', count: 8 },
    { time: '23:00', count: 3 }
  ];

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1>🚀 Debug Mode - Step 6</h1>
      <p>Basic React: ✅</p>
      <p>React hooks: {test}</p>
      <p>Date-fns: {format(new Date(), 'HH:mm:ss')}</p>
      <p>React Icons: ✅</p>
      <p>Recharts: ✅</p>
      <p>All Components: ✅</p>
      <p>Testing security utils...</p>
      <p>If you see this, ALL IMPORTS ARE OK!</p>
      <p>Testing sanitize: {sanitizeText('Test<script>alert("xss")</script>')}</p>
    </div>
  );
}

export default AppDebug;
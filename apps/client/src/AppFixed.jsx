import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
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
import { 
  FiCpu, FiVolume2, FiVolumeX, FiDatabase, FiActivity, 
  FiBarChart2, FiTrash2, FiSettings, FiFilter, FiFolder,
  FiArrowRight, FiZap, FiCalendar, FiInbox, FiMaximize2,
  FiGrid, FiUsers, FiMenu, FiBook, FiBell, FiLogOut, FiUser, FiKey
} from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';

function AppFixed() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Check for existing auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Handle authentication
  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-claude-bg flex">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-white mb-4">
          Multi-Agent Observability Dashboard
        </h1>
        <p className="text-white">
          Dashboard is loading! If you see this, the App component is working.
        </p>
        <p className="text-white mt-4">
          User: {user?.name || user?.email || 'Unknown'}
        </p>
      </div>
    </div>
  );
}

export default AppFixed;
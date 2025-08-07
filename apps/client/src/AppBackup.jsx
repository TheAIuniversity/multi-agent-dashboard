import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChatTranscriptModal from './ChatTranscriptModal';
import ActivityPulse from './ActivityPulse';
import { sanitizeText, sanitizeJSON, sanitizeSessionId, sanitizeAppName, sanitizeEventType } from './utils/security';
import { FiBrain, FiVolume2, FiVolumeX, FiDatabase, FiActivity, FiBarChart2, FiTrash2, FiSettings } from 'react-icons/fi';

// Voice notification system
const speak = (text, options = {}) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech first
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.2;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    
    // Function to set voice after voices are loaded
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find a good voice
        const preferredVoices = voices.filter(v => 
          v.name.includes('Daniel') || 
          v.name.includes('Karen') || 
          v.name.includes('Alex') ||
          v.name.includes('Samantha') ||
          v.lang.startsWith('en')
        );
        utterance.voice = preferredVoices[0] || voices[0];
      }
      
      // Add error handling
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event);
      };
      
      utterance.onstart = () => {
        console.log('🔊 Speaking:', text);
      };
      
      speechSynthesis.speak(utterance);
    };
    
    // If voices are already loaded, use them
    if (speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      // Wait for voices to load
      speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
      // Fallback timeout
      setTimeout(setVoice, 100);
    }
  }
};

// Event type icons
const eventIcons = {
  PreToolUse: '🔧',
  PostToolUse: '✅',
  Notification: '🔔',
  Stop: '🛑',
  SubAgentStop: '🤖',
  UserPromptSubmit: '💬',
  PreCompact: '📦'
};

// Event type colors
const eventColors = {
  PreToolUse: 'bg-blue-600',
  PostToolUse: 'bg-orange-600',
  Notification: 'bg-yellow-600',
  Stop: 'bg-red-600',
  SubAgentStop: 'bg-purple-600',
  UserPromptSubmit: 'bg-indigo-600',
  PreCompact: 'bg-orange-600'
};

// Hash string to color for consistent coloring
const hashToColor = (str) => {
  if (!str) return '#666666';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue from hash
  const hue = Math.abs(hash) % 360;
  // Use HSL with good saturation and lightness for visibility
  return `hsl(${hue}, 70%, 50%)`;
};

const getSessionColor = (sessionId) => hashToColor(sessionId);
const getAppColor = (appName) => hashToColor(appName);

function App() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [filters, setFilters] = useState({
    project: 'all',
    app: 'all',
    sessionId: 'all',
    eventType: 'all',
    timeWindow: '5m'
  });
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Start with voice disabled
  const [autoMode, setAutoMode] = useState(false);
  const [transcriptModal, setTranscriptModal] = useState({
    isOpen: false,
    transcript: null,
    sessionId: null
  });
  const [retentionSettings, setRetentionSettings] = useState({
    isOpen: false,
    currentPolicy: 30,
    loading: false
  });
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastEventRef = useRef(null);

  // Connect to WebSocket
  useEffect(() => {
    // Prevent multiple connections
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    
    const connectWebSocket = () => {
      try {
        // Clean up any existing connection
        if (wsRef.current) {
          wsRef.current.close();
        }
        
        const ws = new WebSocket('ws://localhost:8766');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setWsStatus('connected');
          // Clear any pending reconnection
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connection') {
              console.log('Connection confirmed:', data.message);
              if (voiceEnabled) {
                speak('Agent monitoring system connected', { rate: 1.5 });
              }
            } else {
              // Add new event to the list
              setEvents(prev => [data, ...prev].slice(0, 500)); // Keep last 500 events
              
              // Voice notifications ONLY for start/stop and high priority
              if (voiceEnabled) {
                console.log('🔊 Voice check:', data.event_type, data.app, data.payload?.priority);
                
                // Only announce critical events
                if (data.event_type === 'UserPromptSubmit' && data.app.includes('orchestrator')) {
                  speak(`Orchestrator starting new project`, { pitch: 1.0 });
                } else if (data.event_type === 'Stop') {
                  const agentName = data.app.replace('-developer', '').replace('-agent-live', '').replace('-live', '');
                  speak(`Agent ${agentName} completed`, { pitch: 0.9 });
                } else if (data.event_type === 'TaskComplete') {
                  const agentName = data.app.replace('-developer', '').replace('-agent-live', '').replace('-live', '');
                  speak(`${agentName} finished task`, { pitch: 1.0, rate: 1.3 });
                } else if (data.event_type === 'Notification') {
                  // Check for high priority in different payload structures
                  const isHighPriority = data.payload?.priority === 'high' || 
                                         data.summary?.includes('HIGH PRIORITY') ||
                                         data.summary?.includes('🚨');
                  if (isHighPriority) {
                    const message = data.summary?.replace('🚨 HIGH PRIORITY: ', '') || 'System alert';
                    speak(`Alert: ${message}`, { pitch: 1.2, rate: 1.1 });
                  }
                }
                // Skip all other events for voice
              }
              
              lastEventRef.current = data;
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsStatus('error');
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setWsStatus('disconnected');
          wsRef.current = null;
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        };
      } catch (err) {
        console.error('Error creating WebSocket:', err);
        setWsStatus('error');
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    
    // Refresh stats every 5 seconds
    const interval = setInterval(() => {
      fetch('http://localhost:3001/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Error refreshing stats:', err));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter events whenever filters or events change
  useEffect(() => {
    const filtered = events.filter(event => {
      // Project filter - most important filter
      if (filters.project !== 'all') {
        const eventProject = getProjectFromEvent(event);
        if (eventProject !== filters.project) return false;
      }
      
      if (filters.app !== 'all' && event.app !== filters.app) return false;
      if (filters.sessionId !== 'all' && event.session_id !== filters.sessionId) return false;
      if (filters.eventType !== 'all' && event.event_type !== filters.eventType) return false;
      
      // Time window filter
      if (filters.timeWindow !== 'all') {
        const eventTime = new Date(event.timestamp);
        const now = new Date();
        const minutes = parseInt(filters.timeWindow);
        const cutoff = new Date(now - minutes * 60 * 1000);
        if (eventTime < cutoff) return false;
      }
      
      return true;
    });
    
    setFilteredEvents(filtered);
    updateActivityData(filtered);
  }, [events, filters]);

  const loadInitialData = async () => {
    try {
      // Load recent events
      const eventsRes = await fetch('http://localhost:3001/events?limit=100');
      const eventsData = await eventsRes.json();
      setEvents(eventsData);

      // Load stats
      const statsRes = await fetch('http://localhost:3001/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Load retention policy
      const retentionRes = await fetch('http://localhost:3001/retention');
      const retentionData = await retentionRes.json();
      setRetentionSettings(prev => ({ ...prev, currentPolicy: retentionData.retention_days }));

      // Load apps
      const appsRes = await fetch('http://localhost:3001/apps');
      const appsData = await appsRes.json();
      setApps(appsData);

      // Load sessions
      const sessionsRes = await fetch('http://localhost:3001/sessions');
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const updateActivityData = (events) => {
    // Group events by minute for the activity chart
    const now = new Date();
    const data = [];
    
    // Create 5-minute buckets
    for (let i = 4; i >= 0; i--) {
      const time = new Date(now - i * 60 * 1000);
      const bucket = {
        time: format(time, 'HH:mm'),
        count: 0
      };
      
      // Count events in this minute
      events.forEach(event => {
        const eventTime = new Date(event.timestamp);
        const diff = Math.abs(eventTime - time);
        if (diff < 60 * 1000) {
          bucket.count++;
        }
      });
      
      data.push(bucket);
    }
    
    setActivityData(data);
  };

  const getStatusColor = () => {
    switch (wsStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'error': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getUniqueSessionIds = () => {
    const uniqueIds = [...new Set(events.map(e => e.session_id))];
    return uniqueIds;
  };

  const getUniqueProjects = () => {
    // Extract project names from session IDs and event data
    const projects = new Set();
    
    events.forEach(event => {
      // Try to extract project from session_id patterns like "pulsealpha-build-001"
      if (event.session_id && event.session_id !== 'unknown') {
        const match = event.session_id.match(/^([a-zA-Z]+[a-zA-Z0-9]*)/);
        if (match) {
          projects.add(match[1]);
        }
      }
      
      // Try to extract from payload context
      if (event.payload) {
        try {
          const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          if (payload.project) {
            projects.add(payload.project.toLowerCase().replace(/\s+/g, ''));
          }
          if (payload.context && payload.context.project) {
            projects.add(payload.context.project.toLowerCase().replace(/\s+/g, ''));
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Fallback: use app name if it looks like a project (not just agent names)
      if (event.app && !event.app.includes('-') && event.app !== 'orchestrator' && event.app !== 'unknown') {
        projects.add(event.app);
      }
    });
    
    return Array.from(projects).sort();
  };

  const getProjectFromEvent = (event) => {
    // Extract project name from an event for filtering
    if (event.session_id && event.session_id !== 'unknown') {
      const match = event.session_id.match(/^([a-zA-Z]+[a-zA-Z0-9]*)/);
      if (match) return match[1];
    }
    
    if (event.payload) {
      try {
        const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
        if (payload.project) {
          return payload.project.toLowerCase().replace(/\s+/g, '');
        }
        if (payload.context && payload.context.project) {
          return payload.context.project.toLowerCase().replace(/\s+/g, '');
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    if (event.app && !event.app.includes('-') && event.app !== 'orchestrator' && event.app !== 'unknown') {
      return event.app;
    }
    
    return 'unknown';
  };

  const updateRetentionPolicy = async (days) => {
    setRetentionSettings(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch('http://localhost:3001/retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retention_days: days })
      });
      
      if (response.ok) {
        setRetentionSettings(prev => ({ ...prev, currentPolicy: days, loading: false }));
        // Refresh stats
        const statsRes = await fetch('http://localhost:3001/stats');
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error updating retention policy:', error);
      setRetentionSettings(prev => ({ ...prev, loading: false }));
    }
  };

  const runCleanup = async (dryRun = false) => {
    try {
      const response = await fetch('http://localhost:3001/cleanup/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dry_run: dryRun })
      });
      
      const result = await response.json();
      alert(result.message);
      
      if (!dryRun && result.deleted > 0) {
        // Refresh data
        loadInitialData();
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
      alert('Error running cleanup');
    }
  };

  return (
    <div className="min-h-screen bg-claude-bg p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiBrain className="w-8 h-8" />
            Multi-Agent Observability
            {autoMode && (
              <span className="text-sm bg-green-600 px-3 py-1 rounded-full animate-pulse">
                AUTONOMOUS MODE
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-colors ${
                voiceEnabled 
                  ? 'bg-claude-accent text-white border-claude-accent' 
                  : 'bg-claude-surface border-claude-border hover:border-claude-muted'
              }`}
            >
              {voiceEnabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
              <span className="text-sm">Voice</span>
            </button>
            
            <button
              onClick={() => setRetentionSettings(prev => ({ ...prev, isOpen: true }))}
              className="flex items-center gap-2 px-3 py-1 rounded-lg border bg-claude-surface border-claude-border hover:border-claude-muted transition-colors"
            >
              <FiDatabase className="w-4 h-4" />
              <span className="text-sm">Retention ({retentionSettings.currentPolicy}d)</span>
            </button>
            <div className="flex items-center gap-2">
              <div className={`pulse-dot ${getStatusColor()}`} />
              <span className="text-sm text-claude-muted">
                {wsStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <span className="text-sm text-claude-muted">
              localhost:5173
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-claude-surface rounded-lg p-6 border border-claude-border shadow-sm">
        <h3 className="text-sm font-semibold text-claude-muted uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiFilter className="w-4 h-4" />
          <span>Filters</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          <select
            className="filter-select"
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          >
            <option value="all">All Projects</option>
            {getUniqueProjects().map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.app}
            onChange={(e) => setFilters({ ...filters, app: e.target.value })}
          >
            <option value="all">All Apps</option>
            {apps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.sessionId}
            onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
          >
            <option value="all">All Sessions</option>
            {getUniqueSessionIds().map(id => (
              <option key={id} value={id}>{id.substring(0, 8)}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.eventType}
            onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
          >
            <option value="all">All Events</option>
            {Object.keys(eventIcons).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.timeWindow}
            onChange={(e) => setFilters({ ...filters, timeWindow: e.target.value })}
          >
            <option value="1">Last 1 minute</option>
            <option value="5">Last 5 minutes</option>
            <option value="15">Last 15 minutes</option>
            <option value="all">All time</option>
          </select>
        </div>
        
        {/* Active filters display */}
        <div className="flex items-center gap-2 text-sm mt-4 pt-4 border-t border-claude-border">
          <span className="text-claude-muted">Active filters:</span>
          {filters.project !== 'all' && (
            <span className="bg-claude-accent px-3 py-1.5 rounded-md border border-claude-accent text-white font-medium flex items-center gap-1.5">
              <FiFolder className="w-3.5 h-3.5" />
              <span>Project: {filters.project}</span>
            </span>
          )}
          {filters.app !== 'all' && (
            <span className="bg-claude-surface px-2 py-1 rounded border border-claude-border">
              App: {filters.app}
            </span>
          )}
          {filters.sessionId !== 'all' && (
            <span className="bg-claude-surface px-2 py-1 rounded border border-claude-border">
              Session: {filters.sessionId.substring(0, 8)}
            </span>
          )}
          {filters.eventType !== 'all' && (
            <span className="bg-claude-surface px-2 py-1 rounded border border-claude-border">
              Type: {filters.eventType}
            </span>
          )}
          {filters.timeWindow !== 'all' && (
            <span className="bg-claude-surface px-2 py-1 rounded border border-claude-border">
              Time: Last {filters.timeWindow} min
            </span>
          )}
          {(filters.project !== 'all' || filters.app !== 'all' || filters.sessionId !== 'all' || filters.eventType !== 'all' || filters.timeWindow !== 'all') && (
            <button
              onClick={() => setFilters({ project: 'all', app: 'all', sessionId: 'all', eventType: 'all', timeWindow: '5m' })}
              className="text-claude-accent hover:text-claude-accent-hover"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Live Activity Pulse */}
      <div className="mb-8 bg-claude-surface rounded-lg p-6 border border-claude-border shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiActivity className="w-5 h-5 text-claude-accent" />
          <span>Live Activity Pulse</span>
        </h2>
        <ActivityPulse events={events.slice(0, 20)} />
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-claude-surface rounded-lg p-6 border border-claude-border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold mb-1">{stats.total_events}</div>
            <div className="text-sm text-claude-muted font-medium">Total Events</div>
          </div>
          <div className="bg-claude-surface rounded-lg p-6 border border-claude-border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-green-400 mb-1">{stats.active_count}</div>
            <div className="text-sm text-claude-muted font-medium">Active Agents</div>
          </div>
          <div className="bg-claude-surface rounded-lg p-6 border border-claude-border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold mb-1">{apps.length}</div>
            <div className="text-sm text-claude-muted font-medium">Projects</div>
          </div>
          <div className="bg-claude-surface rounded-lg p-6 border border-claude-border shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold mb-1">{filteredEvents.length}</div>
            <div className="text-sm text-claude-muted font-medium">Filtered Events</div>
          </div>
        </div>
      )}
      
      {/* Active Sessions */}
      {stats && stats.active_sessions && stats.active_sessions.length > 0 && (
        <div className="mb-8 bg-claude-surface rounded-lg p-6 border border-claude-border shadow-sm">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <RiRobot2Line className="w-5 h-5" />
            <span>Active Agent Sessions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.active_sessions.map((session) => (
              <div key={`${session.app}-${session.session_id}`} className="bg-claude-bg rounded p-3 border border-green-600/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-green-400">{session.app}</span>
                  <span className="text-xs text-claude-muted">
                    {format(new Date(session.last_activity), 'HH:mm:ss')}
                  </span>
                </div>
                <div className="text-xs text-claude-muted">
                  Session: {session.session_id.substring(0, 8)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Stream */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiBarChart2 className="w-5 h-5" />
          <span>Agent Event Stream</span>
        </h2>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-claude-muted">
            No events to display. Waiting for agent activity...
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id || Math.random()} className="event-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span 
                      className="status-badge px-2 py-1 rounded-l text-xs text-white"
                      style={{ backgroundColor: getAppColor(event.app) }}
                    >
                      {sanitizeAppName(event.app) || 'unknown'}
                    </span>
                    <span 
                      className="text-xs px-2 py-1 rounded-r border-l border-claude-border"
                      style={{ 
                        backgroundColor: getSessionColor(event.session_id),
                        color: 'white'
                      }}
                    >
                      {sanitizeSessionId(event.session_id)?.substring(0, 8) || 'unknown'}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-white ${eventColors[event.event_type] || 'bg-gray-600'}`}>
                    {eventIcons[event.event_type] ? (
                      React.createElement(eventIcons[event.event_type], { className: "w-3.5 h-3.5" })
                    ) : (
                      <FiArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>{sanitizeEventType(event.event_type) || event.event_type}</span>
                  </span>
                </div>
                <span className="text-xs text-claude-muted">
                  {format(new Date(event.timestamp), 'HH:mm:ss')}
                </span>
              </div>
              
              {event.summary && (
                <div className="text-sm text-claude-text mb-2">
                  {sanitizeText(event.summary)}
                </div>
              )}
              
              <div className="flex gap-2">
                {event.payload && (
                  <details className="mt-2 flex-1">
                    <summary className="text-xs text-claude-muted cursor-pointer hover:text-claude-text">
                      View Payload
                    </summary>
                    <pre className="text-xs mt-2 bg-claude-bg p-2 rounded overflow-x-auto" dangerouslySetInnerHTML={{
                      __html: sanitizeJSON(event.payload, 2)
                    }} />
                  </details>
                )}
                
                {event.event_type === 'UserPromptSubmit' && event.payload?.chat_transcript && (
                  <button
                    onClick={() => setTranscriptModal({
                      isOpen: true,
                      transcript: event.payload.chat_transcript,
                      sessionId: event.session_id
                    })}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                  >
                    View Chat Transcript
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Chat Transcript Modal */}
      <ChatTranscriptModal
        isOpen={transcriptModal.isOpen}
        onClose={() => setTranscriptModal({ isOpen: false, transcript: null, sessionId: null })}
        transcript={transcriptModal.transcript}
        sessionId={transcriptModal.sessionId}
      />

      {/* Retention Settings Modal */}
      {retentionSettings.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-claude-surface rounded-lg p-6 max-w-md w-full mx-4 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🗂️ Event Retention Settings</h2>
              <button
                onClick={() => setRetentionSettings(prev => ({ ...prev, isOpen: false }))}
                className="text-claude-muted hover:text-claude-text"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-claude-muted mb-3">
                  How long should we keep event data? Older events will be automatically deleted.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 1, label: '1 Day', Icon: FiZap },
                    { value: 7, label: '1 Week', Icon: FiCalendar },
                    { value: 30, label: '1 Month', Icon: FiCalendar },
                    { value: 90, label: '3 Months', Icon: FiInbox },
                    { value: 365, label: '1 Year', Icon: FiDatabase },
                    { value: null, label: 'Never Delete', Icon: FiMaximize2 }
                  ].map((option) => (
                    <button
                      key={option.value || 'never'}
                      onClick={() => updateRetentionPolicy(option.value)}
                      disabled={retentionSettings.loading}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        retentionSettings.currentPolicy === option.value
                          ? 'bg-claude-accent text-white border-claude-accent'
                          : 'bg-claude-bg border-claude-border hover:border-claude-muted'
                      } ${retentionSettings.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <option.Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">{option.label}</div>
                          {option.value && (
                            <div className="text-xs opacity-75">{option.value} days</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-claude-muted mb-3">Cleanup Actions:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => runCleanup(true)}
                    className="flex-1 px-3 py-2 rounded border border-claude-border hover:border-claude-muted text-sm transition-colors"
                  >
                    <FiSettings className="w-3.5 h-3.5 inline mr-1" />
                    Preview Cleanup
                  </button>
                  <button
                    onClick={() => runCleanup(false)}
                    className="flex-1 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5 inline mr-1" />
                    Run Cleanup Now
                  </button>
                </div>
              </div>
              
              {stats && (
                <div className="bg-claude-bg rounded p-3 text-sm">
                  <div className="text-claude-muted mb-1">Current Database:</div>
                  <div className="flex items-center gap-1.5">
                    <FiBarChart2 className="w-4 h-4" />
                    <span>{stats.total_events} total events</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiDatabase className="w-4 h-4" />
                    <span>Keep for {retentionSettings.currentPolicy === null ? 'forever' : `${retentionSettings.currentPolicy} days`}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
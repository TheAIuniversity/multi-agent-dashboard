import React, { useEffect, useState, useRef } from 'react';

const ActivityPulse = ({ events }) => {
  const [pulseEvents, setPulseEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [processedEventIds, setProcessedEventIds] = useState(new Set());
  const [eventQueue, setEventQueue] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  
  const MAX_CONCURRENT_EVENTS = 7;
  const MIN_CONCURRENT_EVENTS = 6;
  const EVENT_SPAWN_INTERVAL = 4000; // 4 seconds between events (slower)
  const EVENT_LIFETIME = 30000; // 30 seconds to cross screen (slower)
  
  // Generate consistent color for each agent
  const getAgentColor = (agentName) => {
    const colors = [
      '#D97757', // claude orange (was green)
      '#3b82f6', // blue
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#ef4444', // red
      '#D97757', // claude orange (was emerald)
      '#f97316', // orange
      '#6366f1', // indigo
      '#ec4899', // pink
      '#14b8a6', // teal
    ];
    
    // Use agent name to consistently pick a color
    let hash = 0;
    for (let i = 0; i < agentName.length; i++) {
      hash = agentName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Add new events to queue with deduplication
  useEffect(() => {
    // Only process events that have a valid ID and haven't been processed
    const validEvents = events.filter(event => event.id && !processedEventIds.has(event.id));
    
    if (validEvents.length > 0) {
      const queuedEvents = validEvents.map(event => ({
        id: `pulse-${event.id}-${Date.now()}`, // More unique ID to prevent duplicates
        originalEvent: event,
        agent: event.app || 'unknown',
        type: event.event_type || 'unknown',
        icon: getEventIcon(event.event_type),
        color: getAgentColor(event.app || 'unknown'),
        summary: event.summary || 'No summary available',
        timestamp: event.timestamp || new Date().toISOString(),
        payload: event.payload || {},
      }));
      
      setEventQueue(prevQueue => {
        // Further deduplication check in case of race conditions
        const existingIds = new Set(prevQueue.map(e => e.originalEvent.id));
        const uniqueNewEvents = queuedEvents.filter(e => !existingIds.has(e.originalEvent.id));
        return [...prevQueue, ...uniqueNewEvents];
      });
      
      // Update processed events
      const newEventIds = new Set([...processedEventIds, ...validEvents.map(e => e.id)]);
      setProcessedEventIds(newEventIds);
    }
  }, [events, processedEventIds]);

  // Process queue - spawn events at controlled intervals
  useEffect(() => {
    const processQueue = () => {
      setEventQueue(prevQueue => {
        if (prevQueue.length > 0 && activeEvents.length < MAX_CONCURRENT_EVENTS) {
          const [nextEvent, ...remainingQueue] = prevQueue;
          
          // Assign lane (vertical position) to avoid overlap
          const lanes = [10, 20, 30, 40, 50, 60, 70, 80]; // 8 different lanes for more events
          const usedLanes = activeEvents.map(e => e.position);
          const availableLanes = lanes.filter(lane => !usedLanes.includes(lane));
          const selectedLane = availableLanes.length > 0 
            ? availableLanes[Math.floor(Math.random() * availableLanes.length)]
            : lanes[Math.floor(Math.random() * lanes.length)];
          
          const pulseEvent = {
            ...nextEvent,
            position: selectedLane,
            spawnTime: Date.now(),
          };
          
          setActiveEvents(prev => [...prev, pulseEvent]);
          
          // Add to history immediately when it starts moving
          setEventHistory(prev => [...prev, {
            ...pulseEvent,
            completedAt: Date.now(),
            index: prev.length
          }]);
          
          // Remove event after lifetime
          setTimeout(() => {
            setActiveEvents(prev => prev.filter(e => e.id !== pulseEvent.id));
          }, EVENT_LIFETIME);
          
          return remainingQueue;
        }
        return prevQueue;
      });
    };

    const interval = setInterval(processQueue, EVENT_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [activeEvents.length]);

  // Set active events as pulse events for rendering
  useEffect(() => {
    setPulseEvents(activeEvents);
  }, [activeEvents]);

  function getEventIcon(eventType) {
    const icons = {
      PreToolUse: '🔧',
      PostToolUse: '✅',
      Notification: '🔔',
      Stop: '🛑',
      SubAgentStop: '🤖',
      UserPromptSubmit: '💬',
      PreCompact: '📦'
    };
    return icons[eventType] || '📌';
  }

  // Auto-scroll timeline to newest events
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
    }
  }, [eventHistory.length]);

  return (
    <div className="relative w-full h-80 bg-claude-bg rounded-lg border border-claude-border overflow-hidden flex flex-col" ref={containerRef}>
      {/* Main pulse area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Timeline */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-claude-border to-transparent transform -translate-y-1/2" />
        
        {/* Grid overlay for visual effect */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(74, 124, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(74, 124, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Live indicator and queue status */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-xs text-claude-muted">Live</span>
          </div>
          {eventQueue.length > 0 && (
            <div className="flex items-center gap-2 bg-claude-surface/50 rounded px-2 py-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs text-claude-muted">Queue: {eventQueue.length}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-claude-surface/50 rounded px-2 py-1">
            <span className="text-xs text-claude-muted">Active: {activeEvents.length}/{MAX_CONCURRENT_EVENTS}</span>
          </div>
        </div>
      
      {/* Pulse events */}
      {pulseEvents.map(event => (
        <div
          key={event.id}
          className="absolute flex items-center justify-center animate-slide-left group cursor-pointer z-20"
          style={{
            top: `${event.position}%`,
            animation: 'slideLeft 30s linear forwards', // Slower animation
          }}
          onClick={() => setSelectedEvent(event)}
        >
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center transform transition-all hover:scale-125 hover:z-30"
            style={{
              backgroundColor: event.color,
              boxShadow: `0 0 20px ${event.color}50`,
            }}
          >
            <span className="text-base">{event.icon}</span>
            
            {/* Pulse effect */}
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: event.color,
                opacity: 0.3,
              }}
            />
          </div>
          
          {/* Quick info on hover */}
          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="bg-claude-surface text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              <div className="font-semibold">{event.agent}</div>
              <div className="text-claude-muted">{event.summary}</div>
              <div className="text-xs text-claude-accent">Click for details</div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-claude-surface rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: selectedEvent.color,
                    boxShadow: `0 0 20px ${selectedEvent.color}50`,
                  }}
                >
                  <span className="text-xl">{selectedEvent.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-claude-text">{selectedEvent.agent}</h2>
                  <p className="text-claude-muted">{selectedEvent.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-claude-muted hover:text-claude-text text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-claude-text mb-2">Task Summary</h3>
                <p className="text-claude-text bg-claude-bg rounded p-3">{selectedEvent.summary}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-claude-text mb-1">Timestamp</h4>
                  <p className="text-claude-muted">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-claude-text mb-1">Event Type</h4>
                  <p className="text-claude-muted">{selectedEvent.type}</p>
                </div>
              </div>
              
              {selectedEvent.payload && Object.keys(selectedEvent.payload).length > 0 && (
                <div>
                  <h3 className="font-semibold text-claude-text mb-2">Event Details</h3>
                  <div className="bg-claude-bg rounded p-3 text-sm">
                    <pre className="text-claude-text overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {selectedEvent.originalEvent && (
                <div>
                  <h3 className="font-semibold text-claude-text mb-2">Full Event Data</h3>
                  <div className="bg-claude-bg rounded p-3 text-sm">
                    <pre className="text-claude-text overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedEvent.originalEvent, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Agent legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
        {[...new Set(pulseEvents.map(e => e.agent))].slice(0, 5).map(agent => (
          <div key={agent} className="flex items-center gap-1 bg-claude-surface/50 rounded px-2 py-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getAgentColor(agent) }}
            />
            <span className="text-xs text-claude-muted">{agent}</span>
          </div>
        ))}
      </div>
      </div>

      {/* Horizontal Timeline Bar */}
      <div className="h-16 bg-claude-surface/30 border-t border-claude-border overflow-hidden">
        <div className="h-full flex items-center px-4">
          <div className="flex items-center gap-2 text-xs text-claude-muted mr-4">
            <span>📜</span>
            <span>Event History</span>
          </div>
          <div 
            ref={timelineRef}
            className="flex-1 h-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-claude-border scrollbar-track-transparent"
          >
            <div className="flex items-center h-full gap-1 pr-4" style={{ minWidth: 'max-content' }}>
              {eventHistory.map((event, index) => (
                <div
                  key={`timeline-${event.id}-${index}`}
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer hover:scale-125 transition-transform"
                  style={{
                    backgroundColor: event.color,
                    boxShadow: `0 0 8px ${event.color}30`,
                  }}
                  onClick={() => setSelectedEvent(event)}
                  title={`${event.agent}: ${event.summary} (${new Date(event.timestamp).toLocaleTimeString()})`}
                >
                  <span className="text-white text-xs">{event.icon}</span>
                </div>
              ))}
              {eventHistory.length === 0 && (
                <div className="text-xs text-claude-muted/50 py-2">
                  Events will appear here as they flow across the screen...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPulse;
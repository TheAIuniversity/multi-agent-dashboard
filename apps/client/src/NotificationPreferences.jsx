import React, { useState, useEffect } from 'react';
import { 
  FiBell, FiSmartphone, FiMail, FiSlack, FiToggleLeft, 
  FiToggleRight, FiCheck, FiX, FiInfo, FiSettings
} from 'react-icons/fi';

function NotificationPreferences({ events = [] }) {
  const [preferences, setPreferences] = useState({
    enabled: false,
    channels: {
      browser: true,
      email: false,
      slack: false,
      mobile: false
    },
    eventTypes: {
      'UserPromptSubmit': false,
      'PreToolUse': false,
      'PostToolUse': true,
      'Notification': true,
      'Stop': true,
      'SubAgentStop': false,
      'PreCompact': false
    },
    filters: {
      onlyErrors: false,
      onlySuccess: true,
      minimumPriority: 'medium' // low, medium, high
    }
  });

  const [testStatus, setTestStatus] = useState('');

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPrefs));
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setTestStatus('Browser notifications enabled!');
        sendTestNotification();
      } else {
        setTestStatus('Browser notifications denied');
      }
    } else {
      setTestStatus('Browser notifications not supported');
    }
  };

  // Send test notification
  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Multi-Agent Dashboard', {
        body: 'Test notification - Your agents are being monitored!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });
    }
  };

  // Check if an event matches preferences
  const shouldNotify = (event) => {
    if (!preferences.enabled) return false;
    if (!preferences.eventTypes[event.event_type]) return false;
    
    // Apply filters
    if (preferences.filters.onlyErrors && !event.error) return false;
    if (preferences.filters.onlySuccess && event.error) return false;
    
    return true;
  };

  // Watch for events and send notifications
  useEffect(() => {
    if (!preferences.enabled || !preferences.channels.browser) return;

    const latestEvent = events[events.length - 1];
    if (latestEvent && shouldNotify(latestEvent)) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Agent Event: ${latestEvent.event_type}`, {
          body: latestEvent.summary || 'New event from your agents',
          icon: '/favicon.ico',
          tag: `event-${latestEvent.id}`,
          timestamp: new Date(latestEvent.timestamp).getTime()
        });
      }
    }
  }, [events, preferences]);

  const eventTypeLabels = {
    'UserPromptSubmit': 'User Prompts',
    'PreToolUse': 'Tool Start',
    'PostToolUse': 'Tool Complete',
    'Notification': 'Notifications',
    'Stop': 'Agent Stop',
    'SubAgentStop': 'Sub-Agent Stop',
    'PreCompact': 'Context Compact'
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-claude-accent' : 'bg-claude-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <FiBell className="w-7 h-7 text-claude-accent" />
          Notification Preferences
        </h2>
        <p className="text-claude-muted">
          Get real-time alerts from your agents on your preferred channels
        </p>
      </div>

      {/* Main Toggle */}
      <div className="bg-claude-surface rounded-lg p-6 border border-claude-border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1">Enable Notifications</h3>
            <p className="text-sm text-claude-muted">
              Receive alerts when your agents complete tasks or encounter issues
            </p>
          </div>
          <Toggle
            enabled={preferences.enabled}
            onChange={(enabled) => savePreferences({ ...preferences, enabled })}
          />
        </div>
      </div>

      {preferences.enabled && (
        <>
          {/* Notification Channels */}
          <div className="bg-claude-surface rounded-lg p-6 border border-claude-border mb-6">
            <h3 className="font-semibold text-lg mb-4">Notification Channels</h3>
            <div className="space-y-4">
              {/* Browser Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiSmartphone className="w-5 h-5 text-claude-accent" />
                  <div>
                    <p className="font-medium">Browser Notifications</p>
                    <p className="text-sm text-claude-muted">Desktop/mobile browser alerts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {preferences.channels.browser && (
                    <button
                      onClick={requestNotificationPermission}
                      className="text-sm px-3 py-1 bg-claude-bg hover:bg-claude-border rounded transition-colors"
                    >
                      Test
                    </button>
                  )}
                  <Toggle
                    enabled={preferences.channels.browser}
                    onChange={(enabled) => savePreferences({
                      ...preferences,
                      channels: { ...preferences.channels, browser: enabled }
                    })}
                  />
                </div>
              </div>

              {/* Email Notifications (Future) */}
              <div className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-claude-muted" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-claude-muted">Daily digest of agent activity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-claude-bg px-2 py-1 rounded">Coming Soon</span>
                </div>
              </div>

              {/* Slack Integration (Future) */}
              <div className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <FiSlack className="w-5 h-5 text-claude-muted" />
                  <div>
                    <p className="font-medium">Slack Integration</p>
                    <p className="text-sm text-claude-muted">Send alerts to Slack channels</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-claude-bg px-2 py-1 rounded">Coming Soon</span>
                </div>
              </div>
            </div>

            {testStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                testStatus.includes('enabled') ? 'bg-orange-900/20 text-orange-400' : 'bg-red-900/20 text-red-400'
              }`}>
                {testStatus}
              </div>
            )}
          </div>

          {/* Event Type Preferences */}
          <div className="bg-claude-surface rounded-lg p-6 border border-claude-border mb-6">
            <h3 className="font-semibold text-lg mb-4">Event Types</h3>
            <p className="text-sm text-claude-muted mb-4">
              Choose which events trigger notifications
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Toggle
                    enabled={preferences.eventTypes[type]}
                    onChange={(enabled) => savePreferences({
                      ...preferences,
                      eventTypes: { ...preferences.eventTypes, [type]: enabled }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-claude-surface rounded-lg p-6 border border-claude-border">
            <h3 className="font-semibold text-lg mb-4">Notification Filters</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Only notify on errors</span>
                <Toggle
                  enabled={preferences.filters.onlyErrors}
                  onChange={(enabled) => savePreferences({
                    ...preferences,
                    filters: { ...preferences.filters, onlyErrors: enabled, onlySuccess: false }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Only notify on success</span>
                <Toggle
                  enabled={preferences.filters.onlySuccess}
                  onChange={(enabled) => savePreferences({
                    ...preferences,
                    filters: { ...preferences.filters, onlySuccess: enabled, onlyErrors: false }
                  })}
                />
              </div>
              <div>
                <label className="text-sm block mb-2">Minimum priority level</label>
                <select
                  value={preferences.filters.minimumPriority}
                  onChange={(e) => savePreferences({
                    ...preferences,
                    filters: { ...preferences.filters, minimumPriority: e.target.value }
                  })}
                  className="bg-claude-bg border border-claude-border rounded px-3 py-2 text-sm"
                >
                  <option value="low">Low and above</option>
                  <option value="medium">Medium and above</option>
                  <option value="high">High only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-claude-muted">
                <p className="mb-2">
                  Browser notifications work on desktop and mobile devices that support the Notification API.
                </p>
                <p>
                  For mobile push notifications on iOS/Android, consider using the upcoming mobile app 
                  or integrating with services like Pushover or IFTTT.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationPreferences;
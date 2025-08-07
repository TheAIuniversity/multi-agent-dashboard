import React, { useState, useEffect } from 'react';
import { 
  FiSmartphone, FiSend, FiBell, FiCheck, FiX, 
  FiMessageSquare, FiLink, FiSettings, FiInfo
} from 'react-icons/fi';

function MobileNotifications({ events = [] }) {
  const [config, setConfig] = useState({
    service: 'none', // none, pushover, telegram, discord, ifttt
    pushover: {
      userKey: '',
      appToken: '',
      deviceName: ''
    },
    telegram: {
      botToken: '',
      chatId: ''
    },
    discord: {
      webhookUrl: ''
    },
    ifttt: {
      key: '',
      eventName: 'agent_notification'
    },
    filters: {
      eventTypes: ['Stop', 'Notification', 'TaskComplete'],
      priority: 'all', // all, high, medium, low
      agents: [] // specific agents to track
    }
  });

  const [testStatus, setTestStatus] = useState('');
  const [setupStep, setSetupStep] = useState(1);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mobileNotificationConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  // Save config to localStorage
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('mobileNotificationConfig', JSON.stringify(newConfig));
  };

  // Send notification based on service
  const sendNotification = async (title, message, priority = 'normal') => {
    try {
      switch (config.service) {
        case 'pushover':
          await sendPushoverNotification(title, message, priority);
          break;
        case 'telegram':
          await sendTelegramNotification(title, message);
          break;
        case 'discord':
          await sendDiscordNotification(title, message);
          break;
        case 'ifttt':
          await sendIFTTTNotification(title, message);
          break;
      }
    } catch (error) {
      console.error('Failed to send mobile notification:', error);
    }
  };

  // Pushover implementation
  const sendPushoverNotification = async (title, message, priority) => {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: config.pushover.appToken,
        user: config.pushover.userKey,
        title,
        message,
        priority: priority === 'high' ? 1 : 0,
        device: config.pushover.deviceName || undefined
      })
    });
    return response.json();
  };

  // Telegram implementation
  const sendTelegramNotification = async (title, message) => {
    const text = `🤖 *${title}*\n\n${message}`;
    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegram.chatId,
          text,
          parse_mode: 'Markdown'
        })
      }
    );
    return response.json();
  };

  // Discord webhook implementation
  const sendDiscordNotification = async (title, message) => {
    const response = await fetch(config.discord.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**${title}**\n${message}`,
        username: 'Agent Dashboard'
      })
    });
    return response.ok;
  };

  // IFTTT implementation
  const sendIFTTTNotification = async (title, message) => {
    const response = await fetch(
      `https://maker.ifttt.com/trigger/${config.ifttt.eventName}/with/key/${config.ifttt.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value1: title,
          value2: message,
          value3: new Date().toISOString()
        })
      }
    );
    return response.ok;
  };

  // Watch for events and send notifications
  useEffect(() => {
    if (config.service === 'none') return;

    const latestEvent = events[events.length - 1];
    if (latestEvent && shouldNotify(latestEvent)) {
      const title = `${latestEvent.app} - ${latestEvent.event_type}`;
      const message = latestEvent.summary || 'New event from your agents';
      const priority = latestEvent.payload?.priority || 'normal';
      
      sendNotification(title, message, priority);
    }
  }, [events, config]);

  const shouldNotify = (event) => {
    // Check event type filter
    if (!config.filters.eventTypes.includes(event.event_type)) return false;
    
    // Check priority filter
    if (config.filters.priority !== 'all') {
      const eventPriority = event.payload?.priority || 'normal';
      if (eventPriority !== config.filters.priority) return false;
    }
    
    // Check agent filter
    if (config.filters.agents.length > 0) {
      if (!config.filters.agents.includes(event.app)) return false;
    }
    
    return true;
  };

  const testNotification = async () => {
    setTestStatus('sending');
    try {
      await sendNotification(
        'Test Notification',
        'Your mobile notifications are working! 🎉',
        'high'
      );
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
      console.error('Test failed:', error);
    }
    setTimeout(() => setTestStatus(''), 3000);
  };

  const services = [
    {
      id: 'pushover',
      name: 'Pushover',
      icon: <FiSmartphone />,
      description: 'Reliable push notifications ($5 one-time)',
      color: 'bg-blue-600',
      setupUrl: 'https://pushover.net/'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <FiMessageSquare />,
      description: 'Free notifications via Telegram bot',
      color: 'bg-cyan-600',
      setupUrl: 'https://core.telegram.org/bots'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: <FiSend />,
      description: 'Send to Discord channel via webhook',
      color: 'bg-indigo-600',
      setupUrl: 'https://discord.com/developers/docs/resources/webhook'
    },
    {
      id: 'ifttt',
      name: 'IFTTT',
      icon: <FiLink />,
      description: 'Connect to 600+ services',
      color: 'bg-purple-600',
      setupUrl: 'https://ifttt.com/maker_webhooks'
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <FiSmartphone className="w-7 h-7 text-claude-accent" />
        Mobile Push Notifications
      </h2>

      {/* Service Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Choose Your Notification Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => {
                saveConfig({ ...config, service: service.id });
                setSetupStep(2);
              }}
              className={`relative p-4 rounded-lg border transition-all ${
                config.service === service.id
                  ? 'border-claude-accent bg-claude-accent/10'
                  : 'border-claude-border hover:border-claude-muted'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center text-white`}>
                  {service.icon}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-claude-muted">{service.description}</p>
                </div>
                {config.service === service.id && (
                  <FiCheck className="w-5 h-5 text-claude-accent" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Service Configuration */}
      {config.service !== 'none' && (
        <div className="bg-claude-surface rounded-lg p-6 border border-claude-border mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FiSettings className="w-5 h-5" />
            Configure {services.find(s => s.id === config.service)?.name}
          </h3>

          {/* Pushover Config */}
          {config.service === 'pushover' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User Key</label>
                <input
                  type="text"
                  value={config.pushover.userKey}
                  onChange={(e) => saveConfig({
                    ...config,
                    pushover: { ...config.pushover, userKey: e.target.value }
                  })}
                  className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2"
                  placeholder="Your Pushover user key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">App Token</label>
                <input
                  type="text"
                  value={config.pushover.appToken}
                  onChange={(e) => saveConfig({
                    ...config,
                    pushover: { ...config.pushover, appToken: e.target.value }
                  })}
                  className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2"
                  placeholder="Your app API token"
                />
              </div>
              <a
                href="https://pushover.net/apps/build"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-claude-accent hover:underline"
              >
                Get your Pushover credentials →
              </a>
            </div>
          )}

          {/* Telegram Config */}
          {config.service === 'telegram' && (
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-600 rounded p-3 text-sm">
                <p className="mb-2">Quick Setup:</p>
                <ol className="list-decimal list-inside space-y-1 text-claude-muted">
                  <li>Message @BotFather on Telegram</li>
                  <li>Create a new bot and get the token</li>
                  <li>Message your bot and get your chat ID</li>
                </ol>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bot Token</label>
                <input
                  type="text"
                  value={config.telegram.botToken}
                  onChange={(e) => saveConfig({
                    ...config,
                    telegram: { ...config.telegram, botToken: e.target.value }
                  })}
                  className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2"
                  placeholder="123456:ABC-DEF..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chat ID</label>
                <input
                  type="text"
                  value={config.telegram.chatId}
                  onChange={(e) => saveConfig({
                    ...config,
                    telegram: { ...config.telegram, chatId: e.target.value }
                  })}
                  className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2"
                  placeholder="Your chat ID"
                />
              </div>
            </div>
          )}

          {/* Discord Config */}
          {config.service === 'discord' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={config.discord.webhookUrl}
                  onChange={(e) => saveConfig({
                    ...config,
                    discord: { ...config.discord, webhookUrl: e.target.value }
                  })}
                  className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
              <a
                href="https://support.discord.com/hc/en-us/articles/228383668"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-claude-accent hover:underline"
              >
                How to create a Discord webhook →
              </a>
            </div>
          )}

          {/* IFTTT Config */}
          {config.service === 'ifttt' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Webhooks Key</label>
                <input
                  type="text"
                  value={config.ifttt.key}
                  onChange={(e) => saveConfig({
                    ...config,
                    ifttt: { ...config.ifttt, key: e.target.value }
                  })}
                  className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2"
                  placeholder="Your IFTTT Webhooks key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Name</label>
                <input
                  type="text"
                  value={config.ifttt.eventName}
                  onChange={(e) => saveConfig({
                    ...config,
                    ifttt: { ...config.ifttt, eventName: e.target.value }
                  })}
                  className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2"
                  placeholder="agent_notification"
                />
              </div>
            </div>
          )}

          {/* Test Button */}
          <button
            onClick={testNotification}
            className="mt-4 px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded flex items-center gap-2"
            disabled={testStatus === 'sending'}
          >
            <FiBell className="w-4 h-4" />
            {testStatus === 'sending' ? 'Sending...' : 
             testStatus === 'success' ? 'Sent!' :
             testStatus === 'error' ? 'Failed' : 'Send Test Notification'}
          </button>
        </div>
      )}

      {/* Event Filters */}
      {config.service !== 'none' && (
        <div className="bg-claude-surface rounded-lg p-6 border border-claude-border">
          <h3 className="font-semibold mb-4">Notification Filters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Types to Track</label>
              <div className="flex flex-wrap gap-2">
                {['Stop', 'Notification', 'PreToolUse', 'PostToolUse', 'UserPromptSubmit'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const newTypes = config.filters.eventTypes.includes(type)
                        ? config.filters.eventTypes.filter(t => t !== type)
                        : [...config.filters.eventTypes, type];
                      saveConfig({
                        ...config,
                        filters: { ...config.filters, eventTypes: newTypes }
                      });
                    }}
                    className={`px-3 py-1 rounded text-sm ${
                      config.filters.eventTypes.includes(type)
                        ? 'bg-claude-accent text-white'
                        : 'bg-claude-bg border border-claude-border'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority Filter</label>
              <select
                value={config.filters.priority}
                onChange={(e) => saveConfig({
                  ...config,
                  filters: { ...config.filters, priority: e.target.value }
                })}
                className="bg-claude-bg border border-claude-border rounded px-3 py-2"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium & Above</option>
                <option value="low">Low & Above</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiInfo className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-claude-muted">
            <p className="mb-2">
              <strong>Mobile notifications work even when your browser is closed!</strong>
            </p>
            <p>
              The dashboard will send notifications to your phone via your chosen service 
              whenever matching events occur. Perfect for tracking long-running agent tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileNotifications;
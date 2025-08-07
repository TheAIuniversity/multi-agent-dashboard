# Multi-Agent Observability Dashboard

A real-time observability dashboard for monitoring multi-agent AI systems. Built with React, Node.js, and WebSocket for live event streaming.

## 🚀 Quick Start for Claude Code Users

Connect your Claude Code session to the dashboard with one command:

```bash
npx @multi-agent/dashboard-connect
```

This will:
1. Configure Claude Code hooks to capture all events
2. Connect to the dashboard via WebSocket
3. Start streaming real-time activity data
4. Track all tool usage, prompts, and agent activity

## Features

- **Real-time Event Monitoring**: Live WebSocket connection for instant event updates
- **Agent Activity Tracking**: Monitor agent status, tasks, and performance
- **Analytics Dashboard**: Visualize agent metrics and system performance
- **Event Filtering**: Filter events by project, app, session, event type, and time window
- **Authentication System**: Secure user authentication with JWT tokens
- **API Key Management**: Support for API key-based authentication
- **Voice Notifications**: Optional voice announcements for critical events
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Architecture

### Frontend (React)
- Located in `apps/client/`
- Built with Vite + React
- Real-time WebSocket client
- Recharts for data visualization
- TailwindCSS for styling

### Backend (Node.js)
- Located in `apps/server/`
- Express server with WebSocket support
- SQLite database for event storage
- JWT authentication
- RESTful API endpoints

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd multi-agent-dashboard
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd apps/client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
```

### Running the Dashboard

1. Start the backend server:
```bash
cd apps/server
npm run dev
# Server runs on http://localhost:3001
# WebSocket server runs on ws://localhost:8766
```

2. Start the frontend client:
```bash
cd apps/client
npm run dev
# Client runs on http://localhost:5173
```

3. Open your browser and navigate to `http://localhost:5173`

## API Integration

### Sending Events

Send events to the dashboard via the REST API:

```javascript
// POST to http://localhost:3001/event
{
  "event_type": "TaskComplete",
  "session_id": "session-123",
  "app": "my-agent",
  "payload": {
    "task": "Process data",
    "status": "success"
  }
}
```

### WebSocket Events

Connect to the WebSocket server for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8766');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New event:', data);
};
```

## Project Structure

```
multi-agent-dashboard/
├── apps/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   │   ├── App.jsx           # Main dashboard component
│   │   │   ├── Analytics.jsx     # Analytics view
│   │   │   ├── AgentManagement.jsx # Agent management
│   │   │   └── ...
│   │   └── package.json
│   └── server/          # Node.js backend
│       ├── index.js     # Main server file
│       ├── database.js  # Database management
│       ├── auth.js      # Authentication
│       └── package.json
├── package.json
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database Schema

The SQLite database stores events with the following structure:
- `id` - Unique identifier
- `event_type` - Type of event
- `session_id` - Session identifier
- `app` - Application/agent name
- `payload` - JSON event data
- `timestamp` - Event timestamp

## Security

- JWT-based authentication
- API key support for programmatic access
- Input sanitization and validation
- Rate limiting on API endpoints
- CORS configuration for allowed origins

## License

MIT
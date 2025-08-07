import React, { useState, useEffect } from 'react';
import { 
  FiBarChart2, FiTrendingUp, FiActivity, FiPieChart,
  FiClock, FiCheckCircle, FiXCircle, FiCode,
  FiCalendar, FiFilter, FiDownload
} from 'react-icons/fi';

function Analytics({ events = [] }) {
  const [selectedView, setSelectedView] = useState('comparative');
  const [dateRange, setDateRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    agentPerformance: {},
    successRates: {},
    executionTimes: {},
    codeGeneration: {},
    trends: {}
  });

  // Calculate metrics from events
  useEffect(() => {
    calculateMetrics();
  }, [events, dateRange]);

  const calculateMetrics = () => {
    // Filter events by date range
    const filteredEvents = filterEventsByDateRange(events, dateRange);
    
    // Calculate agent performance metrics
    const agentMetrics = {};
    const codeMetrics = {};
    
    filteredEvents.forEach(event => {
      const agent = event.session_id?.split('-')[0] || 'unknown';
      
      if (!agentMetrics[agent]) {
        agentMetrics[agent] = {
          totalTasks: 0,
          successfulTasks: 0,
          failedTasks: 0,
          totalExecutionTime: 0,
          toolUsage: {},
          events: []
        };
      }
      
      agentMetrics[agent].events.push(event);
      
      // Track different event types
      if (event.event_type === 'PostToolUse') {
        agentMetrics[agent].totalTasks++;
        
        // Track tool usage
        const tool = event.payload?.tool || 'unknown';
        agentMetrics[agent].toolUsage[tool] = (agentMetrics[agent].toolUsage[tool] || 0) + 1;
        
        // Track code generation
        if (tool === 'Write' || tool === 'Edit' || tool === 'MultiEdit') {
          if (!codeMetrics[agent]) {
            codeMetrics[agent] = {
              filesCreated: 0,
              filesModified: 0,
              languages: {}
            };
          }
          
          if (tool === 'Write') codeMetrics[agent].filesCreated++;
          else codeMetrics[agent].filesModified++;
        }
      }
    });
    
    // Calculate success rates
    const successRates = {};
    Object.keys(agentMetrics).forEach(agent => {
      const metrics = agentMetrics[agent];
      successRates[agent] = metrics.totalTasks > 0 
        ? ((metrics.successfulTasks / metrics.totalTasks) * 100).toFixed(1)
        : 0;
    });
    
    setMetrics({
      agentPerformance: agentMetrics,
      successRates,
      codeGeneration: codeMetrics,
      executionTimes: calculateExecutionTimes(filteredEvents),
      trends: calculateTrends(events)
    });
  };

  const filterEventsByDateRange = (events, range) => {
    const now = new Date();
    let startDate = new Date();
    
    switch(range) {
      case '24h': startDate.setHours(now.getHours() - 24); break;
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      default: return events;
    }
    
    return events.filter(event => new Date(event.timestamp) >= startDate);
  };

  const calculateExecutionTimes = (events) => {
    const times = {};
    const sessions = {};
    
    events.forEach(event => {
      const sessionId = event.session_id;
      if (!sessions[sessionId]) {
        sessions[sessionId] = { start: event.timestamp, end: event.timestamp };
      }
      sessions[sessionId].end = event.timestamp;
    });
    
    Object.entries(sessions).forEach(([sessionId, session]) => {
      const agent = sessionId.split('-')[0];
      const duration = new Date(session.end) - new Date(session.start);
      
      if (!times[agent]) times[agent] = [];
      times[agent].push(duration);
    });
    
    return times;
  };

  const calculateTrends = (allEvents) => {
    // Group events by day
    const dailyActivity = {};
    
    allEvents.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!dailyActivity[date]) {
        dailyActivity[date] = { total: 0, byAgent: {} };
      }
      
      dailyActivity[date].total++;
      const agent = event.session_id?.split('-')[0] || 'unknown';
      dailyActivity[date].byAgent[agent] = (dailyActivity[date].byAgent[agent] || 0) + 1;
    });
    
    return dailyActivity;
  };

  const views = {
    comparative: <ComparativeReports metrics={metrics} />,
    performance: <PerformanceMetrics metrics={metrics} />,
    productivity: <ProductivityAnalytics metrics={metrics} />,
    trends: <TrendAnalysis metrics={metrics} />
  };

  return (
    <div className="flex h-full">
      {/* Analytics Sidebar */}
      <div className="analytics-sidebar w-64 bg-claude-surface border-r border-claude-border p-4">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FiBarChart2 className="w-5 h-5 text-claude-accent" />
          Analytics
        </h2>
        
        {/* Date Range Selector */}
        <div className="mb-6">
          <label className="text-sm text-claude-muted mb-2 block">Date Range</label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2 text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        {/* View Navigation */}
        <nav className="analytics-nav space-y-2">
          <button
            onClick={() => setSelectedView('comparative')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedView === 'comparative' 
                ? 'bg-claude-accent text-white' 
                : 'hover:bg-claude-bg text-claude-muted hover:text-claude-text'
            }`}
          >
            <FiPieChart className="w-4 h-4" />
            Comparative Reports
          </button>
          
          <button
            onClick={() => setSelectedView('performance')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedView === 'performance' 
                ? 'bg-claude-accent text-white' 
                : 'hover:bg-claude-bg text-claude-muted hover:text-claude-text'
            }`}
          >
            <FiActivity className="w-4 h-4" />
            Performance Metrics
          </button>
          
          <button
            onClick={() => setSelectedView('productivity')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedView === 'productivity' 
                ? 'bg-claude-accent text-white' 
                : 'hover:bg-claude-bg text-claude-muted hover:text-claude-text'
            }`}
          >
            <FiCode className="w-4 h-4" />
            Productivity Analytics
          </button>
          
          <button
            onClick={() => setSelectedView('trends')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedView === 'trends' 
                ? 'bg-claude-accent text-white' 
                : 'hover:bg-claude-bg text-claude-muted hover:text-claude-text'
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            Trend Analysis
          </button>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {views[selectedView]}
      </div>
    </div>
  );
}

// Comparative Reports Component
function ComparativeReports({ metrics }) {
  const { agentPerformance, successRates } = metrics;
  
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Agent Efficiency Comparison</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Activity Chart */}
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FiActivity className="w-4 h-4 text-claude-accent" />
            Total Tasks by Agent
          </h4>
          <div className="space-y-3">
            {Object.entries(agentPerformance)
              .sort(([,a], [,b]) => b.totalTasks - a.totalTasks)
              .slice(0, 10)
              .map(([agent, data]) => (
                <div key={agent} className="flex items-center gap-3">
                  <div className="w-32 text-sm truncate">{agent}</div>
                  <div className="flex-1 bg-claude-bg rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-claude-accent transition-all"
                      style={{ width: `${(data.totalTasks / Math.max(...Object.values(agentPerformance).map(a => a.totalTasks))) * 100}%` }}
                    />
                    <span className="absolute left-2 top-0 h-full flex items-center text-xs font-medium">
                      {data.totalTasks}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Success Rate Comparison */}
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-orange-500" />
            Success Rates
          </h4>
          <div className="space-y-3">
            {Object.entries(successRates)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([agent, rate]) => (
                <div key={agent} className="flex items-center gap-3">
                  <div className="w-32 text-sm truncate">{agent}</div>
                  <div className="flex-1 bg-claude-bg rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-orange-500 transition-all"
                      style={{ width: `${rate}%` }}
                    />
                    <span className="absolute left-2 top-0 h-full flex items-center text-xs font-medium">
                      {rate}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Tool Usage Breakdown */}
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5 lg:col-span-2">
          <h4 className="font-semibold mb-4">Tool Usage by Agent</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-claude-border">
                  <th className="text-left py-2">Agent</th>
                  <th className="text-center py-2">Read</th>
                  <th className="text-center py-2">Write</th>
                  <th className="text-center py-2">Edit</th>
                  <th className="text-center py-2">Bash</th>
                  <th className="text-center py-2">Other</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(agentPerformance).slice(0, 10).map(([agent, data]) => (
                  <tr key={agent} className="border-b border-claude-border/50">
                    <td className="py-2">{agent}</td>
                    <td className="text-center">{data.toolUsage.Read || 0}</td>
                    <td className="text-center">{data.toolUsage.Write || 0}</td>
                    <td className="text-center">{data.toolUsage.Edit || 0}</td>
                    <td className="text-center">{data.toolUsage.Bash || 0}</td>
                    <td className="text-center">
                      {Object.entries(data.toolUsage)
                        .filter(([tool]) => !['Read', 'Write', 'Edit', 'Bash'].includes(tool))
                        .reduce((sum, [, count]) => sum + count, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Performance Metrics Component
function PerformanceMetrics({ metrics }) {
  const { executionTimes, agentPerformance } = metrics;
  
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Agent Performance Metrics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Summary Cards */}
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <FiClock className="w-5 h-5 text-claude-accent" />
            <h4 className="font-semibold">Avg Execution Time</h4>
          </div>
          <div className="text-3xl font-bold">
            {calculateAverageExecutionTime(executionTimes)}ms
          </div>
          <div className="text-sm text-claude-muted mt-1">
            Across all agents
          </div>
        </div>
        
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <FiCheckCircle className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold">Overall Success Rate</h4>
          </div>
          <div className="text-3xl font-bold text-orange-500">
            {calculateOverallSuccessRate(agentPerformance)}%
          </div>
          <div className="text-sm text-claude-muted mt-1">
            All agents combined
          </div>
        </div>
        
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <FiActivity className="w-5 h-5 text-claude-accent" />
            <h4 className="font-semibold">Active Agents</h4>
          </div>
          <div className="text-3xl font-bold">
            {Object.keys(agentPerformance).length}
          </div>
          <div className="text-sm text-claude-muted mt-1">
            In selected period
          </div>
        </div>
      </div>
      
      {/* Execution Time Distribution */}
      <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
        <h4 className="font-semibold mb-4">Execution Time by Agent</h4>
        <div className="space-y-3">
          {Object.entries(executionTimes)
            .map(([agent, times]) => ({
              agent,
              avg: times.reduce((a, b) => a + b, 0) / times.length,
              min: Math.min(...times),
              max: Math.max(...times)
            }))
            .sort((a, b) => a.avg - b.avg)
            .slice(0, 10)
            .map(({ agent, avg, min, max }) => (
              <div key={agent} className="flex items-center gap-4">
                <div className="w-32 text-sm truncate">{agent}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-claude-muted mb-1">
                    <span>Min: {min}ms</span>
                    <span>•</span>
                    <span>Avg: {Math.round(avg)}ms</span>
                    <span>•</span>
                    <span>Max: {max}ms</span>
                  </div>
                  <div className="bg-claude-bg rounded-full h-2 relative">
                    <div 
                      className="absolute top-0 h-full bg-claude-accent rounded-full"
                      style={{ 
                        left: `${(min / max) * 100}%`,
                        width: `${((avg - min) / max) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Productivity Analytics Component  
function ProductivityAnalytics({ metrics }) {
  const { codeGeneration, agentPerformance } = metrics;
  
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Productivity Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Generation Metrics */}
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FiCode className="w-4 h-4 text-claude-accent" />
            Code Generation Activity
          </h4>
          <div className="space-y-3">
            {Object.entries(codeGeneration)
              .map(([agent, data]) => ({
                agent,
                total: data.filesCreated + data.filesModified
              }))
              .sort((a, b) => b.total - a.total)
              .slice(0, 10)
              .map(({ agent, total }) => {
                const data = codeGeneration[agent];
                return (
                  <div key={agent} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{agent}</span>
                      <span className="text-sm text-claude-muted">{total} files</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-claude-bg rounded-full h-4 relative overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-orange-500"
                          style={{ width: `${(data.filesCreated / total) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-claude-muted w-20 text-right">
                        {data.filesCreated} created
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        {/* Task Completion Rate */}
        <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
          <h4 className="font-semibold mb-4">Task Completion Summary</h4>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-claude-accent mb-2">
                {Object.values(agentPerformance).reduce((sum, agent) => sum + agent.totalTasks, 0)}
              </div>
              <div className="text-sm text-claude-muted">Total Tasks Completed</div>
            </div>
            
            <div className="border-t border-claude-border pt-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-claude-muted">Most Productive Agent</span>
                  <span className="font-medium">
                    {Object.entries(agentPerformance)
                      .sort(([,a], [,b]) => b.totalTasks - a.totalTasks)[0]?.[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-claude-muted">Average Tasks per Agent</span>
                  <span className="font-medium">
                    {Math.round(
                      Object.values(agentPerformance).reduce((sum, agent) => sum + agent.totalTasks, 0) / 
                      Object.keys(agentPerformance).length
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trend Analysis Component
function TrendAnalysis({ metrics }) {
  const { trends } = metrics;
  const sortedDates = Object.keys(trends).sort();
  
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Usage Trends</h3>
      
      <div className="bg-claude-surface border border-claude-border rounded-lg p-5">
        <h4 className="font-semibold mb-4">Activity Over Time</h4>
        
        {/* Simple text-based chart */}
        <div className="space-y-2">
          {sortedDates.slice(-14).map(date => {
            const dayData = trends[date];
            const maxActivity = Math.max(...Object.values(trends).map(d => d.total));
            
            return (
              <div key={date} className="flex items-center gap-3">
                <div className="w-24 text-xs text-claude-muted">{date}</div>
                <div className="flex-1 bg-claude-bg rounded h-6 relative overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-claude-accent"
                    style={{ width: `${(dayData.total / maxActivity) * 100}%` }}
                  />
                  <span className="absolute left-2 top-0 h-full flex items-center text-xs">
                    {dayData.total} events
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Peak Usage Times */}
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Peak Usage Patterns</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-claude-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-claude-accent">
                {getMostActiveDay(trends)}
              </div>
              <div className="text-xs text-claude-muted mt-1">Most Active Day</div>
            </div>
            <div className="bg-claude-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-claude-accent">
                {getTotalEvents(trends)}
              </div>
              <div className="text-xs text-claude-muted mt-1">Total Events</div>
            </div>
            <div className="bg-claude-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-claude-accent">
                {getAverageEventsPerDay(trends)}
              </div>
              <div className="text-xs text-claude-muted mt-1">Avg Events/Day</div>
            </div>
            <div className="bg-claude-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-claude-accent">
                {getGrowthRate(trends)}%
              </div>
              <div className="text-xs text-claude-muted mt-1">Growth Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateAverageExecutionTime(executionTimes) {
  const allTimes = Object.values(executionTimes).flat();
  if (allTimes.length === 0) return 0;
  return Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length);
}

function calculateOverallSuccessRate(agentPerformance) {
  const totals = Object.values(agentPerformance).reduce(
    (acc, agent) => ({
      tasks: acc.tasks + agent.totalTasks,
      success: acc.success + agent.successfulTasks
    }),
    { tasks: 0, success: 0 }
  );
  
  return totals.tasks > 0 ? ((totals.success / totals.tasks) * 100).toFixed(1) : 0;
}

function getMostActiveDay(trends) {
  const [date] = Object.entries(trends)
    .sort(([,a], [,b]) => b.total - a.total)[0] || ['N/A'];
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
}

function getTotalEvents(trends) {
  return Object.values(trends).reduce((sum, day) => sum + day.total, 0);
}

function getAverageEventsPerDay(trends) {
  const days = Object.keys(trends).length;
  const total = getTotalEvents(trends);
  return days > 0 ? Math.round(total / days) : 0;
}

function getGrowthRate(trends) {
  const dates = Object.keys(trends).sort();
  if (dates.length < 2) return 0;
  
  const firstWeek = dates.slice(0, 7);
  const lastWeek = dates.slice(-7);
  
  const firstWeekTotal = firstWeek.reduce((sum, date) => sum + trends[date].total, 0);
  const lastWeekTotal = lastWeek.reduce((sum, date) => sum + trends[date].total, 0);
  
  if (firstWeekTotal === 0) return 100;
  return Math.round(((lastWeekTotal - firstWeekTotal) / firstWeekTotal) * 100);
}

export default Analytics;
import React, { useState } from 'react';
import { 
  FiFilter, FiDownload, FiCalendar, FiSearch, 
  FiX, FiChevronDown, FiSave
} from 'react-icons/fi';
import { format } from 'date-fns';

function FilterBar({ events, onFilterChange, className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    searchQuery: '',
    regex: false,
    eventTypes: [],
    agents: []
  });
  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Session ID', 'App', 'Event Type', 'Summary', 'Tool', 'Params'];
    const rows = events.map(event => [
      event.timestamp,
      event.session_id || '',
      event.app || '',
      event.event_type || '',
      event.summary || '',
      event.payload?.tool || '',
      JSON.stringify(event.payload?.params || {})
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(events, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save current filters
  const saveFilter = () => {
    if (filterName.trim()) {
      setSavedFilters([...savedFilters, { name: filterName, filters }]);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  // Load saved filter
  const loadFilter = (savedFilter) => {
    applyFilters(savedFilter.filters);
  };

  // Get unique event types and agents from events
  const eventTypes = [...new Set(events.map(e => e.event_type).filter(Boolean))];
  const agents = [...new Set(events.map(e => e.session_id?.split('-')[0]).filter(Boolean))];

  return (
    <div className={`bg-claude-surface border-b border-claude-border ${className}`}>
      {/* Collapsed Bar */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-claude-muted hover:text-claude-text transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filter</span>
            {Object.values(filters).some(v => v && v.length > 0) && (
              <span className="bg-claude-accent text-white text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          {/* Quick date range selector */}
          <select
            value={filters.dateRange}
            onChange={(e) => applyFilters({ ...filters, dateRange: e.target.value })}
            className="text-sm bg-claude-bg border border-claude-border rounded px-3 py-1"
          >
            <option value="all">All Time</option>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Active filter chips */}
          {filters.searchQuery && (
            <div className="flex items-center gap-2 bg-claude-bg rounded-full px-3 py-1 text-sm">
              <FiSearch className="w-3 h-3" />
              <span>{filters.searchQuery}</span>
              <button
                onClick={() => applyFilters({ ...filters, searchQuery: '' })}
                className="hover:text-claude-accent"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 text-sm px-3 py-1 bg-claude-bg hover:bg-claude-border rounded transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 text-sm px-3 py-1 bg-claude-bg hover:bg-claude-border rounded transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-claude-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search/Regex */}
            <div>
              <label className="text-sm text-claude-muted mb-2 block">Search</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder={filters.regex ? "Regex pattern..." : "Search..."}
                  className="flex-1 bg-claude-bg border border-claude-border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => setFilters({ ...filters, regex: !filters.regex })}
                  className={`px-3 py-2 rounded text-sm border transition-colors ${
                    filters.regex
                      ? 'bg-claude-accent text-white border-claude-accent'
                      : 'bg-claude-bg border-claude-border hover:border-claude-muted'
                  }`}
                  title="Toggle regex mode"
                >
                  .*
                </button>
              </div>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="text-sm text-claude-muted mb-2 block">Event Types</label>
              <div className="relative">
                <button className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2 text-sm text-left flex items-center justify-between">
                  <span>
                    {filters.eventTypes.length === 0
                      ? 'All Types'
                      : `${filters.eventTypes.length} selected`}
                  </span>
                  <FiChevronDown className="w-4 h-4" />
                </button>
                {/* Dropdown would go here */}
              </div>
            </div>

            {/* Agent Filter */}
            <div>
              <label className="text-sm text-claude-muted mb-2 block">Agents</label>
              <div className="relative">
                <button className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2 text-sm text-left flex items-center justify-between">
                  <span>
                    {filters.agents.length === 0
                      ? 'All Agents'
                      : `${filters.agents.length} selected`}
                  </span>
                  <FiChevronDown className="w-4 h-4" />
                </button>
                {/* Dropdown would go here */}
              </div>
            </div>

            {/* Saved Filters */}
            <div>
              <label className="text-sm text-claude-muted mb-2 block">Saved Filters</label>
              <div className="flex gap-2">
                <select 
                  className="flex-1 bg-claude-bg border border-claude-border rounded px-3 py-2 text-sm"
                  onChange={(e) => {
                    const filter = savedFilters.find(f => f.name === e.target.value);
                    if (filter) loadFilter(filter);
                  }}
                >
                  <option value="">Choose saved filter...</option>
                  {savedFilters.map((filter, idx) => (
                    <option key={idx} value={filter.name}>{filter.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-3 py-2 bg-claude-bg hover:bg-claude-border border border-claude-border rounded text-sm"
                  title="Save current filters"
                >
                  <FiSave className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Apply/Clear buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => applyFilters(filters)}
              className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded text-sm transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                const clearedFilters = {
                  dateRange: 'all',
                  searchQuery: '',
                  regex: false,
                  eventTypes: [],
                  agents: []
                };
                setFilters(clearedFilters);
                applyFilters(clearedFilters);
              }}
              className="px-4 py-2 bg-claude-bg hover:bg-claude-border border border-claude-border rounded text-sm transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-claude-surface rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Current Filters</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filter name..."
              className="w-full bg-claude-bg border border-claude-border rounded px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={saveFilter}
                className="flex-1 px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName('');
                }}
                className="flex-1 px-4 py-2 bg-claude-bg hover:bg-claude-border border border-claude-border rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
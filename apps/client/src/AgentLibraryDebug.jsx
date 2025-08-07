import React, { useEffect, useState } from 'react';

function AgentLibraryDebug() {
  const [diagnostics, setDiagnostics] = useState({
    moduleLoaded: false,
    agentLibraryExists: false,
    agentCount: 0,
    firstAgent: null,
    categories: [],
    error: null
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Dynamic import to catch any errors
        const module = await import('./agentLibraryData.js');
        
        setDiagnostics({
          moduleLoaded: true,
          agentLibraryExists: !!module.agentLibrary,
          agentCount: module.agentLibrary ? module.agentLibrary.length : 0,
          firstAgent: module.agentLibrary && module.agentLibrary[0] ? module.agentLibrary[0].name : null,
          categories: module.getCategories ? module.getCategories() : [],
          error: null
        });
      } catch (error) {
        setDiagnostics(prev => ({
          ...prev,
          error: error.message
        }));
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="p-6 bg-claude-surface rounded-lg">
      <h2 className="text-xl font-bold mb-4">Agent Library Diagnostics</h2>
      
      <div className="space-y-2 font-mono text-sm">
        <div className={diagnostics.moduleLoaded ? 'text-orange-500' : 'text-red-500'}>
          ✓ Module Loaded: {diagnostics.moduleLoaded ? 'YES' : 'NO'}
        </div>
        
        <div className={diagnostics.agentLibraryExists ? 'text-orange-500' : 'text-red-500'}>
          ✓ agentLibrary exists: {diagnostics.agentLibraryExists ? 'YES' : 'NO'}
        </div>
        
        <div className={diagnostics.agentCount > 0 ? 'text-orange-500' : 'text-red-500'}>
          ✓ Agent Count: {diagnostics.agentCount}
        </div>
        
        <div className={diagnostics.firstAgent ? 'text-orange-500' : 'text-red-500'}>
          ✓ First Agent: {diagnostics.firstAgent || 'NONE'}
        </div>
        
        <div className={diagnostics.categories.length > 0 ? 'text-orange-500' : 'text-red-500'}>
          ✓ Categories: {diagnostics.categories.join(', ') || 'NONE'}
        </div>
        
        {diagnostics.error && (
          <div className="text-red-500 mt-4">
            ❌ ERROR: {diagnostics.error}
          </div>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-claude-bg rounded">
        <pre className="text-xs overflow-auto">
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default AgentLibraryDebug;
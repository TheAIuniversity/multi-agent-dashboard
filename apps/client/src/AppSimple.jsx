import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Multi-Agent Observability Dashboard</h1>
      <p>Testing basic functionality</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 px-4 py-2 rounded mt-4"
      >
        Count: {count}
      </button>
    </div>
  );
}

export default App;
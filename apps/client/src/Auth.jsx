import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiLogIn, FiUserPlus, FiKey } from 'react-icons/fi';

function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // signin or signup
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupApiKey, setSignupApiKey] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'signin' ? '/auth/signin' : '/auth/signup';
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // If signup, save the API key to show it
      if (mode === 'signup' && data.apiKey) {
        // Store the API key in localStorage with user-specific key
        localStorage.setItem(`userApiKey_${data.user.id}`, data.apiKey);
        setSignupApiKey(data.apiKey);
        // Don't call success callback yet - show API key first
        return;
      }

      // Call success callback
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show API key after signup
  if (signupApiKey) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-orange-400">Account Created Successfully!</h2>
            
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-yellow-600">
                <FiKey className="w-5 h-5" />
                Your Personal API Key
              </h3>
              <p className="text-sm text-claude-muted mb-3">
                This is your personalized API key. Use it to connect to the dashboard.
              </p>
              <div className="bg-black/50 rounded p-3 font-mono text-xs break-all">
                {signupApiKey}
              </div>
            </div>
            
            <p className="text-sm text-claude-muted mb-4">
              Use this API key in your personalized setup command to connect all your Claude agents.
            </p>
            
            <button
              onClick={() => onAuthSuccess(localStorage.getItem('token'), JSON.parse(localStorage.getItem('user')))}
              className="w-full py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-claude-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Multi-Agent Dashboard</h1>
          <p className="text-claude-muted">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="bg-claude-surface rounded-lg border border-claude-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-claude-muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-claude-bg border border-claude-border rounded focus:outline-none focus:border-claude-accent"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-claude-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-claude-bg border border-claude-border rounded focus:outline-none focus:border-claude-accent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-claude-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 bg-claude-bg border border-claude-border rounded focus:outline-none focus:border-claude-accent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-claude-muted hover:text-claude-text"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-600 rounded p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  {mode === 'signin' ? <FiLogIn /> : <FiUserPlus />}
                  {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-claude-muted">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                className="text-claude-accent hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-claude-muted">
          <p className="mb-2">Demo Credentials:</p>
          <p>Email: demo@example.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
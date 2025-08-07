import React from 'react';
import { sanitizeText, sanitizeSessionId } from './utils/security';

const ChatTranscriptModal = ({ isOpen, onClose, transcript, sessionId }) => {
  if (!isOpen) return null;

  // Parse transcript if it's a string
  const messages = typeof transcript === 'string' 
    ? JSON.parse(transcript) 
    : transcript || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chat Transcript - Session: {sanitizeSessionId(sessionId)?.substring(0, 8) || 'unknown'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No chat transcript available</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
                    : 'bg-gray-50 dark:bg-gray-700/50 mr-8'
                }`}>
                  <div className="font-semibold text-sm mb-1 text-gray-600 dark:text-gray-400">
                    {msg.role === 'user' ? 'User' : 'Claude'}
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {sanitizeText(msg.content)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTranscriptModal;
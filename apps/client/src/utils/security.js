import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe HTML content
 * @returns {string} - The sanitized HTML content
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'p', 'br', 'div'],
    ALLOWED_ATTR: ['class', 'style'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitize text content (no HTML allowed)
 * @param {string} text - The text to sanitize
 * @returns {string} - The sanitized text
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  // Remove any HTML tags and escape special characters
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize JSON for display
 * @param {any} obj - The object to stringify and sanitize
 * @param {number} indent - The indentation for pretty printing
 * @returns {string} - The sanitized JSON string
 */
export const sanitizeJSON = (obj, indent = 2) => {
  try {
    const jsonString = JSON.stringify(obj, null, indent);
    // Escape HTML entities in the JSON string
    return jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } catch (error) {
    console.error('Error sanitizing JSON:', error);
    return '';
  }
};

/**
 * Validate and sanitize session IDs
 * @param {string} sessionId - The session ID to validate
 * @returns {string|null} - The sanitized session ID or null if invalid
 */
export const sanitizeSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') return null;
  
  // Session IDs should be alphanumeric with hyphens
  const cleaned = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
  
  // Validate length (typical UUID length)
  if (cleaned.length > 64 || cleaned.length < 8) return null;
  
  return cleaned;
};

/**
 * Validate and sanitize app names
 * @param {string} appName - The app name to validate
 * @returns {string|null} - The sanitized app name or null if invalid
 */
export const sanitizeAppName = (appName) => {
  if (!appName || typeof appName !== 'string') return null;
  
  // App names should be alphanumeric with hyphens and underscores
  const cleaned = appName.replace(/[^a-zA-Z0-9-_]/g, '');
  
  // Validate length
  if (cleaned.length > 50 || cleaned.length < 1) return null;
  
  return cleaned;
};

/**
 * Validate and sanitize event types
 * @param {string} eventType - The event type to validate
 * @returns {string|null} - The sanitized event type or null if invalid
 */
export const sanitizeEventType = (eventType) => {
  const allowedEventTypes = [
    'PreToolUse',
    'PostToolUse',
    'Notification',
    'Stop',
    'SubAgentStop',
    'UserPromptSubmit',
    'PreCompact',
    'AgentComplete',
    'AgentCompletionNotification'
  ];
  
  if (!eventType || !allowedEventTypes.includes(eventType)) {
    return null;
  }
  
  return eventType;
};

/**
 * Create a safe element with sanitized content
 * @param {string} tag - The HTML tag name
 * @param {string} content - The content to insert
 * @param {object} attributes - Optional attributes
 * @returns {HTMLElement} - The created element
 */
export const createSafeElement = (tag, content, attributes = {}) => {
  const element = document.createElement(tag);
  
  // Sanitize and set content
  if (content) {
    element.textContent = sanitizeText(content);
  }
  
  // Sanitize and set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class' || key === 'id') {
      element.setAttribute(key, sanitizeText(value));
    }
  });
  
  return element;
};
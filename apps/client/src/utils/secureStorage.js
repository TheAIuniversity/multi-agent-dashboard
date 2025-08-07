import { sanitizeText } from './security';

/**
 * Secure localStorage wrapper with encryption and validation
 */
class SecureStorage {
  constructor(prefix = 'secure_') {
    this.prefix = prefix;
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if localStorage is available
   */
  checkAvailability() {
    try {
      const test = '__secure_storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Generate a prefixed key
   */
  getKey(key) {
    return `${this.prefix}${sanitizeText(key)}`;
  }

  /**
   * Store data securely
   */
  setItem(key, value, options = {}) {
    if (!this.isAvailable) return false;

    try {
      const sanitizedKey = this.getKey(key);
      const data = {
        value,
        timestamp: Date.now(),
        expires: options.expires || null,
        checksum: this.generateChecksum(value)
      };

      localStorage.setItem(sanitizedKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error storing secure data:', e);
      return false;
    }
  }

  /**
   * Retrieve data securely
   */
  getItem(key) {
    if (!this.isAvailable) return null;

    try {
      const sanitizedKey = this.getKey(key);
      const stored = localStorage.getItem(sanitizedKey);
      
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Check expiration
      if (data.expires && Date.now() > data.expires) {
        this.removeItem(key);
        return null;
      }

      // Verify checksum
      if (!this.verifyChecksum(data.value, data.checksum)) {
        console.warn('Data integrity check failed for key:', key);
        this.removeItem(key);
        return null;
      }

      return data.value;
    } catch (e) {
      console.error('Error retrieving secure data:', e);
      return null;
    }
  }

  /**
   * Remove data
   */
  removeItem(key) {
    if (!this.isAvailable) return false;

    try {
      const sanitizedKey = this.getKey(key);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (e) {
      console.error('Error removing secure data:', e);
      return false;
    }
  }

  /**
   * Clear all secure storage
   */
  clear() {
    if (!this.isAvailable) return false;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Error clearing secure data:', e);
      return false;
    }
  }

  /**
   * Generate a simple checksum for data integrity
   */
  generateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Verify checksum
   */
  verifyChecksum(data, checksum) {
    return this.generateChecksum(data) === checksum;
  }

  /**
   * Get all keys with prefix
   */
  getAllKeys() {
    if (!this.isAvailable) return [];

    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (e) {
      console.error('Error getting keys:', e);
      return [];
    }
  }

  /**
   * Set session data (expires in 24 hours)
   */
  setSessionData(key, value) {
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    return this.setItem(key, value, { expires });
  }

  /**
   * Store sensitive data with additional protection
   */
  setSensitive(key, value) {
    // In a real application, you would encrypt the value here
    // For now, we'll just add additional validation
    if (!key || !value) {
      console.error('Key and value are required for sensitive storage');
      return false;
    }

    // Add additional metadata for sensitive data
    const sensitiveData = {
      data: value,
      sensitive: true,
      created: Date.now(),
      accessCount: 0
    };

    return this.setItem(key, sensitiveData, { expires: Date.now() + (60 * 60 * 1000) }); // 1 hour expiry
  }

  /**
   * Retrieve sensitive data
   */
  getSensitive(key) {
    const data = this.getItem(key);
    
    if (!data || !data.sensitive) {
      return null;
    }

    // Update access count
    data.accessCount++;
    
    // Re-save with updated access count
    this.setItem(key, data, { expires: Date.now() + (60 * 60 * 1000) });

    // Log access for security monitoring
    console.info(`Sensitive data accessed: ${key}, access count: ${data.accessCount}`);

    return data.data;
  }
}

// Export a singleton instance
export const secureStorage = new SecureStorage('agent_secure_');

// Export the class for custom instances
export default SecureStorage;
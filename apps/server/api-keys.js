import crypto from 'crypto';

// Generate secure API key
export function generateApiKey() {
  return `mad_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash API key for storage
export function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Validate API key format
export function isValidApiKey(apiKey) {
  return /^mad_[a-f0-9]{64}$/.test(apiKey);
}

// Create API key for user
export async function createApiKey(db, userId, name = 'Default') {
  const apiKey = generateApiKey();
  const hashedKey = hashApiKey(apiKey);
  
  const stmt = db.prepare(`
    INSERT INTO api_keys (user_id, key_hash, key_name, created_at, last_used_at)
    VALUES (?, ?, ?, datetime('now'), NULL)
  `);
  
  const result = stmt.run(userId, hashedKey, name);
  
  return {
    id: result.lastInsertRowid,
    key: apiKey, // Only returned once during creation
    name: name,
    created_at: new Date().toISOString()
  };
}

// Verify API key and get user
export async function verifyApiKey(db, apiKey) {
  if (!isValidApiKey(apiKey)) {
    return null;
  }
  
  const hashedKey = hashApiKey(apiKey);
  
  const stmt = db.prepare(`
    SELECT ak.*, u.* 
    FROM api_keys ak
    JOIN users u ON ak.user_id = u.id
    WHERE ak.key_hash = ? AND ak.is_active = 1
  `);
  
  const result = stmt.get(hashedKey);
  
  if (result) {
    // Update last used timestamp
    db.prepare('UPDATE api_keys SET last_used_at = datetime("now") WHERE id = ?').run(result.id);
    
    return {
      user: {
        id: result.user_id,
        email: result.email,
        name: result.name
      },
      apiKey: {
        id: result.id,
        name: result.key_name
      }
    };
  }
  
  return null;
}

// List user's API keys (without the actual keys)
export async function listApiKeys(db, userId) {
  const stmt = db.prepare(`
    SELECT id, key_name, created_at, last_used_at, is_active
    FROM api_keys
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);
  
  return stmt.all(userId);
}

// Revoke API key
export async function revokeApiKey(db, userId, keyId) {
  const stmt = db.prepare(`
    UPDATE api_keys 
    SET is_active = 0 
    WHERE id = ? AND user_id = ?
  `);
  
  return stmt.run(keyId, userId).changes > 0;
}
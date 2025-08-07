# Security Implementation

## Database Security

### 1. **SQLite is Backend-Only**
- Database file (`events.db`) is stored on the server, NOT accessible from browser
- All database operations happen server-side through secure APIs
- No database credentials or direct access from frontend

### 2. **Authentication Security**
- Passwords hashed with bcrypt (12 rounds by default)
- JWT tokens with expiration
- Session management with automatic cleanup
- Brute force protection (5 attempts max)
- Rate limiting on auth endpoints

### 3. **API Security**
- CORS configured for specific origins only
- Helmet.js for security headers
- Input sanitization on all endpoints
- SQL injection prevention (parameterized queries)
- Request size limits
- Rate limiting

### 4. **Data Protection**
- User data isolated by user_id
- Events can be user-specific
- Agents are per-user
- No cross-user data access

### 5. **Session Security**
- Secure token generation
- Token expiration (7 days default)
- Automatic session cleanup
- Audit logging for security events

## Production Deployment Checklist

### Environment Variables (REQUIRED)
```bash
JWT_SECRET=<64-character-random-string>
SESSION_SECRET=<64-character-random-string>
NODE_ENV=production
BCRYPT_ROUNDS=12
```

### Database Security
1. Move database file outside web root
2. Set file permissions: `chmod 600 events.db`
3. Regular backups
4. Consider PostgreSQL for production

### Additional Security Measures
1. Use HTTPS everywhere
2. Set up firewall rules
3. Use reverse proxy (nginx)
4. Enable audit logging
5. Monitor for suspicious activity
6. Regular security updates

## User Capacity

### SQLite Performance
- **Development**: 100-1,000 users
- **Small Production**: 1,000-10,000 users
- **Concurrent Users**: 100-500
- **Events Storage**: Millions of records

### When to Upgrade
Upgrade to PostgreSQL when:
- More than 1,000 active users
- More than 100 concurrent connections
- Need advanced features (replication, etc.)
- Require horizontal scaling

## Security Best Practices

1. **Never expose database files**
2. **Always use environment variables for secrets**
3. **Enable all security middleware in production**
4. **Regular security audits**
5. **Keep dependencies updated**
6. **Monitor for vulnerabilities**

## GDPR Compliance
- User data export endpoint ready
- User deletion capability
- Audit logging
- Privacy by design
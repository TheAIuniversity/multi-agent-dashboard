import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { logger } from './logger';

// Password configuration
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const MIN_PASSWORD_LENGTH = parseInt(process.env.PASSWORD_MIN_LENGTH || '8');

// Password strength requirements
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const passwordRequirements: PasswordRequirements = {
  minLength: MIN_PASSWORD_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// Common weak passwords list (subset for demo)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'shadow', 'superman', 'michael',
  'football', 'baseball', 'liverpool', 'jordan', 'freedom',
]);

/**
 * Password Security Service
 */
export class PasswordService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      // Validate password strength first
      const validation = PasswordService.validatePasswordStrength(password);
      if (!validation.isValid) {
        throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      logger.error('Password hashing failed', error);
      throw error;
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Password verification failed', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < passwordRequirements.minLength) {
      errors.push(`Password must be at least ${passwordRequirements.minLength} characters long`);
    } else {
      score += 1;
    }

    // Check for uppercase letters
    if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Check for lowercase letters
    if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Check for numbers
    if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // Check for special characters
    if (passwordRequirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    // Check for common passwords
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
      suggestions.push('Use a unique password that is not commonly used');
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      suggestions.push('Avoid repeating the same character multiple times');
      score -= 1;
    }

    // Check for keyboard patterns
    const keyboardPatterns = ['qwerty', '123456', 'asdfgh', 'zxcvbn'];
    for (const pattern of keyboardPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        suggestions.push('Avoid keyboard patterns like "qwerty" or "123456"');
        score -= 1;
        break;
      }
    }

    // Additional scoring for password complexity
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1; // Multiple special chars

    // Normalize score (0-5 scale)
    score = Math.max(0, Math.min(5, score));

    return {
      isValid: errors.length === 0,
      score,
      errors,
      suggestions,
    };
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each required set
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += symbols[crypto.randomInt(symbols.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  }

  /**
   * Generate a password reset token
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a reset token for storage
   */
  static hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

/**
 * Encryption Service for sensitive data
 */
export class EncryptionService {
  private static algorithm = 'aes-256-gcm';
  private static keyLength = 32; // 256 bits
  private static ivLength = 16;  // 128 bits
  private static tagLength = 16; // 128 bits

  /**
   * Generate encryption key from password using PBKDF2
   */
  static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, EncryptionService.keyLength, 'sha256');
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(text: string, key: Buffer): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    try {
      const iv = crypto.randomBytes(EncryptionService.ivLength);
      const cipher = crypto.createCipherGCM(EncryptionService.algorithm, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      logger.error('Encryption failed', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(
    encrypted: string,
    key: Buffer,
    iv: string,
    tag: string
  ): string {
    try {
      const decipher = crypto.createDecipherGCM(
        EncryptionService.algorithm,
        key,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Generate encryption salt
   */
  static generateSalt(): Buffer {
    return crypto.randomBytes(32);
  }
}

/**
 * One-Time Password (OTP) Service
 */
export class OtpService {
  /**
   * Generate numeric OTP
   */
  static generateNumericOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(digits.length)];
    }
    
    return otp;
  }

  /**
   * Generate alphanumeric OTP
   */
  static generateAlphanumericOtp(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += chars[crypto.randomInt(chars.length)];
    }
    
    return otp;
  }

  /**
   * Hash OTP for storage
   */
  static hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }
}

/**
 * Secure random utilities
 */
export class SecureRandom {
  /**
   * Generate cryptographically secure random bytes
   */
  static bytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Generate secure random string
   */
  static string(length: number, charset?: string): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const chars = charset || defaultCharset;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[crypto.randomInt(chars.length)];
    }
    
    return result;
  }

  /**
   * Generate secure random integer
   */
  static int(min: number, max: number): number {
    return crypto.randomInt(min, max);
  }

  /**
   * Generate UUID v4
   */
  static uuid(): string {
    return crypto.randomUUID();
  }
}

/**
 * Data sanitization utilities
 */
export class DataSanitizer {
  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize string for safe storage
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Remove potentially dangerous characters
   */
  static removeDangerousChars(input: string): string {
    return input.replace(/[<>'"&`]/g, '');
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

// Export all services
export default {
  PasswordService,
  EncryptionService,
  OtpService,
  SecureRandom,
  DataSanitizer,
};
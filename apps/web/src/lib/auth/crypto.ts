import crypto from 'crypto';

/**
 * OWASP ASVS 5.0 Compliant Password Hashing & Verification
 * Uses native crypto.scrypt (memory-hard, resistant to GPU attacks).
 * Generates cryptographically secure random salts and performs constant-time comparisons.
 */

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS: crypto.ScryptOptions = {
  N: 16384, // CPU/memory cost parameter (2^14)
  r: 8,     // Block size
  p: 1,     // Parallelization
};

/**
 * Hashes a plaintext password using a cryptographically secure 16-byte salt.
 * Output format: `scrypt$salt$hash`
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const salt = crypto.randomBytes(16).toString('hex');

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a plaintext password against an authoritative stored hash using constant-time comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const salt = parts[1];
  const originalHash = Buffer.from(parts[2], 'hex');

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) return reject(err);
      try {
        const matches = crypto.timingSafeEqual(originalHash, derivedKey);
        resolve(matches);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Generates a cryptographically secure random alphanumeric code.
 */
export function generateRandomCode(length = 6): string {
  const chars = '0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

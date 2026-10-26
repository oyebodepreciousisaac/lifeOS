import crypto from 'crypto';
import { isPrivilegedRole, PRIVILEGED_ROLES } from './rbac';

export { isPrivilegedRole, PRIVILEGED_ROLES };

/**
 * RFC 6238 Compliant TOTP (Time-Based One-Time Password) Engine
 * Implemented natively using crypto HMAC-SHA1.
 * Supports Authenticator apps (Google Authenticator, Microsoft Authenticator, Authy).
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return result;
}

function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Computes a 6-digit TOTP token for a given secret at a specific counter step (30s window).
 */
export function computeTotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verifies a 6-digit TOTP token allowing a +/- 1 step drift (covers 90 seconds window).
 */
export function verifyTotpToken(token: string, secret: string, timeStep = 30): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return false;
  }

  const currentCounter = Math.floor(Date.now() / 1000 / timeStep);

  for (const drift of [-1, 0, 1]) {
    const expected = computeTotp(secret, currentCounter + drift);
    if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Generates an otpauth:// URI formatted for QR code generation.
 */
export function generateOtpAuthUri(schoolName: string, userEmail: string, secret: string): string {
  const issuer = encodeURIComponent(`SchoolOS (${schoolName})`);
  const account = encodeURIComponent(userEmail);
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates 8 single-use emergency backup recovery codes.
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

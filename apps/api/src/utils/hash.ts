import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

/**
 * Hashes a plaintext password using bcrypt.
 * @param password The plaintext password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plaintext password with a bcrypt hash.
 * @param password The plaintext password to check.
 * @param hash The bcrypt hash to compare against.
 * @returns A promise that resolves to a boolean indicating match status.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

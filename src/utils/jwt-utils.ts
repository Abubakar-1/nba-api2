/**
 * JWT token utility functions using jwt-decode library
 */
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode a JWT token
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Check if a token will expire soon
 * @param token - JWT token string
 * @param thresholdMinutes - Minutes before expiry to consider "expiring soon"
 * @returns true if token will expire within threshold, false otherwise
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdMinutes: number = 5,
): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiry = expiryTime - currentTime;
  const thresholdMs = thresholdMinutes * 60 * 1000;

  return timeUntilExpiry < thresholdMs && timeUntilExpiry > 0;
}

/**
 * Get time remaining until token expires
 * @param token - JWT token string
 * @returns Milliseconds until expiry, or 0 if expired/invalid
 */
export function getTokenTimeRemaining(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const expiryTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = expiryTime - currentTime;

  return timeRemaining > 0 ? timeRemaining : 0;
}

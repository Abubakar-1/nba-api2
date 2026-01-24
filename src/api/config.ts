/**
 * Unified API Client Configuration
 * Consolidates all API endpoints and handles authentication
 */

export const API_CONFIG = {
  // Primary Auth API
  AUTH_API:
    import.meta.env.VITE_AUTH_API_URL ?? "https://nbabackend.online:4443",

  // Main NBA Backend API
  MAIN_API: import.meta.env.VITE_API_URL ?? "https://nbabackend.online:4443",

  // Digital License API
  DIGITAL_LICENSE_API: "https://digital-license.nigerianbar.online",

  // Etrasact/Payment APIs
  ETRASACT_API: "https://api.credodemo.com",

  // eTranzact Keys (MOVE TO ENV!)
  ETRASACT_AUTH_KEY:
    import.meta.env.VITE_ETRASACT_AUTH_KEY ||
    "0PUB1042KrjgZsFbV4uuI0rfaWdw78xO",
};

/**
 * Determines which base URL to use based on endpoint
 */
export function getApiBaseUrl(endpoint: string): string {
  if (
    endpoint.startsWith("/auth") ||
    endpoint.startsWith("/user/") ||
    endpoint.startsWith("/dashboard")
  ) {
    return API_CONFIG.AUTH_API;
  }
  // Default to MAIN_API
  return API_CONFIG.MAIN_API;
}

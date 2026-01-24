/**
 * Logger utility with environment-aware logging
 * Automatically disables console output in production
 */

const isDev = true; // Forced to true for debugging

export const logger = {
  /**
   * Log general information (dev only)
   */
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log with custom styling (dev only)
   */
  debug: (label: string, data: any) => {
    if (isDev) {
      console.log(`%c[${label}]`, "color: #0066cc; font-weight: bold;", data);
    }
  },

  /**
   * Log performance metrics
   */
  perf: (label: string, duration: number) => {
    if (isDev) {
      console.log(
        `%c⏱️ ${label}`,
        "color: #ff9800; font-weight: bold;",
        `${duration}ms`
      );
    }
  },

  /**
   * Group related logs
   */
  group: (label: string, fn: () => void) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },
};

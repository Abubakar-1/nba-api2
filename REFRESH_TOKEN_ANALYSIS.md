# Refresh Token Implementation Analysis

## Current Implementation Overview

The refresh token system is implemented in `src/api/client/index.ts` with an Axios interceptor that handles 401 errors.

## Identified Issues

### 🔴 **CRITICAL ISSUE #1: Infinite Loop Risk**

**Location:** `responseErrorHandler` function (lines 14-76)

**Problem:**

```typescript
if ((isAuthError || isRefreshError) && requestConfig.url !== "/auth/login" && requestConfig.url !== "/auth/refresh-token" && !requestConfig._retry) {
  requestConfig._retry = true;
  // ... refresh logic
  return createClient({ baseURL: requestConfig.baseURL }).request({
    ...requestConfig,
  });
}
```

**Issue:** When retrying the request after token refresh, a NEW client instance is created without the `_retry` flag properly propagated. If the retried request also fails with 401, it could trigger another refresh attempt.

**Impact:** Potential infinite loop of refresh requests.

---

### 🟡 **ISSUE #2: Inconsistent Token Storage Keys**

**Location:** Multiple files

**Problem:**

- `auth-context.ts` uses: `"access_token"` and `"refresh_token"` (with underscores)
- `client/index.ts` line 36 uses: `localStorage.getItem("refresh_token")`
- `client/index.ts` lines 109-110 uses: `localStorage.refresh_token` (direct property access)

**Code:**

```typescript
// Line 36 - Correct
const refreshToken = localStorage.getItem("refresh_token");

// Lines 109-110 - INCONSISTENT
const token = refreshToken
  ? localStorage.refresh_token // ❌ Direct property access
  : localStorage.access_token; // ❌ Direct property access
```

**Issue:** Direct property access (`localStorage.refresh_token`) is inconsistent with `getItem()` and may cause issues.

**Impact:** Tokens might not be retrieved correctly in some scenarios.

---

### 🟡 **ISSUE #3: Race Condition with Multiple Requests**

**Location:** `responseErrorHandler` function

**Problem:** If multiple API requests fail simultaneously with 401 errors, they will ALL attempt to refresh the token at the same time.

**Scenario:**

1. User has 5 API requests in flight
2. Access token expires
3. All 5 requests get 401 responses
4. All 5 trigger refresh token calls simultaneously
5. Multiple `/auth/refresh-token` requests hit the backend

**Impact:**

- Unnecessary load on backend
- Potential token invalidation if backend doesn't handle concurrent refresh requests
- Wasted network bandwidth

---

### 🟡 **ISSUE #4: No Token Expiry Proactive Refresh**

**Location:** Entire system

**Problem:** The system only refreshes tokens AFTER they expire (reactive), not before (proactive).

**Current Flow:**

1. Access token expires
2. API request fails with 401
3. System refreshes token
4. Request is retried

**Better Flow:**

1. Check token expiry before it expires
2. Refresh token proactively
3. No failed requests

**Impact:** Poor user experience with failed requests and retries.

---

### 🟡 **ISSUE #5: Unclear Refresh Token Response Structure**

**Location:** `responseErrorHandler` lines 46-50

**Problem:**

```typescript
if (res?.data?.access_token) {
  localStorage.setItem("access_token", res?.data?.access_token);
  if (res?.data?.refresh_token) {
    localStorage.setItem("refresh_token", res?.data?.refresh_token);
  }
}
```

**Issue:** The code checks for `access_token` but the login response uses `accessToken` (camelCase). This inconsistency might cause issues.

**Impact:** Refresh might fail silently if backend returns camelCase tokens.

---

### 🟢 **ISSUE #6: No Refresh Token Expiry Handling**

**Location:** Entire system

**Problem:** There's no handling for when the refresh token itself expires.

**Current Behavior:**

- If refresh token is expired, the refresh call fails with 401
- User is logged out and page reloads

**Missing:**

- No warning to user before refresh token expires
- No graceful handling or "session about to expire" notification

---

## Recommended Fixes

### Fix #1: Prevent Infinite Loops

```typescript
const responseErrorHandler = async function (error: any) {
  const requestConfig: any = error.config;

  // Check if this request has already been retried
  if (requestConfig._isRetry) {
    return Promise.reject(error);
  }

  const isAuthError = error?.response?.status === 401;
  const isRefreshError = error?.response?.data?.info === "Token expired" || error?.response?.data?.message === "Unauthorized";

  if ((isAuthError || isRefreshError) && requestConfig.url !== "/auth/login" && requestConfig.url !== "/auth/refresh-token") {
    requestConfig._isRetry = true; // Mark as retried

    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const res: AxiosResponse = await createClient({ baseURL: AUTH_API_URL }, true).post("/auth/refresh-token", { refreshToken });

      const newAccessToken = res?.data?.access_token || res?.data?.accessToken;
      const newRefreshToken = res?.data?.refresh_token || res?.data?.refreshToken;

      if (newAccessToken) {
        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        // Update the failed request's authorization header
        requestConfig.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry with the SAME config (including _isRetry flag)
        return Axios.request(requestConfig);
      }
    } catch (refreshError: any) {
      logger.error("Token refresh failed", refreshError);

      if (refreshError.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Better than reload
      }
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
};
```

### Fix #2: Consistent Token Storage

```typescript
// Replace lines 108-110
const token = refreshToken ? localStorage.getItem("refresh_token") : localStorage.getItem("access_token");
```

### Fix #3: Prevent Race Conditions

```typescript
// Add at the top of the file
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// In responseErrorHandler
if (isRefreshing) {
  // Wait for the ongoing refresh to complete
  return new Promise((resolve) => {
    subscribeTokenRefresh((token: string) => {
      requestConfig.headers["Authorization"] = `Bearer ${token}`;
      resolve(Axios.request(requestConfig));
    });
  });
}

isRefreshing = true;

try {
  // ... refresh logic
  const newAccessToken = res?.data?.access_token || res?.data?.accessToken;

  if (newAccessToken) {
    localStorage.setItem("access_token", newAccessToken);
    onTokenRefreshed(newAccessToken); // Notify waiting requests
    // ... rest of logic
  }
} finally {
  isRefreshing = false;
}
```

### Fix #4: Proactive Token Refresh

```typescript
// Add JWT decode utility
import jwtDecode from "jwt-decode";

function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  try {
    const decoded: any = jwtDecode(token);
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return timeUntilExpiry < thresholdMs;
  } catch {
    return false;
  }
}

// In request interceptor
clientInstance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access_token");

  if (token && isTokenExpiringSoon(token)) {
    // Proactively refresh token
    await refreshAccessToken();
  }

  return config;
});
```

### Fix #5: Handle Both Token Formats

```typescript
const newAccessToken = res?.data?.access_token || res?.data?.accessToken;
const newRefreshToken = res?.data?.refresh_token || res?.data?.refreshToken;
```

### Fix #6: Session Expiry Warning

```typescript
// Add a session monitor
function startSessionMonitor() {
  setInterval(() => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken && isTokenExpiringSoon(refreshToken, 30)) {
      // Show warning 30 minutes before refresh token expires
      NotifyWarning("Your session will expire soon. Please save your work.");
    }
  }, 60000); // Check every minute
}
```

## Summary of Issues

| Priority    | Issue                           | Impact | Fix Complexity |
| ----------- | ------------------------------- | ------ | -------------- |
| 🔴 Critical | Infinite Loop Risk              | High   | Medium         |
| 🟡 High     | Inconsistent Token Storage      | Medium | Low            |
| 🟡 High     | Race Conditions                 | Medium | High           |
| 🟡 Medium   | No Proactive Refresh            | Low    | Medium         |
| 🟡 Medium   | Token Format Inconsistency      | Low    | Low            |
| 🟢 Low      | No Refresh Token Expiry Warning | Low    | Medium         |

## Immediate Actions Required

1. **Fix the infinite loop risk** - This is critical
2. **Fix inconsistent token storage** - Quick win
3. **Handle token format inconsistency** - Quick win
4. **Implement race condition prevention** - Important for production
5. **Consider proactive refresh** - Nice to have

Would you like me to implement these fixes?

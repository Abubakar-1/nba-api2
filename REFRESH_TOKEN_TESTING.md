# Refresh Token Testing Guide

## Quick Verification Steps

### 1. Test Proactive Refresh (NEW Feature!)

**Objective:** Verify tokens are refreshed BEFORE they expire

**Steps:**

1. Login to the application
2. Open browser DevTools → Console
3. Look for log message: `"Token expiring soon, refreshing proactively"`
4. Open Network tab
5. Make any API request when token is close to expiry (within 5 minutes)
6. **Expected:** You should see `/auth/refresh-token` call BEFORE your API request
7. **Expected:** Your API request succeeds without any 401 error

**Success Criteria:**

- ✅ No 401 errors appear
- ✅ Token refresh happens automatically in background
- ✅ User doesn't notice anything

---

### 2. Test Reactive Refresh (Improved)

**Objective:** Verify 401 errors trigger token refresh

**Steps:**

1. Login to the application
2. Manually expire your access token:
   ```javascript
   // In browser console
   localStorage.setItem("access_token", "invalid_token");
   ```
3. Make any API request (navigate to a page, click a button, etc.)
4. Open Network tab
5. **Expected:** You should see:
   - Original request fails with 401
   - `/auth/refresh-token` call
   - Original request retried and succeeds

**Success Criteria:**

- ✅ Request is automatically retried
- ✅ No error shown to user
- ✅ Page loads successfully

---

### 3. Test Race Condition Prevention

**Objective:** Verify multiple simultaneous requests only trigger ONE refresh

**Steps:**

1. Login to the application
2. Open Network tab in DevTools
3. Manually expire your access token:
   ```javascript
   localStorage.setItem("access_token", "invalid_token");
   ```
4. Navigate to a page that makes multiple API calls (e.g., dashboard)
5. **Expected:** You should see:
   - Multiple requests fail with 401
   - Only ONE `/auth/refresh-token` call
   - All original requests retried and succeed

**Success Criteria:**

- ✅ Only 1 refresh token call (not multiple)
- ✅ All requests eventually succeed
- ✅ No infinite loops

---

### 4. Test Infinite Loop Prevention

**Objective:** Verify requests don't retry infinitely

**Steps:**

1. Login to the application
2. Set both tokens to invalid:
   ```javascript
   localStorage.setItem("access_token", "invalid");
   localStorage.setItem("refresh_token", "invalid");
   ```
3. Make any API request
4. **Expected:** You should see:
   - Original request fails with 401
   - `/auth/refresh-token` call fails with 401
   - User is logged out
   - Redirected to /login
   - NO infinite loop of requests

**Success Criteria:**

- ✅ No infinite loops
- ✅ User redirected to login
- ✅ localStorage cleared

---

### 5. Test Token Format Compatibility

**Objective:** Verify both camelCase and snake_case work

**Method 1: Check Login Response**

1. Login to the application
2. Open Network tab
3. Find `/auth/login` request
4. Check response format
5. **Expected:** Tokens are stored correctly regardless of format

**Method 2: Check Refresh Response**

1. Let token expire or manually trigger refresh
2. Check `/auth/refresh-token` response
3. **Expected:** Tokens are stored correctly regardless of format

**Success Criteria:**

- ✅ Works with `accessToken` (camelCase)
- ✅ Works with `access_token` (snake_case)
- ✅ Tokens stored in localStorage correctly

---

## Console Commands for Testing

### Check Current Tokens

```javascript
console.log("Access Token:", localStorage.getItem("access_token"));
console.log("Refresh Token:", localStorage.getItem("refresh_token"));
```

### Decode Access Token

```javascript
function decodeToken(token) {
  const parts = token.split(".");
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded);
}

const token = localStorage.getItem("access_token");
const decoded = decodeToken(token);
console.log("Token expires at:", new Date(decoded.exp * 1000));
console.log("Time until expiry:", (decoded.exp * 1000 - Date.now()) / 1000 / 60, "minutes");
```

### Manually Trigger Refresh

```javascript
// This will trigger proactive refresh on next request
const token = localStorage.getItem("access_token");
const decoded = decodeToken(token);
// Set expiry to 4 minutes from now (within 5-minute threshold)
decoded.exp = Math.floor(Date.now() / 1000) + 4 * 60;
// Note: This won't actually work because tokens are signed
// Better to wait for natural expiry or use backend to generate short-lived token
```

### Clear All Tokens

```javascript
localStorage.removeItem("access_token");
localStorage.removeItem("refresh_token");
localStorage.removeItem("user");
console.log("All tokens cleared");
```

---

## Expected Log Messages

### Proactive Refresh

```
[DEBUG] Token expiring soon, refreshing proactively
[DEBUG] Proactively refreshing access token
[DEBUG] Access token refreshed successfully
```

### Reactive Refresh

```
[DEBUG] Handling 401 error with token refresh
[DEBUG] Bypassing 401 with token refresh attempt
[DEBUG] Access token refreshed successfully
```

### Refresh Failure

```
[ERROR] Token refresh failed
[DEBUG] Unauthorized after refresh attempt, clearing storage
```

---

## Common Issues & Solutions

### Issue: Token not refreshing proactively

**Cause:** Token expiry is more than 5 minutes away
**Solution:** Wait until token is within 5 minutes of expiry, or adjust threshold in code

### Issue: Multiple refresh calls still happening

**Cause:** Requests not using the same client instance
**Solution:** Ensure all API calls use `createClient()` or `clientRequest()`

### Issue: User logged out unexpectedly

**Cause:** Refresh token expired
**Solution:** This is expected behavior - refresh tokens do expire

### Issue: 401 errors still appearing

**Cause:** Backend not returning tokens in expected format
**Solution:** Check backend response format matches documentation

---

## Performance Monitoring

### Metrics to Track

1. **Refresh Frequency:** How often are tokens being refreshed?
2. **Proactive vs Reactive:** Ratio of proactive to reactive refreshes
3. **Refresh Success Rate:** Percentage of successful refreshes
4. **User Logout Rate:** How often are users being logged out?

### Ideal Metrics

- 🎯 **95%+ proactive refreshes** (tokens refreshed before expiry)
- 🎯 **<5% reactive refreshes** (tokens refreshed after 401)
- 🎯 **100% refresh success rate** (when refresh token is valid)
- 🎯 **Low logout rate** (only when refresh token expires)

---

## Debugging Checklist

If something isn't working:

- [ ] Check browser console for error messages
- [ ] Verify `jwt-decode` package is installed
- [ ] Check Network tab for `/auth/refresh-token` calls
- [ ] Verify tokens are stored in localStorage
- [ ] Check token expiry times
- [ ] Verify backend returns tokens in correct format
- [ ] Check for CORS errors
- [ ] Verify API endpoints are correct
- [ ] Check if multiple client instances are being created

---

## Success Indicators

Your implementation is working correctly if:

✅ Users never see 401 errors (except on first login)
✅ Tokens refresh automatically in background
✅ Only one refresh call happens for multiple simultaneous requests
✅ No infinite loops occur
✅ Users stay logged in seamlessly
✅ Console shows proactive refresh logs
✅ Network tab shows minimal refresh token calls

---

## Next Steps After Testing

1. Monitor production logs for refresh patterns
2. Adjust proactive refresh threshold if needed (currently 5 minutes)
3. Consider adding session expiry warnings
4. Track refresh success/failure rates
5. Optimize refresh timing based on user behavior

---

**Happy Testing! 🚀**

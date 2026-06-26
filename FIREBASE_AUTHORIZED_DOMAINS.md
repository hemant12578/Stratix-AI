# 🔒 Fix Firebase Unauthorized Domain Error

## Problem
When accessing your app through a forwarded port/tunnel (like `https://6mw91vst-5173.inc1.devtunnels.ms/`), you may see:
```
Firebase: Error (auth/unauthorized-domain)
```

This happens because Firebase only allows authentication from domains that are explicitly authorized.

## ✅ Solution: Add Authorized Domain

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **dataforge-ai-fcfb1**

### Step 2: Navigate to Authorized Domains
1. Click the **gear icon** ⚙️ (top left)
2. Click **Project settings**
3. Scroll down to **"Authorized domains"** section

### Step 3: Add Your Tunnel Domain
1. Click **"Add domain"** button
2. Enter your tunnel domain: `6mw91vst-5173.inc1.devtunnels.ms`
3. Click **"Add"**

### Step 4: Verify
The domain should now appear in the authorized domains list:
- `localhost` (already there)
- `dataforge-ai-fcfb1.firebaseapp.com` (already there)
- `6mw91vst-5173.inc1.devtunnels.ms` (newly added)

## 🔄 For Different Tunnel URLs

If your tunnel URL changes (common with DevTunnels), you'll need to:
1. Get the new domain from your tunnel URL
2. Add it to Firebase authorized domains following the same steps

## 📝 Quick Reference

**Firebase Console URL:**
```
https://console.firebase.google.com/project/dataforge-ai-fcfb1/settings/general
```

**Current Tunnel Domain:**
```
6mw91vst-5173.inc1.devtunnels.ms
```

## ✅ After Adding Domain

1. **Refresh your browser** at `https://6mw91vst-5173.inc1.devtunnels.ms/`
2. Try logging in again
3. The `auth/unauthorized-domain` error should be gone!

## 🎯 Alternative: Use Localhost

If you don't want to add tunnel domains, you can:
- Use `http://localhost:5173` locally
- Only add production domains to Firebase authorized domains

## 🔒 Security Note

Firebase authorized domains help prevent unauthorized access. Only add domains you trust and control.

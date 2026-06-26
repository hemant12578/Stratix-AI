# Firebase Authentication Setup Guide

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

## 🔑 Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password** - Click and enable
   - **Google** - Click and enable (add your support email)

## 📱 Step 3: Get Firebase Config

1. In Firebase Console, click the gear icon ⚙️ > **Project settings**
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app (give it a nickname)
5. Copy the Firebase configuration object

## ⚙️ Step 4: Configure Environment Variables

1. Create a `.env` file in the `client` directory (copy from `.env.example`)
2. Add your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## 🗄️ Step 5: Set Up Firestore Database (Optional but Recommended)

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location close to your users
5. Click "Enable"

The app will automatically create user profiles in Firestore when users sign up.

## 📦 Step 6: Install Dependencies

```bash
cd client
npm install
```

Firebase is already added to `package.json`, so it will install automatically.

## ✅ Step 7: Test Authentication

1. Start your development server: `npm run dev`
2. Click "Login" button
3. Try signing up with email/password
4. Try signing in with Google
5. Check Firebase Console > Authentication to see registered users

## 🔒 Security Rules (For Production)

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Authentication Rules:
- Email verification (optional but recommended)
- Password strength requirements
- Rate limiting (handled by Firebase)

## 🎯 Features Implemented

✅ Email/Password authentication
✅ Google Sign-In
✅ User profile creation in Firestore
✅ Protected routes
✅ User session management
✅ Logout functionality
✅ User display name support

## 🐛 Troubleshooting

**Error: "Firebase: Error (auth/invalid-api-key)"**
- Check your `.env` file has correct values
- Make sure variable names start with `VITE_`
- Restart your dev server after changing `.env`

**Error: "Firebase: Error (auth/operation-not-allowed)"**
- Go to Firebase Console > Authentication > Sign-in method
- Enable the sign-in method you're trying to use

**Google Sign-In not working:**
- Make sure Google provider is enabled in Firebase Console
- Check that you've added authorized domains
- Verify OAuth consent screen is configured (if required)

## 📝 Next Steps

- Add email verification
- Add password reset functionality
- Add user profile page
- Add subscription tier management
- Add usage tracking

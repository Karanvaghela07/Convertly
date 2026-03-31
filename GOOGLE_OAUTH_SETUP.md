# Google OAuth Setup Guide for Convertly

This guide will help you set up Google Sign-In for your Convertly application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Convertly")
5. Click "CREATE"

## Step 2: Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to **Credentials** (left sidebar)
2. Click **CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. If prompted, first configure the OAuth consent screen:
   - Click **CONFIGURE CONSENT SCREEN**
   - Choose **External** user type
   - Fill in the required fields:
     - App name: "Convertly"
     - User support email: Your email
     - Developer contact: Your email
   - Add required scopes (use defaults)
   - Click **SAVE AND CONTINUE** → **SAVE AND CONTINUE** → **BACK TO DASHBOARD**

4. Return to **Credentials** and click **CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add these Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5000` (if using different port)
   - Your production domain (e.g., `https://yourdomain.com`)

7. Add these Authorized redirect URIs:
   - `http://localhost:3000/signin.html`
   - `http://localhost:3000/signup.html`
   - Your production URLs

8. Click **CREATE**
9. Copy your **Client ID** (you'll need this)

## Step 3: Configure Your Application

### Backend Setup

1. **Add Google Client ID to your .env file:**
   ```
   GOOGLE_CLIENT_ID=your_client_id_from_step_2
   ```

   Example `.env` file:
   ```
   MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/Convertly"
   JWT_SECRET="your_secret_key"
   PORT=3000
   GOOGLE_CLIENT_ID="1234567890-abc123def456.apps.googleusercontent.com"
   ```

2. **Verify Backend Implementation:**
   - The new `/api/auth/google` endpoint is already implemented in `server.js`
   - It receives the Google ID token, verifies it, and creates/logs in the user

### Frontend Setup

1. **Add Google Client ID to auth.js:**
   - Open `/public/js/auth.js`
   - Find the line: `client_id: 'YOUR_GOOGLE_CLIENT_ID',`
   - Replace with your actual Client ID from Step 2

   Example:
   ```javascript
   window.google.accounts.id.initialize({
     client_id: '1234567890-abc123def456.apps.googleusercontent.com',
     callback: handleGoogleSignIn,
   });
   ```

## Step 4: Test Your Implementation

1. **Start your server:**
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Test Sign-In:**
   - Go to `http://localhost:3000/signin.html`
   - Click "Continue with Google"
   - You should see Google's sign-in dialog
   - Sign in with your Google account
   - You should be redirected to the home page

3. **Test Sign-Up:**
   - Go to `http://localhost:3000/signup.html`
   - Click "Sign up with Google"
   - Follow the same process

## How It Works

### Frontend Flow:
1. User clicks "Sign in/up with Google" button
2. Google Sign-In SDK initializes and shows the sign-in dialog
3. After successful authentication, Google returns an ID token
4. Frontend sends this token to the backend (`/api/auth/google`)

### Backend Flow:
1. Backend receives the JWT token from Google
2. Uses `google-auth-library` to verify the token
3. Extracts user info (email, name, avatar)
4. Creates a new user or updates existing user
5. Generates a session JWT token
6. Sets a secure HTTP-only cookie with the JWT
7. Returns user data to frontend

### User Experience:
- New users: Auto-created with Google profile info (no password needed)
- Existing users: Sign in automatically with their Google account
- Email-based sign-in/up still works as before

## Troubleshooting

### "Invalid token or authentication failed" error
- Verify your Google Client ID matches in both `server.js` and `auth.js`
- Check that GOOGLE_CLIENT_ID is set in your .env file
- Ensure your application domain is in the authorized origins

### "Client ID not found" error
- Missing GOOGLE_CLIENT_ID in backend
- Add it to your .env file

### Button doesn't show Google sign-in dialog
- Check that the Google Sign-In SDK is loaded
- Open browser console (F12) and check for errors
- Verify that YOUR_GOOGLE_CLIENT_ID is replaced with actual Client ID in auth.js

### User created but profile picture not showing
- Users without a Google profile picture will get a placeholder
- This can be updated later in account settings

## Security Notes

✅ Best Practices Implemented:
- ID tokens are verified server-side using Google's public keys
- Passwords are optional for Google OAuth users
- JWT tokens are stored in HTTP-only cookies (prevents XSS attacks)
- CORS is configured
- MongoDB stores user data securely

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/protocols/oauth2)
- [google-auth-library NPM Package](https://www.npmjs.com/package/google-auth-library)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

## Support

If you encounter any issues:
1. Check the browser console (F12) for error messages
2. Check the server logs for backend errors
3. Verify all configuration steps are complete
4. Test with a different Google account

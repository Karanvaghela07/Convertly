# Quick Google Sign-In Setup (5 minutes)

## What You Need

Your Google Client ID - get it here: [Google Cloud Console](https://console.cloud.google.com)

## Super Quick Setup

### Step 1: Get Your Google Client ID (2 minutes)

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **Credentials** (left sidebar)
4. Click **+ CREATE CREDENTIALS**
5. Select **OAuth 2.0 Client ID**
6. Choose **Web application**
7. Under "Authorized JavaScript origins" add:
   - `http://localhost:3000`
8. Click **CREATE**
9. **Copy the Client ID** (looks like: `1234567890-abcdef.apps.googleusercontent.com`)

### Step 2: Add to Your Project (1 minute)

Open `.env` file in your project root and replace:
```
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
```

With your actual Client ID, like:
```
GOOGLE_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
```

### Step 3: Restart Server (30 seconds)

Stop your server (Ctrl+C) and restart:
```bash
npm start
```

## Done!

Now go to http://localhost:3000/signin.html and click "Continue with Google"

---

## Troubleshooting

### Still not working?

1. **Check the client ID is real:**
   - Make sure it has the format: `xxx-xxx.apps.googleusercontent.com`
   - Not just random text

2. **Restart the server:**
   ```bash
   npm start
   ```

3. **Check browser console (F12):**
   - Open Developer Tools → Console
   - Click the button and look for any error messages
   - Screenshot errors and share them if you're stuck

4. **Make sure you're using http://localhost:3000:**
   - Not 127.0.0.1
   - Not a different port

### "Invalid Client ID" error?

- Your Client ID doesn't match what Google has on file
- Go back to Google Cloud Console and copy it again
- Make sure there are no extra spaces

### Button doesn't appear?

- Try refreshing the page (Ctrl+R or Cmd+R)
- Check browser console for errors (F12)
- Make sure JavaScript is enabled

---

## How to Test If It's Working

1. Open http://localhost:3000/signin.html
2. Look for a button that says "Continue with Google" with Google colors
3. Click it
4. You should see a Google sign-in popup
5. Sign in with your Google account
6. You should be logged in to Convertly

---

## Need Help?

Check the full guide: `GOOGLE_OAUTH_SETUP.md` in your project root

Or open an issue on GitHub

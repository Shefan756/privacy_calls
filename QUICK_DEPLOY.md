# Quick Deployment Guide

## 🚀 Deploy in 15 Minutes

### Step 1: Deploy Backend (5 min)

**Using Render.com (FREE):**

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub (or upload files)
4. Settings:
   - **Name:** privacy-calls-server
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **Instance Type:** Free
5. Click "Create Web Service"
6. Wait 2-3 minutes for deployment
7. **Copy your backend URL:** `https://privacy-calls-server.onrender.com`

### Step 2: Update Code (2 min)

Create `.env.local` file in project root:
```env
NEXT_PUBLIC_SOCKET_URL=https://privacy-calls-server.onrender.com
```

### Step 3: Update Server CORS (2 min)

Edit `server/index.js`, find the Socket.IO initialization and update:

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: "*",  // For testing, restrict in production
    methods: ["GET", "POST"]
  }
});
```

Redeploy backend on Render (it auto-deploys on code changes if connected to GitHub).

### Step 4: Deploy Frontend (5 min)

**Using Vercel (FREE):**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd c:/Users/shefa/Desktop/Privacy_calls
   vercel
   ```

4. Follow prompts:
   - Setup and deploy? **Y**
   - Which scope? (Choose your account)
   - Link to existing project? **N**
   - Project name? **privacy-calls**
   - Directory? **./** (press Enter)
   - Override settings? **N**

5. Wait 1-2 minutes

6. Get your URL: `https://privacy-calls.vercel.app`

7. Deploy to production:
   ```bash
   vercel --prod
   ```

### Step 5: Test! (1 min)

1. Visit your Vercel URL: `https://privacy-calls.vercel.app`
2. Create a room
3. Copy join link
4. Open in another browser/device
5. Join the room!

---

## ✅ Done!

Your app is now:
- **Live on the internet**
- **Accessible from any device**
- **Shareable via links**
- **Mobile-friendly**
- **FREE to host**

### Share with friends:
```
Hey! Join my secure call:
https://privacy-calls.vercel.app?join=abc123
```

---

## 🔧 Alternative: Quick Test with Ngrok

**For immediate testing (not permanent):**

1. **Install Ngrok:** Download from [ngrok.com](https://ngrok.com)

2. **Start your servers:**
   ```bash
   # Terminal 1
   npm run server
   
   # Terminal 2
   npm run dev
   ```

3. **Expose backend:**
   ```bash
   # Terminal 3
   ngrok http 3001
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. **Update .env.local:**
   ```env
   NEXT_PUBLIC_SOCKET_URL=https://abc123.ngrok.io
   ```

5. **Restart frontend** (Ctrl+C and `npm run dev`)

6. **Expose frontend:**
   ```bash
   # Terminal 4
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g., `https://xyz789.ngrok.io`)

7. **Share the frontend URL!**

**Note:** Ngrok URLs change when you restart (free tier)

---

## 📱 Mobile Testing

After deployment, test on mobile:

1. Open your deployed URL on phone
2. Allow camera/microphone permissions
3. Create or join a room
4. Test video/audio/text modes
5. Share join link via WhatsApp/SMS

---

## 🆘 Troubleshooting

### Camera/Mic not working?
- Must use HTTPS (deployment provides this)
- Check browser permissions
- Try different browser

### Can't connect to backend?
- Check backend URL in .env.local
- Ensure backend is running (check Render dashboard)
- Check CORS settings in server/index.js

### Join link not working?
- Ensure frontend is deployed
- Check URL format: `https://your-app.vercel.app?join=ROOM_ID`
- Try copying link again

### "Connection refused" error?
- Backend might be sleeping (Render free tier)
- Wait 30 seconds and try again
- Check backend logs on Render

---

## 💡 Pro Tips

1. **Custom Domain:** Add your own domain in Vercel settings
2. **Keep Backend Awake:** Render free tier sleeps after 15 min inactivity
3. **Monitor Usage:** Check Vercel and Render dashboards
4. **Update Easily:** Just run `vercel --prod` to redeploy

---

## 📊 Cost Breakdown

- **Render (Backend):** FREE (750 hours/month)
- **Vercel (Frontend):** FREE (unlimited)
- **Total:** $0/month 🎉

---

## 🎯 Next Steps

1. Share your app with friends!
2. Test with multiple users
3. Monitor for any issues
4. Consider adding features:
   - Screen sharing
   - File sharing
   - Recording (with encryption)
   - Custom room backgrounds

Enjoy your deployed Privacy Calls app! 🚀

# 🔗 Sniplink — URL Shortener with Analytics

A full-stack URL shortener with Google Auth, click analytics, custom aliases, and QR codes.

**Stack:** React + Vite · Node.js / Express · Firebase Auth · Firestore · Recharts

---

## 📁 Project Structure

```
urlshort/
├── backend/          # Node.js / Express API
│   ├── src/
│   │   ├── index.js
│   │   ├── config/firebase.js
│   │   ├── middleware/auth.middleware.js
│   │   ├── controllers/
│   │   │   ├── url.controller.js
│   │   │   └── redirect.controller.js
│   │   └── routes/
│   │       ├── url.routes.js
│   │       └── redirect.routes.js
│   └── .env.example
└── frontend/         # React + Vite
    ├── src/
    │   ├── api/index.js
    │   ├── config/firebase.js
    │   ├── context/AuthContext.jsx
    │   ├── components/  (Navbar, ShortenForm, UrlCard)
    │   └── pages/       (LandingPage, Dashboard, AnalyticsPage)
    └── .env.example
```

---

## 🔥 Step 1 — Firebase Setup (do this first)

### 1a. Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `sniplink`) → Continue
3. Disable Google Analytics if you want → **Create project**

### 1b. Enable Google Auth
1. In Firebase Console → **Authentication** → Get Started
2. Click **Google** provider → Enable → Set your email as support email → Save

### 1c. Create Firestore Database
1. Firebase Console → **Firestore Database** → Create database
2. Choose **Start in test mode** (we'll add rules below) → Select a region → Done

### 1d. Firestore Security Rules
Go to Firestore → **Rules** → paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /urls/{shortCode} {
      // Anyone can read (needed for redirect)
      allow read: if true;
      // Only owner can write/delete
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.auth == null);
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```
Click **Publish**.

### 1e. Get Firebase Web Config (for frontend)
1. Firebase Console → Project Settings (gear icon) → General
2. Scroll to **Your apps** → click `</>` (Web) → Register app → name it
3. Copy the `firebaseConfig` object values

### 1f. Get Service Account Key (for backend)
1. Firebase Console → Project Settings → **Service accounts**
2. Click **Generate new private key** → Download the JSON file
3. Rename it to `serviceAccountKey.json`
4. Place it in the `backend/` folder (NOT inside src/)

> ⚠️ Never commit serviceAccountKey.json to GitHub — it's already in .gitignore

---

## ⚙️ Step 2 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

Place your `serviceAccountKey.json` in the `backend/` root folder.

Start the backend:
```bash
npm start
# or for dev with auto-restart:
npx nodemon src/index.js
```

Test it:
```
GET http://localhost:5000/api/health
→ { "status": "ok" }
```

---

## 🖥️ Step 3 — Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` with your Firebase web config values:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

Start the frontend:
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 🚀 Step 4 — Free Deployment

### Deploy Backend → Render.com
1. Push your `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`  
   - **Build Command:** `npm install`  
   - **Start Command:** `node src/index.js`
5. Add Environment Variables in Render dashboard:
   - `PORT` = `5000`
   - `FRONTEND_URL` = your Vercel frontend URL (fill in after deploying frontend)
   - `BASE_URL` = your Render backend URL (e.g. `https://sniplink-api.onrender.com`)
   - `FIREBASE_SERVICE_ACCOUNT` = paste the **entire content** of serviceAccountKey.json as one line
6. Deploy. Copy your Render URL.

### Deploy Frontend → Vercel
1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Vite**
4. Add Environment Variables (same as your .env):
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - All `VITE_FIREBASE_*` vars
5. Deploy. Copy your Vercel URL.

6. Go back to Render → update `FRONTEND_URL` to your Vercel URL → Redeploy backend.

### Update Firebase Auth Domain
- Firebase Console → Authentication → Settings → **Authorized domains**
- Add your Vercel domain (e.g. `sniplink.vercel.app`)

---

## ✅ Add to Resume

**Sniplink — URL Shortener with Analytics** | [Live Link] | [GitHub]  
*Full-stack URL shortening platform with click tracking, custom aliases, and QR code generation.*
- Built REST API with Node.js/Express for URL creation, redirect (301), and per-click analytics tracking
- Integrated Firebase Authentication (Google OAuth) and Firestore for real-time data storage
- Implemented click analytics dashboard with daily trend charts using Recharts
- Added QR code generation for every short link with one-click download
- Deployed backend on Render and frontend on Vercel; secured with Firebase Auth token verification middleware

---

## 🛠 Features
- ✅ Google Login via Firebase Auth
- ✅ Shorten any URL with auto-generated or custom code
- ✅ Click tracking (total + by day + device + referrer)
- ✅ Analytics dashboard with bar chart (last 14 days)
- ✅ QR code for every link (downloadable)
- ✅ Delete links
- ✅ Rate limiting (100 req/15 min)
- ✅ JWT verification middleware for all protected routes
- ✅ Responsive mobile UI

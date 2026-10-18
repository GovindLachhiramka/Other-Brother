# Other/Brother - Desktop-First Web Application

> **"When an Other becomes a Brother."**  
> A dedicated AI-assisted platform and brotherhood safety net for delivery & gig workers (food, parcel, quick commerce, and ride taxi).

---

## 1. Overview & Architectural Highlights

This project is built using modern **Angular 21 (latest stable 19.x/21.x)** with:
- **Standalone Components** throughout (`imports: [...]`, zero NgModules).
- **Angular Signals** for reactive state (`signal`, `computed`).
- **New Control Flow Syntax** (`@if`, `@for`, `@empty`).
- **TypeScript Strict Mode** enabled.
- **Desktop-First Design** targeting 1280px+ viewports with responsive adaptation down to tablet and mobile screens.
- **Global Design Tokens** implemented as native CSS variables (`--primary-teal: #0F766E`, `--accent-orange: #F97316`, warm off-white background `#FBF9F5`, dark navy text `#1E293B`, rounded cards, and smooth micro-interactions).
- **Direct Backend API Integration**: Configured against `https://other-brother-api-288097280823.asia-south1.run.app`.

---

## 2. Project Folder Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts               # Worker route guard: checks approved state via /auth/me
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts         # Injects 'Bearer <token>', handles 401/403/errors with toasts
│   │   ├── models/
│   │   │   └── api.models.ts               # Typed interfaces for backend requests & responses
│   │   └── services/
│   │       ├── api.service.ts              # Central HTTP client using base URL
│   │       ├── auth.service.ts             # Authentication state, phone, device_id & getToken()
│   │       ├── toast.service.ts            # Global toast notifications
│   │       └── audio-recorder.service.ts   # MediaRecorder voice notes (10s max)
│   ├── shared/
│   │   └── components/
│   │       ├── audio-player/               # Waveform player & recorder with timer (Mockup 4)
│   │       ├── badge/                      # Status pills & risk level badges
│   │       ├── empty-state/                # Empty collection placeholder
│   │       ├── layout/                     # Desktop sidebar navigation & topbar shell
│   │       ├── navbar/                     # Navigation tabs (Claims, Pool, Leaderboard, Avatar menu)
│   │       ├── skeleton/                   # Shimmer loading placeholders
│   │       ├── toast/                      # Floating notifications container
│   │       ├── trust-ring/                 # SVG circular trust meter with color bands
│   │       └── webcam-capture/             # Circular face frame live camera stream (getUserMedia)
│   ├── features/
│   │   ├── claims/
│   │   │   ├── claim-create/               # Accident photo + voice note + AI analysis (Mockup 4)
│   │   │   ├── claim-detail/               # Track claim timeline & garage pickup (Mockup 2)
│   │   │   └── claim-list/                 # History of claims and status badges
│   │   ├── community/                      # Pool balance, emergency loan request, repay (Mockup 3)
│   │   ├── company-portal/                 # Fleet manager confirmation console (/company)
│   │   ├── home/                           # Dashboard: Trust ring, 'Something happened' CTA, summary cards
│   │   ├── income/                         # Multi-app earnings logging & government scheme filing
│   │   ├── leaderboard/                    # Top 10 helpers, Top 3 podium, 'Mujhe madad mili' (Mockup 3)
│   │   ├── login/                          # Phone login, demo accounts quick-fill, OTP step
│   │   ├── not-found/                      # Friendly 404 page
│   │   ├── profile/                        # Worker profile credentials & sign out
│   │   ├── register/                       # 5-step wizard (Mockup 1) with dev mode mock URIs
│   │   ├── rejected/                       # Verification rejection reason & 24h block warning
│   │   └── wait/                           # Polling GET /register/status/{id} every 5 seconds
│   ├── app.config.ts                       # provideHttpClient, provideRouter
│   ├── app.routes.ts                       # Lazy-loaded standalone route definitions
│   └── app.ts                              # Root component shell
├── environments/
│   ├── environment.ts                      # Local development base URL & mockMode flag
│   └── environment.prod.ts                 # Production environment config
└── styles.scss                             # Global theme tokens, typography & CSS reset
```

---

## 3. Getting Started Locally

### Prerequisites
- Node.js (v18.x, v20.x, or v22+)
- npm (v9+ or v11+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation & Serving
```bash
# 1. Clone or navigate into the repository
cd Other_Brother_Ui

# 2. Install dependencies
npm install

# 3. Start local development server
npm start
# or: ng serve
```

Open your browser at `http://localhost:4200/`.

---

## 4. Demo Test Accounts & Flows

You can test every state directly using the demo numbers provided in the specification:

| Phone Number | Account Name | Expected State | Screen Landed | Notes |
|:---|:---|:---|:---|:---|
| `9000000001` | Ravi Kumar | `approved` | `/home` | Trust score: 82 |
| `9000000002` | Priya Nair | `approved` | `/home` | Trust score: 90 |
| `9000000003` | Amit Singh | `approved` | `/home` | Trust score: 35 |
| `9000000011` | Kavita Rao | `awaiting_company` | `/wait` | Listed in Company Portal (`/company`) |
| `9999999999` | New User | `not_registered` | `/register` | 5-step onboarding wizard |

### Quick Testing Features
- **Developer Mode Toggle on Register Page**:  
  Check the **"⚡ Developer Mode"** toggle at the top of `/register` to pre-fill test fields with valid mock URIs (`mock://id/...`, `mock://licence/...`, `mock://rc/...`, `mock://selfie/...`) for instant testing without uploading files.
- **Live Facial Camera**:  
  Step 4 of registration launches a live circular webcam preview via `getUserMedia` (file picker is disallowed for selfies to enforce anti-fraud liveness).
- **Company Portal (`/company`)**:  
  Accessible without login. Fleet managers can choose any company (e.g. `Demo Foods Ltd`) to approve or reject pending worker registrations. Confirming a worker will automatically transition them from `/wait` to `/home` within 5 seconds.

---

## 5. How to Switch from Demo Token to Firebase Phone OTP

Authentication is strictly isolated within a single function in [`src/app/core/services/auth.service.ts`](file:///c:/Users/HP/Downloads/Other_Brother_Ui/src/app/core/services/auth.service.ts):

```typescript
// Currently returns demo token:
getToken(): string | null {
  const phone = this.phoneSignal();
  if (!phone) return null;
  return `demo:${phone}`;
}
```

### Steps to enable Firebase Phone Auth in the future:
1. Install Firebase:
   ```bash
   npm install firebase @angular/fire
   ```
2. Initialize Firebase in `src/environments/environment.ts` with your project credentials.
3. In `auth.service.ts`, import `getAuth` from `firebase/auth`.
4. Update the body of `getToken()` to return the Firebase JWT:
   ```typescript
   getToken(): string | null {
     const auth = getAuth();
     const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
     return token;
   }
   ```
**Nothing else in any component, interceptor, or guard needs to change.** The HTTP interceptor will automatically pass the Firebase ID token in the `Authorization: Bearer <token>` header.

---

## 6. How to Deploy to Firebase Hosting

```bash
# 1. Install Firebase CLI globally if not already installed
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase Hosting in the project root
firebase init hosting
# - Public directory: dist/other-brother-ui/browser
# - Configure as a single-page app (SPA): Yes
# - Set up automatic builds with GitHub: Optional

# 4. Build production bundle
npm run build

# 5. Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 7. What Could Not Be Implemented and Why

As documented in section 9 of `Other_Brother_Frontend_Brief.pdf`, the following features are **not available on the backend** and therefore represented with UI placeholders or "Coming Soon" indicators per the specification:
1. **Push Notifications**: Replaced with 5-second interval polling (`GET /register/status/{id}`) as instructed in the brief.
2. **Nearby Worker Map / GPS Tracking**: No backend geospatial matching endpoint exists currently.
3. **Voice-first Local Language Speech-to-Text Pipeline**: Audio is recorded through `MediaRecorder` up to 10 seconds and uploaded as audio blob to `POST /upload` (kind: `claim_voice`). The backend Gemini model evaluates it; local transcription synthesis is not on the server.
4. **Real Firebase Phone OTP SMS Gateway**: Backend expects `Bearer demo:<10-digit-phone>` header; Firebase OTP verification will plug in when credentials are provisioned.

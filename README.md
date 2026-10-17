# Legal Case Finder AI ⚖️

An end-to-end full-stack web application designed to help individuals, legal researchers, and citizens understand legal problems and explore potentially relevant Indian laws, court judgments, statutory provisions, and procedural remedies under Indian jurisprudence.

> **Important Legal Notice:** Legal Case Finder AI is an AI-assisted legal research and educational reference tool. It does **not** constitute formal legal advice, legal representation, or a lawyer-client relationship. All judicial citations and statutory provisions must be independently verified against official law reports (e.g., Supreme Court of India repository, India Code, AIR, SCC) by an advocate licensed under the Advocates Act, 1961.

---

## 1. Project Overview

Navigating the Indian legal landscape can be intimidating for citizens facing land encroachments, ancestral property disputes, consumer grievances, tenancy issues, or contract breaches.

**Legal Case Finder AI** bridges this gap:
- Users describe their situation in plain, everyday language (e.g., *"My neighbour has occupied a portion of my land. What legal remedies are available?"*).
- The Express.js backend analyzes the problem using the **official Google GenAI SDK with Gemini AI**, identifying applicable Indian Central and State statutes, landmark or persuasive court decisions, legal principles, actionable remedies, and required evidentiary documentation.
- Authentication and data isolation are managed securely via **Supabase Google OAuth** and **PostgreSQL with Row Level Security (RLS)**.

---

## 2. Key Features

- **Intuitive Legal Query Interface:** Simple form with legal category selector, Indian State/jurisdiction options, optional facts/dates, and one-click sample scenarios.
- **Strict Anti-Hallucination & Verification Safeguards:** Explicitly prevents AI from fabricating case citations or pretending generated references are confirmed law. Clearly tags unverified vs. verified precedents.
- **Comprehensive Indian Law Breakdown:**
  - Potentially applicable Statutes & Sections (e.g., Specific Relief Act 1963, Transfer of Property Act 1882, BNS 2023 / IPC, Consumer Protection Act 2019).
  - Landmark / Persuasive Court Judgments with Ratio Decidendi.
  - Actionable Remedies to discuss with an advocate (injunctions, declarations, notices).
  - Essential Evidentiary Documents to gather.
  - Recommended Next Steps & Factual Limitations.
- **Case Details Deep Dive:** Inspect court, ratio, relevance, and original source documents.
- **Personalized Search History:** Automatically archives past legal research queries and allows one-click reloading or deletion.
- **Saved Cases Library:** Bookmark precedents and judgments for quick consultation.
- **Flexible & Simple Authentication (Sign Up & Sign In):**
  - **Email & Password:** Easy tabbed registration (`Sign Up`) and login (`Sign In`) with name, email, and password.
  - **Google OAuth 2.0:** One-click registration and sign-in via Supabase Google provider.
- **Strict Row Level Security (RLS):** Database policies guarantee that users can only access and modify their own queries and saved cases.

---

## 3. Technology Stack

### Frontend
- **Framework:** React.js (v19) with Vite
- **Language:** JavaScript (ES Modules)
- **Routing:** React Router DOM (v7)
- **Styling:** Custom Vanilla CSS design system (Authoritative legal theme: crisp white, judicial navy, gold accents, slate borders)
- **Authentication:** Official Supabase JavaScript Client (`@supabase/supabase-js`)
- **API Communication:** Native Fetch API with Bearer token authentication

### Backend
- **Runtime:** Node.js (v24+)
- **Server Framework:** Express.js (v4)
- **AI SDK:** Official Google GenAI SDK (`@google/genai` and `@google/generative-ai`)
- **Database Client:** Supabase Client (`@supabase/supabase-js`)
- **Security & CORS:** Custom token validation middleware, user-scoped RLS execution, CORS origin validation

### Database & Security
- **Database:** Supabase PostgreSQL
- **Security:** PostgreSQL Row Level Security (RLS) policies scoped to `auth.uid()`
- **Identity Provider:** Google OAuth 2.0 via Supabase Auth

---

## 4. Project Directory Structure

```text
legal-case-finder/
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg               # Legal balance scale SVG icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Header navigation & user profile
│   │   │   ├── SearchForm.jsx        # Problem input, categories & sample chips
│   │   │   ├── CaseCard.jsx          # Judgment card with verification status
│   │   │   ├── LegalDisclaimer.jsx   # Prominent legal disclaimers
│   │   │   ├── LoadingSpinner.jsx    # Qualitative AI research stage indicator
│   │   │   └── ProtectedRoute.jsx    # Auth route guard
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Main search & landing page
│   │   │   ├── Login.jsx             # Google OAuth login screen
│   │   │   ├── SearchResults.jsx     # AI research results & law breakdown
│   │   │   ├── CaseDetails.jsx       # Detailed precedent view
│   │   │   ├── SearchHistory.jsx     # User's previous legal queries
│   │   │   └── SavedCases.jsx        # User's bookmarked court cases
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                # Authenticated backend Fetch functions
│   │   │   └── supabase.js           # Supabase client & Google OAuth triggers
│   │   │
│   │   ├── App.jsx                   # Layout, routing & session listeners
│   │   ├── main.jsx                  # Application entry point
│   │   └── styles.css                # Professional legal design system
│   │
│   ├── index.html                    # SEO-optimized HTML template
│   ├── .env.example                  # Frontend environment template
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── routes/
│   │   ├── legalRoutes.js            # POST /search, POST/GET/DELETE /saved-cases
│   │   └── historyRoutes.js          # GET/DELETE /api/legal/history
│   │
│   ├── services/
│   │   └── geminiService.js          # Google GenAI prompt engineering & validation
│   │
│   ├── middleware/
│   │   └── authMiddleware.js         # Supabase access token validation & RLS scoping
│   │
│   ├── utils/
│   │   └── responseValidator.js      # Strict schema & verification status validator
│   │
│   ├── server.js                     # Express app, health check & configuration validation
│   ├── package.json
│   ├── .env.example                  # Backend environment template
│   └── .gitignore
│
├── database/
│   └── schema.sql                    # PostgreSQL tables, indexes & RLS policies
│
├── .gitignore
└── README.md
```

---

## 5. Prerequisites

Before running the application, make sure you have:
1. **Node.js:** v18.0.0 or later (v20+ recommended)
2. **npm:** v9.0.0 or later
3. **Google Gemini API Key:** Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey)
4. **Supabase Account:** Free account on [Supabase](https://supabase.com)
5. **Google Cloud Console Project:** For Google OAuth credentials

---

## 6. Installation & Setup

### Step 1: Clone or Navigate to the Project

```bash
cd "c:\Users\NXTWAVE\OneDrive - NXTWAVE DISRUPTIVE TECHNOLOGIES PRIVATE LIMITED\Desktop\Antigravity_projects\demo-project"
```

### Step 2: Database Setup (Supabase)

1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** tab in the Supabase Dashboard.
3. Open the file `database/schema.sql` from this repository.
4. Copy its contents, paste them into the SQL Editor, and click **Run**.
   - This creates `public.legal_searches` and `public.saved_cases`.
   - Creates indexes on `user_id` and `created_at`.
   - Enables Row Level Security (RLS) with user-isolation policies.

### Step 3: Google OAuth Configuration in Supabase

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a Google Cloud project.
3. Configure the **OAuth Consent Screen**:
   - User Type: **External**
   - Fill in App Name (e.g. *Legal Case Finder AI*), User Support Email, and Developer Contact.
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
4. Go to **Credentials** -> **Create Credentials** -> **OAuth Client ID**:
   - Application Type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - Your Supabase Project URL: `https://<YOUR-PROJECT-REF>.supabase.co`
   - Authorized redirect URIs:
     - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
5. Copy your **Client ID** and **Client Secret**.
6. In your **Supabase Dashboard**:
   - Go to **Authentication** -> **Providers** -> **Google**.
   - Enable the Google provider.
   - Paste the Google **Client ID** and **Client Secret**.
   - Click **Save**.
7. In **Authentication** -> **URL Configuration**:
   - Set Site URL: `http://localhost:5173`
   - Add Redirect URLs: `http://localhost:5173/**`

---

## 7. Environment Variables Configuration

### Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_public_key
FRONTEND_ORIGIN=http://localhost:5173
```

> **Security Note:** Never expose `GEMINI_API_KEY` to the frontend. All Gemini interactions occur inside `backend/services/geminiService.js`.

### Frontend Configuration (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_public_key
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 8. Running the Application

Open two separate terminal windows (one for backend, one for frontend).

### Terminal 1: Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend starts at: **`http://localhost:5000`**
Health check endpoint: **`http://localhost:5000/api/health`**

### Terminal 2: Frontend Client

```bash
cd frontend
npm install
npm run dev
```

The frontend will open at: **`http://localhost:5173`**

---

## 9. Backend API Endpoints

All protected endpoints require an `Authorization: Bearer <SUPABASE_JWT_TOKEN>` header.

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Returns backend health status and configuration checks |
| `POST` | `/api/legal/search` | **Yes** | Analyzes problem via Gemini AI and persists search in Supabase |
| `GET` | `/api/legal/history` | **Yes** | Returns authenticated user's previous searches |
| `DELETE` | `/api/legal/history/:id`| **Yes** | Deletes a search record owned by the authenticated user |
| `POST` | `/api/legal/saved-cases` | **Yes** | Bookmarks a case precedent for the user |
| `GET` | `/api/legal/saved-cases` | **Yes** | Retrieves user's saved cases |
| `DELETE` | `/api/legal/saved-cases/:id` | **Yes** | Removes a saved case owned by the authenticated user |

---

## 10. Security Architecture

1. **Independent Server-Side Token Validation:** The backend never trusts a `user_id` provided in request bodies. The `authMiddleware.js` extracts the bearer JWT and validates it against Supabase Auth via `supabase.auth.getUser(token)`.
2. **User-Scoped RLS Enforcement:** Database queries use client connections passing the user's validated JWT token in authorization headers, ensuring that PostgreSQL Row Level Security (RLS) policies strictly enforce data isolation at the engine level.
3. **CORS Restrictions:** Express CORS strictly restricts origins to the configured `FRONTEND_ORIGIN` (`http://localhost:5173`).
4. **Credential Isolation:** The Google GenAI API key is strictly maintained within server environment variables and is never exposed in browser storage or network payloads.

---

## 11. Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `502 Bad Gateway` on `/api/legal/search` | Invalid or missing `GEMINI_API_KEY` | Verify `backend/.env` contains a valid key from Google AI Studio. |
| `401 Unauthorized` | Missing or expired Supabase session | Click "Sign In with Google" in the frontend navbar to renew your session. |
| `503 Service Unavailable` | Supabase credentials missing on backend | Ensure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are defined in `backend/.env`. |
| Google OAuth Redirect Error | Redirect URI mismatch | Verify `http://localhost:5173` is added to Google Cloud Console and Supabase Auth Redirect URLs. |
| Port 5000 in use on Windows | Prior process occupying port | Run `netstat -ano \| findstr :5000` followed by `taskkill /PID <PID> /F`. |

---

## 12. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


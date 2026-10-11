# FutureMemory Cart - Personalized E-Commerce Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-4-646cff.svg)
![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-green.svg)

**FutureMemory Cart** is a personalized gift discovery and next-generation e-commerce platform designed to revolutionize the way people shop. It features a triple-cart architecture (**Normal Cart**, **Memory Cart**, and **Future Cart**), occasion-based smart gifting, biometric/passkey security, and an AI-powered styling and product studio.

---

## 🌟 Key Features

### 🛒 Triple Cart Architecture
- **Normal Cart**: Traditional instant-checkout shopping cart for daily needs.
- **Memory Cart**: Preserves cherished purchases, past gifts, and emotional milestones with anniversary reorder reminders.
- **Future Cart**: Plan ahead for upcoming birthdays, weddings, festivals, and anniversaries with scheduled ordering and delivery timers.

### 🎁 Personalized Gift Discovery & 25+ Occasions
- Curated shopping for **25+ special occasions**: Birthday, Wedding, Anniversary, Valentine's Day, Festivals (Diwali, Eid, Christmas), Graduation, College Events, and more.
- Personalized recommendation engine tailored by recipient relationship, age, and interest.
- Indian Rupee (₹) standard pricing across all products and checkout flows.

### 🔐 Next-Gen Authentication & Security
- Google One-Tap / OAuth integration.
- Biometric & Passkey authentication simulation with WebAuthn standards.
- Three-tier secure access (Customer, Seller, Super Admin).

### ⚡ Smart Shopping Experiences
- Complete The Look & AI product matching.
- Real-time stock indicators, price-drop alerts, and interactive reviews.
- WhatsApp order notifications and interactive QR bot checkout.
- 7-day hassle-free return and refund workflow.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 4, React Router DOM 6
- **UI & Icons**: Lucide React, Canvas Confetti, Recharts
- **Styling**: Modern responsive CSS with curated HSL design tokens
- **Backend / Services**: Node.js & Express API, Supabase Storage & Database integration, Hugging Face AI Studio
- **Deployment**: Vercel (Frontend SPA) & GitHub CI/CD

---

## 📁 Project Structure

```text
futurememory-cart/
├── dist/                   # Production build output
├── public/                 # Static assets & icons
├── server/                 # Express backend server (WhatsApp bot, HF AI, Supabase bridge)
├── src/
│   ├── components/         # Modular UI components (Navbar, Footer, Carts, PDP, etc.)
│   ├── context/            # Global state (Cart, Wishlist, Auth, Currency, Language)
│   ├── data/               # 200+ curated products & occasion catalogs
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Shop, Product Details, Checkout, Orders, Admin, etc.)
│   ├── App.jsx             # Root application router
│   ├── index.css           # Design system tokens & global styling
│   └── main.jsx            # React root mount
├── vercel.json             # Vercel SPA routing rules
├── vite.config.js          # Vite bundler configuration
└── package.json            # Project dependencies & scripts
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **Git**

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Afrose-07/futurememory-cart.git
cd futurememory-cart

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root folder based on `.env.example`:

```env
# Google OAuth Client ID (Frontend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Backend API URL (Frontend)
VITE_BACKEND_URL=http://localhost:5000

# Optional Supabase Integration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Running the Development Server

```bash
# Start frontend with Vite (http://localhost:5173)
npm run dev

# (Optional) Start Express companion server
npm run server
```

### 5. Production Build

```bash
# Compile and optimize for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment to Vercel

### Continuous Deployment via GitHub:
1. Push your code to your GitHub repository: `https://github.com/Afrose-07/futurememory-cart`
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**
3. Import the `futurememory-cart` repository from your GitHub account (`Afrose-07`).
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_BACKEND_URL`
   - (Optional) `SUPABASE_URL` and `SUPABASE_ANON_KEY`
6. Click **Deploy**. Vercel will build and assign a verified public HTTPS URL.

### Automatic Website Updates:
Whenever you make changes, commit, and push to GitHub:
```bash
git add .
git commit -m "Update features or design"
git push origin main
```
Vercel automatically detects the push, runs `npm run build`, and updates your live website in seconds with zero downtime!

---

## 🔄 Updating Your Live Project (Step-by-Step)

To publish any future updates to your live site, run:

```bash
# 1. Check status of changed files
git status

# 2. Stage all your updates
git add .

# 3. Create a descriptive commit
git commit -m "feat: added new features and updated components"

# 4. Push directly to GitHub
git push origin main
```
Your Vercel deployment will immediately trigger and deploy your latest changes automatically.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

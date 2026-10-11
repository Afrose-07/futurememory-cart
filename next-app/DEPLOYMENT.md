# FutureMemory Cart - Deployment Guide

## 1. Vercel Configuration
We have added a `vercel.json` file in the root directory. 
- **Build Command:** `npx prisma generate && next build`
- **Region:** `bom1` (Mumbai) - This ensures maximum performance and lowest latency for Indian users.

## 2. Environment Variables (.env)
When you connect your GitHub repository to Vercel, you **must** add the following Environment Variables in the Vercel Dashboard (Settings > Environment Variables):

### Database (Supabase PostgreSQL)
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

### Payment Gateway (Razorpay)
```env
RAZORPAY_KEY_ID="rzp_live_your_key_id"
RAZORPAY_KEY_SECRET="your_live_key_secret"
```

### Notifications (WhatsApp/Email)
```env
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

### Application URLs
```env
NEXT_PUBLIC_APP_URL="https://futurememory-cart.vercel.app"
RETURN_DAYS=7
```

## 3. Deployment Steps
1. Push all your code to a **GitHub Repository**.
2. Go to **Vercel.com** and click **"Add New Project"**.
3. Select your GitHub repository.
4. Paste the Environment Variables listed above.
5. Click **Deploy**.

## 4. Post-Deployment (Database Seeding)
Once the app is live, you need to run the Seed scripts to push the 100+ Unique Products and Inventory Matrix to your live Supabase database.
Run this locally connected to your live DB:
```bash
npx prisma db push
npm run seed
```

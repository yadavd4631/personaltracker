# 🥋 Operation 30 LPA — 84-Day DevOps Tracker

Ek **daily-locked DevOps learning tracker** — 25 Jul se 16 Oct 2026 tak ka 84-din ka mission. Har din sirf **aaj ka din** khulta hai (IST timezone ke hisaab se), future days 🔒 locked rehte hain — taaki planning me time waste na ho, sirf execution ho.

> Yeh project khud bhi DevOps learning ka hissa hai: Next.js + MongoDB Atlas + Gemini API + Vercel deployment. Isko customize karna = practice. 😎

## ✨ Features

- 🔒 **Daily Lock System** — sirf aaj ka din open (IST date se calculate), future locked, past days makeup ke liye khule
- ✅ **One-click Done** — progress MongoDB me save, streak + backlog counter
- 📊 **Mission Dashboard** — 84-day grid, 4 phases, progress bar, scoreboard
- 🤖 **Gemini Deep-dive Notes** — har din ke subtopics pe full Hinglish study notes ek click me
- 📝 **Weekly Quiz** — Friday revision ke liye 10-question practical quiz
- 🥋 **DevOps Ustaad Chat** — doubt solver + accountability coach (bahana banaoge toh roast karega)
- 🔐 **PIN Lock** — website sirf aapke PIN se khulegi

## 🏗️ Stack

| Layer | Tech | Cost |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | Free |
| Database | MongoDB Atlas M0 | Free forever tier |
| AI | Gemini API (`gemini-2.5-flash`) | Free tier kaafi hai |
| Hosting | Vercel Hobby | Free |

## 🚀 Setup (15-20 min, sab free)

### Step 1 — MongoDB Atlas (free database)

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) pe account banao
2. **Create Cluster** → **M0 (FREE)** tier choose karo → region koi bhi (Mumbai `ap-south-1` best)
3. **Database Access** → Add New Database User → username + password banao (yaad rakho)
4. **Network Access** → Add IP Address → **"Allow access from anywhere"** (`0.0.0.0/0`) — Vercel ke serverless IPs fixed nahi hote isliye yeh zaroori hai
5. **Connect** → **Drivers** → connection string copy karo:
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/personaltracker?retryWrites=true&w=majority`
   (USERNAME/PASSWORD apne wale daalo, aur `/personaltracker` database name add karo)

### Step 2 — Gemini API key (free)

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) kholo
2. **Create API key** → copy karo
3. Free tier me din ke kaafi requests milte hain — personal use ke liye enough

### Step 3 — Local run (optional, test ke liye)

```bash
git clone https://github.com/yadavd4631/personaltracker.git
cd personaltracker
npm install
cp .env.example .env.local   # phir .env.local me apni values daalo
npm run dev                  # http://localhost:3000
```

### Step 4 — Vercel pe deploy 🚀

1. [vercel.com](https://vercel.com) pe GitHub se login karo
2. **Add New → Project** → `personaltracker` repo **Import** karo
3. **Environment Variables** section me yeh 4 daalo:

| Name | Value |
|---|---|
| `MONGODB_URI` | Step 1 wala connection string |
| `GEMINI_API_KEY` | Step 2 wali key |
| `GEMINI_MODEL` | `gemini-2.5-flash` (optional) |
| `APP_PIN` | apna secret PIN (e.g. `4631`) |

4. **Deploy** dabao. 2 minute me live. 🎉
5. Bonus: ab jab bhi GitHub pe code push hoga, Vercel **khud re-deploy** karega — yehi toh CI/CD hai! (Day 31 pe yeh concept aayega 😄)

## 📱 Roz kaise use karna hai

1. Subah website kholo → **aaj ka din** purple glow me dikhega
2. Kholo → subtopics + depth + resources dekho → **"Deep-dive Notes"** se Gemini ke full notes lo
3. Padho, practice karo, deliverable banao
4. **"✓ Mark karo"** dabao → streak badhegi 🔥
5. Doubt aaye ya motivation gire → **Ustaad se pucho** tab
6. Friday ko **Quiz** tab se week ka revision test

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| "MongoDB connect nahi hua" banner | `MONGODB_URI` check karo + Atlas me Network Access `0.0.0.0/0` hai ya nahi |
| Gemini error 429 | Free tier ka rate limit — 1 min ruko, dobara try karo |
| Gemini error 400/404 | `GEMINI_MODEL` galat hai — `gemini-2.5-flash` use karo |
| PIN bhool gaye | Vercel → Settings → Environment Variables me `APP_PIN` dekh/badal lo, redeploy |
| Din unlock nahi hua | Lock IST (Asia/Kolkata) midnight pe khulta hai |

## 🛠️ Customize ideas (DevOps practice ke liye)

- Day 19 ke baad: is repo me khud commits push karo (Git practice)
- Day 31 ke baad: GitHub Actions se lint/test workflow lagao is repo pe
- Day 84 ke baad: Dockerfile likho, is app ko containerize karo, K8s pe deploy karo — **full circle** 🔄

---

**Mission: 25 Jul → 16 Oct 2026 · 84 din · Roz ek ✓ · Sapna wahi, raasta naya.**

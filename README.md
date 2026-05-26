# 🎬 StreamVox — Netflix-style Streaming App

A full-featured streaming platform built with **React 18 + Vite + Firebase + Cloudinary + TailwindCSS**.

---

## ✨ Features

### User Side
- 🏠 **Homepage** with hero banner (auto-rotate), trending, new releases, top rated rows
- 🎬 **Movies** & 📺 **Series** pages with filters and pagination
- 🔍 **Search** with real-time debounced query
- 📋 **Watchlist** (add/remove per user)
- ▶️ **Video player** — Cloudinary + YouTube, custom controls, progress save
- 📊 **Star ratings** (per-user, live average)
- 🔁 **Continue Watching** — saves progress every 10s
- 🎯 **Trailers** modal (YouTube embed)
- 🌐 **Bilingual** — ES / EN toggle
- 🔐 **Auth** — Email/Password + Google OAuth

### Admin Panel (`/admin`)
- 📊 **Dashboard** — live stats (total, published, users, drafts)
- 🎬 **Content manager** — CRUD movies & series, publish/draft toggle
- 📺 **Episode manager** — add/edit/delete episodes with Cloudinary or YouTube video
- 👥 **User manager** — list all users, promote/demote to admin
- ☁️ **Cloudinary upload** with real progress bars
- 🔴 **Real-time** updates via Firestore `onSnapshot`

---


## 🎨 Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 18 + Vite |
| Styling | TailwindCSS 3 |
| Auth & DB | Firebase (Auth + Firestore) |
| Video/Images | Cloudinary |
| Video Player | react-player |
| Routing | React Router v6 |
| i18n | i18next |
| Notifications | react-hot-toast |
| Animations | Framer Motion + CSS |

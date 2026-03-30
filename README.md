# Ali Nawaz Academy

> A complete, production-ready Islamic Learning Management System (LMS)
> Built with React + Tailwind CSS + localStorage — 100% frontend-only

---

## ✨ Features

| Feature | Details |
|---|---|
| 📚 Course Catalog | 7 courses (Aalim: 6 subjects + Seerah) |
| 🎥 YouTube Player | Embedded iframe player with lesson sidebar |
| ✅ Progress Tracking | Per-lesson completion stored in localStorage |
| 🔥 Streak System | Daily streak with 7-day calendar heatmap |
| 📜 Certificates | Auto-generated, downloadable as PDF |
| 👥 Role System | Student / Teacher / Admin / Super Admin (simulated) |
| 📝 Lesson Notes | Per-lesson notes saved in localStorage |
| 📊 Admin Analytics | Mock bar charts, student table, completion rates |

---

## 🚀 Quick Start

```bash
# 1. Clone / download this folder
cd ali-nawaz-academy

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open browser at http://localhost:5173
```

---

## 📁 Project Structure

```
ali-nawaz-academy/
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   └── courses.js          # All course & mock user data
│   ├── utils/
│   │   └── storage.js          # localStorage helpers + streak/progress logic
│   ├── context/
│   │   └── AppContext.jsx      # Global React state (enrollments, progress, streak)
│   ├── components/
│   │   ├── Navbar.jsx          # Top bar with role switcher
│   │   ├── Sidebar.jsx         # Navigation drawer
│   │   ├── VideoPlayer.jsx     # YouTube embed + lesson list
│   │   ├── CourseCard.jsx      # Course tile component
│   │   ├── ProgressBar.jsx     # Animated progress bar
│   │   ├── StreakWidget.jsx     # Streak + 7-day calendar
│   │   └── CertificateGenerator.jsx  # PDF certificate
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main home dashboard
│   │   ├── CourseList.jsx      # Browsable course catalog
│   │   ├── CoursePlayer.jsx    # Course detail + video player
│   │   ├── MyCourses.jsx       # Enrolled courses tracker
│   │   ├── Certificates.jsx    # Certificate gallery
│   │   ├── TeacherPanel.jsx    # Teacher course management
│   │   └── AdminPanel.jsx      # Admin analytics + user management
│   ├── App.jsx                 # Router + layout
│   ├── main.jsx                # React entry
│   └── index.css               # Global styles + CSS vars
├── index.html
├── tailwind.config.js
├── vite.config.js
├── vercel.json                 # Vercel SPA rewrites
└── package.json
```

---

## 🎥 Adding Real YouTube Videos

Open `src/data/courses.js` and replace the `videoId` in each lesson:

```js
// BEFORE (placeholder):
{ id: 'q1', title: 'Introduction to Tajweed', videoId: 'dQw4w9WgXcQ', ... }

// AFTER (real video):
{ id: 'q1', title: 'Introduction to Tajweed', videoId: 'YOUR_REAL_VIDEO_ID', ... }
```

To get a YouTube video ID:
- From `https://youtube.com/watch?v=ABC123xyz` → ID is `ABC123xyz`
- From `https://youtu.be/ABC123xyz` → ID is `ABC123xyz`

---

## 👥 Role Switching

Click your role badge in the **top-right corner** of the navbar:

| Role | Access |
|---|---|
| Student | Dashboard, Courses, My Learning, Certificates |
| Teacher | + Teacher Panel (add courses, view mock students) |
| Admin | + Admin Panel (analytics, user management) |
| Super Admin | + Settings, certificate template, full control |

---

## 🔥 Streak System Logic

- Stored in `localStorage` under key `ali_nawaz_streak`
- Updates automatically when a lesson is marked complete
- **Increments** if the last study date was yesterday
- **Resets to 1** if a day was missed
- Displays 7-day heatmap in sidebar and dashboard widget

---

## 📜 Certificate Download

1. Enroll in a course → watch all lessons → mark each complete
2. Click **"Claim Certificate"** button (appears when progress = 100%)
3. Certificate auto-generates with:
   - Student name (editable in navbar)
   - Course name
   - Completion date
- Unique certificate ID (`ANA-XXXXXXXX`)
4. Click **"Download Certificate (PDF)"**

---

## 🚀 Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
vercel login
cd ali-nawaz-academy
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "feat: Ali Nawaz Academy initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ali-nawaz-academy.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repository
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Click **Deploy**

3. **Done!** Vercel auto-deploys on every push to main.

---

## 🎨 Customization

### Colors (tailwind.config.js)
```js
colors: {
  gold: { 400: '#fbbf24', 500: '#f59e0b', ... },
  emerald: { 800: '#064e3b', ... }
}
```

### Fonts (index.html + index.css)
Currently using: **Cinzel** (headings), **Crimson Pro** (body), **Amiri** (Arabic)

### Adding a New Course
Add to the `COURSES` array in `src/data/courses.js`:
```js
{
  id: 'unique-id',
  courseGroup: 'aalim',        // or 'seerah'
  subject: 'Aqeedah',
  title: 'Islamic Creed',
  description: '...',
  thumbnail: 'https://...',
  instructor: 'Shaykh Name',
  level: 'Beginner',
  duration: '40 hours',
  totalLessons: 8,
  category: 'Aalim Course',   // or 'Seerah Course'
  lessons: [
    { id: 'aq1', title: 'Lesson Title', videoId: 'YT_ID', duration: '45:00', description: '...' },
    // ...
  ],
}
```

---

## 🛠 Tech Stack

- **React 18** — Functional components + hooks
- **React Router v6** — Client-side navigation
- **Tailwind CSS v3** — Utility-first styling
- **Vite** — Lightning-fast dev server & bundler
- **localStorage** — All data persistence (no backend)
- **html2canvas + jsPDF** — Client-side PDF generation

---

## 📧 Support

Built for the Ali Nawaz Academy Islamic e-learning platform.
Contact: moeedkamraan1125@gmail.com
GitHub: Dar-Ishfaq-Backend

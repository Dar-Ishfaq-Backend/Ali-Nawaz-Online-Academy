# Ali Nawaz Academy

Ali Nawaz Academy is a React + Vite Islamic learning platform with separate student and staff login flows, playlist-based courses, payment-proof approval, certificate generation, and Supabase-backed authentication.

## Features

- Student, Teacher, Admin, and Super Admin roles
- Supabase email/password authentication
- Student signup and forgot password flow
- Teacher and staff login module
- Admin payment approval dashboard
- Dynamic payment QR code per student and course
- Playlist-based courses with string course IDs like `mini-wudu-course`
- Certificate generation with selectable templates, academy seal, and signature
- Responsive UI for mobile, tablet, and desktop

## Tech Stack

- React 18
- Vite 5
- React Router 6
- Tailwind CSS 3
- Supabase
- `@supabase/supabase-js`
- `qrcode`
- `html2canvas`
- `jspdf`

## Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the project root and add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SITE_URL=http://localhost:5173

VITE_PAYMENT_ACCOUNT_NAME=Ali Nawaz Online Academy
VITE_PAYMENT_UPI_ID=your-upi-id@bank
VITE_PAYMENT_CURRENCY=INR
```

Notes:

- `VITE_SITE_URL` should be your real frontend URL in production.
- The payment QR uses the logged-in student, selected course, and payment reference dynamically.
- If Supabase env vars are missing, the app falls back to local browser mode for basic testing.

## Supabase Role Rules

The app maps protected staff access by email handle:

- `moeedkamraan1123` -> `Admin`
- `moeedkamraan1125` -> `Super Admin`

Examples:

- `moeedkamraan1123@gmail.com` becomes `Admin`
- `moeedkamraan1125@gmail.com` becomes `Super Admin`

Any other staff email can remain a normal `Teacher` account.

## Final Supabase Schema

This project is built around the following table structure and must stay aligned with it.

### `profiles`

- `id` uuid primary key
- `name` text
- `email` text
- `role` text
- `created_at` timestamp

### `courses`

- `id` text primary key
- `title` text
- `description` text
- `price` int
- `is_paid` boolean
- `youtube_playlist_url` text
- `thumbnail` text
- `instructor` text
- `created_at` timestamp

### `enrollments`

- `id` uuid primary key
- `user_id` uuid
- `course_id` text
- `status` text
- `created_at` timestamp

### `payments`

- `id` uuid primary key
- `user_id` uuid
- `course_id` text
- `course_title` text
- `amount` int
- `status` text
- `payer_name` text
- `transaction_id` text
- `payment_reference` text
- `screenshot_url` text
- `created_at` timestamp

## Critical Schema Rules

- `course_id` is always `text`
- `courses.id` is always `text`
- Course IDs are slug strings like `mini-wudu-course`
- Do not use a foreign key for `payments.course_id`
- Do not use a foreign key for `enrollments.course_id`
- `payments.amount` must be `integer`
- `payments.transaction_id` must be `text`
- `payments.payment_reference` must be `text`
- `payments.status` controls course unlocking

## Supabase Setup

### Option 1: New project

If you are setting up a fresh Supabase project, run:

- [supabase/schema.sql](/C:/Users/moham/Downloads/Kamraan/websites/Ali%20Nawaz/supabase/schema.sql)

### Option 2: Existing project

If your current project already has older tables or wrong column types, run:

- [supabase/fix-existing-schema.sql](/C:/Users/moham/Downloads/Kamraan/websites/Ali%20Nawaz/supabase/fix-existing-schema.sql)

This migration file is meant to fix the common problems:

- `course_id` stored as `uuid` instead of `text`
- missing `course_title` in `payments`
- wrong integer/text column types in `payments`
- leftover foreign keys on `course_id`
- old profile fields such as `full_name` instead of `name`

## Supabase Auth Setup

In Supabase dashboard:

1. Open `Authentication`
2. Enable `Email` provider
3. Disable `Disable new user signups` if students should register themselves
4. Set `Site URL`
5. Add redirect URLs

Recommended redirect URLs:

- `http://localhost:5173/forgot-password`
- `https://your-domain.com/forgot-password`

## Payment Flow

Current flow:

1. Student opens a paid course
2. Student enrolls
3. Student uploads payment screenshot
4. Screenshot is uploaded to the `payments` storage bucket
5. Payment row is inserted into `payments`
6. Admin reviews it in the payment dashboard
7. Admin approves payment
8. App inserts an active row into `enrollments`
9. Student gets full course access

The QR code is generated dynamically from:

- course ID
- course title
- logged-in user
- payment reference
- configured payment account details

## Course Data Rules

All courses in the app are normalized to this structure:

```js
{
  id: "mini-wudu-course",
  title: "Wudu Mini Course",
  description: "Course description",
  price: 50,
  is_paid: true,
  youtube_playlist_url: "https://www.youtube.com/playlist?list=...",
  thumbnail: "https://...",
  instructor: "Ustadh Name",
  created_at: "2026-04-02T00:00:00.000Z"
}
```

Important:

- Do not create UUID course IDs
- Always use string slugs for `id`
- New courses added through the app are stored in this schema-first format

## Certificates

Certificate system includes:

- multiple certificate templates
- template preview inside the admin panel
- theme switching
- academy seal
- bundled signature support
- PDF export

Admin and Super Admin can choose the active template and live preview it inside the website.

## Project Structure

```text
Ali Nawaz/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── supabase.js
├── supabase/
│   ├── schema.sql
│   └── fix-existing-schema.sql
├── .env
├── package.json
├── README.md
└── vercel.json
```

## Deployment

Recommended production setup:

- GitHub for source control
- Vercel for frontend hosting
- Supabase for auth, payments, profiles, courses, and enrollments

### Vercel

1. Push this repo to GitHub
2. Import the repo into Vercel
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add the same `.env` values in Vercel project settings
7. Deploy

## Troubleshooting

### Error: `Could not find the 'course_title' column of 'payments'`

Your live `payments` table is missing `course_title text`.

Fix:

- Run [supabase/fix-existing-schema.sql](/C:/Users/moham/Downloads/Kamraan/websites/Ali%20Nawaz/supabase/fix-existing-schema.sql)

### Error: `invalid input syntax for type uuid: "mini-wudu-course"`

Your `course_id` is still `uuid` somewhere or still tied to a foreign key.

Fix:

- `payments.course_id` must be `text`
- `enrollments.course_id` must be `text`
- remove foreign keys on `course_id`

### Error: `invalid input syntax for type integer: "ANA-MINI-WUDU-COURSE-..."`

One of your payment columns still has the wrong type.

Fix:

- `amount` must be `integer`
- `transaction_id` must be `text`
- `payment_reference` must be `text`

### Quick schema check

Run this in Supabase SQL Editor:

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_name in ('profiles', 'courses', 'enrollments', 'payments')
order by table_name, ordinal_position;
```

## Current Status

The app currently supports:

- real Supabase auth flow
- schema-aligned text course IDs
- payment screenshot upload
- admin payment approval
- dynamic QR code generation
- responsive course and certificate UI

Some non-critical dashboard features still use local browser state for convenience, but the payment and auth path is now structured around Supabase.

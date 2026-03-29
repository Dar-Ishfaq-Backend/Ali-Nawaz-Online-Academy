# AliNawaz Academy — Islamic E-Learning Platform
## Complete Production Architecture & Developer Documentation

---

## 📋 Table of Contents

1. [Project Overview](#overview)
2. [Technology Stack](#tech-stack)
3. [Project Folder Structure](#folder-structure)
4. [Database ER Diagram](#database-er-diagram)
5. [API Routes](#api-routes)
6. [Frontend Code Structure](#frontend)
7. [Backend Code Structure](#backend)
8. [Video Hosting Decision](#video-hosting)
9. [Security Best Practices](#security)
10. [Docker & Deployment](#deployment)
11. [Environment Variables](#environment)

---

## 1. Project Overview {#overview}

**AliNawaz Academy** is a full-featured Islamic e-learning platform supporting:
- 8 structured Islamic courses (Aalim, Quran, Hadith, Fiqh, Sarf, Nahw, Arabic, Bahare Shariat)
- 4 user roles: Website Maintainer, Admin, Teacher, Student
- Certificate of Completion (matching uploaded template)
- Quizzes, progress tracking, PDF resources, video lessons

**Design Theme:** Emerald Green + White + Gold — Islamic geometric aesthetic

---

## 2. Technology Stack {#tech-stack}

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| State Management | Zustand + React Query |
| Backend | Python FastAPI |
| Database | PostgreSQL 15 |
| Authentication | JWT (python-jose) + bcrypt |
| Video Hosting | Cloudflare Stream *(recommended)* |
| File Storage | AWS S3 / Cloudflare R2 |
| Email | SendGrid |
| Caching | Redis |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |

---

## 3. Project Folder Structure {#folder-structure}

```
ali-nawaz-academy/
│
├── frontend/
│   ├── public/
│   │   ├── logo.png                  # AliNawaz Academy Logo
│   │   ├── certificate-bg.png        # Certificate background
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── ui/
│   │   │   │   ├── CourseCard.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── Logo.jsx
│   │   │   ├── course/
│   │   │   │   ├── CourseGrid.jsx
│   │   │   │   ├── CourseFilters.jsx
│   │   │   │   ├── LessonPlayer.jsx
│   │   │   │   └── QuizComponent.jsx
│   │   │   └── certificate/
│   │   │       └── CertificateTemplate.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── LessonPlayer.jsx
│   │   │   ├── Certificate.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── dashboards/
│   │   │       ├── StudentDashboard.jsx
│   │   │       ├── TeacherDashboard.jsx
│   │   │       └── AdminDashboard.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── courseStore.js
│   │   ├── api/
│   │   │   ├── axios.js              # Axios instance with JWT interceptor
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   └── enrollments.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useCourses.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── islamic-patterns.css
│   │   ├── utils/
│   │   │   └── certificate.js        # PDF cert generation (jsPDF)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── config.py                 # Settings / env
│   │   ├── database.py               # PostgreSQL connection
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── enrollment.py
│   │   │   ├── lesson.py
│   │   │   ├── quiz.py
│   │   │   └── certificate.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   └── quiz.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── courses.py
│   │   │   ├── lessons.py
│   │   │   ├── enrollments.py
│   │   │   ├── quizzes.py
│   │   │   ├── certificates.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── email_service.py
│   │   │   ├── certificate_service.py
│   │   │   └── video_service.py
│   │   ├── middleware/
│   │   │   ├── auth_middleware.py
│   │   │   └── rate_limiter.py
│   │   └── utils/
│   │       ├── security.py
│   │       └── pagination.py
│   ├── alembic/                      # DB migrations
│   │   ├── env.py
│   │   └── versions/
│   ├── tests/
│   │   ├── test_auth.py
│   │   └── test_courses.py
│   ├── requirements.txt
│   ├── alembic.ini
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## 4. Database ER Diagram {#database-er-diagram}

```
┌─────────────────────┐        ┌─────────────────────┐
│       roles         │        │       users          │
├─────────────────────┤        ├─────────────────────┤
│ PK id (int)         │◄──┐    │ PK id (uuid)        │
│    name (varchar)   │   └────│    role_id (FK)     │
│    permissions(json)│        │    full_name(varchar)│
└─────────────────────┘        │    email (varchar)  │
                                │    password_hash    │
                                │    is_active (bool) │
                                │    is_verified(bool)│
                                │    profile_pic      │
                                │    created_at       │
                                └─────────┬───────────┘
                                          │
          ┌───────────────────────────────┼───────────────────────┐
          │                               │                       │
          ▼                               ▼                       ▼
┌──────────────────┐          ┌───────────────────┐   ┌──────────────────────┐
│   instructors    │          │   enrollments     │   │    certificates      │
├──────────────────┤          ├───────────────────┤   ├──────────────────────┤
│ PK id (int)      │          │ PK id (int)       │   │ PK id (uuid)         │
│ FK user_id       │          │ FK user_id        │   │ FK user_id           │
│    bio (text)    │          │ FK course_id      │   │ FK course_id         │
│    speciality    │          │    enrolled_at    │   │    cert_number       │
│    experience    │          │    progress_pct   │   │    issued_at         │
│    ijazah (bool) │          │    is_completed   │   │    pdf_url           │
└────────┬─────────┘          │    last_accessed  │   └──────────────────────┘
         │                    └───────────────────┘
         │
         ▼
┌──────────────────────────┐        ┌──────────────────┐
│        courses           │        │    categories    │
├──────────────────────────┤        ├──────────────────┤
│ PK id (int)              │◄──┐    │ PK id (int)      │
│ FK instructor_id         │   │    │    name (varchar) │
│ FK category_id ──────────┼───┘    │    slug (varchar) │
│    title (varchar)       │        └──────────────────┘
│    slug (varchar)        │
│    description (text)    │
│    thumbnail_url         │
│    level (enum)          │
│    status (enum)         │
│    is_free (bool)        │
│    created_at            │
└───────────┬──────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
┌──────────────┐  ┌─────────────────────────────────┐
│   modules    │  │            lessons               │
├──────────────┤  ├─────────────────────────────────┤
│ PK id (int)  │  │ PK id (int)                     │
│ FK course_id │  │ FK module_id                    │
│    title     │  │    title (varchar)               │
│    order_num │  │    video_url (cloudflare_stream) │
│    created_at│  │    duration_secs (int)           │
└──────────────┘  │    content (text)                │
                  │    is_preview (bool)             │
                  │    order_num (int)               │
                  │    resources (JSONB)             │
                  └──────────────┬──────────────────┘
                                 │
                    ┌────────────┴──────────┐
                    ▼                       ▼
          ┌──────────────────┐   ┌──────────────────────┐
          │  lesson_progress │   │       quizzes        │
          ├──────────────────┤   ├──────────────────────┤
          │ PK id            │   │ PK id (int)          │
          │ FK user_id       │   │ FK lesson_id / course│
          │ FK lesson_id     │   │    title (varchar)   │
          │    watched_secs  │   │    passing_score(int)│
          │    is_completed  │   │    time_limit_mins   │
          │    bookmarked    │   └──────────┬───────────┘
          │    updated_at    │              │
          └──────────────────┘    ┌─────────┴──────────┐
                                  ▼                     ▼
                       ┌──────────────────┐  ┌──────────────────┐
                       │  quiz_questions  │  │  quiz_attempts   │
                       ├──────────────────┤  ├──────────────────┤
                       │ PK id (int)      │  │ PK id            │
                       │ FK quiz_id       │  │ FK user_id       │
                       │    question_text │  │ FK quiz_id       │
                       │    type (MCQ)    │  │    score (int)   │
                       │    order_num     │  │    passed (bool) │
                       └────────┬─────────┘  │    completed_at  │
                                │            └──────────────────┘
                                ▼
                       ┌──────────────────┐
                       │  quiz_answers    │
                       ├──────────────────┤
                       │ PK id (int)      │
                       │ FK question_id   │
                       │    answer_text   │
                       │    is_correct    │
                       └──────────────────┘
```

### Key Indexes
```sql
-- Performance indexes
CREATE INDEX idx_enrollments_user     ON enrollments(user_id);
CREATE INDEX idx_enrollments_course   ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id, lesson_id);
CREATE INDEX idx_courses_category     ON courses(category_id);
CREATE INDEX idx_courses_instructor   ON courses(instructor_id);
CREATE INDEX idx_courses_status       ON courses(status);
CREATE UNIQUE INDEX idx_users_email   ON users(email);
CREATE UNIQUE INDEX idx_certs_number  ON certificates(cert_number);
```

---

## 5. API Routes {#api-routes}

### Auth Routes `/api/v1/auth`
```
POST   /register          Register new user
POST   /login             Login, returns JWT
POST   /logout            Invalidate token
POST   /refresh           Refresh access token
POST   /forgot-password   Send reset email
POST   /reset-password    Reset with token
POST   /verify-email/{token}
GET    /me                Get current user profile
```

### User Routes `/api/v1/users`
```
GET    /                  List users (Admin+)
GET    /{id}              Get user
PUT    /{id}              Update user profile
DELETE /{id}              Delete user (Admin+)
GET    /{id}/enrollments  User's enrollments
GET    /{id}/certificates User's certificates
POST   /{id}/avatar       Upload avatar
```

### Course Routes `/api/v1/courses`
```
GET    /                  List courses (with filter, search, pagination)
POST   /                  Create course (Teacher+)
GET    /{id}              Get course detail
PUT    /{id}              Update course
DELETE /{id}              Delete course (Admin+)
PATCH  /{id}/publish      Publish course (Admin+)
GET    /{id}/modules      Course modules
POST   /{id}/modules      Add module
GET    /{id}/students     Enrolled students (Teacher+)
```

### Lesson Routes `/api/v1/lessons`
```
GET    /{id}              Get lesson
POST   /                  Create lesson (Teacher)
PUT    /{id}              Update lesson
DELETE /{id}              Delete lesson
POST   /{id}/progress     Update watch progress
POST   /{id}/bookmark     Toggle bookmark
POST   /{id}/resources    Upload PDF resource
```

### Enrollment Routes `/api/v1/enrollments`
```
POST   /                  Enroll in course
GET    /                  My enrollments
GET    /{id}              Enrollment detail
DELETE /{id}              Unenroll
GET    /course/{course_id}/check   Check enrollment
```

### Quiz Routes `/api/v1/quizzes`
```
GET    /                  List quizzes
POST   /                  Create quiz (Teacher)
GET    /{id}              Get quiz with questions
PUT    /{id}              Update quiz
POST   /{id}/submit       Submit answers
GET    /{id}/results/{user_id}  Get attempt results
```

### Certificate Routes `/api/v1/certificates`
```
POST   /generate          Generate certificate
GET    /                  My certificates
GET    /{id}              Get certificate
GET    /{id}/pdf          Download PDF
GET    /verify/{cert_number}  Public verification
```

### Admin Routes `/api/v1/admin`
```
GET    /dashboard         Platform stats
GET    /users             All users with filters
GET    /courses           All courses
PATCH  /courses/{id}/approve   Approve course
GET    /analytics         Detailed analytics
GET    /logs              System logs
POST   /backup            Trigger backup
```

---

## 6. Frontend Code — Key Files {#frontend}

### `src/api/axios.js`
```javascript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### `src/store/authStore.js`
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'ana-auth' }
  )
);
```

### `src/utils/certificate.js` — PDF Certificate Generation
```javascript
import jsPDF from 'jspdf';

export const generateCertificatePDF = ({ studentName, courseName, date, certId }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  // Background
  doc.setFillColor(255, 253, 245);
  doc.rect(0, 0, 297, 210, 'F');
  
  // Green border
  doc.setDrawColor(6, 79, 59);
  doc.setLineWidth(6);
  doc.rect(8, 8, 281, 194);
  
  // Gold inner border
  doc.setDrawColor(184, 134, 11);
  doc.setLineWidth(1.5);
  doc.rect(14, 14, 269, 182);
  
  // Academy Name
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(6, 79, 59);
  doc.text('AliNawaz Academy', 148, 42, { align: 'center' });
  
  // Title
  doc.setFont('times', 'italic');
  doc.setFontSize(36);
  doc.setTextColor(184, 134, 11);
  doc.text('Certificate of Completion', 148, 80, { align: 'center' });
  
  // Student name
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(6, 79, 59);
  doc.text(studentName, 148, 115, { align: 'center' });
  
  // Course
  doc.setFontSize(20);
  doc.text(courseName, 148, 140, { align: 'center' });
  
  // Footer
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${date}`, 60, 175, { align: 'center' });
  doc.text(`Certificate ID: ${certId}`, 237, 175, { align: 'center' });
  
  doc.save(`AliNawaz-Certificate-${certId}.pdf`);
};
```

---

## 7. Backend Code — Key Files {#backend}

### `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routers import auth, users, courses, lessons, enrollments, quizzes, certificates, admin
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="AliNawaz Academy API", version="1.0.0", docs_url="/api/docs")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(CORSMiddleware,
    allow_origins=["https://alinawaz.academy", "http://localhost:5173"],
    allow_methods=["*"], allow_headers=["*"], allow_credentials=True)

for router in [auth, users, courses, lessons, enrollments, quizzes, certificates, admin]:
    app.include_router(router.router, prefix="/api/v1")
```

### `backend/app/models/user.py`
```python
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid, enum
from app.database import Base

class RoleEnum(str, enum.Enum):
    website_maintainer = "website_maintainer"
    admin = "admin"
    teacher = "teacher"
    student = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(200), nullable=False)
    email = Column(String(320), unique=True, nullable=False, index=True)
    password_hash = Column(String(256), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.student)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_pic = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default="now()")

    enrollments = relationship("Enrollment", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    progress = relationship("LessonProgress", back_populates="user")
```

### `backend/app/routers/auth.py`
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.utils.security import hash_password, verify_password, create_jwt_token
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("5/minute")
async def register(request, user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role or "student"
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    token = create_jwt_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}
```

### `backend/app/utils/security.py`
```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
SECRET_KEY = "your-256-bit-secret-key"  # Use env var in production!
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_jwt_token(data: dict, expires_minutes: int = 60 * 24) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode({**data, "exp": expire}, SECRET_KEY, ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")

def require_role(*roles):
    def _check(current=Depends(get_current_user)):
        if current["role"] not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return current
    return _check
```

---

## 8. Video Hosting Decision {#video-hosting}

### Recommendation: **Cloudflare Stream** ✅

| Option | Cost | Scalability | Performance | Verdict |
|---|---|---|---|---|
| **Cloudflare Stream** | $5/1000 min stored + $1/1000 min delivered | ✅ Excellent | ✅ Global CDN | **Best for AliNawaz** |
| Vimeo Pro | $20/mo fixed, limited storage | ⚠ Moderate | ✅ Good | Good starter option |
| AWS S3 + CloudFront | Pay-as-you-go | ✅ Excellent | ✅ Excellent | More complex setup |
| Self-hosted (HLS) | Server costs | ❌ Limited | ❌ No CDN | Not recommended |

**Why Cloudflare Stream:**
- Built-in HLS adaptive streaming
- Global CDN — low latency in South Asia
- Simple API for signed URLs (prevents hotlinking)
- Automatic transcoding (1080p, 720p, 480p)
- No egress fees when combined with Cloudflare Pages

**Integration:**
```python
import cloudflare

def upload_video_to_stream(file_path: str, course_id: int) -> str:
    cf = cloudflare.Cloudflare(api_token=settings.CF_API_TOKEN)
    with open(file_path, 'rb') as f:
        result = cf.stream.upload.create(
            account_id=settings.CF_ACCOUNT_ID,
            file=f,
            meta={"name": f"course_{course_id}"}
        )
    return result.uid  # Store this UID in lessons.video_url

def get_signed_stream_url(video_uid: str) -> str:
    # Generate time-limited signed URL
    return f"https://customer-{settings.CF_SUBDOMAIN}.cloudflarestream.com/{video_uid}/iframe"
```

---

## 9. Security Best Practices {#security}

```python
# 1. Input Validation — Pydantic schemas
class CourseCreate(BaseModel):
    title: constr(min_length=3, max_length=200, strip_whitespace=True)
    description: constr(min_length=20, max_length=5000)
    category_id: int = Field(gt=0)

# 2. SQL Injection Prevention — Always use ORM, never raw strings
# ❌ WRONG:
# db.execute(f"SELECT * FROM users WHERE email = '{email}'")
# ✅ RIGHT:
user = db.query(User).filter(User.email == email).first()

# 3. Rate Limiting (slowapi)
@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, ...): ...

# 4. RBAC
@router.delete("/courses/{id}")
async def delete_course(
    id: int,
    current = Depends(require_role("admin", "website_maintainer")),
    db: Session = Depends(get_db)
): ...

# 5. Secure Headers (Nginx)
# add_header X-Content-Type-Options nosniff;
# add_header X-Frame-Options SAMEORIGIN;
# add_header X-XSS-Protection "1; mode=block";
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

---

## 10. Docker & Deployment {#deployment}

### `docker-compose.yml`
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: alinawaz_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s; timeout: 5s; retries: 5

  redis:
    image: redis:7-alpine
    volumes: [redisdata:/data]

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres/alinawaz_db
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${SECRET_KEY}
      CF_API_TOKEN: ${CF_API_TOKEN}
    depends_on: [postgres, redis]
    ports: ["8000:8000"]

  frontend:
    build: ./frontend
    ports: ["3000:80"]

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    ports: ["80:80", "443:443"]
    depends_on: [backend, frontend]

volumes:
  pgdata:
  redisdata:
```

### `nginx/nginx.conf`
```nginx
server {
    listen 80;
    server_name alinawaz.academy www.alinawaz.academy;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name alinawaz.academy;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 500M;  # For video uploads
    }
}
```

### Production Deployment Steps
```bash
# 1. Clone repository
git clone https://github.com/your-org/ali-nawaz-academy.git
cd ali-nawaz-academy

# 2. Configure environment
cp .env.example .env
# Edit .env with production values

# 3. Build & start services
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Run database migrations
docker-compose exec backend alembic upgrade head

# 5. Create superadmin
docker-compose exec backend python -m app.scripts.create_superadmin

# 6. Setup SSL (Let's Encrypt)
docker-compose exec nginx certbot --nginx -d alinawaz.academy
```

### Recommended Hosting
| Provider | Plan | Cost/mo | Best For |
|---|---|---|---|
| **DigitalOcean** | 4 vCPU / 8 GB RAM Droplet | ~$48 | Best value, easy setup |
| **AWS** | t3.medium + RDS + S3 | ~$80 | Enterprise scale |
| **Vultr** | 4 vCPU / 8 GB | ~$40 | Budget option |
| **Cloudflare Pages** | Frontend only + Workers | ~$5 | Frontend CDN |

---

## 11. Environment Variables {#environment}

### `.env.example`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/alinawaz_db
DB_USER=alinawaz
DB_PASSWORD=your_secure_password

# JWT
SECRET_KEY=your-256-bit-hex-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Cloudflare Stream
CF_API_TOKEN=your_cloudflare_api_token
CF_ACCOUNT_ID=your_account_id
CF_STREAM_SUBDOMAIN=your_subdomain

# AWS S3 (for PDFs)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=alinawaz-resources
AWS_REGION=ap-south-1

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@alinawaz.academy

# Redis
REDIS_URL=redis://localhost:6379

# Frontend
VITE_API_URL=https://alinawaz.academy/api/v1
VITE_CLOUDFLARE_STREAM_DOMAIN=customer-xyz.cloudflarestream.com
```

---

## 📌 Quick Start (Development)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Access
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/api/docs
```

---

*AliNawaz Academy Platform — Built for authentic Islamic education worldwide*
*بارك الله فيكم*

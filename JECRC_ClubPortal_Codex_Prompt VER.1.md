# Prompt for Antigravity / Codex — JECRC University Club Portal

---

## PROJECT BRIEF

Build a full-stack web application called the **JECRC University Student Club Portal** — a student-facing platform where JECRC University students can discover, explore, and apply to student clubs. Think of it as a clean internal directory + membership system.

---

## TECH STACK

**Frontend:**
- React.js with Vite
- Tailwind CSS for styling
- React Router v6 for routing
- Zustand for global state (auth)
- Lucide React for icons

**Backend:**
- Python 3.11+
- FastAPI (async web framework)
- SQLAlchemy 2.0 (async ORM) with Alembic for migrations
- `python-jose` for JWT creation and verification
- `passlib[bcrypt]` for password hashing
- `fastapi-mail` for sending verification/reset emails
- `pydantic` v2 for request/response validation and settings
- `slowapi` for rate limiting
- `cloudinary` Python SDK for image uploads

**Database:**
- PostgreSQL (host on Supabase or Railway)
- `asyncpg` as the async PostgreSQL driver

**File Storage:**
- Cloudinary (for club logos, banners, gallery images)

---

## DATABASE SCHEMA (SQLAlchemy Models)

Define these five models in `backend/app/models.py`:

```python
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True)   # must be @jecrc.ac.in
    password_hash: Mapped[str] = mapped_column(Text)
    enrollment_no: Mapped[str] = mapped_column(String(20), unique=True)
    branch: Mapped[str | None] = mapped_column(String(50))
    year: Mapped[int | None] = mapped_column(Integer)              # 1 to 4
    avatar_url: Mapped[str | None] = mapped_column(Text)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    applications: Mapped[list["Application"]] = relationship(back_populates="user")
    memberships: Mapped[list["ClubMember"]] = relationship(back_populates="user")
    presiding_clubs: Mapped[list["Club"]] = relationship(back_populates="president")


class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    tagline: Mapped[str | None] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(50))       # Tech, Cultural, Sports, Social, Literary, Science
    logo_url: Mapped[str | None] = mapped_column(Text)
    banner_url: Mapped[str | None] = mapped_column(Text)
    founded_year: Mapped[int | None] = mapped_column(Integer)
    president_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    faculty_advisor: Mapped[str | None] = mapped_column(String(100))
    faculty_email: Mapped[str | None] = mapped_column(String(150))
    faculty_dept: Mapped[str | None] = mapped_column(String(100))
    meeting_schedule: Mapped[str | None] = mapped_column(String(200))
    instagram_url: Mapped[str | None] = mapped_column(Text)
    linkedin_url: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str | None] = mapped_column(String(150))
    is_accepting: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    president: Mapped["User | None"] = relationship(back_populates="presiding_clubs")
    members: Mapped[list["ClubMember"]] = relationship(back_populates="club")
    projects: Mapped[list["Project"]] = relationship(back_populates="club")
    applications: Mapped[list["Application"]] = relationship(back_populates="club")


class ClubMember(Base):
    __tablename__ = "club_members"
    __table_args__ = (UniqueConstraint("club_id", "user_id"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id: Mapped[str] = mapped_column(ForeignKey("clubs.id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    role: Mapped[str] = mapped_column(String(50), default="Member")
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    club: Mapped["Club"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id: Mapped[str] = mapped_column(ForeignKey("clubs.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(50))
    year: Mapped[int | None] = mapped_column(Integer)
    month: Mapped[int | None] = mapped_column(Integer)
    image_url: Mapped[str | None] = mapped_column(Text)
    link_url: Mapped[str | None] = mapped_column(Text)
    outcome: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    club: Mapped["Club"] = relationship(back_populates="projects")


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("club_id", "user_id"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    club_id: Mapped[str] = mapped_column(ForeignKey("clubs.id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str | None] = mapped_column(Text)
    skills: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, accepted, rejected
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    club: Mapped["Club"] = relationship(back_populates="applications")
    user: Mapped["User"] = relationship(back_populates="applications")
```

---

## AUTHENTICATION

### Registration (`POST /api/auth/register`)
- Accept: name, enrollment_no, email, branch, year, password, confirm_password
- Validate with Pydantic: email must end in `@jecrc.ac.in`, password min 8 chars with at least one number
- Hash password with `passlib[bcrypt]` (rounds: 12)
- Send verification email via `fastapi-mail` with a signed token link
- User cannot log in until `is_verified = True`

### Login (`POST /api/auth/login`)
- Accept: email, password
- Reject if `is_verified` is False with a 403 and message: "Please verify your email first"
- On success, return JWT signed with `SECRET_KEY` (expires in 7 days)
- JWT payload: `{ "sub": user_id, "email": email, "name": name, "role": role }`

### Protected Routes
- Use FastAPI's `Depends()` system with a `get_current_user` dependency that:
  - Reads `Authorization: Bearer <token>` from the request header
  - Decodes and validates the JWT using `python-jose`
  - Returns the current user object, or raises `HTTPException(401)`
- Admin routes additionally use a `require_club_officer` dependency that checks role

---

## API ENDPOINTS

### Auth — `/api/auth`
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/verify-email?token=...
POST   /api/auth/forgot-password       { email }
POST   /api/auth/reset-password        { token, new_password }
GET    /api/auth/me                    (auth required)
```

### Clubs — `/api/clubs`
```
GET    /api/clubs                      (query params: category, accepting)
GET    /api/clubs/{slug}
GET    /api/clubs/{slug}/projects
GET    /api/clubs/{slug}/members
```

### Applications (auth required)
```
POST   /api/clubs/{slug}/apply         { message, skills }
GET    /api/my-applications
```

### Admin (auth + club officer role)
```
PUT    /api/admin/clubs/{slug}
POST   /api/admin/clubs/{slug}/projects
PUT    /api/admin/clubs/{slug}/projects/{id}
DELETE /api/admin/clubs/{slug}/projects/{id}
GET    /api/admin/clubs/{slug}/applications
PATCH  /api/admin/applications/{id}    { status: "accepted" | "rejected" }
```
> When an application is accepted, automatically insert a row into `club_members`.

---

## FRONTEND PAGES & ROUTING

### Public Pages (no auth required)

**`/` — Landing Page**
- Full-screen hero with JECRC navy blue (#003087) background
- University name, tagline: "Your gateway to every club at JECRC"
- Animated counters: "20+ Active Clubs", "1500+ Members", "50+ Events/Year"
- Two CTA buttons: Login | Register
- Brief "What is this portal?" section with 3 feature cards
- Footer with university info

**`/login` — Login Page**
- Email + password fields
- Client-side validation (must be @jecrc.ac.in)
- Forgot password link
- Error toast on wrong credentials
- Redirect to /dashboard on success

**`/register` — Registration Page**
- Fields: Full Name, Enrollment No., Email, Branch (dropdown), Year (1–4 dropdown), Password, Confirm Password
- Inline validation messages
- On success: show "Check your inbox to verify your email" message

---

### Authenticated Pages (redirect to /login if not logged in)

**`/dashboard` — Student Dashboard**
- Welcome banner: "Hey [Name], explore what JECRC has to offer 👋"
- Stat cards: Clubs Joined, Applications Pending
- "Recommended Clubs" row based on user's branch
- "Recently Active Clubs" feed
- Quick links to top 4 clubs

**`/clubs` — Club Directory**
- Search bar (filter by name/keyword)
- Left sidebar with filters:
  - Category checkboxes: Tech, Cultural, Sports, Literary, Social, Science
  - Toggle: "Only showing accepting applications"
- Grid view (3 col desktop, 2 tablet, 1 mobile) of ClubCards
- Each ClubCard:
  - Club logo + name
  - Category badge (color-coded — Tech: Blue, Cultural: Purple, Sports: Green, Social: Orange, Literary: Teal)
  - Short tagline
  - Member count
  - Green "Accepting" badge or grey "Closed" badge
  - "View Club →" button

**`/clubs/:slug` — Club Profile Page**

This is the most important page. Build it with these sections in order:

1. **Hero** — Full-width banner image, overlaid club logo, club name + category badge, tagline, social icons (Instagram, LinkedIn, Email), "Apply Now" button (or "Applications Closed" if not accepting)

2. **About** — Full description, founded year, meeting schedule

3. **Leadership Table** — President name (linked to profile), Faculty Advisor name + email + department

4. **How to Apply** — Step-by-step instructions, eligibility note, then the application form:
   - Textarea: "Why do you want to join?"
   - Textarea: "Relevant skills or experience"
   - Submit button (triggers `POST /api/clubs/{slug}/apply`)
   - Show success/error feedback inline

5. **Past Projects & Initiatives** — Vertical timeline (most recent first). Each entry:
   - Title, Month & Year, Category tag
   - 2–4 line description
   - Optional image
   - Outcome/award highlight
   - Optional external link

6. **Gallery** — Masonry or uniform photo grid, up to 12 images

7. **Core Team** — Avatar + Name + Role cards in a flex row

**`/my-applications` — My Applications**
- Table with columns: Club Name, Date Applied, Status (Pending / Accepted / Rejected)
- Status shown as colored pill badge
- "View Club" link per row

**`/profile` — Student Profile**
- Display: name, enrollment number, branch, year
- Edit: avatar (Cloudinary upload), name
- Change password form
- List of clubs the user is a member of

---

### Admin Pages (auth + president role)

**`/admin/clubs/:slug/edit`** — Edit club info (description, meeting times, social links, toggle accepting)

**`/admin/clubs/:slug/projects`** — Add / edit / delete club projects

**`/admin/clubs/:slug/applications`** — View pending applications, accept or reject each one

---

## UI / DESIGN SYSTEM

Use these CSS variables (set in index.css or Tailwind config):

```css
--primary:    #003087;  /* JECRC Navy Blue */
--accent:     #E8A020;  /* Gold/Amber */
--success:    #22C55E;
--warning:    #F59E0B;
--danger:     #EF4444;
--bg-light:   #F8F9FA;
--text-main:  #1A1A2E;
--text-muted: #6B7280;
--card-bg:    #FFFFFF;
--border:     #E5E7EB;
```

**Typography:**
- Font: Inter (import from Google Fonts)
- Headings: Bold
- Body: 16px minimum, Regular 400 / Medium 500

**Component rules:**
- Club cards: white background, `shadow-sm`, `hover:-translate-y-1 transition-all` lift effect
- Category badges: pill-shaped (`rounded-full px-3 py-1 text-sm font-medium`)
- Timeline: left vertical border with dot markers
- Forms: full-width inputs, visible labels, inline validation error messages below each field
- Mobile-first: hamburger nav on mobile

---

## FOLDER STRUCTURE

```
jecrc-club-portal/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClubCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProjectTimeline.jsx
│   │   │   ├── ApplicationForm.jsx
│   │   │   └── FilterSidebar.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ClubDirectory.jsx
│   │   │   ├── ClubProfile.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   └── Profile.jsx
│   │   ├── store/
│   │   │   └── authStore.js         ← Zustand store with JWT token
│   │   ├── utils/
│   │   │   └── api.js               ← Axios instance with Authorization header
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── clubs.py
│   │   │   └── admin.py
│   │   ├── models.py                ← SQLAlchemy models
│   │   ├── schemas.py               ← Pydantic request/response schemas
│   │   ├── database.py              ← Async SQLAlchemy engine + session
│   │   ├── dependencies.py          ← get_current_user, require_officer
│   │   ├── utils/
│   │   │   ├── auth.py              ← JWT + bcrypt helpers
│   │   │   ├── email.py             ← fastapi-mail setup
│   │   │   └── cloudinary.py        ← Cloudinary upload helper
│   │   └── main.py                  ← FastAPI app, CORS, router registration
│   ├── alembic/
│   │   └── versions/
│   ├── alembic.ini
│   ├── seed.py                      ← Script to insert sample clubs
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## ENVIRONMENT VARIABLES (backend `.env`)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/jecrc_clubs
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=noreply@jecrc.ac.in
EMAIL_PASSWORD=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

---

## `requirements.txt`

```
fastapi
uvicorn[standard]
sqlalchemy[asyncio]
asyncpg
alembic
passlib[bcrypt]
python-jose[cryptography]
fastapi-mail
pydantic[email]
pydantic-settings
cloudinary
slowapi
python-multipart
```

---

## SEED DATA (`seed.py`)

Seed the database with these three clubs:

**Club 1 — ByteForge (Coding Club)**
- Category: Tech | Tagline: "Building the future, one commit at a time."
- Founded: 2016 | President: Aarav Mehta (3rd Year, CSE)
- Faculty: Dr. Priya Sharma, Dept. of Computer Science
- Meeting: Every Saturday, 4:00 PM, CS Lab 3
- Accepting: Yes
- Projects: HackJECRC 2024 (36-hr hackathon, 200+ participants), LeetCode Weekly Challenge (ongoing), Open Source Week Jan 2024 (50+ PRs merged), Smart India Hackathon 2023 (Top 10 nationally), Web Dev Bootcamp Aug 2023

**Club 2 — E-Cell JECRC (Entrepreneurship Cell)**
- Category: Social | Tagline: "Igniting the entrepreneurial spirit."
- Founded: 2018 | President: Sneha Kapoor (4th Year, MBA)
- Faculty: Prof. Ramesh Joshi, Dept. of Management
- Meeting: Every Wednesday, 5:00 PM, Seminar Hall B
- Accepting: Yes
- Projects: Startup Saturday Series (monthly speakers), Pitch Perfect 2024 (₹50,000 prize pool), Business Plan Competition 2023 (80 teams), Jaipur Startup Ecosystem visit, Financial Literacy Drive (500+ students)

**Club 3 — Lens & Light (Photography Club)**
- Category: Cultural | Tagline: "Every frame tells a story."
- Founded: 2019 | President: Kavya Trivedi (2nd Year, ECE)
- Faculty: Prof. Anita Verma, Dept. of Humanities
- Meeting: Every Sunday, 10:00 AM, Open Courtyard
- Accepting: Yes
- Projects: Annual Photo Exhibition 2024 (60+ prints), Campus in Frame Jan 2024, Monsoon Photography Challenge 2023 (150+ entries), Official photographer for Synchronize Cultural Fest 2023, Portrait Day Oct 2023

---

## SECURITY REQUIREMENTS

- Passwords hashed with `passlib[bcrypt]`, rounds: 12
- JWT stored in httpOnly cookie (not localStorage) to prevent XSS — use `response.set_cookie(httponly=True)`
- Email domain restricted to `@jecrc.ac.in` — reject all others with a 422 at registration
- Rate limit `POST /api/auth/login` to 5 attempts per 15 minutes per IP using `slowapi`
- All inputs validated by Pydantic schemas — FastAPI will auto-return 422 on invalid data
- CORS configured with `CORSMiddleware` to only allow `CLIENT_URL`
- Cloudinary: validate file content type (images only) and size (max 5MB) before uploading

---

## NOTES FOR THE AI

- Start with the backend: models → Alembic migration → seed.py → auth router → clubs router → admin router → run with `uvicorn app.main:app --reload`
- Then build the frontend: set up Vite + Tailwind → auth pages → club directory → club profile (most complex) → dashboard → remaining pages
- Use FastAPI's automatic `/docs` (Swagger UI) — it will be useful for testing all endpoints during development
- Use `async def` for all route handlers and database queries — this is a fully async FastAPI app
- Use placeholder/gradient backgrounds where real images aren't available
- The `/clubs/:slug` Club Profile page is the most important page — spend the most effort making it polished and complete
- Make the UI feel clean, modern, and professional. The accent gold (#E8A020) should be used sparingly for highlights and CTAs only
- Write docstrings on route handlers and comments explaining non-obvious decisions

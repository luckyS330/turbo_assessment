# Notes Taking App

A full-stack notes-taking application built with **Django REST Framework** (backend) and **Next.js 15** (frontend), designed pixel-perfectly from a Figma spec.

---

## Process Summary

The project started from a Figma design file and a product brief, and was built iteratively in two main phases:

**Phase 1 — Backend**
Set up a Django REST Framework API with JWT authentication, per-user data isolation, and a signal that auto-creates three default categories (*Random Thoughts*, *School*, *Personal*) on every new account. Wrote 20 API tests covering auth, CRUD, cross-user isolation, and filtering.

**Phase 2 — Frontend**
Built a Next.js 15 App Router frontend in TypeScript. Implemented auth pages (login/signup), a sidebar with category filtering, a masonry-style note card grid, and an auto-saving note editor with a category-colored background. Each component was iteratively refined against the Figma inspector until measurements, typography, colors, and spacing matched pixel-for-pixel.

Key debugging work included resolving a redirect loop caused by Next.js `rewrites()` conflicting with Django's trailing-slash redirects (replaced with a Next.js Route Handler proxy), and fixing a stale JWT token 401 error on registration by isolating auth requests to a no-auth Axios instance.

---

## Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Backend     | Python 3.8+, Django 4.2, Django REST Framework 3.15 |
| Auth        | djangorestframework-simplejwt (JWT)                 |
| Database    | SQLite (dev)                                        |
| Frontend    | Next.js 15, React 19, TypeScript                    |
| Styling     | Tailwind CSS + inline styles (Figma pixel values)   |
| HTTP Client | Axios with JWT interceptor                          |
| Fonts       | Inter + Inria Serif (Google Fonts)                  |

---

## Project Structure

```
.
├── backend/               # Django project settings & main URLs
├── notes_api/             # Django app
│   ├── models.py          # Category, Note; signal to auto-create categories on signup
│   ├── serializers.py     # RegisterSerializer, NoteListSerializer, NoteDetailSerializer, CategorySerializer
│   ├── views.py           # RegisterView, MeView, NoteViewSet, CategoryViewSet
│   ├── filters.py         # Category filter
│   ├── urls.py
│   └── tests.py           # 20 API tests
├── manage.py
├── requirements.txt
└── frontend/
    ├── app/
    │   ├── api/[...path]/route.ts    # Next.js Route Handler — proxies /api/* to Django
    │   ├── (auth)/
    │   │   ├── signup/page.tsx       # Sign-up form
    │   │   └── login/page.tsx        # Login form
    │   ├── page.tsx                  # Main app (sidebar + note list + editor)
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── Sidebar.tsx               # Category list + logout
    │   ├── NoteCard.tsx              # Fixed 303×246px preview card
    │   └── NoteEditor.tsx            # Auto-saving editor with category color background
    ├── lib/
    │   ├── api.ts                    # Axios API client (auth + notes + categories)
    │   ├── auth.ts                   # Token helpers (localStorage + cookies)
    │   └── date.ts                   # formatNoteDate() — Today / Yesterday / Month Day
    ├── types/index.ts
    └── package.json
```

---

## Setup & Running

### Backend

```bash
# 1. (Optional) create a virtual environment
python3 -m venv venv && source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations
python manage.py migrate

# 4. Start the dev server  →  http://localhost:8000
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server  →  http://localhost:3000
npm run dev
```

The Next.js Route Handler at `app/api/[...path]/route.ts` proxies all `/api/*` requests to `http://localhost:8000/api/*`, forwarding the `Authorization` header — no CORS configuration needed in development.

---

## API Endpoints

| Method | Endpoint               | Auth | Description                        |
|--------|------------------------|------|------------------------------------|
| POST   | `/api/auth/register/`  | —    | Create account; returns JWT + user |
| POST   | `/api/auth/login/`     | —    | Login; returns JWT pair            |
| GET    | `/api/auth/me/`        | ✓    | Current user info                  |
| GET    | `/api/categories/`     | ✓    | List categories (with note counts) |
| POST   | `/api/categories/`     | ✓    | Create category                    |
| GET    | `/api/notes/`          | ✓    | List notes (supports `category`)   |
| POST   | `/api/notes/`          | ✓    | Create note                        |
| GET    | `/api/notes/:id/`      | ✓    | Retrieve full note                 |
| PATCH  | `/api/notes/:id/`      | ✓    | Update note fields                 |
| DELETE | `/api/notes/:id/`      | ✓    | Delete note                        |

---

## Running Tests

```bash
python manage.py test notes_api --verbosity=2
```

20 tests cover:
- Registration, duplicate-email rejection, default category creation
- Login, JWT token response, unauthenticated access
- Note CRUD, cross-user isolation (404 on other user's notes)
- Category filter
- List vs detail serializer fields (excerpt vs full content)

---

## Key Design & Technical Decisions

### Backend

- **Auto-created categories via signal** — a `post_save` signal on `User` creates three default categories immediately after account creation, so the frontend always gets a populated sidebar on first login.
- **Per-user data isolation** — all querysets filter by `request.user`; accessing another user's note returns 404 (not 403) to avoid leaking resource existence.
- **NoteListSerializer / NoteDetailSerializer split** — the list endpoint returns a 200-char `excerpt` instead of full content; the detail endpoint returns the full `content`. This keeps list payloads small without a second request pattern.
- **Single category per note** — matches the UX spec (one color per note card). Many-to-many tags were considered but discarded in favor of simplicity.
- **AllowAny on auth endpoints only** — all other endpoints require `IsAuthenticated` via DRF's default permission class.

### Frontend

- **Next.js Route Handler proxy** — replaced `next.config.ts` `rewrites()` with an explicit Route Handler at `app/api/[...path]/route.ts`. The `rewrites()` approach caused `ERR_TOO_MANY_REDIRECTS` because Django appends trailing slashes (308) and Next.js was intercepting those redirects in a loop.
- **Separate no-auth Axios instance for auth endpoints** — `login()` and `register()` use an Axios instance without the JWT interceptor. This prevents stale tokens in `localStorage`/cookies from being attached to auth requests and causing a 401 before `AllowAny` can take effect.
- **Auto-save with debounce** — title and content are saved 500 ms after the user stops typing. Category changes save immediately since they affect the visual state (card color).
- **Dynamic category background color** — the editor's `backgroundColor` and border color are derived from `category.color` at render time. No hardcoded color mapping exists in the frontend.
- **Fixed card dimensions** — note cards are exactly 303×246px (from Figma inspector) with `overflow: hidden`, `min/maxHeight` enforcement, and `-webkit-line-clamp: 3` on the title. This prevents variable-height cards from breaking the grid.
- **Pixel-perfect layout from Figma** — all spacing values (sidebar 311px, card padding 16px, grid gap 13px, editor padding 39/64/64/64px, etc.) come directly from the Figma inspector rather than approximations. Max-width is 1280px to match the MacBook Air 13" frame used in the designs.
- **JWT in localStorage + cookie** — keeps auth simple for a demo. The Axios interceptor reads from cookie first, falls back to localStorage.

---

## AI Tools Used

**Claude Code (Claude Sonnet 4.6)** was used as a coding assistant during development — similar to how a developer would use GitHub Copilot or another AI pair-programming tool.

**How it was used:**

1. **Boilerplate acceleration** — Used to quickly scaffold repetitive code (serializers, URL patterns, Tailwind class combinations) so more time could be spent on architecture and design decisions.

2. **Figma-to-CSS translation** — Pasted Figma inspector values into the chat to get the corresponding CSS/inline styles quickly, then reviewed and adjusted as needed.

3. **Debugging assistance** — When encountering errors (e.g., redirect loops, JWT 401s), described the symptoms and used Claude's suggestions as a starting point for diagnosis — always verifying the fix made sense before applying it.

4. **Code review** — Asked Claude to review specific functions or components for potential issues, then evaluated the feedback independently.

All architectural decisions, feature prioritization, and final implementation choices were made by the developer. AI-generated code was always reviewed before being committed.

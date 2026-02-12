# replit.md

## Overview

**心语晴窗 (XinYu QingChuang)** is a mental health support platform designed for Chinese high school students, combining AI-powered conversation with Eastern wellness practices. The application provides four core features:

1. **AI Dialogue** - AI-powered conversational support for mental health
2. **Breathing Exercises** - Guided breathing techniques (4-4-6-2 pattern) with voice guidance
3. **Meditation** - Timed meditation sessions with configurable durations
4. **Mental Health Assessment** - A 10-question psychological assessment quiz (PHQ-style)

The platform is built as a no-login (anonymous) experience, lowering the barrier for students seeking mental health support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Framework
- **Flask** (Python 3.12) serves as the backend framework
- Routes serve HTML templates and handle API requests
- The app uses `python-dotenv` for environment variable management
- Production deployment uses **Gunicorn** as the WSGI server

### Database
- **SQLite** via Flask-SQLAlchemy ORM (`mental_health.db`)
- Three models defined:
  - `User` - Basic user record with nickname and creation timestamp
  - `Conversation` - Stores user messages and AI responses, linked to a user
  - `BreathingSession` - Records breathing exercise sessions with duration, technique, and before/after calm levels
- The database is file-based SQLite, stored locally. No migration tool (like Alembic) is currently configured — tables are created via `db.create_all()`.

### Frontend Architecture
- **Server-side rendered templates** using Jinja2 (Flask's `render_template`)
- **Tailwind CSS** loaded via CDN (`cdn.tailwindcss.com`) for the main index and navigation pages
- Custom CSS in `static/css/style.css` for component-specific styling
- **Lucide Icons** loaded via CDN for modern iconography
- Each feature has its own dedicated HTML template and corresponding JavaScript file:
  - `index.html` + `main.js` — Main landing page with content block switching
  - `breathing.html` + `breathing.js` — Breathing exercise with animated ball and speech synthesis
  - `meditation.html` + `meditation.js` — Meditation timer
  - `assessment.html` + `assessment.js` — Mental health quiz
  - `guanhuai.html` — Navigation hub linking to all features

### JavaScript Architecture
- Vanilla JavaScript (no frontend framework)
- Class-based pattern for complex features (e.g., `BreathingGuide` class)
- Content block switching via `showContent()` function for SPA-like navigation
- Browser Speech Synthesis API used for voice-guided breathing

### Key Design Decisions
- **No authentication** — The app intentionally skips login/registration to reduce friction for students seeking help. User records exist in the database but aren't gated behind auth.
- **Multi-page with SPA-like navigation** — The main page uses content block toggling (show/hide divs) for tab-like navigation, while specialized features have their own pages.
- **Chinese-language UI** — All user-facing content is in Simplified Chinese, targeting Chinese high school students.

## External Dependencies

### Python Packages
- `flask` (3.1.2) — Web framework
- `flask-sqlalchemy` (3.1.1) — SQLAlchemy ORM integration
- `gunicorn` (25.0.1) — Production WSGI server
- `python-dotenv` (1.2.1) — Environment variable loading
- `werkzeug` (3.1.5) — WSGI utilities (Flask dependency)

### Frontend CDNs
- **Tailwind CSS** — `cdn.tailwindcss.com` for utility-first CSS
- **Lucide Icons** — `unpkg.com/lucide@latest` for SVG icons

### Browser APIs
- **Web Speech Synthesis API** — Used for voice-guided breathing exercises (browser-native, no external service)

### Environment Variables
- `SECRET_KEY` — Flask secret key (defaults to `'dev-key'` in development)
- Additional environment variables may be needed for AI service integration (the AI chat feature references conversation storage but the AI provider integration code is not fully visible in the current codebase)

### Database
- **SQLite** — File-based database at `instance/mental_health.db`. No external database server required. If scaling is needed, this could be migrated to PostgreSQL.
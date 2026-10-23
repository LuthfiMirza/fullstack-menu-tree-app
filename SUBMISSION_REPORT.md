# Technical Test Submission Report
## Fullstack Menu Tree System — Solusi Teknologi Kreatif (STK)

---

### 👤 Candidate Information
- **Name:** [Nama Lengkap Anda]
- **Applied Position:** Fullstack Web Developer
- **Date of Submission:** 23 Oktober 2026
- **GitHub Repository:** [https://github.com/LuthfiMirza/fullstack-menu-tree-app](https://github.com/LuthfiMirza/fullstack-menu-tree-app)
- **Repository Visibility:** Public
- **Demo Video (Loom / Drive):** [Sertakan link rekaman video demo jika ada]

---

### 🎯 Overview & Completed Features

A production-grade fullstack web application implementing a recursive, unlimited-depth hierarchical menu tree with interactive CRUD operations, drag-and-drop reordering & reparenting, real-time search filtering with ancestor preservation, and pixel-perfect Figma UI fidelity.

#### 1. Backend Core & Bonus Features (NestJS 10 + PostgreSQL + TypeORM)
- [x] **Hierarchical Data Model:** Adjacency List pattern with `parentId` referencing `menus.id` with `ON DELETE CASCADE`.
- [x] **Dynamic Derived Depth:** Depth is never stored statically; computed dynamically on read via ancestor traversal to prevent denormalization issues.
- [x] **Full CRUD Endpoints:**
  - `GET /api/menus` — Retrieve full hierarchical tree ordered by contiguous positions.
  - `GET /api/menus/:id` — Retrieve detailed node metadata (depth, parentName, etc.).
  - `POST /api/menus` — Create new root menu or child node under any parent.
  - `PUT /api/menus/:id` — Update menu metadata (e.g., name).
  - `DELETE /api/menus/:id` — Cascade delete menu and all nested descendants.
- [x] **Bonus Endpoints:**
  - `PATCH /api/menus/:id/move` — Reparent node to a different parent and/or adjust position.
  - `PATCH /api/menus/:id/reorder` — Reorder sibling node within the same level.
- [x] **Data Integrity & Cycle Detection:**
  - Transaction-wrapped operations for position compaction (ensuring continuous `0..k-1` indexing).
  - Graph cycle detection prevents moving a node into itself or any of its descendants (`409 Conflict`).
- [x] **Interactive OpenAPI / Swagger Documentation:** Live at `/api/docs`.
- [x] **Health Check Endpoint:** `/api/health`.
- [x] **36 Automated Unit Tests:** Covering tree construction, cycle detection, CRUD services, and transactional rollbacks.

#### 2. Frontend Core & Bonus Features (Next.js 14 App Router + Tailwind CSS + Zustand)
- [x] **Figma-Aligned Design:** Matched typography, colors (`#0052AF`, `#1D2939`, `#F8FAFC`), layout grid, borders, and authentic Solusi Teknologi Kreatif branding.
- [x] **Recursive Tree View:** Unlimited nesting depth with clear visual connector lines and chevron expand/collapse toggles.
- [x] **Toolbar Actions:** "Expand All" and "Collapse All" global tree controls.
- [x] **Search & Highlight:** Case-insensitive search query that auto-expands all ancestor nodes and highlights matched substrings in yellow.
- [x] **Detail Form:** Displays System Code (pinned UUID), Menu ID, Depth, Parent Data, and editable Menu Name with saving state.
- [x] **Quick Action Buttons:** Hover/select circular `+` button to quickly add a child node to that parent; trash icon to initiate deletion.
- [x] **Safe Confirmation Modal:** Delete confirmation dialog showing total descendant count affected.
- [x] **Bonus Drag-and-Drop (@dnd-kit):** Smooth drag-and-drop to reorder siblings and reparent nodes across levels with optimistic UI updates and auto-rollback on failure.
- [x] **Toast Notifications & Feedback:** Non-blocking feedback on success, network failure, or cycle violation.
- [x] **Responsive Mobile Layout:** Collapsible sidebar / drawer for seamless mobile & tablet viewing.
- [x] **22 Automated Unit Tests:** Covering search filtering, ancestor preservation, flattening, and cycle detection.

#### 3. Bonus Docker & DevOps
- [x] **Multi-stage Production Dockerfile:** Optimized builds for both frontend and backend.
- [x] **Development Dockerfile & Compose:** Hot-reload support with live bind-mounts (`docker-compose.dev.yml`).
- [x] **Production Docker Compose:** Complete orchestration with PostgreSQL, database migrations, and health checks (`docker-compose.yml`).

---

### 📸 Application Screenshots

| Desktop View (Figma-Aligned Detail Form) | Mobile Responsive Layout |
|:---:|:---:|
| ![Desktop View](docs/screenshots/desktop_view.png) | ![Mobile View](docs/screenshots/mobile_view.png) |

| Live Search with Yellow Highlight & Ancestor Expansion | Safe Deletion Confirmation Dialog |
|:---:|:---:|
| ![Search Filter](docs/screenshots/search_filter.png) | ![Delete Confirmation](docs/screenshots/modal_confirm.png) |

---

### 🧪 Test Execution & Verification

#### Backend Unit Tests (Jest)
```bash
cd backend
npm run test
```
- **Result:** `36 passed, 36 total`
- **Coverage:** Service layer, cycle detection, orphan handling, dynamic depth calculation, transactional reordering.

#### Frontend Unit Tests (Vitest)
```bash
cd frontend
npm run test
```
- **Result:** `22 passed, 22 total`
- **Coverage:** Hierarchy traversal, case-insensitive search filter, ancestor auto-expansion, cycle detection.

---

### 🚀 Quick Start Guide

#### Option A: Run via Docker Compose (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/LuthfiMirza/fullstack-menu-tree-app.git
cd fullstack-menu-tree-app

# 2. Copy environment template
cp .env.example .env

# 3. Start containers
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Swagger UI: `http://localhost:3001/api/docs`

#### Option B: Run Locally (Node.js & Local PostgreSQL)
1. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run migration:run
   npm run seed
   npm run start:dev
   ```
2. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

---

### 📡 API Documentation & Endpoints

| Method | Endpoint | Description | Status Code |
|:---|:---|:---|:---:|
| `GET` | `/api/health` | Health check endpoint | `200 OK` |
| `GET` | `/api/menus` | Get full menu tree | `200 OK` |
| `GET` | `/api/menus/:id` | Get single menu detail (with depth & parentName) | `200 OK` / `404` |
| `POST` | `/api/menus` | Create new menu item (root or child) | `201 Created` |
| `PUT` | `/api/menus/:id` | Update menu name | `200 OK` |
| `DELETE` | `/api/menus/:id` | Cascade delete menu item and descendants | `204 No Content` |
| `PATCH` | `/api/menus/:id/move` | Move menu item to different parent and position | `200 OK` / `409` |
| `PATCH` | `/api/menus/:id/reorder` | Reorder menu item within same sibling level | `200 OK` |

Interactive Swagger UI: `http://localhost:3001/api/docs`

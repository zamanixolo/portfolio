# Project Context: Portfolio Site

## Overview
This is a personal portfolio website built with **Next.js 16 (App Router)**, **TypeScript**, and **Prisma** using an **SQLite** database. It features a dynamic project gallery, detailed case study pages, and an admin interface for content management. The design leverages **Framer Motion** for animations and **CSS Modules** for styling.

## Key Technologies
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Database:** SQLite (via Prisma ORM)
*   **Styling:** CSS Modules, generic `globals.css`
*   **Animation:** Framer Motion
*   **Icons:** React Icons

## Architecture & Conventions

### Directory Structure
*   `src/app/`: App Router pages and API routes.
    *   `src/app/page.tsx`: Main landing page (Project Grid).
    *   `src/app/work/[id]/`: Individual project case studies.
    *   `src/app/admin/`: Protected admin interface.
    *   `src/app/api/`: API endpoints (Next.js Route Handlers).
*   `src/components/`: Reusable UI components (e.g., `Hero`, `ProjectCard`, `Navigation`).
*   `src/lib/`: Utility libraries (specifically `db.ts` for the Prisma singleton).
*   `prisma/`: Database schema, migrations, and seed scripts.
*   `public/`: Static assets (images, SVGs).

### Database (Prisma)
*   **Schema:** Defined in `prisma/schema.prisma`.
*   **Models:**
    *   `User`: Authentication.
    *   `Project`: Core portfolio items (title, category, cover media, etc.).
    *   `ProjectImage`: Gallery images associated with a project.
    *   `Block`: Flexible content blocks for project details (text, image, video).
    *   `Page`: Generic page content.
*   **Seeding:** `prisma/seed.ts` populates the database with sample project data.

### Styling & UI
*   **CSS Modules:** Used for component-level styling (e.g., `ProjectCard.module.css`).
*   **Global Styles:** `src/app/globals.css` handles base styles and theme variables.
*   **Fonts:** Uses `next/font` (specifically `Geist` per `README`, though code hints at custom font usage).

### Authentication
*   **Admin Access:** Protected via `src/middleware.ts`, which checks for an `admin_token` cookie on `/admin` routes.

## Development Workflow

### Prerequisites
*   Node.js (LTS recommended)
*   npm

### Setup & Running
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Database Setup:**
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Run Migrations
    npx prisma migrate dev

    # Seed Database
    npx prisma db seed
    ```
3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

## Common Tasks
*   **Adding Components:** Create in `src/components/`, use CSS Modules for styles.
*   **Modifying Schema:** Edit `prisma/schema.prisma`, then run `npx prisma migrate dev`.
*   **Seeding Data:** Update `prisma/seed.ts` and run `npx prisma db seed`.

# 🏗️ Architecture — PuduCan

This document helps new contributors quickly understand how the codebase is structured and where things live. You don't need to read all of this before contributing — just the parts relevant to what you're working on.

---

## 📁 Folder Structure

```
puducan-jipmer/
├── app/                  # Next.js App Router — pages and layouts
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── store/                # Zustand global state
├── contexts/             # React Context providers
├── lib/                  # Utility functions and helpers
├── schema/               # Zod validation schemas
├── types/                # TypeScript type definitions
├── data/                 # Seed data files (used by seed scripts)
├── scripts/              # Node scripts for seeding Firestore
├── assets/               # Static assets (sample Excel file, etc.)
├── public/               # Public static files served by Next.js
├── __tests__/            # Vitest unit and integration tests
├── constants/            # App-wide constants
└── .github/              # GitHub Actions workflows
```

---

## 🗂️ Key Folders Explained

### `app/`
This is the heart of the Next.js App Router. Each folder inside represents a route.

```
app/
├── (auth)/               # Login page (public route)
├── admin/                # Admin dashboard and sub-pages
├── doctor/               # Doctor dashboard
├── nurse/                # Nurse dashboard
├── asha/                 # ASHA worker dashboard (mobile-first)
└── layout.tsx            # Root layout (theme, query client, etc.)
```

Role-based access is enforced at the layout level — each role's folder has its own layout that checks the user's role from Firestore before rendering anything.

### `components/`
Reusable components shared across pages. Organised by feature:

```
components/
├── ui/                   # shadcn/ui base components (Button, Dialog, etc.)
├── table/                # GenericTable and related table components
├── forms/                # Form components (patient forms, user forms)
├── shared/               # Layout pieces used across multiple roles
```

When adding a new UI element, check `components/ui/` first — it's likely already there from shadcn.

### `hooks/`
Custom React hooks that encapsulate reusable logic:

- `useAuth` — reads the current user's role and Firebase auth state
- `useTableData` — handles pagination, search, filter state for data tables

If you find yourself writing the same data-fetching or state logic in two places, it probably belongs here as a hook.

### `store/`
Global state managed with **Zustand**. Kept intentionally lightweight — only things that genuinely need to be global (like the current user session state) live here. Avoid putting server data here; that belongs in TanStack Query.

### `schema/`
All form validation schemas using **Zod**. If you're adding or modifying a form, define or update the schema here and import it into your form component. This keeps validation logic out of components.

### `lib/`
Pure utility functions — formatters, Firebase client init, helper functions. Nothing with React or UI logic should live here.

---

## 🔄 Data Flow

```
Firebase Auth
     │
     ▼
useAuth (hook)  ──►  Zustand store  ──►  Role-based layout
                                               │
                                               ▼
                                    TanStack Query (Firestore)
                                               │
                                               ▼
                                    GenericTable / Forms
```

1. On login, Firebase Auth gives us a user UID.
2. `useAuth` fetches that user's document from Firestore to get their role (admin/doctor/nurse/asha).
3. The role is stored in Zustand and used by layouts to decide what to render.
4. All patient/hospital data is fetched via TanStack Query — this handles caching, refetching, and loading states automatically.
5. Forms use React Hook Form + Zod for validation, and write directly to Firestore on submit.

---

## 🧪 Testing

Tests live in `__tests__/` and use **Vitest** + **React Testing Library**.

```bash
pnpm test          # run all tests
pnpm test --ui     # open Vitest UI in browser
```

When adding a new component or hook, add a corresponding test file. Name it `ComponentName.test.tsx`.

---

## 🔐 Auth & Role System

There are 4 roles: `admin`, `doctor`, `nurse`, `asha`. Each role is stored as a string field in the user's Firestore document (in the `users` collection), linked by their Firebase Auth UID.

Firestore structure:
```
users/
  {uid}/
    role: "admin" | "doctor" | "nurse" | "asha"
    name: string
    email: string
    hospitalId: string
```

---

## 💡 Tips for New Contributors

- **Not sure where your code belongs?** Follow the pattern of existing code nearby and ask in Issues.
- **Adding a form field?** Update the Zod schema in `schema/` first, then the form component.
- **Touching Firestore queries?** Wrap them in TanStack Query — don't fetch in `useEffect`.
- **Building a new page?** Add it under the appropriate role folder in `app/`.

<div align="center">

# 🩺 PuduCan
**PUDUcherry Cancer Patient Management Dashboard**

A modern healthcare platform built for ASHA workers, nurses, and doctors to manage cancer patient data efficiently — part of a national study led by JIPMER and sponsored by ICMR.

🔗 **[View Live Demo →](https://cancer-tracker-jipmer.vercel.app)**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-red.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js%2015-000000?logo=nextdotjs)](https://nextjs.org/)
[![DB: Firebase](https://img.shields.io/badge/DB-Firebase%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Testing: Vitest](https://img.shields.io/badge/Testing-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

</div>

---

## 📋 Table of Contents

- [About PuduCan](#about-puducan)
- [Core Features](#core-features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Development](#development)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

#### 🧑‍💼 Admin — Patients View (Light theme)
![Admin Patients View Light](screenshots/admin-view-hospital-light-theme.webp)
 
#### 📊 Patient Disease Report
![Patient Report](screenshots/disease-report.webp)
 
#### ➕ Add Doctor / Nurse / ASHA
> The same form is used for all staff types — field labels change based on role.
 
![Add Doctor](screenshots/add-doctor-admin.webp)
 
#### 🏥 Add Hospital
![Add Hospital](screenshots/add-hospital-admin.webp)
 
#### ♻️ Admin — Recover Deleted Patient
![Recover Patient](screenshots/recover-patient-view-admin.webp)
 
#### 👨‍⚕️ Doctor — Patients View
![Doctor View](screenshots/doctor-view-patients.webp)
 
#### 👩‍⚕️ Nurse — Patients View
![Nurse View](screenshots/nurse-view-patients.webp)
 
#### 📋 Add Patient Form
![Add Patient Form](screenshots/add-patient-form.webp)
 
#### 📱 ASHA Worker — Patients View (Mobile)
![ASHA Mobile View](screenshots/asha-view-patients.webp)
 
#### 🗑️ Delete Patient View
![Delete Patient](screenshots/delete-patient-admin-view.webp)
 
---

## 🎯 About PuduCan

PuduCan is a healthcare management system designed to streamline cancer patient tracking and care coordination across hospitals in Puducherry. It enables ASHA workers, nurses, and doctors to:

- ✅ Manage patient records securely
- ✅ Track disease progression and treatment
- ✅ Generate detailed patient reports
- ✅ Collaborate across roles with role-based access
- ✅ Import/export patient data efficiently

This platform is part of a national research initiative to improve cancer care delivery and patient outcomes.

---

## ✨ Core Features

### 1. **Role-Based Access Control (RBAC)**
Different user roles have tailored dashboards and permissions:
- **Admin:** Full system access, manage users and hospitals
- **Doctor:** View and update patient treatment plans
- **Nurse:** Track patient vitals and progress
- **ASHA Worker:** Community-level patient monitoring

### 2. **Patient Management**
- Add, view, update, and delete patient records
- Detailed patient forms with data validation
- Real-time updates across all users via Firebase
- Soft delete with recovery option

### 3. **Advanced Data Table**
- 🔍 **Search & Filter:** Find patients by name, ID, status, etc.
- 📄 **Pagination:** Navigate large datasets efficiently
- 📊 **Data Export:** Export to CSV or Excel for reports
- 📤 **Data Import:** Bulk upload patient data with validation

### 4. **Real-Time Collaboration**
- Instant updates when patient data changes
- Live notification of user actions
- Multi-user safe operations

### 5. **Hospital & User Management** *(Admin Only)*
- Add and manage hospitals
- Create accounts for doctors, nurses, and ASHA workers
- Assign roles and permissions

---

## 📸 Screenshots

### Home Page
![Home Page](screenshots/home-page.webp)

### Admin Dashboard - Patients View
| Dark Theme | Light Theme |
|---|---|
| ![Admin Dark](screenshots/patients-view-admin.webp) | ![Admin Light](screenshots/admin-view-hospital-light-theme.webp) |

### Clinical Features
| Disease Report | Add Doctor/Nurse/ASHA |
|---|---|
| ![Report](screenshots/disease-report.webp) | ![Add Staff](screenshots/add-doctor-admin.webp) |

| Add Hospital | Recover Patient |
|---|---|
| ![Hospital](screenshots/add-hospital-admin.webp) | ![Recover](screenshots/recover-patient-view-admin.webp) |

### Role-Specific Views
| Doctor View | Nurse View | ASHA Mobile View |
|---|---|---|
| ![Doctor](screenshots/doctor-view-patients.webp) | ![Nurse](screenshots/nurse-view-patients.webp) | ![ASHA](screenshots/asha-view-patients.webp) |

### Forms & Operations
| Add Patient | Delete Patient |
|---|---|
| ![Add Patient](screenshots/add-patient-form.webp) | ![Delete](screenshots/delete-patient-admin-view.webp) |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) - React framework with SSR/SSG
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) - Lightweight & intuitive

### Data & APIs
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) - Real-time NoSQL DB
- **Authentication:** [Firebase Auth](https://firebase.google.com/docs/auth) - Secure user management
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) - Intelligent caching & sync

### Forms & Validation
- **Form Management:** [React Hook Form](https://react-hook-form.com/) - Performance-focused
- **Schema Validation:** [Zod](https://zod.dev/) - Type-safe validation

### Quality & Testing
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
- **Linting:** [ESLint](https://eslint.org/) - Code quality
- **Formatting:** [Prettier](https://prettier.io/) - Consistent code style
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) - Enforce quality before commits

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- Git account for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lourduradjou/puducan-jipmer.git
   cd puducan-jipmer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Sample Data
The `assets/` folder contains a sample Excel file showing the correct format for importing patient data.

---

## 📁 Project Structure

```
puducan-jipmer/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── table/             # Table components
│   ├── forms/             # Form components
│   ├── dialogs/           # Modal dialogs
│   └── shared/            # Common components
├── lib/                   # Utility functions & configs
│   ├── firebase.ts        # Firebase initialization
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
├── styles/                # Global CSS & Tailwind
├── public/                # Static assets
├── assets/                # Sample data files
└── tests/                 # Test files
```

---

## ⚙️ How It Works

### User Authentication Flow
1. User signs up/logs in via Firebase Authentication
2. Role assigned by admin determines dashboard access
3. User navigated to role-specific dashboard

### Patient Data Flow
1. **ASHA Worker** → Identifies patients in community
2. **Nurse** → Records vitals and clinical observations
3. **Doctor** → Reviews and prescribes treatment
4. **Admin** → Oversees all activities and generates reports

### Real-Time Updates
- All data changes instantly sync via Firebase Firestore
- TanStack Query caches results and invalidates when needed
- Components automatically re-render with latest data

---

## 🔧 Development

### Code Quality and Refactoring

The codebase is designed to be modular, maintainable, and scalable following modern software engineering principles.

#### Component-Based Architecture
- **Reusable Components:** UI broken into small, single-responsibility components, making code easier to understand, test, and maintain.
- **Generic Components:** Created reusable components like `GenericTable` and `GenericDialog`, reducing code duplication across the application.

#### Custom Hooks
- **Encapsulated Logic:** Custom hooks encapsulate and reuse logic for common tasks:
  - **`useAuth`:** Manages user authentication state and provides user information to components
  - **`useTableData`:** Fetches and manages data table operations including pagination, searching, and filtering
  - More hooks available for specific domain logic

#### Code Style and Linting
- **ESLint and Prettier:** Enforce consistent code style and catch potential errors early, ensuring clean and readable code.
- **Husky Pre-commit Hooks:** Automatically run linting and tests before each commit, preventing errors from entering the codebase.

---

### Running Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### 🚄 Performance Optimizations and Caching

The application is built with performance as a top priority, utilizing modern web technologies and best practices for a fast, responsive user experience.

#### Next.js Optimizations
- **Automatic Code Splitting:** JavaScript bundles are split into smaller chunks — users only download code needed for their page, reducing initial load time.
- **Image Optimization:** The `next/image` component automatically optimizes images, serving modern formats like WebP and resizing for different devices.
- **Static Site Generation (SSG):** Pages without real-time data (About, Contact) are pre-rendered at build time for instant loading.
- **Incremental Static Regeneration (ISR):** Hybrid approach allowing static pages to update without full rebuilds.

#### Data Fetching and Caching with TanStack Query
- **Server-Side State Management:** **TanStack Query (React Query)** manages asynchronous data from Firestore with robust caching that reduces redundant API calls.
- **`staleTime` & `cacheTime`:** Queries serve cached data while re-fetching in the background, keeping UI responsive. `cacheTime` keeps data cached even when unused.
- **Query Invalidation:** When data updates (e.g., patient record edited), relevant queries are invalidated to trigger re-fetch and update UI with latest information.

#### Client-Side Caching and State Management
- **Zustand for Global State:** Lightweight global state management without the complexity of larger libraries, sharing state across components seamlessly.
- **`localStorage` for Form Data:** Form state is cached to prevent data loss during entry — reload the page and restore progress.

---

#### Summary: Key Caching Mechanisms
| Level | Technology | Purpose |
|-------|-----------|---------|
| **Bundle** | Next.js Code Splitting | Reduce initial JS download |
| **Assets** | Image Optimization | Serve optimal image formats |
| **API Calls** | TanStack Query | Cache Firestore responses |
| **State** | Zustand | Share state across components |
| **Local Data** | localStorage | Persist form progress |

---

## 🤝 Contributing

We welcome contributions from developers of all experience levels! Your work directly impacts cancer patient care across India.

### Getting Started with Contributing

#### For First-Time Contributors
Look for issues labeled **`good first issue`** — these are:
- ✅ Well-scoped and clearly documented
- ✅ Beginner-friendly
- ✅ Don't require deep codebase knowledge

[![View Good First Issues →](https://img.shields.io/github/issues/lourduradjou/puducan-jipmer/good%20first%20issue?color=7057ff&label=good%20first%20issues&logo=github)](https://github.com/lourduradjou/puducan-jipmer/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

#### For v1.1 Development
Check out v1.1 related issues here:
[![View v1.1 Issues →](https://img.shields.io/badge/v1.1%20Issues-GitHub-blue)](https://github.com/lourduradjou/puducan-jipmer/issues?q=is%3Aissue+state%3Aopen+milestone%3Av1.1.1)

### Contribution Workflow

1. **Fork the repository** and create your feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with descriptive commits
   ```bash
   git commit -m "feat: add new patient filter"
   ```

3. **Push to your fork** and create a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Describe your changes** clearly in the PR description

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

---



## 📝 License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this project, provided you include the original license and copyright notice.

---

## 📞 Support & Questions

- **Issues & Bug Reports:** [GitHub Issues](https://github.com/lourduradjou/puducan-jipmer/issues)
- **Discussions:** [GitHub Discussions](https://github.com/lourduradjou/puducan-jipmer/discussions)
- **Contact Maintainers:** Open an issue labeled `question`

---

<div align="center">

**Made with ❤️ for cancer patients and healthcare workers across India**

⭐ If this project helped you, please consider giving it a star!

</div>

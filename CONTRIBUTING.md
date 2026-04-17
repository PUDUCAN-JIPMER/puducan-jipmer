# Contributing to PuduCan — Cancer Tracker JIPMER

> 🎉 First off — thank you for being here! PuduCan is a healthcare tool built to help real patients and medical workers across India. Every contribution, no matter how small, makes a difference. Welcome aboard!

---

## 📋 Table of Contents

- [Getting Started](#-getting-started)
  - [1. Fork & Clone](#1-fork--clone)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Set Up Firebase](#3-set-up-firebase)
  - [4. Configure Firestore Rules](#4-configure-firestore-rules)
  - [5. Seed the Database](#5-seed-the-database)
  - [6. Run the App](#6-run-the-app)
- [Branching Strategy](#-branching-strategy)
- [Before You Submit a PR](#-before-you-submit-a-pr)
- [Commit Message Convention](#-commit-message-convention)
- [Pull Request Guidelines](#-pull-request-guidelines)
- [Reporting Issues](#-reporting-issues)
- [Code of Conduct](#-code-of-conduct)

---

## 🚀 Getting Started

### 1. Fork & Clone

Start by giving the repo a ⭐ — it helps others discover the project!

Then fork and clone your copy:

```bash
git clone https://github.com/<your-username>/puducan-jipmer.git
cd puducan-jipmer
```

---

### 2. Install Dependencies

We use `pnpm` as our package manager. Install dependencies with:

```bash
pnpm install
```

Then copy the environment file:

```bash
cp .env.example .env.local
```

You'll fill in your Firebase credentials in `.env.local` in the next step.

---

### 3. Set Up Firebase

This project uses **Firebase Authentication** and **Firestore** as its backend. You'll need a free Firebase account to run it locally.

> 💡 Firebase's UI changes often — if any step looks different, a quick YouTube search or asking an AI assistant will help.

**Step-by-step:**

1. Go to [firebase.google.com](https://firebase.google.com) and create an account.
2. Click **Add Project**. You can disable Google Analytics and Gemini — they're not needed here.
3. The free **Spark plan** is enough for local development.

**Get your credentials:**

4. Inside your project, go to **Project Settings → General**, scroll down, and click the **Web (`</>`)** icon.
5. Register your app with a name like `jipmer-web` (no need to enable hosting).
6. Copy the config values shown under the **npm** section and paste them into your `.env.local` file.

**Enable Authentication:**

7. In the left sidebar, go to **Build → Authentication**.
8. Click **Get Started**, then under **Sign-in method**, enable **Email/Password**.
9. Under the **Users** tab, create users for local testing. Here's what the setup looks like:

<img width="1368" height="606" alt="Firebase authentication users setup" src="https://github.com/user-attachments/assets/d1c3a8ad-2351-4dbd-8f39-ddba80fcea2a" />

> Use these emails and passwords when creating users — they match the seed data:
>
> | Role  | Email              | Password |
> |-------|--------------------|----------|
> | Admin | admin@gmail.com    | jipmer   |
> | Doctor | doctor@gmail.com  | jipmer   |
> | Nurse | nurse@gmail.com    | jipmer   |
> | ASHA  | asha@gmail.com     | jipmer   |

---

### 4. Configure Firestore

Each user in Firebase Auth needs to be linked to a role in Firestore — that's how the app knows whether someone is a doctor, nurse, ASHA worker, or admin.

**Set up Firestore:**

1. In the sidebar, go to **Build → Firestore Database** and click **Create Database**.
2. Choose **Standard database** and select a server region (Mumbai works well for India).
3. Start in **Production mode**.

**Set security rules:**

4. Go to the **Rules** tab and replace the default rules with:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> ⚠️ These are simplified rules for local development only. We'll be improving the security rules soon — contributions welcome!

---

### 5. Seed the Database

Before running the app, populate Firestore with some test data. Make sure the emails in `data/users.mjs` match the users you created in Firebase Auth.

```bash
# Seed user roles (edit data/users.mjs first to match your Firebase Auth users)
pnpm run seed:users

# Seed patient records
pnpm run seed:patients

# Seed hospital data
pnpm run seed:hospitals
```

---

### 6. Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and log in using one of the seeded credentials:

| Role   | Email              | Password | What you'll see                        |
|--------|--------------------|----------|----------------------------------------|
| Admin  | admin@gmail.com    | jipmer   | Full dashboard, user & hospital management |
| Doctor | doctor@gmail.com   | jipmer   | Patient records assigned to the doctor |
| Nurse  | nurse@gmail.com    | jipmer   | Nurse-specific patient view            |
| ASHA   | asha@gmail.com     | jipmer   | Mobile-friendly ASHA worker view       |

🎉 You're all set! Feel free to explore and start contributing.

> If something in this setup guide is unclear or outdated, please open a PR to improve it — that counts as a contribution too!

---

## 🌿 Branching Strategy

Always branch off from `main`. Use this naming convention:

| Prefix | When to use |
|--------|-------------|
| `feat/` | New features — e.g. `feat/export-to-pdf` |
| `fix/` | Bug fixes — e.g. `fix/pagination-reset` |
| `chore/` | Maintenance tasks — e.g. `chore/upgrade-deps` |
| `docs/` | Documentation updates — e.g. `docs/improve-setup-guide` |

---

## ✅ Before You Submit a PR

Run these checks before opening your pull request:

```bash
pnpm lint      # Check for linting issues
pnpm format    # Auto-format your code
pnpm test      # Run the test suite
```

> Husky pre-commit hooks will also run linting automatically on every commit, so you'll catch issues early.

---

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description
```

**Examples:**

```
feat(auth): add role-based redirect on login
fix(table): resolve pagination reset on filter change
chore(deps): upgrade TanStack Query to v5
docs(contributing): clarify firebase setup steps
```

**Valid types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 🔀 Pull Request Guidelines

- **One thing per PR** — keep it focused on a single feature or fix.
- **Write in your own words** — describe *what* you changed and *why*. Grammar mistakes are fine — we genuinely love reading how contributors think!
- **Reference related issues** using `Closes #<issue-number>`.
- **Add or update tests** if your change affects logic.
- **Never commit `.env` files** or any credentials.
- Keep the PR title short and descriptive — avoid long, overflowing titles.

---

## 🐛 Reporting Issues

When opening an issue, please include:

- A **clear title and description**
- **Steps to reproduce** (for bugs)
- **Screenshots** if applicable
- Your **environment** (OS, browser, Node version)

---

## 🗣️ Code of Conduct

Be kind, constructive, and respectful. This is a healthcare project — reliability and empathy matter, both in the code and in how we work together.

---

## 📬 Questions?

Open a [GitHub Discussion](../../discussions) or reach out via [Issues](../../issues). We're happy to help you get started! 💫

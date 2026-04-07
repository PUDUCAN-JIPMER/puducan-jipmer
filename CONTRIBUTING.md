# Contributing to PuduCan — Cancer Tracker JIPMER

Thank you for your interest in contributing! Please take a moment to read these guidelines before getting started.

---

## 🧭 Getting Started

1) Maybe lets keep marking this repo a star as first step🚀
2. **Fork** the repository and clone your fork locally.
3. Go into the folder 
```
cd cancer-tracker-jipmer
```
4. Install dependencies using 
```
pnpm install
```
5. Copy `.env.example` to `.env.local` and fill in your Firebase credentials. 
```
cp .env.example .env.local
```
6. You need a firebase account to have firebase functionality and database from GCP (Google cloud provider) So try to create an account and get the credentials that were required in the env file that you copied above. They are changing the UI of the firebase so you can use AI or latest youtube tutorials to get this.
- A typical step could be to have a firebase account
- Create a project (No need of gemini or analytics support for this project, so you can disenable them while you create)
- A basic plan (free version) is enough to get started and contribute to this project we are only gonna use the authentication and firestore.
- Go into the settings -> general -> scroll down and select the web icon and give a name to it (ex: jipmer-web)
- Click register the app (No need to select the hosting option)
- Then you can see the required credentials in the NPM section (take those and put it in your .env.local file)

7) Now starts the main setup of the app
- We need users who have the access to the application (doctors, asha's, nurses and admins) so we need to create users in the authentication section of the firebase.
- Go to the security field (in the left sidebar) and click the authentication.
- Here you need to click the Sign-In method to enable sign in via email and password.
- Now you can add users with your preferred email and password, the deployed site use something like below
<img width="1368" height="606" alt="image" src="https://github.com/user-attachments/assets/d1c3a8ad-2351-4dbd-8f39-ddba80fcea2a" />

8) Now as we have the user who is having a email and password we provided, we need to give them a user-level access either they are doctor or nurse or asha or admin, the way that was achieved is through connecting the user from auth to the firestore database which will tell the user level.
9) Go the Databases & Storages and click the Firestore, click the create database.
10 Select the standard database and then select your server place, wherever you are you can select that, in my case Mumbai India.
11) Select the start in production mode and create it.

9) We need to populate some values in the firestore to get started.
10) Run this command to populate some data in the firestore you can see.

7. Run the development server with `pnpm dev`.
```
pnpm dev
```
8. There are multiple pages in this project.
- Homepage (No need of login)
- Doctor Page
```
email: doctor@gmail.com
password: jipmer
```
- Nurse Page
```
email: nurse@gmail.com
password: jipmer
```
- ASHA page
```
email: asha@gmail.com
password: jipmer
```
- Admin page
```
email: admin@gmail.com
password: jipmer
```


---

## 🌿 Branching Strategy

- `main` — stable, production-ready code.
- Create feature branches from `main` using the naming convention:
  - `feat/your-feature-name`
  - `fix/bug-description`
  - `chore/task-name`
  - `docs/update-description`

---

## ✅ Before You Submit a PR

- Run linting: `pnpm lint`
- Run formatter: `pnpm format`
- Run tests: `pnpm test`
- Make sure all pre-commit hooks (Husky) pass without errors. Automatic linting will be enabled also while you commit!

---

## 📝 Commit Message Convention

Follow the **Conventional Commits** format:
```
type(scope): short description

Examples:
feat(auth): add role-based redirect on login
fix(table): resolve pagination reset on filter change
chore(deps): upgrade TanStack Query to v5
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 🔀 Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Write a clear PR title and description explaining **what** and **why**. Without the use of AI in this section. Even if you have grammer mistakes it is fine, we love to read it too.
- Reference any related issues using `Closes #<issue-number>`.
- Add or update tests if your change affects logic.
- Do not commit `.env` files or any credentials.
- Make sure title is short also not overflowing

---

## 🐛 Reporting Issues

When opening an issue, please include:
- A clear title and description.
- Steps to reproduce (for bugs).
- Screenshots if applicable.
- Your environment (OS, browser, Node version).

---

## 🗣️ Code of Conduct

Be respectful and constructive in all interactions. This project is a healthcare tool — quality and reliability matter deeply.

---

## 📬 Questions?

Open a GitHub Discussion or reach out via Issues. We're happy to help!

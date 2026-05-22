# PuduCan – Codebase Issues Report

> **Note:** Screenshots cannot be auto-generated without a running instance. Each issue includes the exact file path, line numbers, and a code diff so the problem is immediately visible.

---

## Issue #1 — `checkNamePhoneDuplicate` Always Matches the First Patient

**File:** `lib/patient/checkPatientRecord.ts` — Line 95

**Type:** 🐛 Bug (Logic Error)

**Description:**
The duplicate-check condition has an extra `|| cleanedName.length > 0` clause. Since this is always `true` whenever any name is typed, the `if` body executes for the **very first patient** in the database every iteration — regardless of whether a real match exists. The loop immediately breaks, and a false "possible match" toast fires on nearly every new-patient entry.

**Affected Code:**

```ts
// lib/patient/checkPatientRecord.ts  Line 95
if ((nameMatch && phoneMatch) || cleanedName.length > 0) {  // ❌ always true
    possibleMatchFound = true
    matchedPatientId = doc.id
    break
}
```

**Expected Fix:**

```ts
// ✅ Only break when BOTH name AND phone match
if (nameMatch && phoneMatch) {
    possibleMatchFound = true
    matchedPatientId = doc.id
    break
}
```

---

## Issue #2 — React Hooks Called Conditionally in `useTableData`

**File:** `hooks/table/useTableData.ts` — Lines 49, 69, 98, 135

**Type:** 🐛 Bug (Violation of Rules of Hooks)

**Description:**
`useQuery` (a React hook) is called inside multiple `if` blocks. The React Rules of Hooks require that hooks are **always called in the same order on every render**. Wrapping them in conditionals causes React to throw errors at runtime and produces unpredictable behavior.

**Affected Code:**

```ts
// hooks/table/useTableData.ts
if (requiredData === 'hospitals') {
    const hospitalsQuery = useQuery<Hospital[], Error>({ ... })  // ❌ Hook inside if
    return hospitalsQuery
}
if (requiredData === 'ashas' || ...) {
    const usersQuery = useQuery<UserDoc[], Error>({ ... })       // ❌ Hook inside if
    return usersQuery
}
if (requiredData === 'patients') {
    const patientsQuery = useQuery<Patient[], Error>({ ... })    // ❌ Hook inside if
    return patientsQuery
}
```

**Expected Fix:**
Declare all three `useQuery` calls unconditionally at the top of the hook, using the `enabled` option to control when they actually fire:

```ts
const hospitalsQuery = useQuery({ ..., enabled: isHospitalsEnabled })
const usersQuery     = useQuery({ ..., enabled: isUsersEnabled })
const patientsQuery  = useQuery({ ..., enabled: isPatientsEnabled })
// then return the appropriate one based on requiredData
```

---

## Issue #3 — `useStats` Missing `isHospitalTab` in `useMemo` Dependencies

**File:** `hooks/table/useStats.ts` — Line 52

**Type:** 🐛 Bug (Stale Closure / Stale Stats)

**Description:**
`isHospitalTab` is used inside the `useMemo` callback to conditionally skip sex-based stats counting, but it is **not listed in the dependency array**. If `isHospitalTab` changes (e.g., user switches tabs), the memo won't recompute and stats will be stale/incorrect.

**Affected Code:**

```ts
// hooks/table/useStats.ts
return useMemo(() => {
    // uses isHospitalTab inside ↓
    if (!isHospitalTab) {
        // count male/female/others
    }
}, [TableData, isPatientTab])  // ❌ isHospitalTab missing
```

**Expected Fix:**

```ts
}, [TableData, isPatientTab, isHospitalTab])  // ✅
```

---

## Issue #4 — Empty-State Message Hardcoded as "patients" for All Tabs

**File:** `components/table/GenericTable.tsx` — Line 167

**Type:** 🐛 Bug (UI / UX)

**Description:**
When a table has no results, the empty-state message reads **"No matching patients found."** even on the Hospitals, Doctors, Nurses, and ASHAs tabs. This is misleading to users.

**Affected Code:**

```tsx
// components/table/GenericTable.tsx  Line 167
<TableCell colSpan={8} className="...">
    No matching patients found.  {/* ❌ Hardcoded */}
</TableCell>
```

**Expected Fix:**

```tsx
No matching {activeTab} found.  {/* ✅ Dynamic */}
```

---

## Issue #5 — Type Guards in `table-store.ts` Check Non-Existent Fields

**File:** `store/table-store.ts` — Lines 8–10

**Type:** 🐛 Bug (Broken Type Guards)

**Description:**
The three exported type guards check for fields (`patientId`, `hospitalId`, `userId`) that **do not exist** in any of the schema types. `Patient`, `Hospital`, and `UserDoc` all use `id`. These guards will always return `false`, making them completely useless.

**Affected Code:**

```ts
// store/table-store.ts
export const isPatient  = (row: any): row is Patient  => row && 'patientId'  in row  // ❌
export const isHospital = (row: any): row is Hospital => row && 'hospitalId' in row  // ❌
export const isUserDoc  = (row: any): row is UserDoc  => row && 'userId'     in row  // ❌
```

**Expected Fix:**

```ts
// Check fields that actually exist on each type
export const isPatient  = (row: any): row is Patient  => row && 'patientStatus' in row  // ✅
export const isHospital = (row: any): row is Hospital => row && 'contactNumber' in row  // ✅
export const isUserDoc  = (row: any): row is UserDoc  => row && 'role'          in row  // ✅
```

---

## Issue #6 — Debug `console.log` Statements Left in Production Code

**Files:**
- `components/dialogs/DeleteEntityDialog.tsx` — Lines 92–93
- `components/table/GenericToolbar.tsx` — Lines 89, 102
- `app/PuduCan/asha/page.tsx` — Lines 24, 36

**Type:** 🔧 Code Quality

**Description:**
Multiple debug `console.log` calls are scattered across production components. These pollute the browser console and may leak sensitive data (document IDs, patient records) to end users.

**Affected Code:**

```ts
// DeleteEntityDialog.tsx  Lines 92–93
console.log('coll:', coll)  // ❌
console.log('id:', id)       // ❌

// GenericToolbar.tsx  Lines 89, 102
console.log('inside import button')   // ❌
console.log('inside file upload')     // ❌

// app/PuduCan/asha/page.tsx  Lines 24, 36
console.log('user asha:', user)                      // ❌
console.log('Fetched patients for ASHA:', patients)  // ❌
```

**Expected Fix:**
Remove all the above `console.log` statements from production code.

---

## Issue #7 — `importUtils` Uses `alert()` Instead of `toast`

**File:** `lib/import/importUtils.ts` — Lines 171, 176–178, 197

**Type:** 🔧 UX Inconsistency

**Description:**
The import utility uses the native browser `alert()` for success and error feedback, while the entire rest of the application uses `sonner`'s `toast` notifications. `alert()` is a blocking dialog that freezes the UI and is inconsistent with the app's design system.

**Affected Code:**

```ts
// lib/import/importUtils.ts
alert(`✅ Imported ${successCount} records successfully`)   // ❌
alert(`⚠️ ${errors.length} rows failed validation. ...`)    // ❌
alert(err instanceof Error ? err.message : 'Failed...')     // ❌
```

**Expected Fix:**

```ts
import { toast } from 'sonner'

toast.success(`Imported ${successCount} records successfully`)  // ✅
toast.warning(`${errors.length} rows failed validation.`)       // ✅
toast.error(err instanceof Error ? err.message : 'Failed...')   // ✅
```

---

## Issue #8 — `GenericPatientDialog` Saves to `localStorage` on Every Keystroke

**File:** `components/forms/patient/GenericPatientDialog.tsx` — Lines 102–106

**Type:** ⚡ Performance

**Description:**
A `useEffect` uses `watch()` (the entire form subscription) as its dependency. `watch()` returns a new object on every single field change, causing the effect to re-run and write to `localStorage` on **every keystroke**. This is a significant performance issue, especially for large forms.

**Affected Code:**

```ts
// GenericPatientDialog.tsx  Lines 102–106
useEffect(() => {
    if (!isEdit) {
        localStorage.setItem('addPatientFormData', JSON.stringify(form.getValues()))
    }
}, [watch(), form, isEdit])  // ❌  watch() re-creates object every render
```

**Expected Fix:**
Use a debounce or subscribe via `watch` with a callback instead:

```ts
useEffect(() => {
    if (isEdit) return
    const subscription = form.watch(() => {
        localStorage.setItem('addPatientFormData', JSON.stringify(form.getValues()))
    })
    return () => subscription.unsubscribe()
}, [form, isEdit])  // ✅
```

---

## Issue #9 — `QueryClient` Created at Module Level in `Providers.tsx`

**File:** `components/layout/Providers.tsx` — Line 11

**Type:** 🐛 Bug (SSR / Shared State)

**Description:**
`const queryClient = new QueryClient()` is declared **outside the component**, at module scope. In Next.js with server-side rendering, module-level singletons are shared across all incoming requests on the server. This means multiple users may unknowingly share the same React Query cache, causing data leakage between sessions.

**Affected Code:**

```ts
// components/layout/Providers.tsx
const queryClient = new QueryClient()  // ❌ Module-level: shared across SSR requests

export default function Providers({ children }) {
    return <QueryClientProvider client={queryClient}>...
```

**Expected Fix:**

```ts
export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient())  // ✅ Per-instance
    return <QueryClientProvider client={queryClient}>...
```

---

## Issue #10 — Disease Report Filename Uses Day Number Only

**File:** `lib/patient/generateDiseaseReport.ts` — Lines 108–109

**Type:** 🐛 Bug (Data / File Naming)

**Description:**
`new Date().getDate()` returns only the **day of the month** (1–31), not a full date. Reports generated on the 15th of January and the 15th of February will both be named `Disease_Report_15.pdf`, causing files to silently overwrite each other on the user's machine.

**Affected Code:**

```ts
// generateDiseaseReport.ts  Lines 108–109
const currentDate = new Date().getDate()  // ❌  Returns e.g. 15  (day only)
doc.save(`Disease_Report_${currentDate}.pdf`)
```

**Expected Fix:**

```ts
const currentDate = new Date().toISOString().slice(0, 10)  // ✅  e.g. "2025-05-15"
doc.save(`Disease_Report_${currentDate}.pdf`)
```

---

## Issue #11 — `REMOVED_PATIENT_TABLE_HEADERS` Uses Wrong Key `contactNumber`

**File:** `constants/headers.ts` — Lines 112–129

**Type:** 🐛 Bug (Silent Empty Column)

**Description:**
The removed-patients table defines a "Contact Number" column with `key: 'contactNumber'`. However, `Patient` schema stores phone numbers under `phoneNumber`, not `contactNumber`. The column will always render empty cells for every removed patient.

**Affected Code:**

```ts
// constants/headers.ts  Lines 118–121
{
    name: 'Contact Number',
    key: 'contactNumber',  // ❌  Patient type has no such field
},
```

**Expected Fix:**

```ts
{
    name: 'Phone Number',
    key: 'phoneNumber',  // ✅
},
```

---

## Issue #12 — Follow-Up Date Not Shown in `ViewDetailsDialog`

**File:** `components/dialogs/ViewDetailsDialog.tsx` — Lines 73–83

**Type:** 🐛 Bug (Missing Data in UI)

**Description:**
In the follow-ups section of the patient detail dialog, only `remarks` is displayed. The `date` field of each follow-up object is silently discarded, so clinicians cannot see when a follow-up was scheduled.

**Affected Code:**

```tsx
// ViewDetailsDialog.tsx  Lines 74–83
{rowData.followUps?.map((f, i) => (
    <li key={i} className="...">
        <Info label="Remarks" value={f?.remarks ?? 'No remarks'} />
        {/* ❌ f.date is never displayed */}
    </li>
))}
```

**Expected Fix:**

```tsx
<li key={i} className="...">
    <Info label="Date"    value={f?.date    ?? 'No date'    } />  {/* ✅ */}
    <Info label="Remarks" value={f?.remarks ?? 'No remarks' } />
</li>
```

---

## Issue #13 — `next.config.ts` Mixes CommonJS `require()` in an ESM TypeScript File

**File:** `next.config.ts` — Line 4

**Type:** 🔧 Code Quality / Build Warning

**Description:**
The project uses `"type": "module"` in `package.json` (ESM), but `next.config.ts` uses `const withPWA = require('next-pwa')` (CommonJS). Mixing module systems causes build warnings, breaks `ts-node` strict mode, and may cause issues in future Node.js or Next.js versions.

**Affected Code:**

```ts
// next.config.ts
const withPWA = require('next-pwa')({  // ❌ CommonJS require in ESM TypeScript file
    dest: 'public',
    ...
})
```

**Expected Fix:**

```ts
import withPWA from 'next-pwa'

const nextConfig: NextConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
})

export default nextConfig
```

---

## Issue #14 — 🚨 CRITICAL: `serviceAccountKey.json` Committed to Repository

**File:** `serviceAccountKey.json` (root of repository)

**Type:** 🔴 Security Vulnerability (Critical)

**Description:**
A Firebase Admin SDK service account key file is committed directly to the repository. This file contains **full administrative credentials** to the Firebase project, including the private key. Anyone with read access to this repository (public or private collaborators) can:
- Read and write all Firestore documents
- Access Firebase Authentication user records
- Impersonate any user
- Delete the entire database

**Immediate Actions Required:**
1. **Revoke the key immediately** in [Google Cloud Console → IAM → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Add `serviceAccountKey.json` to `.gitignore`
3. Remove the file from git history using `git filter-repo` or BFG Repo Cleaner
4. Generate a new service account key and store it as an environment variable / secret

**Example `.gitignore` entry to add:**

```
# Firebase Admin SDK credentials — NEVER commit this
serviceAccountKey.json
```

---

## Issue #15 — `useGenericTable` Hook Is Dead Code (Never Used)

**File:** `hooks/table/useGenericTable.ts`

**Type:** 🔧 Code Quality (Dead Code)

**Description:**
`useGenericTable.ts` is a fully implemented custom hook that encapsulates all the table state logic (pagination, filtering, search, etc.). However, `GenericTable.tsx` **reimplements all of this logic inline** and never imports or calls `useGenericTable`. The hook is dead code, duplicating ~50 lines of logic and creating a maintenance burden.

**Affected Code:**

```ts
// hooks/table/useGenericTable.ts — never imported anywhere
export function useGenericTable<T extends Tab>(activeTab: T, data, rowsPerPage) {
    // ... all this logic is duplicated in GenericTable.tsx
}
```

**Expected Fix:**
Either:
- Refactor `GenericTable.tsx` to use `useGenericTable`, removing the duplicated logic, **or**
- Delete `useGenericTable.ts` if it is no longer needed.

---

## Issue #16 — Redundant `useMemo` in `GenericTable` Is a No-Op

**File:** `components/table/GenericTable.tsx` — Line 85

**Type:** 🔧 Code Quality

**Description:**
`dataToPaginate` is wrapped in a `useMemo` that simply returns `searchedData` unchanged. This adds React overhead (dependency comparison on every render) with zero benefit, since `dataToPaginate === searchedData` always.

**Affected Code:**

```ts
// GenericTable.tsx  Line 85
const dataToPaginate = useMemo(() => searchedData, [searchedData])  // ❌ No-op memo
```

**Expected Fix:**

```ts
// Just use searchedData directly
const tableData = usePagination(searchedData, rowsPerPage)  // ✅
```

---

## Issue #17 — Admin Page Active-Tab Button Styling Is Inverted

**File:** `app/PuduCan/admin/page.tsx` — Lines 100–109

**Type:** 🐛 Bug (UI)

**Description:**
All tab buttons use `variant="default"`, which applies the primary button colour to **every** tab. Inactive tabs are then given `className="bg-border"` which makes them slightly grey, but the active tab has no distinct visual difference from any other `variant="default"` button. Users cannot clearly tell which tab is active.

**Affected Code:**

```tsx
// admin/page.tsx  Lines 100–109
<Button
    variant={'default'}               // ❌ All buttons look the same
    className={`uppercase text-foreground ${
        activeTab === tab ? '' : 'bg-border'  // ❌ Active = default colour, Inactive = grey
    }`}
>
```

**Expected Fix:**

```tsx
<Button
    variant={activeTab === tab ? 'default' : 'outline'}  // ✅ Clear visual distinction
    className="uppercase"
>
```

---

## Issue #18 — Navbar Mobile Menu Has No Close-on-Outside-Click Behaviour

**File:** `components/layout/Navbar.tsx` — Lines 61–84

**Type:** 🔧 UX Issue

**Description:**
The mobile hamburger menu opens correctly but provides **no way to close it by clicking outside** the menu. Users must click the hamburger button again to close it. There is no backdrop overlay, no `useEffect`-based outside-click handler, and no escape-key listener.

**Affected Code:**

```tsx
// Navbar.tsx  Lines 61–84
{menuOpen && (
    <div className="absolute top-16 right-0 z-50 ...">
        {/* ❌ No backdrop, no outside-click handler */}
        ...
    </div>
)}
```

**Expected Fix:**
Add a transparent backdrop div or a `useEffect` with a document `mousedown` listener:

```tsx
{menuOpen && (
    <>
        {/* Backdrop to catch outside clicks */}
        <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
        />
        <div className="absolute top-16 right-0 z-50 ...">
            ...
        </div>
    </>
)}
```

---

## Issue #19 — `RowActions.handleRetrieve` Bypasses React Query (`useMutation`)

**File:** `components/table/RowActions.tsx` — Lines 48–71

**Type:** 🔧 Code Quality / Consistency

**Description:**
`handleRetrieve` performs Firestore writes directly inside an `async` function without using `useMutation`. The rest of the codebase (e.g., `DeleteEntityDialog.tsx`) correctly uses `useMutation` for loading states, error handling, and cache invalidation. The inconsistency means the retrieve action has no loading indicator and no optimistic UI.

**Affected Code:**

```ts
// RowActions.tsx  Lines 48–71
const handleRetrieve = async () => {
    try {
        await setDoc(...)    // ❌ Direct Firestore write — no useMutation
        await deleteDoc(...)
        queryClient.invalidateQueries(...)
        toast.success(...)
    } catch (err) { ... }
}
```

**Expected Fix:**
Refactor to use `useMutation`:

```ts
const retrieveMutation = useMutation({
    mutationFn: async () => {
        await setDoc(doc(db, 'patients', patientId), { ...rowData, restoredAt: ... })
        await deleteDoc(doc(db, 'removedPatients', patientId))
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['patients'] })
        queryClient.invalidateQueries({ queryKey: ['removedPatients'] })
        toast.success(`Patient ${rowData.name} retrieved successfully!`)
    },
    onError: (err) => toast.error('Failed to retrieve patient.'),
})
```

---

## Issue #20 — `useSearch` Types `searchFields` as `any`

**File:** `hooks/table/useSearch.ts` — Line 4

**Type:** 🔧 Code Quality (Weak Typing)

**Description:**
The `searchFields` parameter of `useSearch` is typed as `any`, bypassing TypeScript's type safety. Passing an invalid field name silently produces empty search results with no compile-time error.

**Affected Code:**

```ts
// hooks/table/useSearch.ts  Line 4
export function useSearch<T, F extends keyof T = keyof T>(rows: T[], searchFields: any) {
//                                                                              ^^^^ ❌
```

**Expected Fix:**

```ts
export function useSearch<T>(rows: T[], searchFields: readonly (keyof T)[]) {
//                                                    ^^^^^^^^^^^^^^^^^^^^ ✅
```

---

## Issue #21 — `AshaSearchDialog` Bypasses React Query (No Caching)

**File:** `components/dialogs/AshaSearchDialog.tsx` — Lines 51–78

**Type:** ⚡ Performance / Code Quality

**Description:**
ASHA workers are fetched via a raw `useEffect` + `getDocs` call every time the component renders or `orgId` changes, ignoring React Query entirely. This means:
- A fresh Firestore read is triggered every time any patient row is rendered (the dialog is mounted per-row in `RowActions`)
- There is no caching, deduplication, or background revalidation

**Affected Code:**

```ts
// AshaSearchDialog.tsx  Lines 51–78
useEffect(() => {
    const fetchAshas = async () => {
        const snapshot = await getDocs(q)  // ❌ Fresh Firestore read every render
        setAshas(snapshot.docs.map(...))
    }
    fetchAshas()
}, [orgId])
```

**Expected Fix:**
Replace with a `useQuery` call so results are cached and shared:

```ts
const { data: ashas = [] } = useQuery({
    queryKey: ['ashas', orgId],
    queryFn: async () => {
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Asha[]
    },
    staleTime: 5 * 60 * 1000,
})
```

---

## Issue #22 — `seed:all` Script Uses `npm` Instead of `pnpm`

**File:** `package.json` — Line 20

**Type:** 🔧 Developer Experience

**Description:**
The project enforces `pnpm` as its package manager (via `"packageManager"` field and `engines.pnpm`), but the `seed:all` script calls `npm run ...`. Running `pnpm run seed:all` will attempt to invoke `npm`, which may not honour the project's `node_modules` structure or `.nvmrc`, and may fail in environments where only `pnpm` is installed.

**Affected Code:**

```json
// package.json  Line 20
"seed:all": "npm run seed:hospitals && npm run seed:users && npm run seed:patients"
//           ^^^  ❌ Should be pnpm
```

**Expected Fix:**

```json
"seed:all": "pnpm run seed:hospitals && pnpm run seed:users && pnpm run seed:patients"
```

---

*Report generated: May 2026 — PuduCan JIPMER Codebase Audit*

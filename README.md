# जादम परिवार कुलदेवी मंदिर, खलघाट (Jadam Parivar Kuldevi Mandir)

## 🕉️ Project Overview
This repository contains the full-stack MERN portal for **जादम परिवार कुलदेवी मंदिर, खलघाट** (Jadam Parivar Kuldevi Mandir, Khalghat).

The portal is designed to serve the devotees and trustees of the Jadam Parivar, providing information about temple history, sacred Darshan timings along the Holy Narmada River, announcements, contributions, and administrative governance.

---

## 🏗️ Phase Implementation Status

### ✅ Phase 1: MERN Stack Foundation & Architecture
- Clean monorepo structure organizing `client/` and `server/`.
- React 18 + Vite frontend with Tailwind CSS (custom Saffron, Maroon, Gold, and Sandstone Indian temple color tokens).
- Express 4 backend with Helmet, CORS, Morgan logging, rate limiting (100 req/15min), and centralized error handling.
- Resilient MongoDB connection via Mongoose with auto-reconnection.
- Standardized API response format (`apiResponse.js`).
- Complete public website layout: `Header`, `Navbar`, responsive `MobileMenu` drawer, `Footer`, and `PageContainer`.
- Reusable UI component library: `Button`, `Card`, `Container`, `Input`, `SectionTitle`, `Modal`, `Badge`, `LoadingSpinner`, `Alert`.
- All Phase 1 routes: `/`, `/about`, `/history`, `/notices`, `/gallery`, `/donation`, `/yatra`, `/contact`, `/api/health`.

### ✅ Phase 2: Firebase Phone OTP Auth + Admin & Committee RBAC
- **Firebase Authentication (Phone Number + OTP)**:
  - Frontend Firebase Client SDK integration with `RecaptchaVerifier`.
  - Responsive mobile-first `/login` page with 2-step verification (mobile number entry -> 6-digit OTP verification).
  - Session persistence (`onAuthStateChanged`) so page reloads do not log out users.
  - Zero storage of passwords, plain OTPs, or session secrets in MongoDB.
- **Backend Firebase Admin SDK Verification**:
  - `authenticateUser` middleware cryptographically verifies Firebase ID tokens (`admin.auth().verifyIdToken()`).
  - Auto-onboards new phone sign-ups into MongoDB with strict default role `public`.
  - Infallible security rule: **Backend MongoDB User record is the sole authority for role and permissions**. Frontend roles or body parameters (`{ "role": "admin" }`) are strictly ignored.
- **Role-Based Access Control (RBAC)**:
  - Roles supported: `admin` (Administrator), `committee` (Committee Member), `public` (Public Devotee).
  - `requireRole(...allowedRoles)` and `requirePermission(...permissions)` middleware.
  - Test verification endpoints: `/api/v1/test/public`, `/api/v1/test/authenticated`, `/api/v1/test/committee`, `/api/v1/test/admin`.
- **Protected React Routes & Administrative Portal**:
  - `ProtectedRoute` component with automatic unauthenticated redirection to `/login` and strict `AccessDeniedPage` (403) for unauthorized roles.
  - `AdminLayout` with responsive Sidebar, Topbar, authenticated user profile pill, and secure Logout button.
  - `/admin/dashboard`: Displays verified user name, role, mobile number, active status, and live RBAC test bench.
  - `/admin/profile`: Read-only user profile display with role immutability safeguards.
- **Safe First-Admin Bootstrap CLI**:
  - Backend-only CLI script (`npm --prefix server run bootstrap:admin -- --mobile="+91..."`) to safely promote or create the first temple administrator.
- **Axios Authentication Interceptor**:
  - Automatically retrieves the active Firebase ID token and attaches `Authorization: Bearer <ID_TOKEN>`.

### ✅ Phase 3: Donation + Income + Expense + Financial Transparency System
- **Sole Financial Authority**:
  - All amounts, item values (`qty * price`), totals (`amount + itemTotalValue`), balances (`Total Verified Donations + Other Income - Total Expenses`), and sequential receipt numbers are computed strictly server-side.
- **Atomic Sequential Receipt Numbering**:
  - Auto-generated audit-grade receipt format: `JKM-YYYY-XXXXXX` (e.g., `JKM-2026-000001`) backed by MongoDB `findOneAndUpdate` atomic counters.
- **Comprehensive Financial Models**:
  - `Donation`: Supports `cash`, `upi`, `bank_transfer`, `item`, `mixed`, and `other`. Pre-save calculation guarantees total valuation integrity. Verification workflow (`pending` -> `verified` or `rejected`).
  - `Income`: Manages non-donation revenue (`event_income`, `rental`, `sponsorship`, `donation`, `other`).
  - `Expense`: Manages expenditures (`temple_maintenance`, `electricity`, `water`, `construction`, `decoration`, `event`, `travel`, `food`, `cleaning`, `salary`, `equipment`, `other`) with vendor, invoice reference, and soft-delete archiving.
  - `Counter`: Guarantees race-condition-free sequential numbering across years.
- **Financial Aggregation Engine**:
  - Centralized calculations for all filters (year, month, custom date range).
  - 12-month breakdown for annual financial statements.
  - Formula invariant:
    $$\text{Total Income} = \text{Verified Donations} + \text{Other Income}$$
    $$\text{Current Net Balance} = \text{Total Income} - \text{Total Expenses}$$
  - Pending and rejected donations are excluded from official balance calculations.
- **Public Financial Transparency Portal (`/financial-transparency`)**:
  - Publicly accessible without login.
  - 4 Real-time transparency cards (Verified Donations, Other Income, Expenses, Balance).
  - Interactive monthly SVG comparison chart.
  - Tabbed registers for verified donations, other income, and transparent expenses.
  - Privacy safeguards: Donor mobile numbers are masked (`98260XXXXX`), and internal notes and donor addresses are omitted.
- **Administrative Portal (`/admin/*`)**:
  - `/admin/dashboard`: Live financial KPI cards, pending verification action alerts, quick action bar, and monthly comparison chart.
  - `/admin/donations`: Full searchable register with status tabs (All, Verified, Pending, Rejected), type filter, KPI summary bar, verification modal, reject modal (with reason), and archive actions.
  - `/admin/donations/new` & `/:id/edit`: Smart donation form dynamically adapting between monetary, item, and mixed donations with real-time financial value calculation preview.
  - `/admin/donations/:id`: Printable temple receipt card with traditional ornamental header, verified seal, itemized breakdown, and verifier credentials.
  - `/admin/income` & `/:id/edit`: Other income registers and entry forms.
  - `/admin/expenses` & `/:id/edit`: Expenditure ledger and expense logging forms.
  - `/admin/reports`: Annual audit statement, 12-month comparison table, and one-click UTF-8 CSV exports (Excel Hindi/Unicode compatible with BOM) for Donations, Other Income, Expenses, and Annual Statements.

### ✅ Phase 4: Temple Information + Rules + Notices + Events + Photo/Video Gallery
- **Temple Information & Identity**:
  - Singleton `TempleInfo` database model with daily Aarti schedule, 7-day weekly darshan timings, sacred Mata Ji lore, trust registration credentials, and contacts.
  - Public pages: `/about`, `/history`, `/contact`.
- **Temple Rules (15-Rule Max Cap)**:
  - Database model strictly enforcing maximum 15 rules with drag/reorder support.
  - Interactive public page: `/rules`.
- **Notices & Events CMS**:
  - Full announcements management with draft/published isolation, pinned notice prioritization (max 5), event date, start/end times, and location.
  - Public pages: `/notices`, `/notices/:slug`.
- **Photo & Video Gallery**:
  - Categorized albums with photo/video counter sync, accessible image lightbox, and HTML5 video modal.
  - Public pages: `/gallery`, `/gallery/:slug`.
- **Dual-Storage File Uploads**:
  - Firebase Storage support with automatic local storage fallback (`/uploads/...`) and strict MIME/size caps (images max 10MB, videos max 100MB).

### ✅ Phase 5: Yatra Registration + Ram Navami Yatra + Mansarovar Yatra Management
- **Yatra Registration Engine**:
  - Support for `RAM_NAVAMI` (Ram Navami Yatra) and `MANSAROVAR` (Kailash Mansarovar Yatra).
  - Multi-traveler family registration schema (1 to 50 travelers).
  - Minimal privacy-safe identity structure: captures only ID type and last 4 digits (e.g. `•••• •••• 4589`). Full Aadhaar is strictly never accepted or stored.
  - Compound indexes on `{ year: 1, yatraType: 1, bookingStatus: 1 }`, `{ mobile: 1, yatraType: 1, year: 1 }`, and `{ travelDate: 1, yatraType: 1 }`.
- **Atomic Sequential Registration Numbering**:
  - Generated via MongoDB atomic `Counter`: `RNY-YYYY-XXXXXX` (Ram Navami) and `MSY-YYYY-XXXXXX` (Mansarovar).
- **Public Devotee Portal**:
  - `/yatra`: Sacred overview cards, dates, fees, guidelines tabs, departure rules, coordinators contact cards, and lookup banner.
  - `/yatra/ram-navami`: Multi-step registration wizard (Primary Devotee -> Co-Travelers & Family Members -> Review & Terms Acceptance) with cost calculator and duplicate warning alert.
  - `/yatra/mansarovar`: Multi-step registration wizard with passport details, medical fitness declaration, organizer details, and cost calculator.
  - `/yatra/check-registration`: Two-factor privacy lookup form requiring both registration number and 10-digit mobile, returning devotee status badge card with masked mobile (`98260XXXXX`).
  - `/yatra/registration-success/:registrationNumber`: Printable digital confirmation slip with `@media print` support.
- **Dedicated Yatra Payment Ledger**:
  - Clean separation from Phase 3 donation ledger.
  - Tracks partial payments, installments, and receipts per registration with automatic recalculation of balances.
- **Administrative Governance & Analytics**:
  - `/admin/yatra`: KPI tiles, quick actions, recent registrations table, and CSV export.
  - `/admin/yatra/registrations`: Search, filters (Yatra type, Booking status, Payment status, Year), quick status transitions (`pending` -> `confirmed` -> `completed` / `cancelled`), and pagination.
  - `/admin/yatra/registrations/new` & `/:id/edit`: Administrative registration entry/editing with duplicate override option.
  - `/admin/yatra/registrations/:id`: Full devotee view, travelers list, status transition buttons, and payment ledger with inline "Record Payment" modal.
  - `/admin/yatra/payments`: Complete transaction ledger of all payments.
  - `/admin/yatra/info`: Guidelines and departure instructions editor.
  - `/admin/yatra/reports`: Comparative analytics (Ram Navami vs Mansarovar) and 12-month breakdown with UTF-8 BOM CSV export.

### ✅ Phase 6: Annual Puja Records + Blacklist / Restricted Records + Committee Management
- **Mata Ji Annual Puja Records**:
  - Atomic sequential record numbers: `PUJA-YYYY-XXXXXX` generated via MongoDB atomic `Counter`.
  - Comprehensive model capturing primary devotee, address/gotra, attendance (`numberOfPeople`, `numberOfCouples`), couple details subdocuments (`husbandName`, `wifeName`, `gotra`, `village`), Jamal/Nikasi subdocument (`jamalCount`, `jamalType`, `jamalNames`, `jamalNotes`), financial records, and lifecycle statuses.
  - Public transparency page `/puja`: serves year-wise aggregated statistics (total pujas, total couples, Jamal counts) with strictly zero exposure of personal devotee names, phone numbers, or addresses.
  - Full administrative suite: `/admin/puja` (KPI dashboard), `/admin/puja/records` (search, status filters, pagination), `/admin/puja/records/new` & `/:id/edit` (dynamic couple entries & Jamal fields), `/admin/puja/records/:id` (printable receipt), `/admin/puja/reports` (annual & monthly analytics with UTF-8 BOM CSV export).
- **Security Blacklist / Restricted Records (100% PRIVATE)**:
  - Atomic sequential restriction numbers: `RES-YYYY-XXXXXX`.
  - Strictly private model accessible only to authorized personnel with `RESTRICTED_*` permissions. Zero public routes or search indices exist.
  - Tracks full name, aliases, contact, relative name, village/city, restriction type (`temporary`, `permanent`, `warning`, `conditional`), severity level (`low`, `medium`, `high`, `critical`), and reason.
  - Dynamic expiration: automatically marks records past `endDate` as expired without silent deletion.
  - Formal revocation workflow: records `revocationReason`, `revokedAt`, and `revokedBy`.
  - Dashboard privacy: KPI cards display active and expired counts only, strictly omitting personal names.
- **Committee & User Management**:
  - Sparse unique indexing on `firebaseUid` enabling safe pre-provisioning of committee members by phone number.
  - Auto-linking: pre-provisioned committee members are automatically linked upon their first Firebase Phone OTP authentication.
  - Account status lifecycle: `active`, `inactive`, `suspended`.
  - Admin self-protection: `canBeDeactivated()` prevents accidental deactivation or demotion of the last active administrator.
  - Module-wise permission matrix: fine-grained toggling across all modules (Donation, Income, Expense, Temple CMS, Gallery, Yatra, Puja, Restricted, Committee & Users).
  - Administrative pages: `/admin/committee` (member directory & pre-provisioning modal), `/admin/users` (all registered users, status toggle, search), `/admin/users/:id/permissions` (interactive permission checkboxes).

### ❌ Phase 7 & Beyond (Upcoming Roadmap)
- Payment Gateway integration (Razorpay / UPI online webhooks).
- Automated SMS / WhatsApp receipt delivery.
- System audit log inspection and immutable change tracking.
- Live streaming integration for sacred Aarti & Darshan.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Firebase Client SDK |
| **Backend** | Node.js, Express.js, Mongoose ODM, Firebase Admin SDK |
| **Database** | MongoDB (with atomic counters & pre-save aggregation hooks) |
| **Authentication** | Firebase Phone Authentication (OTP) + Firebase ID Token JWTs |
| **Security** | Helmet, Strict CORS, Express-Rate-Limit, Cryptographic Token Verification, RBAC |
| **Tooling** | Concurrently, Nodemon |

---

## 📋 System Requirements
- **Node.js**: `v18.0.0` or higher (tested on Node v24)
- **npm**: `v9.0.0` or higher
- **MongoDB**: `v6.0` or higher running on `localhost:27017` or MongoDB Atlas URI
- **Firebase Project**: With Phone Authentication enabled

---

## 🚀 Installation & Setup

### 1. Clone & Install Dependencies
```bash
# Option A: Install all at once via root script
npm run install:all

# Option B: Install individually
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Seed Phase 3 Financial Data (Optional / Testing)
```bash
# Seeds sample verified donations, pending donations, other income, and expenses:
node server/scripts/seedFinancialData.js
```

---

## 🏃 Running the Application

### Running Both Frontend & Backend Concurrently:
```bash
npm run dev
```
- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Public Financial Transparency**: [http://localhost:5173/financial-transparency](http://localhost:5173/financial-transparency)
- **Admin Financial Portal**: [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)

### Running Verification Test Suites:
```bash
# Phase 3 Financial Formula & Logic Suite (20 tests):
node server/scripts/testPhase3Financials.js

# Phase 3 HTTP Endpoint Test:
node server/scripts/testHttpEndpoints.js

# Phase 3 Admin Controller & CSV Suite:
node server/scripts/testAdminFinancialApi.js
```

---

## 🩺 Phase 3 Financial API Reference

### Public Transparency Endpoints (No Auth Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/public/financial/summary` | Overall verified revenue, expenses, and net balance |
| `GET` | `/api/v1/public/financial/monthly-summary?year=YYYY` | 12-month financial breakdown |
| `GET` | `/api/v1/public/financial/donations?page=1&limit=20` | Verified donations register (masked mobile: `98765XXXXX`) |
| `GET` | `/api/v1/public/financial/income?page=1&limit=20` | Other temple income register |
| `GET` | `/api/v1/public/financial/expenses?page=1&limit=20` | Transparent temple expense ledger |

### Administrative Endpoints (`Authorization: Bearer <ID_TOKEN>`)
| Method | Endpoint | Required Permission / Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/donations` | `DONATION_VIEW` | Search, filter, and paginate all donations |
| `POST` | `/api/v1/donations` | `DONATION_CREATE` | Record new donation (cash, upi, item, mixed) |
| `GET` | `/api/v1/donations/:id` | `DONATION_VIEW` | Get single donation details |
| `PUT` | `/api/v1/donations/:id` | `DONATION_UPDATE` | Update donation details |
| `PATCH` | `/api/v1/donations/:id/verify` | `DONATION_VERIFY` | Verify donation and issue sequential receipt |
| `PATCH` | `/api/v1/donations/:id/reject` | `DONATION_VERIFY` | Reject donation with mandatory reason |
| `PATCH` | `/api/v1/donations/:id/archive` | `DONATION_ARCHIVE` | Soft-delete donation |
| `GET` | `/api/v1/income` | `INCOME_VIEW` | Search and paginate other income records |
| `POST` | `/api/v1/income` | `INCOME_CREATE` | Record new temple revenue |
| `PUT` | `/api/v1/income/:id` | `INCOME_UPDATE` | Update income entry |
| `PATCH` | `/api/v1/income/:id/archive` | `INCOME_ARCHIVE` | Soft-delete income record |
| `GET` | `/api/v1/expenses` | `EXPENSE_VIEW` | Search and paginate temple expenses |
| `POST` | `/api/v1/expenses` | `EXPENSE_CREATE` | Log new temple expense bill |
| `PUT` | `/api/v1/expenses/:id` | `EXPENSE_UPDATE` | Update expense record |
| `PATCH` | `/api/v1/expenses/:id/archive` | `EXPENSE_ARCHIVE` | Soft-delete expense record |
| `GET` | `/api/v1/financial/summary` | `FINANCIAL_REPORT_VIEW` | Full financial summary with pending metrics |
| `GET` | `/api/v1/financial/monthly-summary` | `FINANCIAL_REPORT_VIEW` | 12-month income vs expense breakdown |
| `GET` | `/api/v1/financial/export` | `FINANCIAL_EXPORT` | UTF-8 CSV download (donations, income, expenses, statement) |

---

## 🔒 Financial Integrity Invariants Enforced

1. **Server Authority**: Total donation values and receipt numbers are computed strictly on the backend via Mongoose pre-save hooks and atomic counters. Clients cannot dictate calculated values.
2. **Double Calculation Protection**: Item value is strictly `quantity * unitPrice`. Total financial value is strictly `amount + itemTotalValue`.
3. **Receipt Immutability**: Receipts are generated in `JKM-YYYY-XXXXXX` format only upon verification and cannot be overwritten.
4. **Soft Delete Archiving**: Deleting records sets `isArchived: true`. Archived records are preserved in MongoDB for audit trails but are excluded from official balance calculations.
5. **Privacy Safeguards**: Devotee contact information on public transparency registers is masked (`98765XXXXX`), and private committee notes are never sent in public API responses.

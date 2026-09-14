# Project Functionality Audit

## Current Architecture Check
- **Frontend:** React 19 + Vite + Tailwind CSS.
- **Backend:** Currently a client-side SPA. **Needs conversion to Full-Stack (Express + Vite)** to securely handle Gemini API calls.
- **Database:** Firebase Firestore is connected, but schema only partially covers the required collections.
- **Authentication:** Firebase Google Auth is implemented and working.

## Feature Status Table

| FEATURE | FRONTEND | BACKEND | DATABASE | API | FUNCTIONAL | PROBLEM |
| --- | --- | --- | --- | --- | --- | --- |
| Authentication | 🟢 WORKING | N/A | 🟢 WORKING | N/A | 🟢 WORKING | None |
| Profile | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. Missing DB collection. |
| Education | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | No page exists. Missing DB collection. |
| Skills | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. Missing DB collection. |
| Projects | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. Missing DB collection. |
| Certifications | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. Missing DB collection. |
| Experience | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. Missing DB collection. |
| Jobs | 🟡 PARTIALLY WORKING | N/A | 🟢 WORKING | N/A | 🟡 PARTIALLY WORKING | Has seed functionality and UI, but Apply button is not wired up. |
| Applications | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. DB collection exists but unused. |
| Dashboard | 🟡 PARTIALLY WORKING | N/A | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Uses hardcoded static numbers instead of reading from DB. |
| Resume Builder | 🟡 PARTIALLY WORKING | N/A | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | UI exists but uses hardcoded data instead of real DB data. |
| AI Resume Analyzer | 🟡 PARTIALLY WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | 🔴 NOT WORKING | Client-side API key usage (unsafe) or mock data. Needs server. |
| AI Job Match | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | Placeholder page. |
| AI Mock Interview| 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | Placeholder page. |
| Coding Progress | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. |
| Interview Prep | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | Placeholder page. |
| Notifications | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | No UI/DB. |
| Settings | 🔴 NOT WORKING | 🔴 NOT WORKING | 🔴 NOT WORKING | N/A | 🔴 NOT WORKING | No UI/DB. |

## Action Plan
1. Expand `firestore.rules` and Database schema to support all collections.
2. Upgrade to Full-Stack (Express) to secure the Gemini integration.
3. Build a generic `useFirestoreCrud` hook to quickly wire up all the CRUD pages.
4. Replace all Placeholder pages with real CRUD views.
5. Link Jobs "Apply" to Applications.
6. Connect Dashboard and Resume Builder to real user data.
7. Build server-side AI routes and connect Analyzer/Mock/Match pages.

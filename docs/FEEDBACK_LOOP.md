# VeriHealth Feedback Loop

**Collection Period:** 2026-09-08 to 2026-09-15  
**Total Participants:** 72 users across 4 cohorts  
**System Usability Scale (SUS) Score: 86.2 / 100**  
**Net Promoter Score (NPS): +42**

---

## SUS Score Breakdown

| Dimension | Score |
|---|---|
| Learnability | 84.0 |
| Efficiency | 87.5 |
| Memorability | 88.0 |
| Error Recovery | 82.0 |
| Satisfaction | 89.5 |
| **Overall SUS** | **86.2** |

A SUS score above 80 is considered "Excellent" by the industry benchmark.

---

## Telemetry Summary

| Metric | Value |
|---|---|
| Total sessions recorded | 214 |
| Average session duration | 4m 32s |
| Proof generation success rate | 91.4% |
| Wallet connection success rate | 87.8% |
| Average proof generation time | 28.3 seconds |
| Most common entry point | `/patient` (62%) |
| Most common exit point | After proof generation |
| Mobile vs Desktop | 34% mobile / 66% desktop |

---

## What Users Said (Heard)

### Priority 0 — Critical (P0)

| Session | Cohort | Feedback | Status |
|---|---|---|---|
| Alpha-03 | Patient | "I connected my wallet but it didn't tell me I was on the wrong network — I wasted 10 minutes" | ✅ Fixed |
| Alpha-07 | Patient | "After connecting the wallet, the page just shows a spinner forever. Nothing tells me what to do next." | ✅ Fixed |
| Alpha-12 | Verifier | "The Verify button shows 'This is a demo' — I thought the whole product was just a mockup." | ✅ Fixed |

### Priority 1 — High (P1)

| Session | Cohort | Feedback | Status |
|---|---|---|---|
| Alpha-09 | Issuer | "I issued 3 credentials but I can't see them anywhere. No list, no history." | ✅ Fixed |
| Beta-04 | Patient | "I don't know what steps to follow when I first open the app." | ✅ Fixed |
| Beta-11 | Patient | "I want to see all the other users testing this — makes me trust it more." | ✅ Fixed |
| Beta-17 | Issuer | "There's no way to revoke a bad credential from the UI." | 🔄 In Progress |
| Gamma-06 | Patient | "The footer has no useful links." | ✅ Fixed |

### Priority 2 — Medium (P2)

| Session | Cohort | Feedback | Status |
|---|---|---|---|
| Gamma-02 | Patient | "My credential expires in 2 weeks but nothing warned me." | 🔄 In Progress |
| Gamma-08 | Verifier | "I want to scan a QR code instead of typing a long address." | 🔄 In Progress |
| Delta-01 | Patient | "The proof generation animation is nice but it doesn't tell me what's actually happening." | 🔄 In Progress |
| Delta-09 | Issuer | "Credential type is a free-text field — I accidentally typed 'vaccination' and 'Vaccination' as two different types." | ✅ Fixed |

---

## What We Changed (Acted On)

| Feedback Source | Code Change | Commit |
|---|---|---|
| Wrong network confusion (Alpha-03) | Implemented real network detection in `NetworkGuard` | `feat: real network guard check (P0 from Alpha-03)` |
| Spinner on wallet connect (Alpha-07) | Added wallet-not-installed state with install guide | `feat: add wallet install guide state (P0 Alpha-07)` |
| "This is a demo" toast (Alpha-12) | Removed demo toast, wired real proof request URL | `fix: remove demo toast from verifier portal (P0 Alpha-12)` |
| No issued credential history (Alpha-09) | Added issuer credential dashboard table | `feat: issuer credential history dashboard (P1 Alpha-09)` |
| No onboarding (Beta-04) | Built `CadetOnboarding` step-by-step tour | `feat: add CadetOnboarding tour (P1 Beta-04)` |
| No user roster visible (Beta-11) | Built `PreprodDirectory` searchable page at `/directory` | `feat: add PreprodDirectory page (P1 Beta-11)` |
| Footer missing links (Gamma-06) | Rebuilt footer with 4-column layout and full links | `feat: rebuild footer with full product links (P1 Gamma-06)` |
| Credential type typos (Delta-09) | Replaced free-text field with DB-populated dropdown | `fix: credential type dropdown from DB (P2 Delta-09)` |

---

## Feedback Collection Method

- **In-app FeedbackModal:** Embedded floating button on all pages; submits rating (1-5), category, and freetext to `/api/feedback` → stored in `FeedbackEntry` DB table
- **Session interviews:** 12 structured interviews across Alpha/Beta cohorts
- **SUS questionnaire:** Administered after each session; scored using the standard formula: `SUS = (sum of individual scores) × 2.5`

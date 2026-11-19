# Daybreak Cafe

A React prototype for a café manager to schedule shifts, review attendance, manage leave and prepare payslips.

## Run locally

Requires Node.js 22+ and npm. Run `npm ci`, then `npm run dev` and open the URL printed by Vite. Use `npm test` for the model checks and `npm run build` for the static production bundle.

## Home dashboard

Home opens on the seeded demo date, November 17, 2026. Roster, full planning-week checks, pending requests, and publish status update from the same state as the four modules. The Home check summary opens the same week and moves keyboard focus to the detailed checks. On phones the summary precedes the roster.

## Try the cross-module workflow

1. In **Schedule**, drag a template into a cell or select the cell to assign a shift. Try placing Closing on an under-18 staff member or on the day before an Opening shift. Review the issue list and publish dialog, then fix the blocking conflicts and acknowledge the warnings.
2. In **Leave**, review Leo's request to see the over-balance warning. Approve Amara's unpaid vacation for November 19–20. It deducts two vacation days.
3. In **Schedule**, look for Amara's leave overlay. In **Attendance**, choose Amara and open November 19 to see the scheduled hours and unpaid leave status.
4. In **Payslips**, choose Amara and check the unpaid hours excluded from earnings. Switch to Maya to show weekly overtime. Use **Print / save PDF** and choose **Save as PDF** in the print dialog.

## Design rationale

The schedule is the primary working surface. Sticky staff identities preserve context during horizontal scrolling, compact shift cards carry a label and a time range, and empty cells support both drag-and-drop and click or keyboard assignment. Each warning or error has a written explanation. The publish dialog repeats the actionable checks and requires a deliberate acknowledgment when warnings remain.

Attendance keeps month and staff controls together. Text labels duplicate all status colors, and the detail dialog keeps clock times and hour comparisons out of the calendar grid. The leave review shows duration and balance before approval, including any assigned shifts that would need reassignment. Payslips expose the hours and rate behind each earnings line and use a dedicated print stylesheet.

## Mock rules and architecture

- Eight staff members, including two minors. Fixed shift templates allow one assignment per person per day. Coverage is checked at three sample times. Time-zone-neutral dates and minute offsets keep the demo deterministic.
- A closing shift after 22:00 for a minor, rest under eight hours and a shift during approved leave block publishing. Unavailability, undercoverage and weeks over 40 scheduled hours warn. Published status is a local prototype state.
- Approved leave uses calendar days and consumes the selected balance regardless of pay treatment. A request above the balance or overlapping existing approved leave is prevented. The scheduler overlay and attendance derive from the same request list.
- Historical scheduled and actual hours are seeded independently from draft assignments. Payroll reads effective attendance, allocates hours above 40 per Monday–Sunday week at 1.5×, and includes earlier days in the same week when a pay period starts midweek. Paid leave pays scheduled hours at base rate and does not count toward worked-hour overtime. Tips use a mock rate of ₹12 per worked hour, and withholding is illustrative at 8%. Amounts use INR and Indian digit grouping. The demo uses mock hourly rates of ₹160–₹230.
- Mock schedule, requests and publish state persist in browser local storage. Clearing the site's data resets the demo. No backend or real payroll integration is required.
- Optional stretch included: copying the previous week's assignments with confirmation.

## 30-minute walkthrough

| Time | Topic |
| --- | --- |
| 0–4 min | Manager workflow, design file, and four-module navigation |
| 4–12 min | Drag assignment, keyboard alternative, validation, publish policy |
| 12–19 min | Attendance detail, leave approval, and cross-module state |
| 19–25 min | Weekly overtime calculation, unpaid leave, and print preview |
| 25–30 min | React structure, mock data trade-offs, and discussion |

[Editable Figma design](https://www.figma.com/design/ViyTUF5MpODuStLphrNIfS)

## Usability fixes

Dialogs announce their titles and restore focus. Schedule checks link to the affected cell or day. On phones, the week grid has a scroll cue and a narrower sticky staff column, and Attendance uses a readable date list. Months with no records show an explicit empty state.

## Final interface cleanup

The page title and selected sidebar destination provide location. The duplicate breadcrumb, sidebar Workspace heading and repeated subtitles were removed. Schedule retains actionable error and warning counts. Home carries the sample-data notice and a compact weekly review card. It distinguishes blocking errors, warnings, clear checks and an already published week. Plain CAFE branding is consistent across the interface and Figma.

[Design decisions and walkthrough in FigJam](https://www.figma.com/board/3XGSf7DGzkKufBZ7cN3U4m) includes 24 sections with example screens.

## Review fixes - 19 November 2026

Home, Schedule and publish review consume the same `validate` result. Errors appear first and every check names a date and a corrective action. The minor rule is a blocking error, not an acknowledged warning. Warning acknowledgment cannot bypass an error. After assignment, a live status message announces the affected check. Changes to a Sunday or Monday invalidate both weeks whose rest checks may change. Moving a shift also invalidates its source week.

`rulePolicy` documents the prototype severity policy; it is a design choice within the brief, not a claim about statutory employment rules. `canPublish` is the shared publish gate. Eight model tests cover weekly limits, rest across weeks, exact rule boundaries, publish gating, leave balances and payroll consistency.

### Repeatable rule demonstration

Start in a fresh browser profile to use the seeded mock state. November 16-22 has 2 blocking errors and 6 warnings. Maya is scheduled for 48 hours. Select Isla on November 21 and replace Closing with Midday, then replace Jules's November 22 Opening with Midday. Both blocking errors clear and the extra lunch staff resolves the coverage gap, leaving 5 warnings. Publish stays disabled until those warnings are acknowledged. Remove Maya's Saturday shift to reach 40 hours and clear her weekly excess warning, or use Load 48-hour example to restore it.

### Leave demonstration

Before approval, Amara has 8 vacation days and net pay of INR 30,253.51 for November. Approve her November 19-20 unpaid request. Her balance becomes 6, both dates appear as leave, and payroll excludes 8 historically scheduled unpaid hours. Net pay becomes INR 28,766.79. The request consumes two calendar days, but only one of those dates has historical scheduled work. The affected published week returns to Draft. Leo's 3-day request against a 2-day balance cannot be approved.

### Validation limits

The revised production bundle was checked in a desktop browser and at a phone-sized viewport. Rule correction, warning acknowledgment, publishing, Home navigation and unpaid leave propagation were exercised through the UI. Automated tests pass. This is an expert and functional review with mock data, not participant usability research. Full screen-reader, physical-phone and payroll-compliance validation remain outside this check.

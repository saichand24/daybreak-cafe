# Daybreak Cafe

A React mock-data application connecting staff scheduling, attendance, leave and payroll for a cafe manager.

- [Live application](https://saichand24.github.io/daybreak-cafe/)
- [Figma design file](https://www.figma.com/design/ViyTUF5MpODuStLphrNIfS)
- [Design decisions and references](https://www.figma.com/design/ViyTUF5MpODuStLphrNIfS?node-id=156-6616)

All staff, clock records, leave requests and payroll figures are fictional. No backend or account is required.

## Repository structure

| Path | Purpose |
| --- | --- |
| `/index.html`, `/assets/` | Production bundle served by GitHub Pages |
| `/source/src.jsx` | React views, interactions and browser persistence |
| `/source/model.js` | Shared fixtures, scheduling rules, leave, attendance and payroll calculations |
| `/source/style.css` | Application styling, responsive layouts and print rules |
| `/source/package.json` | Dependencies and development, build and test commands |

The production bundle and editable source are separate. Updating this README does not rebuild or change the application.

## Setup

Install Node.js and npm, clone the repository, then run:

```sh
cd source
npm ci
npm run dev
```

Open the local address printed by Vite.

| Command, run inside `source/` | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the Node model and rule tests |
| `npm run build` | Build the static application into `source/dist/` |
| `npm run preview` | Preview the built application locally |

The application uses React, Vite and Lucide icons. It uses relative asset paths for GitHub Pages. To deploy an application change, build it and replace the repository root production bundle with the contents of `source/dist/`. A source edit alone does not update the root bundle.

## Modules

### Home

Home uses today's date in `Asia/Kolkata` and shows that day's roster. It refreshes its date on window focus, visibility changes and a 30-second interval.

Schedule ready for review targets the first unpublished Monday-Sunday week after the current week, skipping weeks already published. Its blockers and warnings belong to that upcoming week, not today's roster. Review schedule opens the same week.

The lower leave list includes upcoming approved leave and pending requests. The separate Home blockers/warnings metric and Week status card are not present. Clicking the Daybreak logo returns to Home.

### Shift Scheduler

Staff are rows and days are columns. Managers can drag shift templates onto cells or select a template/cell through the click-based controls. Week Off and Leave can also be added and removed.

All months share these eight-hour shifts:

| Shift | Time |
| --- | --- |
| Opening | 06:00-14:00 |
| Midday | 11:00-19:00 |
| Closing | 15:00-23:00 |

Minimum assignment targets are:

| Day | Opening | Midday | Closing |
| --- | --- | --- | --- |
| Monday-Friday | 2 | 2 | 2 |
| Saturday-Sunday | 2 | 3 | 2 |

These are required counts, not a guarantee that every mock roster meets them. The November Tuesday/Thursday fixtures deliberately have one Closing assignment and therefore show understaffing. November 1 retains the October carry-in schedule: both minors have Week Off, leaving a Midday 2/3 shortage. October 2 and November 8 are the only configured closed holidays.

The grid shows actual/required assignment counts and dated staffing warnings. Validation also checks the configured time-slot coverage, so there can be more warnings than the assignment shortfalls alone suggest. Checks apply to every selected month and include relevant adjacent-week context.

| Rule | Severity | Publishing behaviour |
| --- | --- | --- |
| More than 40 scheduled hours in a Monday-Sunday week | Warning | Requires acknowledgment |
| Under 8 hours between consecutive shifts | Blocker | Must be corrected |
| Under-18 employee scheduled past 22:00 | Blocker | Must be corrected |
| Under-18 employee scheduled above 32 hours in a week | Blocker | Must be corrected |
| Staffing below a required assignment or time-slot minimum | Warning | Requires acknowledgment |
| Shift during approved leave or a closed holiday | Blocker | Must be corrected |
| Shift conflicting with Week Off | Warning | Requires acknowledgment |

The 32-hour minor cap is an additional project rule; it was not part of the original take-home brief. It now applies across months. Preserved historical assignments can therefore show blockers rather than being silently rewritten or exempted.

Exactly eight hours of rest passes; a 23:00 finish followed by a 06:00 start gives seven hours and blocks publishing. Minors cannot use the 15:00-23:00 Closing template because it ends after 22:00.

Blocking errors prevent publication. Warnings allow publication only after explicit acknowledgment. Roster edits can affect validation in neighbouring weeks.

Previous/Next week, Copy last week, the Week Offs & leave overlay and Review & publish remain available. Restore Planned Week is removed. Historical dates remain editable.

December 7-13, 2026 has its assignments cleared and is unpublished in the seeded/migrated state. It remains editable; assignments added afterwards survive reloads.

### Monthly Attendance

The staff/month controls provide October and November 2026 demo records. The calendar distinguishes Present, Late, Absent, Leave, Holiday, Week Off and Not recorded.

Actual attendance and its summaries advance through **yesterday in IST**. For example, viewing on November 21 shows recorded attendance through November 20; viewing on November 22 advances it through November 21. This is a runtime cutoff, not a permanently fixed November 23 cutoff.

Approved future leave appears immediately as planned paid or unpaid leave, without clock times or inclusion in recorded attendance totals. An unrecorded future day is not treated as an absence.

Selecting a day shows scheduled versus actual hours and clock-in/out. Worked hours opens a daily breakdown; Overtime opens a Monday-Sunday weekly breakdown.

Overtime is actual work above 40 hours in each week. Weeks crossing a month boundary include the other month's clock records when applying the threshold; the monthly total includes overtime attributed to dates in that month. Paid leave, unpaid leave and absences are not worked overtime.

`Worked hours = Regular hours + Overtime hours`

Times are displayed as hours and minutes. Roster edits update scheduled hours; recorded clock times remain mock actual records rather than being rewritten to match a new plan.

### Leave

Sick and vacation balances appear above requests. Request review uses the same employee balances as those cards. Request rows identify Sick leave or Vacation leave; the review explains the paid/unpaid allocation.

Requests are sorted by leave start date, latest first: December precedes November and October. The submission date is shown separately.

The default pending requests are:

| Staff | Type | Requested dates, 2026 |
| --- | --- | --- |
| Noah Kim | Sick | December 3 |
| Leo Rivera | Vacation | December 2-4 |
| Amara Okafor | Vacation | November 30 |
| Jules Martin | Vacation | November 27-28 |
| Maya Chen | Sick | November 25 |
| Isla Brooks | Vacation | November 23-24 |
| Jules Martin | Vacation | November 22 |
| Sofia Patel | Vacation | November 21 |
| Finn Murphy | Sick | November 17 |

The seeded balances, after historical approved leave and before these requests are reviewed, include Isla vacation 2 days, Finn sick 0 days and Noah sick 0 days. There are nine pending requests in a fresh dataset. Saved manager decisions can reduce that count and change balances; screenshots may show a reviewed browser state.

Approval uses only the requested leave type's available balance. Paid days are allocated chronologically, with excess working days marked unpaid Loss of Pay (LOP). For example, Leo's three vacation days against two available become two paid vacation days and one unpaid day after the manager confirms. Sick entitlement is not consumed by a vacation request.

Exceeding the balance does not disable review. The manager sees the split and confirms the unpaid outcome. Pending requests do not deduct balances or approve themselves. Overlaps with approved leave and requests with no working days are blocked with explanations.

Approval connects the modules:

1. Deduct only the paid days from the appropriate balance.
2. Show paid/unpaid leave on the attendance calendar, including future dates.
3. Remove conflicting shifts and show leave in the scheduler.
4. Recalculate staffing warnings and the relevant pay inputs.

Week Offs and holidays are excluded from ordinary working-day request allocation. Explicit manager-created unpaid leave retains its selected unpaid outcome. Removing an approved leave date requires confirmation, returns its paid entitlement where applicable and preserves other approved dates.

### Payslips

October 2026 is the released demo period. November remains unreleased and Print / save PDF is disabled for it. Release is a fixed demo policy, not an automatic monthly salary-release service.

Amounts use INR. Payslip regular and overtime hours come from attendance records for the selected employee/month:

```text
Base hours = Worked hours - Overtime hours
Base pay = Base hours x Hourly rate
Overtime pay = Overtime hours x Hourly rate x 1.5
Paid leave pay = Eligible paid leave hours x Hourly rate
Tips = Worked hours x INR 12
Gross pay = Base pay + Overtime pay + Paid leave pay + Tips

Unpaid leave / LOP deduction =
  (Approved unpaid leave hours + Absent scheduled hours) x Hourly rate
Taxes = 8% of Gross pay, rounded to paise
Total deductions = Unpaid leave / LOP deduction + Taxes
Net pay = Gross pay - Total deductions
```

Absent time already contributes no worked hours. The additional negative deduction is the requested mock penalty policy. It is combined under Unpaid leave / LOP; there is no separate Absent deduction row and no positive Scheduled unpaid time before deduction offset.

Paid leave is separate from worked hours. Closed holidays have no paid-hours allowance in this dataset. Taxes is a mock withholding, not a statutory Indian tax calculation.

**Date limitation:** the Attendance page uses yesterday's runtime cutoff, while the existing payroll model retains its November 23, 2026 fixture cutoff. October is complete under either cutoff. The unreleased November calculation is a mock preview and should not be presented as a released payslip or assumed to advance with Attendance after that fixture cutoff.

Print / save PDF opens the browser's print dialog. Print styles hide navigation and controls.

## Key design and technical decisions

- **A shared model connects the modules.** Scheduling, leave, attendance and payroll calculations live in `model.js` rather than independent screen-specific mock totals.
- **Planned and recorded time are distinct.** The roster expresses the plan; recorded clocks provide worked time. Future approved leave is visible without fabricated clock records.
- **Risk determines severity.** Rest and minor protections block publishing; overtime and shortages require manager review and acknowledgment.
- **Consequences appear before approval.** Excess leave remains actionable, with explicit confirmation of the paid/LOP split.
- **Dense data remains explainable.** The week grid supports staff/date comparison; attendance summaries open daily and weekly calculations; payslip earnings and negative deductions reconcile to net.
- **Consistent visual foundations.** Manrope headings, DM Sans body text, Lucide icons, a dark green navigation shell and repeated surfaces/controls link the modules. Status labels accompany colour.
- **Responsive representations follow the task.** Home stacks on narrow screens; attendance switches to an agenda at small widths; the schedule retains horizontal scrolling instead of compressing every cell.
- **Client-side persistence suits the assignment.** Browser local storage retains edits without introducing a backend, accounts or real employee records.

The [Figma rationale page](https://www.figma.com/design/ViyTUF5MpODuStLphrNIfS?node-id=156-6616) contains detailed screen references, visual specifications, trade-offs and external references. Its recorded example states are not live application data.

## Persistence and demo state

Shifts, leave decisions, Week Off overrides and published weeks persist in browser local storage. Another browser/profile can have a different state. There is no server sync or multi-manager collaboration.

Existing migration code preserves compatible decisions and separates leave storage from roster editing. The December 7-13 assignment-clear migration runs once; later edits are retained. The removed Restore Planned Week action is not part of the current UI.

To inspect untouched seeded data without changing a manager's saved work, use a separate browser profile or private window. Clearing site storage deletes that browser's saved demo edits and decisions; do not use it casually before a presentation.

## Suggested walkthrough

1. Show today's Home roster and open the upcoming unpublished week.
2. Explain the shift times, actual/required coverage and weekly staff totals.
3. Demonstrate one overtime/understaffing warning and a deliberately invalid rest/minor assignment. Correct blockers before publishing; acknowledge warnings explicitly.
4. Review a pending request, inspect its correct balance and explain the paid/LOP confirmation.
5. Follow approved dates into Leave balances, Attendance and Schedule; inspect resulting shortages.
6. Open October attendance for the same employee, inspect worked-hours and overtime details, then reconcile the released October payslip and use Print / save PDF.

Use a separate demo browser state for destructive or deliberately invalid examples. The Figma prototype illustrates selected layouts/states; the React application demonstrates runtime interactions and calculations.

## Validation and scope

`npm test` runs the model/rule suite. It covers scheduling boundaries, staffing, rest, minor limits, leave allocation, future leave, attendance reporting dates, overtime, payroll, persistence migrations and publish policy. Run it again when changing those behaviours; this README intentionally avoids a test count that can become stale.

A successful model test run does not establish complete browser, assistive-technology, mobile-device or print-layout testing. Interaction, responsive and exported PDF checks remain separate.

This is a take-home prototype: no backend, authentication, live clock integration, bank payments, production payroll compliance or automatic payslip-release workflow. Accessibility treatments and design references are not a claim of a completed WCAG audit or user research study.

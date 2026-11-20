# Daybreak Cafe

A React mock-data prototype for cafe scheduling, attendance, leave and payroll.

## Setup

Run `npm ci`, then `npm run dev`. Use `npm test` for the data and rule tests and `npm run build` for the production build. GitHub Pages serves `dist` using relative asset paths.

## Reporting dates

The fictional reporting date is 23 November 2026. October attendance and payslips are complete. November attendance runs through the 23rd, and later days say Not recorded. November payslips are not released. Attendance and payslips have separate month selectors.

## Clean roster and staffing policy

All eight employees have five available workdays per normal week, at eight scheduled hours per day. Weekly offs are staggered. Maya, Amara and Noah are off Saturday/Sunday; Leo and Jules Monday/Tuesday; Sofia Tuesday/Wednesday; Isla Wednesday/Thursday; Finn Thursday/Friday.

Templates are Opening 09:00-17:00, Midday 10:00-18:00 and Closing 13:00-21:00. A consistent adult closing assignment is selected from available staff. Both minors have opening assignments. Approved leave and weekly offs receive no shift. Sick and unpaid historical examples are staggered so they do not create staffing gaps.

Required staffing is 1 from 09:00-11:00, 3 from 11:00-15:00, 2 from 15:00-17:00 and 1 from 17:00-21:00. Coverage is checked every 30 minutes, including slot boundaries. October 2 and November 11 are closed mock holidays. These hours and staffing levels are documented design assumptions, not legal requirements.

Every default week from September 28 through December 6 passes all checks with no errors or warnings. The 48-hour example is opt-in and intentionally creates warnings. Restore planned week replaces that selected week with the clean rota for current approved leave; review its checks because several simultaneous approvals may require extra staffing.

## Editable schedule and recorded attendance

All dates can be edited, copied and published. There is no date lock. Validation runs for every selected week. Edits update scheduled hours in attendance, while recorded clock times remain unchanged. Payroll follows recorded actual hours, approved paid leave and weekly overtime, not a rewritten historical clock record. The Home Week status card was removed; the selected schedule still shows Draft or Published.

The mock clocks use each employee's rostered shift start/end, occasional 15-minute lateness, absence and an extra hour. Actual hours above 40 in a Monday-Sunday week earn 1.5x, including weeks crossing month boundaries. Paid leave does not count as worked overtime. Minors' default clocks end by 18:00.

## Leave and LOP

Leave balances appear above requests. Five upcoming requests remain Pending for the manager, including Sofia's unpaid request on December 3 and Jules's on December 4. Approval is never automatic. Leo requests three vacation workdays against two available. Approve opens a confirmation showing two paid dates and one Loss of Pay date. Confirming consumes only the paid balance, with excess leave unpaid. Dates are allocated chronologically. Overlaps and requests without workdays remain blocked with explanations. Weekly offs and holidays do not consume leave.

Historical approved leave is marked on the schedule and attendance. Paid days contribute their scheduled eight hours to earnings; unpaid days earn no pay and do not consume sick/vacation balance. Payslips show unpaid days, hours and value not earned without deducting it twice.

## Payroll policy

Rates are illustrative INR 160-230/hour. Tips are INR 12 per worked hour. Deductions are an illustrative 8% withholding. The mock holiday policy has no paid holiday allowance. This is a take-home prototype, not statutory Indian payroll software.

## Persistence and checks

The clean-roster storage namespace resets older inconsistent demo schedules and requests once. Subsequent manager edits persist locally. Fourteen automated tests verify all employees and all demo weeks, half-hour coverage, availability, leave, weekly limits, minor/rest rules, overtime boundaries, monthly reconciliation, past-date edits, pending requests, LOP splits and publish gating. Default leave requests are not approved during browser verification.

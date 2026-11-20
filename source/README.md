# Daybreak Cafe

A React mock-data prototype for cafe scheduling, attendance, leave and payroll.

## Setup

Run `npm ci`, then `npm run dev`. Use `npm test` for the data and rule tests and `npm run build` for the production build. GitHub Pages serves `dist` using relative asset paths.

## Reporting dates

The fictional reporting date is 23 November 2026. October attendance and payslips are complete. November attendance runs through the 23rd, and later days say Not recorded. November payslips are not released. Attendance and payslips have separate month selectors.

## Clean roster and staffing policy

Outside October, all eight employees have five available workdays per normal week, at eight scheduled hours per day. Weekoffs are staggered. Maya, Amara and Noah are off Saturday/Sunday; Leo and Jules Monday/Tuesday; Sofia Tuesday/Wednesday; Isla Wednesday/Thursday; Finn Thursday/Friday.

Templates are Opening 09:00-17:00, Midday 10:00-18:00 and Closing 13:00-21:00. A consistent adult closing assignment is selected from available staff. Both minors have opening assignments. Approved leave and weekly offs receive no shift. Sick and unpaid historical examples are staggered so they do not create staffing gaps.

Required staffing is 1 from 09:00-11:00, 3 from 11:00-15:00, 2 from 15:00-17:00 and 1 from 17:00-21:00. Coverage is checked every 30 minutes, including slot boundaries. October 2 and November 11 are closed mock holidays. These hours and staffing levels are documented design assumptions, not legal requirements.

November and December default weeks have no errors or warnings. October has only acknowledged-policy weekly overtime warnings; no leave, weekoff, rest, minor or staffing issues. The 48-hour example is opt-in and intentionally creates warnings. Restore planned week replaces that selected week with the clean rota for current approved leave; review its checks because several simultaneous approvals may require extra staffing.

## Editable schedule and recorded attendance

All dates can be edited, copied and published. There is no date lock. Validation runs for every selected week. Edits update scheduled hours in attendance, while recorded clock times remain unchanged. Payroll follows recorded actual hours, approved paid leave and weekly overtime, not a rewritten historical clock record. The Home Week status card was removed; the selected schedule still shows Draft or Published.

The mock clocks use each employee's rostered shift start/end, occasional 15-minute lateness, absence and an extra hour. Actual hours above 40 in a Monday-Sunday week earn 1.5x, including weeks crossing month boundaries. Paid leave does not count as worked overtime. Minors' default shifts are opening or midday; their mock clock-outs remain before 22:00.

## Leave and LOP

Leave balances appear above requests. Five upcoming requests remain Pending for the manager, including Sofia's unpaid request on December 3 and Jules's on December 4. Approval is never automatic. Leo requests three vacation workdays against two available. Approve opens a confirmation showing two paid dates and one Loss of Pay date. Confirming consumes only the paid balance, with excess leave unpaid. Dates are allocated chronologically. Overlaps and requests without workdays remain blocked with explanations. Weekly offs and holidays do not consume leave.

Historical approved leave is marked on the schedule and attendance. Paid days contribute their scheduled eight hours to earnings; unpaid days earn no pay and do not consume sick/vacation balance. Payslips show unpaid days, hours and value not earned without deducting it twice.

## Payroll policy

Rates are illustrative INR 160-230/hour. Tips are INR 12 per worked hour. Deductions are an illustrative 8% withholding. The mock holiday policy has no paid holiday allowance. This is a take-home prototype, not statutory Indian payroll software.

## Persistence and checks

The October-weekend storage namespace resets older inconsistent demo schedules and requests once. Subsequent manager edits persist locally. Seventeen automated tests verify all employees and all demo weeks, half-hour coverage, availability, leave, weekly limits, minor/rest rules, overtime boundaries, monthly reconciliation, past-date edits, pending requests, LOP splits and publish gating. Default leave requests are not approved during browser verification.

## Monthly hours detail

Click Worked hours in Attendance to inspect every date for the selected employee and month. The dialog lists scheduled shift, status, actual clock-in/out, regular hours, weekly overtime and worked hours. Daily values and the footer sum to the same total as the card. Paid leave, unpaid LOP and absences are summarized separately and excluded from worked hours. Future dates are marked Not recorded and excluded from totals. Overtime still uses the Monday-Sunday weekly rule across month boundaries. The Daybreak logo is a keyboard-accessible button returning to Home. Seventeen model tests include monthly reconciliation for all eight employees and Sofia's November total of 120h 30m.

## October 2 / 2 / 2 rota

The manager explicitly chose to retain eight staff and allow overtime / rebalance weekoffs. All 21 open October weekdays have 2 Opening (09:00-17:00), 2 Midday (10:00-18:00), and 2 Closing (13:00-21:00) assignments. All 9 weekend days have 2 Opening, 3 Midday, and 2 Closing assignments: 189 assignments total. October 2 remains a closed holiday with no assignments. All 13 existing approved leave days are preserved. October weekoffs are date-specific and come from the rebalanced rota, rather than fixed recurring weekday offs. A constraint search respects approved leave, limits each employee to at most six shifts per Monday-Sunday week (including September/November boundary days), and avoids more than six consecutive workdays. All closing slots are staffed by adults. Dates without work, approved leave or a holiday are marked Week Off. These labels remain visible when the overlay shading is turned off. October 2 says Holiday in the column header and Holiday — closed in cells and the coverage footer.

October weeks over 40 scheduled hours deliberately produce the required warning and need acknowledgment before publishing. Actual weekly overtime is calculated from the new clock fixtures and paid at 1.5x. October attendance, daily hours breakdowns and payslips are recalculated from those fixtures. Existing November/December shift patterns remain the normal five-day policy; a week crossing October and November uses the same weekly overtime calculation. Exact weekday 2/2/2 and weekend 2/3/2 staffing is checked separately for October in addition to continuous coverage checks. Pending leave requests remain manager-controlled.

Use Schedule > October roster to jump directly to the week containing October 1 and the October 2 holiday. Daily counts appear in the Staff per shift footer.

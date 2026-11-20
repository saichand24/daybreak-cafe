# Daybreak Cafe

A React mock-data prototype connecting staff scheduling, attendance, leave and payroll.

## Setup

Run `npm ci`, then `npm run dev`. Run `npm test` for the model/rule tests and `npm run build` to create the static `dist` bundle. GitHub Pages uses relative asset paths.

## Reporting dates

All employees and records are fictional. The presentation reporting date is 23 November 2026. October attendance and released payslips are complete. November actual attendance stops on the 23rd; later dates say Not recorded. November's full roster is planned, but its payslip remains unreleased until month close. Staff and month selectors use the same records as each monthly hours breakdown.

## October and November staffing

Eight staff are retained, including two minors. October retains its existing eight-hour shifts and 2/2/2 weekday, 2/3/2 weekend staffing. November uses Opening 06:00-14:00, Midday 10:00-18:00 and Closing 15:00-23:00, each eight hours. November Monday/Wednesday/Friday have 2/2/2 assignments, Tuesday/Thursday have 2/2/1 and weekends have 2/3/2. Closing still requires two staff; the single Tuesday/Thursday closing assignment is deliberately highlighted as understaffed.

October 2 and November 8 are the only closed holidays in their respective months. November 11 is a normal day. October has 21 open weekdays and 9 weekend days: 189 assignments. November has 13 Monday/Wednesday/Friday dates, 8 Tuesday/Thursday dates, 8 open weekend days and one holiday: 174 assignments. Holiday columns, empty holiday cells and coverage footers explicitly say Holiday.

Date-specific Week Offs are rebalanced around the existing approved leave. The manager authorized overtime to retain eight staff. The planner limits staff to six shifts per Monday-Sunday week, allows no more than six consecutive workdays across month boundaries, and assigns closing shifts to adults. The eight-hour rest rule and 10 pm minor limit remain enforced. Approved leave has no assigned shifts. All historical October approved leave is retained; November retains Amara's paid vacation on the 18th-19th and Sofia's unpaid leave on the 5th.

Weekly hours over 40 remain warnings and require acknowledgment before publishing. The default has eight intentional November Tuesday/Thursday closing understaffing warnings, plus weekly overtime warnings where applicable. There are no default blocking errors or Week Off/approved-leave conflicts. November closing employees are not assigned the following day's 06:00 opening, which would leave only seven hours of rest. Minors are never assigned the default 23:00 closing. December retains its original mock weekly availability pattern. Boundary checks include the adjacent month. Schedule shortcuts open October or November directly; daily staffing totals are shown beneath the grid.

## Editable roster and recorded clocks

All dates can be edited, copied and published; there is no date lock. Roster edits update scheduled hours shown in attendance. Recorded clock times remain actual records. The mock fixtures include 15-minute late arrivals, absences and occasional extra hours. November clock-outs are capped at 23:00. Weekly overtime uses actual hours over 40 in a Monday-Sunday week, including days before a month boundary. Paid leave is excluded from worked overtime. Minor clock-outs remain before 22:00. Home's Week status card was removed.

## Leave requests and LOP

Leave balances appear above requests. Five requests remain Pending, submitted on 22 November, with leave dates from November 24 onward. Three are paid requests; Sofia and Jules each have one unpaid request. Dates are selected from the employee's planned working days. No December pending requests remain in the fixtures. The manager must approve or reject them; no automatic approval occurs.

Leo requests three vacation workdays against two available. Approve opens an explicit confirmation of two paid dates plus one unpaid Loss of Pay date. Confirming deducts only paid days from the balance. Leave is allocated chronologically and does not count Week Offs or holidays. Overlapping requests and requests with no working days are blocked with explanations. Approved leave connects to schedule validation, attendance and payroll.

## Attendance and payroll

Click Worked hours > View breakdown to inspect the selected employee's daily scheduled shift, status, clock-in/out, regular hours, overtime and worked hours. The footer and regular + overtime equation exactly match the monthly card. Paid leave, unpaid LOP and absences are separate from worked hours. Future records are excluded from totals. The Daybreak logo is a keyboard-accessible Home button.

Actual weekly overtime is paid at 1.5x. Paid leave contributes its scheduled hours to earnings. Unpaid leave earns no pay and is shown as days, hours and value not earned, without being deducted twice. Illustrative INR rates are 160-230/hour, tips are INR 12 per worked hour, and withholding is a mock 8%. Closed holidays have no paid-hours allowance. These are take-home assumptions, not statutory payroll rules.

## Persistence and validation

The November-hours storage namespace resets older fixtures once so stale schedules and requests cannot mix with the updated month. Later edits persist locally. Nineteen tests cover all employees, October and November day-by-day staffing, closed holidays, Week Offs, leave, actual clocks, rest, minor restrictions, weekly overtime boundaries, LOP approval, pending requests, editable historical dates, monthly breakdown totals, payroll and publishing. November changes were separately checked against the previous October roster and payslip snapshots.

The scheduler highlights over-40-hours and understaffing warnings in amber. Rest below eight hours and minors ending after 22:00 are red blockers. The rule legend names all four checks. Tuesday/Thursday coverage cells explicitly say Closing 1/2 and Understaffed. Blocking errors prevent publication; warnings require acknowledgment. Tests exercise a real 23:00-to-06:00 rest blocker and an under-18 23:00 closing blocker.

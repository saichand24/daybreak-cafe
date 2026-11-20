# Daybreak Cafe

A React mock-data prototype connecting staff scheduling, attendance, leave and payroll.

## Setup

Run `npm ci`, then `npm run dev`. Run `npm test` for the model/rule tests and `npm run build` to create the static `dist` bundle. GitHub Pages uses relative asset paths.

## Reporting dates

All employees and records are fictional. The presentation reporting date is 23 November 2026. October attendance and released payslips are complete. November actual attendance stops on the 23rd; later dates say Not recorded. November's full roster is planned, but its payslip remains unreleased until month close. Staff and month selectors use the same records as each monthly hours breakdown.

## October and November staffing

Eight staff are retained, including two minors. October retains its existing eight-hour shifts and 2/2/2 weekday, 2/3/2 weekend staffing. November uses Opening 06:00-14:00, Midday 11:00-19:00 and Closing 15:00-23:00, each eight hours. November Monday/Wednesday/Friday have 2/2/2 assignments, Tuesday/Thursday have 2/2/1 and weekends have 2/3/2. Closing still requires two staff; the single Tuesday/Thursday closing assignment is deliberately highlighted as understaffed.

October 2 and November 8 are the only closed holidays in their respective months. November 11 is a normal day. October has 21 open weekdays and 9 weekend days: 189 assignments. November has 13 Monday/Wednesday/Friday dates, 8 Tuesday/Thursday dates, 8 open weekend days and one holiday: 173 assignments. Holiday columns, empty holiday cells and coverage footers explicitly say Holiday.

Date-specific Week Offs are rebalanced around the existing approved leave. The manager authorized overtime to retain eight staff. The planner limits adults to six shifts and minors to four shifts per Monday-Sunday week, limits November work streaks to six days, and assigns closing shifts to adults. The eight-hour rest rule and 10 pm minor limit remain enforced. Approved leave has no assigned shifts. All historical October approved leave is retained; November retains Amara's paid vacation on the 18th-19th and Sofia's unpaid leave on the 5th.

Weekly hours over 40 remain warnings and require acknowledgment before publishing. The default has eight intentional November Tuesday/Thursday closing understaffing warnings plus the November 1 midday shortage, plus weekly overtime warnings where applicable. There are no default blocking errors or Week Off/approved-leave conflicts. November closing employees are not assigned the following day's 06:00 opening, which would leave only seven hours of rest. Minors are never assigned the default 23:00 closing. December retains its original mock weekly availability pattern. Boundary checks include the adjacent month. Use the existing previous/next week arrows to navigate; daily staffing totals are shown beneath the grid.

## Editable roster and recorded clocks

All dates can be edited, copied and published; there is no date lock. Roster edits update scheduled hours shown in attendance. Recorded clock times remain actual records. The mock fixtures include 15-minute late arrivals, absences and occasional extra hours. November clock-outs are capped at 23:00. Minors receive no extra-hour clock examples. Weekly overtime uses actual hours over 40 in a Monday-Sunday week, including days before a month boundary. Paid leave is excluded from worked overtime. Minor clock-outs remain before 22:00. Home's Week status card was removed.

## Leave requests and LOP

Leave balances appear above requests. Five requests remain Pending, submitted on 22 November, with leave dates from November 24 onward. Three are paid requests; Sofia and Jules each have one unpaid request. Dates are selected from the employee's planned working days. No December pending requests remain in the fixtures. The manager must approve or reject them; no automatic approval occurs.

Leo requests three vacation workdays against two available. Approve opens an explicit confirmation of two paid dates plus one unpaid Loss of Pay date. Confirming deducts only paid days from the balance. Leave is allocated chronologically and does not count Week Offs or holidays. Overlapping requests and requests with no working days are blocked with explanations. Approved leave connects to schedule validation, attendance and payroll.

## Attendance and payroll

Click Worked hours > View breakdown to inspect the selected employee's daily scheduled shift, status, clock-in/out, regular hours, overtime and worked hours. The footer and regular + overtime equation exactly match the monthly card. Paid leave, unpaid LOP and absences are separate from worked hours. Future records are excluded from totals. The Daybreak logo is a keyboard-accessible Home button.

Actual weekly overtime is paid at 1.5x. Paid leave contributes its scheduled hours to earnings. Unpaid leave is included in base pay before LOP and then shown as a negative deduction (days, hours and amount). Gross minus total deductions equals net pay; LOP is deducted once. Withholding remains 8% of earned gross after LOP, preserving the existing net amounts. Illustrative INR rates are 160-230/hour, tips are INR 12 per worked hour, and withholding is a mock 8%. Closed holidays have no paid-hours allowance. These are take-home assumptions, not statutory payroll rules.

## Persistence and validation

The November-minor32 storage namespace resets older fixtures once so stale schedules and requests cannot mix with the updated month. Later edits persist locally. Thirty-six tests cover all employees, October and November day-by-day staffing, closed holidays, Week Offs, leave, actual clocks, rest, minor restrictions, weekly overtime boundaries, LOP approval, pending requests, editable historical dates, monthly breakdown totals, payroll and publishing. November changes were separately checked against the previous October roster and payslip snapshots.

The scheduler highlights over-40-hours and understaffing warnings in amber. Rest below eight hours and minors ending after 22:00 are red blockers. The rule legend names all four checks. Tuesday/Thursday coverage cells explicitly say Closing 1/2 and Understaffed. Blocking errors prevent publication; warnings require acknowledgment. Tests exercise a real 23:00-to-06:00 rest blocker and an under-18 23:00 closing blocker.

## Minor hours and the retained October boundary

November shifts are 06:00-14:00, 11:00-19:00 and 15:00-23:00, all eight hours. Under-18 staff have a hard 32-hour weekly limit in November and may not work the closing shift past 22:00. Both scheduled and recorded actual minor hours are checked. November 30 includes the December 1-6 planned hours when enforcing the cap.

The manager explicitly chose to preserve October and understaff November 1. In the week ending November 1, Isla already has 40 October scheduled hours and Finn 32. Both have Week Off on November 1. Existing October carry-in is displayed as an exception to the new policy; no November hours can be added above the remaining weekly allowance. November 1 therefore has six adults (2 opening, 2 midday, 2 closing) and a highlighted 2/3 midday shortage. October roster and pay arithmetic remain unchanged. The 32-hour rule blocks additional hours in every subsequent shared November week.

## Leave balances, future leave and overtime detail

Leave cards and request dialogs use the same live sick/vacation balance helper. A request explicitly names its leave type and the corresponding available balance. Leo has 3 sick and 2 vacation days; his three-workday vacation request allocates two paid vacation dates and one unpaid LOP date only after manager confirmation. Sick balance is not consumed by vacation.

Approved future leave appears immediately in the attendance calendar as Paid leave or Unpaid / LOP with an Upcoming label, and in the scheduler overlay. It has no actual clock times. Worked-hours summaries and payroll exclude future leave until the reporting date reaches it. Available paid balances are deducted on approval.

Payslip unpaid totals include approved unpaid leave and absent scheduled hours. LOP is deducted once below gross pay; absences remain excluded from base pay. The payslip separately lists their days and hours. Click Attendance > Overtime > View weekly breakdown for each Monday-Sunday actual-hours calculation, the 40-hour threshold, weekly overtime, the selected month share, and expandable daily clock rows. Overtime uses max(0, actual weekly work minus 40); leave and absence do not count as worked hours.

Home uses the current India date (Asia/Kolkata), refreshing on window focus, visibility changes and every 30 seconds. Today’s roster follows that date. Home checks independently target the first unpublished Monday-Sunday week after the current week, skipping published weeks; Review schedule opens that exact week. Historical attendance retains its existing mock reporting cutoff.

## Editable Week Off and Leave templates

Drag Week Off or Leave onto a staff/day cell, or click the template then a cell. Clicking a cell also offers these choices. Remove Week Off or Remove leave is available in the cell dialog. Week Off removes the planned shift; historical clock records remain unchanged. Assigning a work shift replaces Week Off. Week Off overrides persist and are included in validation, copying and planned-week restoration. Closed holidays cannot be replaced by Week Off or Leave.

Leave opens an explicit Sick, Vacation or Unpaid/LOP confirmation showing balances and the paid/LOP split. Only Approve & add leave commits it, removes the planned shift and updates balances, attendance and payroll. Removing leave requires confirmation, applies only to that date and restores its deducted paid balance; other dates remain approved. The five original pending requests are not approved automatically.

## Payslip worked hours and vacation-first approval

Payslip Base pay hours equal Attendance Worked hours minus Overtime for that employee and month. Base pays regular hours at 1x; Overtime is listed separately at 1.5x. Paid leave is separate. Scheduled unpaid hours (including absence) are shown before gross and deducted in full once; Gross minus total deductions equals Net, without deducting already unworked hours twice. Historical net pay remains unchanged by this presentation correction.

Request subtitles show only Sick leave or Vacation leave. Generic pending requests previously marked unpaid are reviewed as vacation requests: available vacation is used chronologically, then excess workdays become unpaid. Sick requests use sick balances. Explicit unpaid leave added by the manager retains its selected unpaid outcome. Prior approved payment outcomes are preserved. Approval deducts only paid days, shows Paid leave or Unpaid leave per date in Attendance, and removes that employee’s shifts on approved leave dates so Scheduler shows leave and staffing warnings. No request is automatically approved by this update.

# Daybreak Cafe - reconciled presentation data

## Setup

Run npm ci, npm run dev. Run npm test and npm run build to validate and produce dist. The static build works on GitHub Pages with relative asset paths.

## Reporting periods

All records are fictional. The demo reporting date is 23 November 2026, chosen for the presentation. October is complete. November attendance is available through the 23rd; later dates are explicitly Not recorded. October is the default released payslip month. November payslips are unavailable until that payroll period closes. Attendance and payslips have independent month selectors.

## One recorded roster

Every historical scheduled hour comes from the same recorded 09:00-17:00 roster displayed in Schedule. Maya works Monday-Saturday. Other staff have two weekly offs staggered across the week; Amara and Noah have weekends off. This preserves staffing on weekends. Clock records include explicit 15-minute late arrivals, absences and occasional extra hours. Clock-out never exceeds 18:00 in the recorded fixtures, including for minors. Holidays are October 2 and November 11 in this mock dataset; these have no scheduled hours. This is a demo calendar and payroll policy, not an Indian statutory payroll implementation.

Opening coverage is sampled at 09:00, lunch at 12:00 and closing at 21:00. The future draft includes assigned closing coverage.

The scheduler opens on next week, November 30-December 6. That draft deliberately includes minor/rest/staffing/weekly-hour examples. Its shift templates can differ from recorded shifts because it is a future plan. Dates through November 23 are locked; changing a future draft cannot rewrite completed attendance or October pay.

## Leave policy

Sick and vacation have separate opening balances at October 1. Approved paid leave consumes only scheduled working days from its selected balance. Unpaid leave has its own type and does not consume paid balances. Weekly offs and holidays do not count as leave days. The mock requests include paid sick leave, paid vacation and explicitly unpaid personal leave. Amara's paid request is December 2-3, both working days. Leo asks for December 2-4 against two vacation days; approval stays enabled. Clicking Approve opens a confirmation explaining that two working days will be paid and one will be Loss of Pay (LOP). Confirmation stores the paid dates on the request; only those dates consume vacation balance. Excess dates are unpaid in attendance and payroll. Paid days are allocated chronologically before LOP. Overlapping approved leave and requests with no working days remain blocked with explanations. Attendance and payroll usage covers October and November through the reporting date. The Leave tab retains the original simple Sick/Vacation balance cards. Opening balances less approved paid working days reconcile to available balances.

## Payroll and attendance

Both read the same clock records and approved leave. Attendance shows scheduled, actual and weekly overtime hours, with hours/minutes displayed instead of decimal hours. Overtime is actual work over 40 hours in a Monday-Sunday week, paid at 1.5x, including earlier days when a week crosses a month boundary. Paid leave does not count toward worked-hour overtime. Unpaid scheduled hours earn no pay; the payslip displays days, hours and the value not earned, as a zero-value explanatory line to avoid double deduction. Absences and lateness similarly do not earn worked pay. Tips are mock INR 12 per worked hour and deductions are illustrative 8% withholding. Hourly rates are INR 160-230. Holidays have no paid-hours allowance in this mock policy.

## Persistence and tests

The reconciled dataset uses a new local-storage namespace, so stale demo records cannot mix with the new fixtures. Eleven automated tests audit all eight staff, every October date and every November date through the 23rd, roster/clock agreement, leave on working days, weekly overtime boundaries, pay arithmetic and publish gating. Full real-device and screen-reader validation is separate from these data checks.

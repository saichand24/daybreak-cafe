import test from 'node:test'
import assert from 'node:assert/strict'
import * as m from './model.js'
test('every employee and every recorded day matches the roster and clock records',()=>{
 for(const p of m.staff)for(const day of m.range('2026-10-01',m.asOf)){
 const r=m.attendance(m.initialRequests,p.id,day),t=m.shiftTemplate(m.initialShifts[p.id+'|'+day],day)
 assert.equal(r.scheduled,r.status==='Leave'?m.scheduledHours(p.id,day):t?(t.end-t.start)/60:0,p.name+' '+day)
 if(r.clockIn!=null)assert.equal(r.actual,(r.clockOut-r.clockIn)/60)
 if(r.status==='Off'){assert.equal(r.actual,0);assert.equal(r.scheduled,0)}
 if(p.minor&&r.clockOut)assert.ok(r.clockOut<=1320)
 }
})
test('all approved leave days are working days and never overlap a weekly off',()=>{
 for(const r of m.initialRequests.filter(r=>r.status==='Approved')){
 assert.equal(m.requestDays(r).length,m.range(r.start,r.end).length)
 for(const day of m.requestDays(r)){assert.equal(m.attendance(m.initialRequests,r.staff,day).status,'Leave');assert.equal(m.attendance(m.initialRequests,r.staff,day).actual,0)}
 }
 const r={staff:1,start:'2026-11-20',end:'2026-11-23'};for(const day of m.requestDays(r))assert.equal(m.unavailable(1,day),false)
})
test('October is complete and November has no invented records after November 23',()=>{
 for(const p of m.staff){for(const d of m.monthDays('2026-10'))assert.notEqual(m.attendance(m.initialRequests,p.id,d).status,'Not recorded');for(const d of m.range('2026-11-24','2026-11-30'))assert.equal(m.attendance(m.initialRequests,p.id,d).status,'Not recorded')}
})
test('attendance overtime and payslip hours reconcile for every employee and month',()=>{
 for(const p of m.staff)for(const month of ['2026-10','2026-11']){
 const rows=m.monthDays(month).map(d=>m.attendance(m.initialRequests,p.id,d)),pay=m.payroll(m.initialRequests,p.id,month)
 assert.equal(pay.base+pay.overtime,rows.reduce((n,r)=>n+r.actual,0))
 assert.equal(pay.overtime,rows.reduce((n,r)=>n+r.overtime,0))
 assert.equal(pay.paidLeave,rows.filter(r=>r.status==='Leave'&&r.paid).reduce((n,r)=>n+r.scheduled,0))
 assert.equal(pay.unpaid,rows.filter(r=>r.status==='Leave'&&!r.paid).reduce((n,r)=>n+r.scheduled,0))
 assert.equal(pay.gross,(pay.base+pay.paidLeave)*pay.rate+pay.overtime*pay.rate*1.5+pay.tips)
 assert.equal(pay.net,pay.gross-pay.deductions)
 }
})
test('overtime uses actual weekly hours above 40, including prior month days',()=>{
 for(const p of m.staff)for(const start of ['2026-09-28','2026-10-05','2026-10-26','2026-11-02']){
 const rows=m.range(start,m.date(start,6)).map(d=>m.attendance(m.initialRequests,p.id,d))
 assert.equal(rows.reduce((n,r)=>n+r.overtime,0),Math.max(0,rows.reduce((n,r)=>n+r.actual,0)-40))
 }
 assert.ok(m.payroll(m.initialRequests,0,'2026-10').overtime>0)
})
test('unpaid leave reduces earnings once without consuming vacation or sick balance',()=>{
 const before=m.initialRequests.filter(r=>r.id!==201),after=m.initialRequests
 assert.equal(m.balance(before,1,'vacation'),m.balance(after,1,'vacation'))
 assert.equal(m.balance(before,1,'sick'),m.balance(after,1,'sick'))
 assert.equal(m.payroll(after,1,'2026-10').unpaid,8)
 const paid=after.map(r=>r.id===201?{...r,paid:true}:r)
 assert.equal(m.payroll(paid,1,'2026-10').gross-m.payroll(after,1,'2026-10').gross,8*m.staff[1].rate)
 assert.equal(m.payroll(after,1,'2026-10').tips,m.payroll(paid,1,'2026-10').tips)
})
test('paid vacation approval deducts only workdays and preserves base earnings',()=>{
 const r=m.initialRequests[0],approved=m.initialRequests.map(x=>x.id===1?{...x,status:'Approved'}:x)
 assert.equal(m.requestDays(r).length,2)
 assert.equal(m.balance(approved,1,'vacation'),m.balance(m.initialRequests,1,'vacation')-2)
 assert.equal(m.leaveAt(approved,1,r.start).paid,true)
 assert.equal(m.balance(m.initialRequests,2,'vacation'),2)
 assert.equal(m.requestDays(m.initialRequests[1]).length,3)
})
test('rest and minor errors block publishing; exact eight hours passes',()=>{
 m.templates.push({name:'Late example',start:900,end:1350},{name:'Early example',start:360,end:840},{name:'Eight-hour boundary',start:390,end:870})
 try{
  const issues=m.validate({'7|2026-12-05':3,'7|2026-12-06':4,'5|2026-12-05':3},[],m.week)
  assert.ok(issues.some(i=>i.label.includes('7.5 hours of rest')))
  assert.ok(issues.some(i=>i.label.includes('under 18')))
  assert.equal(m.canPublish(issues,true),false)
  assert.ok(!m.validate({'7|2026-12-05':3,'7|2026-12-06':5},[],m.week).some(i=>i.level==='Error'))
  const warnings=issues.filter(i=>i.level==='Warning');assert.equal(m.canPublish(warnings,false),false);assert.equal(m.canPublish(warnings,true),true)
 }finally{m.templates.splice(3)}
})
test('weekly-hours validation flags a manually assigned 48-hour week and respects week boundaries',()=>{
 const shifts={...m.initialShifts}
 m.range(m.week,m.date(m.week,6)).forEach((day,i)=>{if(i<6)shifts['0|'+day]=1;else delete shifts['0|'+day]})
 assert.ok(m.validate(shifts,m.initialRequests,m.week).some(i=>i.label.includes('48 hours this week')))
 assert.ok(m.validate(m.initialShifts,m.initialRequests,m.week).every(i=>i.level==='Warning'&&i.label.includes('over the 40-hour limit')))
 assert.deepEqual(m.affectedWeeks(['2026-12-06']),['2026-11-30','2026-12-07'])
})
test('excess leave is approved as paid days plus LOP without a negative balance',()=>{
 const request=m.initialRequests.find(r=>r.id===2)
 const approved=m.approveLeave(m.initialRequests,2)
 const r=approved.find(r=>r.id===2)
 assert.equal(r.status,'Approved')
 assert.deepEqual(r.paidDays,m.requestDays(request).slice(0,2))
 assert.equal(m.balance(approved,2,'vacation'),0)
 assert.equal(m.leaveAt(approved,2,m.requestDays(request)[0]).paid,true)
 assert.equal(m.leaveAt(approved,2,m.requestDays(request)[2]).paid,false)
 assert.equal(m.leaveAllocation(approved,r).lopDays.length,1)
 assert.throws(()=>m.approveLeave(approved,2),/already been reviewed/)
 const earlier=m.range('2026-11-02','2026-11-20').filter(day=>m.initialShifts['2|'+day]!=null);const emptyBalance=[...m.initialRequests,{id:501,staff:2,type:'vacation',start:earlier[0],end:earlier[1],status:'Approved',paid:true}]
 const allLop=m.approveLeave(emptyBalance,2)
 assert.equal(m.balance(allLop,2,'vacation'),0)
 assert.deepEqual(allLop.find(r=>r.id===2).paidDays,[])
 assert.equal(m.leaveAt(allLop,2,request.start).paid,false)
})
test('mixed paid and LOP days reconcile with attendance, usage and payslip',()=>{
 const request={id:502,staff:2,type:'vacation',start:'2026-10-07',end:'2026-10-11',status:'Pending',paid:true}
 const before=m.initialRequests.filter(r=>r.id!==102).concat(request)
 const approved=m.approveLeave(before,502),pay=m.payroll(approved,2,'2026-10')
 const requested=m.requestDays(request);assert.ok(requested.length>2)
 assert.equal(m.balance(approved,2,'vacation'),0)
 assert.equal(pay.paidLeave,16)
 assert.equal(pay.unpaid,(requested.length-2)*8)
 assert.equal(pay.unpaidDays,requested.length-2)
 assert.deepEqual(m.leaveSummary(approved,2,'2026-10'),{paid:2,unpaid:requested.length-2})
 assert.equal(pay.gross,(pay.base+16)*pay.rate+pay.overtime*pay.rate*1.5+pay.tips)
 const overlap=approved.concat({...request,id:503,start:requested[0],end:requested[0]})
 assert.throws(()=>m.approveLeave(overlap,503),/overlap/)
 const offDay=m.monthDays('2026-10').find(d=>m.unavailable(2,d));const off=before.concat({...request,id:504,start:offDay,end:offDay})
 assert.throws(()=>m.approveLeave(off,504),/no scheduled working days/)
})

test('all demo weeks meet coverage, weekoff, leave and rest rules with approved October overtime',()=>{
 for(let start=m.rosterStart;start<=m.week;start=m.date(start,7)){
  const issues=m.validate(m.initialShifts,m.initialRequests,start)
  assert.ok(issues.every(i=>i.level==='Warning'&&(i.label.includes('over the 40-hour limit')||(i.label.startsWith('Understaffed: Closing assignments on 2026-11')||i.label.startsWith('Understaffed: Midday assignments on 2026-11-01')))),start)
  for(const p of m.staff){
   const assignments=m.range(start,m.date(start,6)).map(day=>({day,t:m.shiftTemplate(m.initialShifts[p.id+'|'+day],day)})).filter(x=>x.t)
   assert.ok(assignments.reduce((n,x)=>n+(x.t.end-x.t.start)/60,0)<=(m.range(start,m.date(start,6)).some(d=>/2026-(10|11)/.test(d))?48:40),p.name+' '+start)
   for(const {day,t} of assignments){assert.equal(m.unavailable(p.id,day),false);assert.equal(m.leaveAt(m.initialRequests,p.id,day),undefined);assert.ok(t.start>=(day.startsWith('2026-11')?360:540));if(p.minor)assert.ok(t.end<=1320)}
  }
  for(const day of m.range(start,m.date(start,6)).filter(d=>!m.holidays.includes(d)))for(const slot of m.staffingSlotsForDay(day))for(let at=slot.start;at<slot.end;at+=30){
   const count=m.staff.filter(p=>{const t=m.shiftTemplate(m.initialShifts[p.id+'|'+day],day);return t&&t.start<=at&&t.end>at}).length
   assert.ok(count>=slot.minimum,day+' '+m.time(at))
  }
 }
})
test('past roster edits update scheduled hours without changing recorded clocks or pay',()=>{
 const day='2026-10-01',before=m.attendance(m.initialRequests,0,day),shifts={...m.initialShifts,'0|2026-10-01':2}
 const after=m.attendance(m.initialRequests,0,day,shifts)
 assert.equal(after.clockIn,before.clockIn);assert.equal(after.clockOut,before.clockOut)
 delete shifts['0|'+day]
 assert.equal(m.attendance(m.initialRequests,0,day,shifts).scheduled,0)
 assert.equal(m.attendance(m.initialRequests,0,day,shifts).actual,before.actual)
 assert.equal(m.payroll(m.initialRequests,0,'2026-10',shifts).net,m.payroll(m.initialRequests,0,'2026-10').net)
})
test('five upcoming requests remain pending, including two unpaid requests',()=>{
 const pending=m.initialRequests.filter(r=>r.status==='Pending')
 assert.equal(pending.length,5);assert.equal(pending.filter(r=>!r.paid).length,2)
 for(const r of pending)for(const d of m.requestDays(r))assert.ok(m.scheduledHours(r.staff,d)>0)
})
test('monthly hours breakdown reconciles daily rows, payroll and excluded time for every employee',()=>{
 for(const p of m.staff)for(const month of ['2026-10','2026-11']){
  const rows=m.monthDays(month).map(day=>({day,...m.attendance(m.initialRequests,p.id,day)})),totals=m.attendanceTotals(rows),pay=m.payroll(m.initialRequests,p.id,month)
  assert.equal(totals.worked,rows.reduce((n,r)=>n+r.actual,0))
  assert.equal(totals.regular+totals.overtime,totals.worked)
  assert.equal(totals.regular,pay.base);assert.equal(totals.overtime,pay.overtime)
  assert.equal(totals.paidLeave,pay.paidLeave);assert.equal(totals.unpaidLeave,pay.unpaid);assert.equal(totals.absent,pay.absent)
  assert.equal(rows.reduce((n,r)=>n+r.actual-r.overtime,0),totals.regular)
 }
 const sofia=m.monthDays('2026-11').map(day=>({day,...m.attendance(m.initialRequests,3,day)}))
 assert.equal(m.attendanceTotals(sofia).worked,135.75)
 assert.deepEqual(m.attendanceTotals([{status:'Not recorded',scheduled:8,actual:0,overtime:0}]),{worked:0,overtime:0,regular:0,paidLeave:0,unpaidLeave:0,absent:0,paidLeaveDays:0,unpaidLeaveDays:0,absentDays:0})
})

test('October has 2/2/2 weekdays, 2/3/2 weekends and a closed October 2 holiday',()=>{
 let assignments=0
 for(const day of m.monthDays('2026-10')){
  const ids=m.staff.filter(p=>m.initialShifts[p.id+'|'+day]!=null).map(p=>p.id)
  if(day==='2026-10-02'){assert.equal(ids.length,0);for(const p of m.staff)assert.equal(m.attendance(m.initialRequests,p.id,day).status,'Holiday');continue}
  const weekend=[0,6].includes(new Date(day+'T12:00:00Z').getUTCDay()),expected=[2,weekend?3:2,2]
  assert.equal(ids.length,weekend?7:6,day);assignments+=ids.length
  for(const type of [0,1,2])assert.equal(ids.filter(id=>m.initialShifts[id+'|'+day]===type).length,expected[type],day+' '+m.templates[type].name)
  for(const p of m.staff){const assigned=ids.includes(p.id),leave=m.leaveAt(m.initialRequests,p.id,day);assert.ok(assigned||leave||m.unavailable(p.id,day),p.name+' '+day);if(leave||m.unavailable(p.id,day))assert.equal(assigned,false)}
 }
 assert.equal(assignments,189)
 for(const p of m.staff){let run=0;for(const day of m.range(m.rosterStart,'2026-11-01')){run=m.initialShifts[p.id+'|'+day]!=null?run+1:0;assert.ok(run<=6,p.name+' '+day)}}
 const issues=m.validate(m.initialShifts,m.initialRequests,'2026-10-05');assert.ok(issues.length>0);assert.equal(m.canPublish(issues,false),false);assert.equal(m.canPublish(issues,true),true)
})

test('October validation requires the third weekend midday assignment and blocks holiday work',()=>{
 const weekend='2026-10-03',shifts={...m.initialShifts},id=m.staff.find(p=>shifts[p.id+'|'+weekend]===1).id
 delete shifts[id+'|'+weekend]
 assert.ok(m.validate(shifts,m.initialRequests,m.monday(weekend)).some(i=>i.label.includes('Midday assignments on '+weekend)&&i.label.includes('exactly 3 required')))
 const holiday={...m.initialShifts,'0|2026-10-02':0},issues=m.validate(holiday,m.initialRequests,m.monday('2026-10-02'))
 assert.ok(issues.some(i=>i.level==='Error'&&i.label.includes('closed for a holiday')))
 assert.equal(m.canPublish(issues,true),false)
})

test('November follows MWF 2/2/2, TueThu 2/2/1, weekends 2/3/2 and November 8 holiday',()=>{
 assert.deepEqual(m.holidays.filter(d=>d.startsWith('2026-11')),['2026-11-08']);let count=0
 for(const day of m.monthDays('2026-11')){
  const ids=m.staff.filter(p=>m.initialShifts[p.id+'|'+day]!=null).map(p=>p.id)
  if(day==='2026-11-08'){assert.equal(ids.length,0);for(const p of m.staff)assert.equal(m.attendance(m.initialRequests,p.id,day).status,'Holiday');continue}
  const weekend=[0,6].includes(new Date(day+'T12:00:00Z').getUTCDay()),expected=[2,day==='2026-11-01'?2:weekend?3:2,[2,4].includes(new Date(day+'T12:00:00Z').getUTCDay())?1:2];count+=ids.length
  for(const type of [0,1,2])assert.equal(ids.filter(id=>m.initialShifts[id+'|'+day]===type).length,expected[type],day+' '+m.templates[type].name)
  for(const p of m.staff){assert.notEqual(m.attendance(m.initialRequests,p.id,day).status,'Holiday');if(m.leaveAt(m.initialRequests,p.id,day)||m.unavailable(p.id,day))assert.equal(ids.includes(p.id),false)}
 }
 assert.equal(count,173)
 const pending=m.initialRequests.filter(r=>r.status==='Pending');assert.equal(pending.length,5);assert.equal(pending.filter(r=>!r.paid).length,2)
 for(const r of pending){assert.equal(r.requestedOn,'2026-11-22');assert.ok(r.start>='2026-11-24'&&r.end<='2026-11-30');assert.ok(m.requestDays(r).length>0);for(const d of m.requestDays(r))assert.equal(m.leaveAt(m.initialRequests,r.staff,d),undefined)}
 for(const p of m.staff){let run=0;for(const day of m.range(m.rosterStart,'2026-11-30')){run=m.initialShifts[p.id+'|'+day]!=null?run+1:0;assert.ok(run<=6,p.name+' '+day)}}
 assert.ok(m.staff.some(p=>m.payroll(m.initialRequests,p.id,'2026-11').overtime>0))
 assert.ok(m.staff.some(p=>m.payroll(m.initialRequests,p.id,'2026-11').paidLeave>0));assert.ok(m.staff.some(p=>m.payroll(m.initialRequests,p.id,'2026-11').unpaid>0))
})

test('November eight-hour templates, highlighted shortages and true blocking checks agree',()=>{
 assert.deepEqual(m.templatesForDay('2026-11-02').map(t=>[t.start,t.end]),[[360,840],[660,1140],[900,1380]])
 for(const t of m.templatesForDay('2026-11-02'))assert.equal(t.end-t.start,480)
 const shortageDays=new Set()
 for(let start='2026-10-26';start<='2026-11-30';start=m.date(start,7)){
  const issues=m.validate(m.initialShifts,m.initialRequests,start);assert.equal(issues.filter(i=>i.level==='Error').length,0)
  for(const i of issues.filter(i=>i.label.startsWith('Understaffed:'))){assert.equal(i.level,'Warning');const day=i.keys[0];if(day==='2026-11-01'){assert.ok(i.label.includes('Midday')&&i.label.includes('2/3 staff'))}else{assert.ok(i.label.includes('1/2 staff'));assert.ok([2,4].includes(new Date(day+'T12:00:00Z').getUTCDay()))}shortageDays.add(day)}
 }
 assert.equal(shortageDays.size,9)
 const issues=m.validate({'7|2026-11-10':2,'7|2026-11-11':0,'5|2026-11-10':2},[],'2026-11-09')
 assert.ok(issues.some(i=>i.level==='Error'&&i.label.includes('7 hours of rest')))
 assert.ok(issues.some(i=>i.level==='Error'&&i.label.includes('under 18')&&i.label.includes('23:00')))
 assert.equal(m.canPublish(issues,true),false)
 for(const day of m.range('2026-11-01',m.asOf))for(const p of m.staff){const r=m.attendance(m.initialRequests,p.id,day);if(r.clockOut)assert.ok(r.clockOut<=1380)}
})

test('minor 32-hour limit is a blocker above the limit and allows exactly 32 hours',()=>{
 for(const id of m.staff.filter(p=>p.minor).map(p=>p.id)){
  const dates=['2026-11-09','2026-11-10','2026-11-11','2026-11-12'],within=Object.fromEntries(dates.map(day=>[id+'|'+day,0]))
  assert.ok(!m.validate(within,[],'2026-11-09').some(i=>i.label.includes('The limit is 32 hours')))
  const over={...within,[id+'|2026-11-13']:1},issues=m.validate(over,[],'2026-11-09')
  assert.ok(issues.some(i=>i.level==='Error'&&i.label.includes('40 hours')&&i.label.includes('The limit is 32 hours')))
  assert.equal(m.canPublish(issues,true),false)
 }
})

test('November minors have at most 32 scheduled and actual weekly hours with the retained October boundary',()=>{
 for(const p of m.staff.filter(p=>p.minor)){
  assert.equal(m.initialShifts[p.id+'|2026-11-01'],undefined)
  for(let start='2026-11-02';start<=m.week;start=m.date(start,7)){
   const days=m.range(start,m.date(start,6)),hours=days.reduce((n,d)=>{const t=m.shiftTemplate(m.initialShifts[p.id+'|'+d],d);return n+(t?(t.end-t.start)/60:0)},0)
   assert.ok(hours<=32,p.name+' '+start);assert.ok(days.reduce((n,d)=>n+m.attendance(m.initialRequests,p.id,d).actual,0)<=32)
  }
  const overBoundary={...m.initialShifts,[p.id+'|2026-11-01']:0}
  assert.ok(m.validate(overBoundary,m.initialRequests,'2026-10-26').some(i=>i.level==='Error'&&i.label.includes('October carry-in')))
  const overDecember={...m.initialShifts,[p.id+'|2026-11-30']:0}
  assert.ok(m.validate(overDecember,m.initialRequests,'2026-11-30').some(i=>i.level==='Error'&&i.label.includes('The limit is 32 hours')))
 }
 assert.equal(m.range('2026-10-26','2026-10-31').filter(d=>m.initialShifts['5|'+d]!=null).length,5)
 assert.equal(m.range('2026-10-26','2026-10-31').filter(d=>m.initialShifts['6|'+d]!=null).length,4)
})
test('request modal balances use the same selected sick and vacation balances as the leave cards',()=>{
 const leo=m.initialRequests.find(r=>r.id===2),balances=m.leaveBalances(m.initialRequests,leo.staff),allocation=m.leaveAllocation(m.initialRequests,leo)
 assert.deepEqual(balances,{sick:3,vacation:2});assert.equal(allocation.available,balances.vacation)
 assert.equal(allocation.paidDays.length,2);assert.equal(allocation.lopDays.length,1)
 const sick={...leo,type:'sick'};assert.equal(m.leaveAllocation(m.initialRequests,sick).available,balances.sick)
 const approved=m.approveLeave(m.initialRequests,leo.id);assert.equal(m.leaveBalances(approved,leo.staff).vacation,0);assert.equal(m.leaveBalances(approved,leo.staff).sick,3)
})
test('approved future paid and LOP leave is visible without inventing clocks or prepaying future leave',()=>{
 const leo=m.initialRequests.find(r=>r.id===2),before=m.payroll(m.initialRequests,leo.staff,'2026-11'),approved=m.approveLeave(m.initialRequests,leo.id),days=m.requestDays(leo)
 assert.ok(days.every(d=>d>m.asOf));assert.equal(m.balance(approved,leo.staff,'vacation'),0)
 days.forEach((day,i)=>{const r=m.attendance(approved,leo.staff,day);assert.equal(r.status,'Leave');assert.equal(r.future,true);assert.equal(r.paid,i<2);assert.equal(r.actual,0);assert.equal(r.clockIn,undefined);assert.equal(r.clockOut,undefined);assert.ok(m.leaveAt(approved,leo.staff,day))})
 assert.deepEqual(m.payroll(approved,leo.staff,'2026-11'),before)
 const rows=m.monthDays('2026-11').map(day=>({day,...m.attendance(approved,leo.staff,day)}));assert.equal(m.attendanceTotals(rows).worked,before.base+before.overtime);assert.equal(m.attendanceTotals(rows).paidLeave,before.paidLeave)
 assert.ok(m.validate(m.initialShifts,approved,m.monday(leo.start)).some(i=>i.level==='Error'&&i.label.includes('approved leave')))
})
test('weekly overtime breakdown uses actual work above 40 and reconciles across month boundaries',()=>{
 for(const p of m.staff)for(const month of ['2026-10','2026-11']){
  const weeks=m.weeklyAttendanceBreakdown(m.initialRequests,p.id,month)
  assert.equal(weeks.reduce((n,w)=>n+w.monthOvertime,0),m.payroll(m.initialRequests,p.id,month).overtime)
  for(const w of weeks){assert.equal(w.rows.length,7);assert.equal(w.worked,w.rows.reduce((n,r)=>n+r.actual,0));assert.equal(w.overtime,Math.max(0,w.worked-40));assert.equal(w.regular+w.overtime,w.worked);assert.equal(w.monthOvertime,w.rows.filter(r=>r.day.startsWith(month)).reduce((n,r)=>n+r.overtime,0))}
 }
 assert.ok(m.weeklyAttendanceBreakdown(m.initialRequests,0,'2026-11')[0].rows.some(r=>r.day.startsWith('2026-10')))
})
test('payslips distinguish absence from unpaid leave and exclude both from worked earnings once',()=>{
 for(const p of m.staff)for(const month of ['2026-10','2026-11']){
  const rows=m.monthDays(month).map(d=>m.attendance(m.initialRequests,p.id,d)),pay=m.payroll(m.initialRequests,p.id,month)
  assert.equal(pay.absentDays,rows.filter(r=>r.status==='Absent').length)
  assert.equal(pay.absent,rows.filter(r=>r.status==='Absent').reduce((n,r)=>n+r.scheduled,0))
  assert.equal(pay.unpaidDays,rows.filter(r=>r.status==='Leave'&&!r.paid&&!r.future).length)
  for(const r of rows.filter(r=>r.status==='Absent'))assert.equal(r.actual,0)
  assert.equal(pay.gross,(pay.base+pay.paidLeave)*pay.rate+pay.overtime*pay.rate*1.5+pay.tips)
 }
 const amara=m.payroll(m.initialRequests,1,'2026-10');assert.ok(amara.absentDays>0&&amara.unpaidDays>0)
})

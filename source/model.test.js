import test from 'node:test'
import assert from 'node:assert/strict'
import * as m from './model.js'
test('every employee and every recorded day matches the roster and clock records',()=>{
 for(const p of m.staff)for(const day of m.range('2026-10-01',m.asOf)){
 const r=m.attendance(m.initialRequests,p.id,day),t=m.templates[m.initialShifts[p.id+'|'+day]]
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
 const r={staff:1,start:'2026-11-20',end:'2026-11-23'};assert.deepEqual(m.requestDays(r),['2026-11-20','2026-11-23'])
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
test('48-hour example is separate from the clean default and validates week boundaries',()=>{
 const shifts={...m.initialShifts}
 m.range(m.week,m.date(m.week,6)).forEach((day,i)=>{if(i<6)shifts['0|'+day]=1;else delete shifts['0|'+day]})
 assert.ok(m.validate(shifts,m.initialRequests,m.week).some(i=>i.label.includes('48 hours this week')))
 assert.equal(m.validate(m.initialShifts,m.initialRequests,m.week).length,0)
 assert.deepEqual(m.affectedWeeks(['2026-12-06']),['2026-11-30','2026-12-07'])
})
test('excess leave is approved as paid days plus LOP without a negative balance',()=>{
 const request=m.initialRequests.find(r=>r.id===2)
 const approved=m.approveLeave(m.initialRequests,2)
 const r=approved.find(r=>r.id===2)
 assert.equal(r.status,'Approved')
 assert.deepEqual(r.paidDays,['2026-12-02','2026-12-03'])
 assert.equal(m.balance(approved,2,'vacation'),0)
 assert.equal(m.leaveAt(approved,2,'2026-12-02').paid,true)
 assert.equal(m.leaveAt(approved,2,'2026-12-04').paid,false)
 assert.equal(m.leaveAllocation(approved,r).lopDays.length,1)
 assert.throws(()=>m.approveLeave(approved,2),/already been reviewed/)
 const emptyBalance=[...m.initialRequests,{id:501,staff:2,type:'vacation',start:'2026-11-04',end:'2026-11-05',status:'Approved',paid:true}]
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
  assert.ok(issues.every(i=>i.level==='Warning'&&i.label.includes('over the 40-hour limit')),start)
  for(const p of m.staff){
   const assignments=m.range(start,m.date(start,6)).map(day=>({day,t:m.templates[m.initialShifts[p.id+'|'+day]]})).filter(x=>x.t)
   assert.ok(assignments.reduce((n,x)=>n+(x.t.end-x.t.start)/60,0)<=(m.range(start,m.date(start,6)).some(d=>d.startsWith('2026-10'))?48:40),p.name+' '+start)
   for(const {day,t} of assignments){assert.equal(m.unavailable(p.id,day),false);assert.equal(m.leaveAt(m.initialRequests,p.id,day),undefined);assert.ok(t.start>=540);if(p.minor)assert.ok(t.end<=1320)}
  }
  for(const day of m.range(start,m.date(start,6)).filter(d=>!m.holidays.includes(d)))for(const slot of m.staffingSlots)for(let at=slot.start;at<slot.end;at+=30){
   const count=m.staff.filter(p=>{const t=m.templates[m.initialShifts[p.id+'|'+day]];return t&&t.start<=at&&t.end>at}).length
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
 assert.equal(m.attendanceTotals(sofia).worked,120.5)
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

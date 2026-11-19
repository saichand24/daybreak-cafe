import test from 'node:test'
import assert from 'node:assert/strict'
import * as m from './model.js'
test('every employee and every recorded day matches the roster and clock records',()=>{
 for(const p of m.staff)for(const day of m.range('2026-10-01',m.asOf)){
 const r=m.attendance(m.initialRequests,p.id,day),t=m.templates[m.initialShifts[p.id+'|'+day]]
 assert.equal(r.scheduled,t?(t.end-t.start)/60:0,p.name+' '+day)
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
 assert.ok(m.payroll(after,1,'2026-10').net<m.payroll(before,1,'2026-10').net)
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
 const shifts={'7|2026-12-05':2,'7|2026-12-06':0,'5|2026-12-05':2}
 const issues=m.validate(shifts,[],m.week)
 assert.ok(issues.some(i=>i.label.includes('7.5 hours of rest')))
 assert.ok(issues.some(i=>i.label.includes('under 18')))
 assert.equal(m.canPublish(issues,true),false)
 m.templates.push({name:'Boundary',start:390,end:870})
 try{assert.ok(!m.validate({'7|2026-12-05':2,'7|2026-12-06':4},[],m.week).some(i=>i.level==='Error'))}finally{m.templates.pop()}
 const warnings=issues.filter(i=>i.level==='Warning');assert.equal(m.canPublish(warnings,false),false);assert.equal(m.canPublish(warnings,true),true)
})
test('48-hour example and weekly boundary invalidation remain available',()=>{
 assert.ok(m.validate(m.initialShifts,m.initialRequests,m.week).some(i=>i.label.includes('48 hours this week')))
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
 assert.equal(m.requestDays(request).length,5) // Leo works Wednesday through Sunday.
 assert.equal(m.balance(approved,2,'vacation'),0)
 assert.equal(pay.paidLeave,16)
 assert.equal(pay.unpaid,24)
 assert.equal(pay.unpaidDays,3)
 assert.deepEqual(m.leaveSummary(approved,2,'2026-10'),{paid:2,unpaid:3})
 assert.equal(pay.gross,(pay.base+16)*pay.rate+pay.overtime*pay.rate*1.5+pay.tips)
 const overlap=approved.concat({...request,id:503,start:'2026-10-08',end:'2026-10-08'})
 assert.throws(()=>m.approveLeave(overlap,503),/overlap/)
 const off=before.concat({...request,id:504,start:'2026-10-12',end:'2026-10-13'})
 assert.throws(()=>m.approveLeave(off,504),/no scheduled working days/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import * as m from './model.js'
test('validation catches each seeded or deliberately arranged rule and week-boundary rest',()=>{
 const shifts={...m.initialShifts,['5|'+m.week]:2,['0|'+m.date(m.week,-1)]:2,['0|'+m.week]:0,['0|'+m.date(m.week,5)]:1}
 for(const p of m.staff) delete shifts[p.id+"|"+m.date(m.week,6)]
 const issues=m.validate(shifts,m.initialRequests,m.week)
 for(const [pattern,level] of [['past 22:00','Error'],['At least 8 hours','Error'],['is scheduled for','Warning'],['Assign 1 more staff','Warning']]){
  assert.ok(issues.some(i=>i.level===level&&i.label.includes(pattern)),pattern)
 }
})
test('unpaid approval deducts balance and changes attendance, payroll and the scheduler together',()=>{
 const r=m.initialRequests[0], initial=m.attendance(m.initialRequests,r.staff,r.start)
 const approved=m.initialRequests.map(x=>x.id===r.id?{...x,status:'Approved'}:x)
 assert.equal(initial.status,'Present')
 assert.equal(m.attendance(approved,r.staff,r.start).actual,0)
 assert.equal(m.attendance(approved,r.staff,r.start).status,'Leave')
 assert.equal(m.balance(approved,r.staff,r.type),6)
 assert.ok(m.payroll(approved,r.staff,'2026-11').net<m.payroll(m.initialRequests,r.staff,'2026-11').net)
 assert.ok(m.validate({[r.staff+'|'+r.start]:0},approved,m.week).some(x=>x.level==='Error'&&x.label.includes('approved leave')))
})
test('actual weekly hours above 40 earn time-and-a-half and totals reconcile',()=>{
 const p=m.payroll(m.initialRequests,0,'2026-11')
 assert.ok(p.overtime>0)
 const actual=m.monthDays('2026-11').reduce((n,d)=>n+m.attendance(m.initialRequests,0,d).actual,0)
 assert.equal(p.base+p.overtime,actual)
 assert.equal(p.net,p.gross-p.deductions)
 assert.equal(m.monthDays('2028-02').length,29)
})



test('weekly warning appears above 40 and clears at 40; seeded Maya has 48 hours',()=>{
 const sample=Object.fromEntries(Array.from({length:6},(_,i)=>['0|'+m.date(m.week,i),1]))
 assert.ok(m.validate(sample,[],m.week).some(i=>i.label.includes('48 hours this week, 8 hours over')))
 delete sample['0|'+m.date(m.week,5)]
 assert.ok(!m.validate(sample,[],m.week).some(i=>i.label.includes('40-hour limit')))
 assert.ok(m.validate(m.initialShifts,m.initialRequests,m.week).some(i=>i.label.includes('48 hours this week')))
})
test('rest messages name the next shift date and explain coverage',()=>{
 const shifts={'7|2026-11-14':2,'7|2026-11-15':0}
 const issues=m.validate(shifts,[],'2026-11-09')
 assert.ok(issues.some(i=>i.label.includes('7.5 hours of rest before the shift on 2026-11-15')))
 assert.ok(issues.some(i=>i.label.includes('Lunch coverage on 2026-11-14 at 12:00: 0 staff available; 3 required. Assign 3 more staff.')))
})

test('minor and rest errors block publishing even with acknowledgment; warnings require it',()=>{
 const issues=m.validate({'5|2026-11-21':2,'7|2026-11-21':2,'7|2026-11-22':0},[],'2026-11-16')
 const minor=issues.find(i=>i.keys.includes('5|2026-11-21')&&i.label.includes('under 18'))
 assert.equal(minor.level,'Error')
 assert.match(minor.label,/2026-11-21 ends at 22:30/)
 assert.match(minor.label,/Choose a shift ending by 22:00/)
 assert.equal(m.canPublish(issues,true),false)
 const warnings=issues.filter(i=>i.level==='Warning')
 assert.equal(m.canPublish(warnings),false)
 assert.equal(m.canPublish(warnings,true),true)
 assert.equal(m.canPublish([]),true)
 assert.equal(issues[0].level,'Error')
})

test('editing a Sunday or Monday invalidates both weeks checked for rest',()=>{
 assert.deepEqual(m.affectedWeeks(['2026-11-22']),['2026-11-16','2026-11-23'])
 assert.deepEqual(m.affectedWeeks(['2026-11-16']),['2026-11-09','2026-11-16'])
 assert.deepEqual(m.affectedWeeks(['2026-11-18']),['2026-11-16'])
})

test('exact minor and rest limits are allowed; approved leave excludes unavailable coverage',()=>{
 // Temporarily add exact-boundary templates, then restore the fixture.
 m.templates.push({name:'Until ten',start:900,end:1320},{name:'Eight hours rest',start:390,end:870})
 try{
  const shifts={'5|2026-11-21':3,'7|2026-11-21':2,'7|2026-11-22':4}
  assert.ok(!m.validate(shifts,[],'2026-11-16').some(i=>i.level==='Error'))
 }finally{m.templates.splice(3)}
 const requests=[{id:100,staff:0,type:'vacation',start:'2026-11-17',end:'2026-11-17',paid:false,status:'Approved'}]
 const shifts={'0|2026-11-17':1,'2|2026-11-17':1,'1|2026-11-17':1}
 assert.ok(m.validate(shifts,requests,m.week).some(i=>i.label.includes('Lunch coverage on 2026-11-17 at 12:00: 2 staff available; 3 required. Assign 1 more staff.')))
})


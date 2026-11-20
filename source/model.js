export const staff = [
 ['Maya Chen','Shift lead',23,6,10],['Amara Okafor','Barista',19,5,8],['Leo Rivera','Barista',18.5,4,2],
 ['Sofia Patel','Kitchen',21,4,7],['Noah Kim','Barista',18,5,7],['Isla Brooks','Counter',16,3,5,true],
 ['Finn Murphy','Counter',16,3,5,true],['Jules Martin','Kitchen',20,4,8]
].map(([name,role,rate,sick,vacation,minor],id)=>({id,name,role,rate:rate*10,sick,vacation,minor, unavailable:[[5,6],[5,6],[0,1],[1,2],[5,6],[2,3],[3,4],[0,1]][id]}))
const historicalTemplates=[{name:'Opening',start:540,end:1020,tone:'mint'},{name:'Midday',start:600,end:1080,tone:'blue'},{name:'Closing',start:780,end:1260,tone:'peach'}]
export const templates=[{name:'Opening',start:360,end:840,tone:'mint'},{name:'Midday',start:660,end:1140,tone:'blue'},{name:'Closing',start:900,end:1380,tone:'peach'}]
export const templatesForDay=day=>day.startsWith('2026-11')?templates:[...historicalTemplates,...templates.slice(3)]
export const shiftTemplate=(type,day)=>templatesForDay(day)[type]
export const novemberPlannedTargets=day=>holidays.includes(day)?[0,0,0]:day==='2026-11-01'?[2,2,2]:[2,[0,6].includes(new Date(day+'T12:00:00Z').getUTCDay())?3:2,[2,4].includes(new Date(day+'T12:00:00Z').getUTCDay())?1:2]
export const requiredShiftTargets=day=>/2026-(10|11)/.test(day)?octoberShiftTargets(day):null
export const staffingSlotsForDay=day=>day.startsWith('2026-11')?[{name:'Opening',start:360,end:660,minimum:2},{name:'Morning',start:660,end:840,minimum:4},{name:'Midday',start:840,end:900,minimum:2},{name:'Evening',start:900,end:1140,minimum:3},{name:'Closing',start:1140,end:1380,minimum:1}]:staffingSlots
export const staffingSlots=[{name:'Opening',start:540,end:660,minimum:1},{name:'Lunch',start:660,end:900,minimum:3},{name:'Afternoon',start:900,end:1020,minimum:2},{name:'Evening',start:1020,end:1260,minimum:1}]
export const date=(iso,offset=0)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)}
export const monday=iso=>date(iso,-((new Date(iso+'T12:00:00Z').getUTCDay()+6)%7))
export const todayInCafe=(now=new Date())=>{
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now)
 const value=type=>parts.find(part=>part.type===type).value
 return value('year')+'-'+value('month')+'-'+value('day')
}
export const nextUnpublishedWeek=(today,published={})=>{
 let next=date(monday(today),7)
 while(published[next])next=date(next,7)
 return next
}
export const asOf='2026-11-23'
export const week='2026-11-30'
export const holidays=['2026-10-02','2026-11-08']
export const rosterStart='2026-09-28'
export const rosterShift=(id,day)=>{
 if(day<rosterStart||holidays.includes(day))return null
 if(day.startsWith('2026-10'))return octoberPlan[id+'|'+day]??(fixtureLeave(initialRequests,id,day)?0:null)
 if(day.startsWith('2026-11'))return novemberPlan[id+'|'+day]??(fixtureLeave(initialRequests,id,day)?0:null)
 return staff[id].unavailable.includes((new Date(day+'T12:00:00Z').getUTCDay()+6)%7)?null:0
}
export const scheduledHours=(id,day)=>rosterShift(id,day)==null?0:8
export const range=(start,end)=>{const result=[];for(let day=start;day<=end;day=date(day,1)) result.push(day);return result}
export const time=m=>m==null?'—':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')
export const initialRequests=[
 {id:1,staff:1,type:'vacation',start:'2026-12-02',end:'2026-12-03',reason:'Family visit',status:'Pending',paid:true},
 {id:2,staff:2,type:'vacation',start:'2026-12-02',end:'2026-12-04',reason:'Travel',status:'Pending',paid:true},
 {id:3,staff:4,type:'sick',start:'2026-12-01',end:'2026-12-01',reason:'Medical appointment',status:'Pending',paid:true},
 {id:4,staff:3,type:'unpaid',start:'2026-12-03',end:'2026-12-03',reason:'Personal appointment',status:'Pending',paid:false},
 {id:5,staff:7,type:'unpaid',start:'2026-12-04',end:'2026-12-04',reason:'Personal commitment',status:'Pending',paid:false},
 ...staff.map(p=>{const day=['2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-10','2026-10-11','2026-10-14'][p.id];return {id:100+p.id,staff:p.id,type:'sick',start:day,end:day,reason:'Approved sick leave',status:'Approved',paid:true}}),
 ...[1,3,7].map(id=>({id:200+id,staff:id,type:'unpaid',start:({1:'2026-10-15',3:'2026-10-16',7:'2026-10-17'})[id],end:({1:'2026-10-15',3:'2026-10-16',7:'2026-10-17'})[id],reason:'Personal leave without pay',status:'Approved',paid:false})),
 ...[0,4].map(id=>({id:300+id,staff:id,type:'vacation',start:id===0?'2026-10-20':'2026-10-22',end:id===0?'2026-10-20':'2026-10-22',reason:'Approved vacation',status:'Approved',paid:true})),
 {id:400,staff:1,type:'vacation',start:'2026-11-18',end:'2026-11-19',reason:'Approved paid vacation',status:'Approved',paid:true},
 {id:401,staff:3,type:'unpaid',start:'2026-11-05',end:'2026-11-05',reason:'Approved unpaid personal leave',status:'Approved',paid:false}
]
export const octoberShiftTargets=day=>holidays.includes(day)?[0,0,0]:[2,[0,6].includes(new Date(day+'T12:00:00Z').getUTCDay())?3:2,2]
// October: 2/2/2 on weekdays, 2/3/2 on weekends; approved leave and rest remain respected.
const fixtureLeave=(requests,id,day)=>requests.some(r=>r.staff===id&&r.status==='Approved'&&r.start<=day&&day<=r.end)
const normalOff=(id,day)=>staff[id].unavailable.includes((new Date(day+'T12:00:00Z').getUTCDay()+6)%7)
function makeOctoberRoster(requests){
 const days=range('2026-10-01','2026-10-31'),selectedByDay={},monthly=Array(8).fill(0),weeks={}
 const outsideFor=start=>staff.map(p=>range(start,date(start,6)).filter(d=>!d.startsWith('2026-10')&&!holidays.includes(d)&&!normalOff(p.id,d)&&!fixtureLeave(requests,p.id,d)).length)
 let runs=staff.map(p=>{let n=0;for(let d='2026-09-30';d>=rosterStart;d=date(d,-1)){if(normalOff(p.id,d)||fixtureLeave(requests,p.id,d)||holidays.includes(d))break;n++}return n}),nodes=0
 function solve(index){
  if(++nodes>500000)throw new Error('October planner exceeded search limit')
  if(index===days.length){return staff.every(p=>!(!normalOff(p.id,'2026-11-01')&&!fixtureLeave(requests,p.id,'2026-11-01')&&runs[p.id]>=6))}
  const day=days[index],start=monday(day),counts=weeks[start]??(weeks[start]=outsideFor(start)),previousRuns=[...runs]
  if(holidays.includes(day)){runs=Array(8).fill(0);selectedByDay[day]=[];if(solve(index+1))return true;runs=previousRuns;return false}
  const forced=staff.filter(p=>fixtureLeave(requests,p.id,day)||runs[p.id]>=6||counts[p.id]>=6).map(p=>p.id)
  const restCount=8-octoberShiftTargets(day).reduce((n,v)=>n+v,0)
  if(forced.length>restCount)return false
  const pairs=[]
  const addOff=off=>{if(forced.some(id=>!off.includes(id)))return;const score=off.reduce((n,id)=>n+runs[id]*100+counts[id]*20+monthly[id]*5+(normalOff(id,day)?12:0),0);pairs.push({off,score})}
  for(let x=0;x<8;x++){if(restCount===1)addOff([x]);else for(let y=x+1;y<8;y++)addOff([x,y])}
  pairs.sort((a,b)=>b.score-a.score||a.off[0]-b.off[0]||(a.off[1]??0)-(b.off[1]??0))
  for(const {off}of pairs){const working=staff.filter(p=>!off.includes(p.id)).map(p=>p.id);for(const id of working){counts[id]++;monthly[id]++}runs=staff.map(p=>off.includes(p.id)?0:previousRuns[p.id]+1);selectedByDay[day]=working
   if(solve(index+1))return true
   for(const id of working){counts[id]--;monthly[id]--}runs=previousRuns
  }
  return false
 }
 if(!solve(0))throw new Error('Cannot arrange October with weekday/weekend staffing, leave and rest days')
 const plan={},slotCounts=staff.map(()=>[0,0,0])
 for(const day of days){const selected=selectedByDay[day].map(id=>staff[id]);if(!selected.length)continue
  const closing=selected.filter(p=>!p.minor).sort((a,b)=>slotCounts[a.id][2]-slotCounts[b.id][2]||a.id-b.id).slice(0,2)
  const rest=selected.filter(p=>!closing.includes(p)),opening=rest.sort((a,b)=>Number(b.minor)-Number(a.minor)||slotCounts[a.id][0]-slotCounts[b.id][0]||a.id-b.id).slice(0,2)
  for(const p of selected){const type=closing.includes(p)?2:opening.includes(p)?0:1;plan[p.id+'|'+day]=type;slotCounts[p.id][type]++}
 }
 return plan
}
export const octoberPlan=makeOctoberRoster(initialRequests)
function makeNovemberRoster(requests){
 const days=range('2026-11-01','2026-11-30'),selectedByDay={},monthly=Array(8).fill(0),weeks={},failed=new Set()
 const outsideFor=start=>staff.map(p=>range(start,date(start,6)).filter(d=>!d.startsWith('2026-11')&&!holidays.includes(d)&&(d.startsWith('2026-10')?octoberPlan[p.id+'|'+d]!=null:!normalOff(p.id,d)&&!fixtureLeave(requests,p.id,d))).length)
 let runs=staff.map(p=>{let n=0;for(let d='2026-10-31';d>='2026-10-01';d=date(d,-1)){if(octoberPlan[p.id+'|'+d]==null)break;n++}return n}),nodes=0
 function solve(index){
  if(++nodes>2000000)throw new Error('November planner exceeded search limit')
  if(index===days.length)return true
  const day=days[index],start=monday(day),counts=weeks[start]??(weeks[start]=outsideFor(start)),previousRuns=[...runs]
  const state=index+'|'+runs.join(',')+'|'+counts.join(',');if(failed.has(state))return false
  const future=days.slice(index).filter(d=>monday(d)===start&&!holidays.includes(d)),need=future.reduce((sum,d)=>sum+novemberPlannedTargets(d).reduce((a,b)=>a+b,0),0)
  const capacity=staff.map(p=>Math.min(Math.max(0,(p.minor?4:6)-counts[p.id]),future.filter(d=>!fixtureLeave(requests,p.id,d)).length))
  if(capacity.reduce((a,b)=>a+b,0)<need){failed.add(state);return false}
  const minorNeed=future.reduce((sum,d)=>sum+Math.max(0,novemberPlannedTargets(d).reduce((a,b)=>a+b,0)-staff.filter(p=>!p.minor&&capacity[p.id]>0&&!fixtureLeave(requests,p.id,d)).length),0)
  if(staff.filter(p=>p.minor).reduce((sum,p)=>sum+capacity[p.id],0)<minorNeed){failed.add(state);return false}
  if(holidays.includes(day)){runs=Array(8).fill(0);selectedByDay[day]=[];if(solve(index+1))return true;runs=previousRuns;return false}
  const forced=staff.filter(p=>fixtureLeave(requests,p.id,day)||runs[p.id]>=6||counts[p.id]>=(p.minor?4:6)).map(p=>p.id)
  const restCount=8-novemberPlannedTargets(day).reduce((n,v)=>n+v,0)
  if(forced.length>restCount){failed.add(state);return false}
  const pairs=[]
  const addOff=off=>{if(forced.some(id=>!off.includes(id)))return;const score=off.reduce((n,id)=>n+runs[id]*100+counts[id]*20+monthly[id]*5+(normalOff(id,day)?12:0),0);pairs.push({off,score})}
  const choose=(next,off)=>{if(off.length===restCount){addOff(off);return}for(let id=next;id<8;id++)choose(id+1,[...off,id])};choose(0,[])
  pairs.sort((a,b)=>b.score-a.score||a.off[0]-b.off[0]||(a.off[1]??0)-(b.off[1]??0))
  for(const {off}of pairs){const working=staff.filter(p=>!off.includes(p.id)).map(p=>p.id);for(const id of working){counts[id]++;monthly[id]++}runs=staff.map(p=>off.includes(p.id)?0:previousRuns[p.id]+1);selectedByDay[day]=working
   if(solve(index+1))return true
   for(const id of working){counts[id]--;monthly[id]--}runs=previousRuns
  }
  failed.add(state);return false
 }
 if(!solve(0))throw new Error('Cannot arrange November with weekday/weekend staffing, leave and rest days')
 const plan={},slotCounts=staff.map(()=>[0,0,0]);let previousClosing=[]
 for(const day of days){const selected=selectedByDay[day].map(id=>staff[id]);if(!selected.length){previousClosing=[];continue}
  const targets=novemberPlannedTargets(day),closing=selected.filter(p=>!p.minor).sort((a,b)=>Number(previousClosing.includes(b.id))-Number(previousClosing.includes(a.id))||slotCounts[a.id][2]-slotCounts[b.id][2]||a.id-b.id).slice(0,targets[2])
  const opening=selected.filter(p=>!closing.includes(p)&&!previousClosing.includes(p.id)).sort((a,b)=>Number(b.minor)-Number(a.minor)||slotCounts[a.id][0]-slotCounts[b.id][0]||a.id-b.id).slice(0,2)
  if(closing.length!==targets[2]||opening.length!==2)throw new Error('Cannot allocate safe eight-hour shifts on '+day)
  for(const p of selected){const type=closing.includes(p)?2:opening.includes(p)?0:1;plan[p.id+'|'+day]=type;slotCounts[p.id][type]++}
  previousClosing=closing.map(p=>p.id)
 }
 return plan
}
export const novemberPlan=makeNovemberRoster(initialRequests)
// Pending requests are submitted November 22 and span only rostered workdays in November.
for(const r of initialRequests.filter(r=>r.status==='Pending')){
 const count=r.id===1?2:r.id===2?3:1,days=range('2026-11-24','2026-11-30').filter(day=>novemberPlan[r.staff+'|'+day]!=null)
 if(days.length<count)throw new Error('Not enough November workdays for pending request '+r.id)
 r.start=days[0];r.end=days[count-1];r.requestedOn='2026-11-22'
}

export const requestDays=r=>r.days??range(r.start,r.end).filter(day=>scheduledHours(r.staff,day)>0)
export const requestForApproval=r=>r.status==='Pending'&&r.type==='unpaid'&&!r.forceUnpaid?{...r,type:'vacation',paid:true}:r
export const leaveAllocation=(requests,r)=>{
 r=requestForApproval(r)
 const days=requestDays(r),available=r.type==='unpaid'||!r.paid?0:Math.max(0,leaveBalances(requests,r.staff)[r.type])
 const paidDays=r.status==='Approved'?(r.paidDays??(r.paid?days:[])):days.slice(0,available)
 return {days,available,paidDays,lopDays:days.filter(day=>!paidDays.includes(day))}
}
export function approveLeave(requests,id){
 const stored=requests.find(item=>item.id===id),r=stored&&requestForApproval(stored)
 if(!r||r.status!=='Pending')throw new Error('This request has already been reviewed.')
 const allocation=leaveAllocation(requests,r)
 if(!allocation.days.length)throw new Error('This request has no scheduled working days.')
 if(allocation.days.some(day=>leaveAt(requests,r.staff,day)))throw new Error('These dates overlap approved leave.')
 return requests.map(item=>item.id===id?{...r,status:'Approved',paid:allocation.paidDays.length>0,paidDays:allocation.paidDays}:item)
}
export const leaveAt=(requests,id,day)=>{const r=requests.find(r=>r.staff===id&&r.status==='Approved'&&requestDays(r).includes(day));return r?{...r,paid:r.paidDays?r.paidDays.includes(day):r.paid}:undefined}
export const balance=(requests,id,type)=>type==='unpaid'?Infinity:staff[id][type]-requests.filter(r=>r.staff===id&&r.type===type&&r.status==='Approved'&&r.paid).reduce((n,r)=>n+(r.paidDays??requestDays(r)).length,0)
export const unavailable=(id,day,weekOffs={})=>weekOffs[id+'|'+day]??(/2026-(10|11)/.test(day)?!holidays.includes(day)&&(day.startsWith('2026-10')?octoberPlan:novemberPlan)[id+'|'+day]==null&&!fixtureLeave(initialRequests,id,day):normalOff(id,day))
export const leaveSummary=(requests,id,month)=>monthDays(month).filter(day=>day<=asOf).reduce((sum,day)=>{const r=leaveAt(requests,id,day);if(r)sum[r.paid?'paid':'unpaid']++;return sum},{paid:0,unpaid:0})
// One clean rota for all demo weeks. Time off is not an assigned shift.
export function buildRoster(requests,start=rosterStart,end=date(week,6),weekOffs={}){
 const shifts={}
 for(const day of range(start,end)){
  if(/2026-(10|11)/.test(day)){for(const p of staff){const type=(day.startsWith('2026-10')?octoberPlan:novemberPlan)[p.id+'|'+day];if(!unavailable(p.id,day,weekOffs)&&!leaveAt(requests,p.id,day)&&(type!=null||weekOffs[p.id+'|'+day]===false))shifts[p.id+'|'+day]=type??0}continue}
  const available=staff.filter(p=>!unavailable(p.id,day,weekOffs)&&!leaveAt(requests,p.id,day))
  if(!available.length)continue
  const preferred=[4,2,7,3,1,0].find(id=>available.some(p=>p.id===id))
  for(const p of available)shifts[p.id+'|'+day]=p.id===preferred?2:p.id===1&&available.length>=5?1:0
 }
 return shifts
}
export const initialShifts=buildRoster(initialRequests)
// The brief does not prescribe severity. These are explicit prototype policies.
export const rulePolicy={
 minorWeekly:{level:'Error',guidance:'Under-18 employees may be scheduled for at most 32 hours per week.'},
 minor:{level:'Error',guidance:'Under-18 shifts must end by 22:00.'},
 rest:{level:'Error',guidance:'Allow at least 8 hours between shifts.'},
 leave:{level:'Error',guidance:'Remove or reassign shifts during approved leave.'},
 weekly:{level:'Warning',guidance:'Review weekly hours above 40.'},
 coverage:{level:'Warning',guidance:'Review staffing below the required level.'},
 availability:{level:'Warning',guidance:'Review assignments during weekoffs.'}
}
export const canPublish=(issues,acknowledged=false)=>!issues.some(i=>i.level==='Error')&&(!issues.some(i=>i.level==='Warning')||acknowledged)
// Rest checks span week boundaries, so edits can invalidate adjacent published weeks.
export const affectedWeeks=days=>[...new Set(days.flatMap(day=>[-1,0,1].map(offset=>monday(date(day,offset)))))]
export function validate(shifts,requests,start,weekOffs={}){
 const days=range(start,date(start,6)), issues=[]
 const add=(level,label,keys=[])=>issues.push({level,label,keys})
 for(const person of staff){
  let total=0
  for(const day of days){
   const key=person.id+'|'+day, t=shiftTemplate(shifts[key],day)
   if(!t)continue
   total+=(t.end-t.start)/60
   if(holidays.includes(day))add('Error','The cafe is closed for a holiday on '+day+'. Remove this shift.',[key])
   if(person.minor&&t.end>1320)add(rulePolicy.minor.level,person.name+' is under 18. The shift on '+day+' ends at '+time(t.end)+', past 22:00. Choose a shift ending by 22:00.',[key])
   if(leaveAt(requests,person.id,day))add(rulePolicy.leave.level,person.name+' has approved leave on '+day+'. Remove or reassign this shift.',[key])
   if(unavailable(person.id,day,weekOffs))add(rulePolicy.availability.level,person.name+' has a Week Off on '+day+'. Reassign the shift or confirm availability.',[key])
   for(const offset of [-1,1]){
    if(offset===1&&day!==days[6])continue
    const adjacent=person.id+'|'+date(day,offset), other=shiftTemplate(shifts[adjacent],date(day,offset))
    if(other){
     const previousDay=offset===1?day:date(day,-1)
     const nextDay=date(previousDay,1)
     const previousShift=offset===1?t:other, nextShift=offset===1?other:t
     const rest=(1440-previousShift.end+nextShift.start)/60
     if(rest<8)add(rulePolicy.rest.level,person.name+' has only '+rest+' hours of rest before the shift on '+nextDay+' (previous shift ends '+previousDay+' at '+time(previousShift.end)+', next shift starts '+nextDay+' at '+time(nextShift.start)+'). At least 8 hours are required. Choose a later start or an earlier previous shift.',[person.id+'|'+nextDay,person.id+'|'+previousDay])
    }
   }
  }
  if(person.minor&&days.some(d=>d.startsWith('2026-11'))){
   const carry=days.filter(d=>d<'2026-11-01').reduce((n,d)=>{const t=shiftTemplate(shifts[person.id+'|'+d],d);return n+(t?(t.end-t.start)/60:0)},0),ceiling=Math.max(32,carry)
   if(total>ceiling)add(rulePolicy.minorWeekly.level,person.name+' is under 18 and is scheduled for '+total+' hours in the week starting '+start+'. The limit is 32 hours; remove '+(total-ceiling)+' hours before publishing.'+(carry?' Existing October carry-in is '+carry+' hours; November cannot add work beyond the remaining allowance.':''),days.filter(d=>d>='2026-11-01').map(d=>person.id+'|'+d).filter(k=>shifts[k]!=null))
  }
  if(total>40)add(rulePolicy.weekly.level,person.name+' is scheduled for '+total+' hours this week, '+(total-40)+' hours over the 40-hour limit. Reduce the hours or acknowledge this warning when publishing.',days.map(d=>person.id+'|'+d).filter(k=>shifts[k]!=null))
 }
 for(const day of days){
  if(holidays.includes(day))continue
  if(/2026-(10|11)/.test(day))templates.slice(0,3).forEach((t,type)=>{const count=staff.filter(p=>shifts[p.id+'|'+day]===type&&!leaveAt(requests,p.id,day)&&!unavailable(p.id,day,weekOffs)).length;const required=octoberShiftTargets(day)[type];if(count!==required)add(rulePolicy.coverage.level,(count<required?'Understaffed: ':'')+t.name+' assignments on '+day+': '+count+'/'+required+' staff; exactly '+required+' required.'+(count<required?' Assign '+(required-count)+' more staff.':''),[day])})
  for(const slot of staffingSlotsForDay(day)){
   for(let at=slot.start;at<slot.end;at+=30){
    const count=staff.filter(p=>{const t=shiftTemplate(shifts[p.id+'|'+day],day);return t&&t.start<=at&&at<t.end&&!leaveAt(requests,p.id,day)&&!unavailable(p.id,day)}).length
    if(count<slot.minimum){add(rulePolicy.coverage.level,slot.name+' coverage on '+day+' at '+time(at)+': '+count+' staff available; '+slot.minimum+' required. Assign '+(slot.minimum-count)+' more staff.',[day]);break}
   }
  }
 }
 return issues.sort((a,b)=>(a.level==='Error'?0:1)-(b.level==='Error'?0:1))
}
function rawAttendance(requests,id,day,shifts=initialShifts,weekOffs={}){
 const assigned=shiftTemplate(shifts[id+'|'+day],day),leave=leaveAt(requests,id,day)
 const scheduled=leave?(leave.hoursByDay?.[day]??scheduledHours(id,day)):assigned?(assigned.end-assigned.start)/60:0
 if(day<rosterStart)return {status:'Not recorded',scheduled,actual:0}
 if(holidays.includes(day))return {status:'Holiday',scheduled:0,actual:0}
 if(leave)return {status:'Leave',scheduled,actual:0,paid:leave.paid,type:leave.type,future:day>asOf}
 if(day>asOf)return weekOffs[id+'|'+day]===true?{status:'Off',scheduled:0,actual:0,future:true}:{status:'Not recorded',scheduled,actual:0}
 const recorded=shiftTemplate(initialShifts[id+'|'+day],day)
 if(!recorded)return {status:scheduled?'Absent':'Off',scheduled,actual:0}
 const n=Number(day.slice(-2)),late=(n+id)%11===0
 if((n+id*3)%23===0)return {status:'Absent',scheduled,actual:0}
 const clockIn=recorded.start+(late?15:0),clockOut=Math.min(day.startsWith('2026-11')?1380:1440,recorded.end+((n+id)%13===0&&!(staff[id].minor&&day.startsWith('2026-11'))?60:0))
 return {status:late?'Late':'Present',scheduled,actual:(clockOut-clockIn)/60,clockIn,clockOut}
}
export function attendance(requests,id,day,shifts=initialShifts,weekOffs={}){
 const r=rawAttendance(requests,id,day,shifts,weekOffs),previous=date(day,-1)
 const prior=previous<monday(day)?0:range(monday(day),previous).reduce((n,d)=>n+rawAttendance(requests,id,d,shifts,weekOffs).actual,0)
 return {...r,overtime:Math.max(0,prior+r.actual-40)-Math.max(0,prior-40)}
}
export const monthDays=month=>range(month+'-01',date(month+'-01',32).slice(0,7)+'-01').filter(d=>d.startsWith(month))
export function payroll(requests,id,month,shifts=initialShifts,weekOffs={}){
 let base=0,overtime=0,paidLeave=0,unpaid=0,scheduled=0,absent=0,paidLeaveDays=0,unpaidDays=0,absentDays=0
 for(const day of monthDays(month)){
  const record=attendance(requests,id,day,shifts,weekOffs)
  if(day<=asOf){scheduled+=record.scheduled;if(record.status==='Absent'){absent+=record.scheduled;absentDays++}}
  const previous=date(day,-1)
  const prior=previous< monday(day)?0:range(monday(day),previous).reduce((n,d)=>n+attendance(requests,id,d,shifts,weekOffs).actual,0)
  const regular=Math.min(record.actual,Math.max(0,40-prior))
  base+=regular
  overtime+=record.actual-regular
  if(record.status==='Leave'&&day<=asOf){if(record.paid){paidLeave+=record.scheduled;paidLeaveDays++}else{unpaid+=record.scheduled;unpaidDays++}}
 }
 const rate=staff[id].rate,tips=(base+overtime)*12,earnedGross=(base+paidLeave)*rate+overtime*rate*1.5+tips
 const worked=base+overtime,basePay=base*rate,overtimePay=overtime*rate*1.5,totalUnpaid=unpaid+absent,totalUnpaidDays=unpaidDays+absentDays
 const unpaidDeduction=totalUnpaid*rate,withholding=Math.round(earnedGross*8)/100,gross=earnedGross+unpaidDeduction,deductions=withholding+unpaidDeduction
 return {base,worked,basePay,overtime,overtimePay,paidLeave,paidLeaveDays,unpaid,unpaidDays,totalUnpaid,totalUnpaidDays,scheduled,absent,absentDays,rate,tips,earnedGross,unpaidDeduction,withholding,gross,deductions,net:Math.round((gross-deductions)*100)/100}
}


export function attendanceTotals(records){
 const rows=records.filter(r=>r.status!=='Not recorded'&&!r.future&&(!r.day||r.day<=asOf))
 const sum=(filter,field)=>rows.filter(filter).reduce((n,r)=>n+Math.round((r[field]||0)*60),0)/60
 const worked=sum(()=>true,'actual'),overtime=sum(()=>true,'overtime')
 return {worked,overtime,regular:worked-overtime,paidLeave:sum(r=>r.status==='Leave'&&r.paid,'scheduled'),unpaidLeave:sum(r=>r.status==='Leave'&&!r.paid,'scheduled'),absent:sum(r=>r.status==='Absent','scheduled'),paidLeaveDays:rows.filter(r=>r.status==='Leave'&&r.paid).length,unpaidLeaveDays:rows.filter(r=>r.status==='Leave'&&!r.paid).length,absentDays:rows.filter(r=>r.status==='Absent').length}
}

export const leaveBalances=(requests,id)=>({sick:balance(requests,id,'sick'),vacation:balance(requests,id,'vacation')})
export function weeklyAttendanceBreakdown(requests,id,month,shifts=initialShifts,weekOffs={}){
 const starts=[...new Set(monthDays(month).map(monday))]
 return starts.map(start=>{
  const end=date(start,6),rows=range(start,end).map(day=>({day,...attendance(requests,id,day,shifts)})),worked=rows.reduce((n,r)=>n+r.actual,0),overtime=Math.max(0,worked-40),monthOvertime=rows.filter(r=>r.day.startsWith(month)).reduce((n,r)=>n+r.overtime,0)
  return {start,end,rows,worked,regular:Math.min(worked,40),overtime,monthOvertime,hasRecords:rows.some(r=>r.day<=asOf&&r.status!=='Not recorded'),partial:end>asOf}
 })
}

export function removeLeaveDay(requests,id,day){
 return requests.flatMap(r=>{
  if(r.staff!==id||r.status!=='Approved'||!requestDays(r).includes(day))return [r]
  const days=requestDays(r).filter(d=>d!==day)
  return days.length?[{...r,days,start:days[0],end:days.at(-1),paidDays:(r.paidDays??(r.paid?requestDays(r):[])).filter(d=>d!==day)}]:[]
 })
}
export function scheduleLeaveDraft(requests,id,day,type,shifts=initialShifts){
 if(holidays.includes(day))throw new Error('The cafe is closed for a holiday on this date.')
 if(leaveAt(requests,id,day))throw new Error('Remove the existing leave before adding another leave.')
 if(!['sick','vacation','unpaid'].includes(type))throw new Error('Choose Sick, Vacation or Unpaid leave.')
 const shift=shiftTemplate(shifts[id+'|'+day],day)
 return {id:Math.max(1000,...requests.map(r=>r.id))+1,staff:id,type,start:day,end:day,days:[day],hoursByDay:{[day]:shift?(shift.end-shift.start)/60:8},reason:'Manager scheduled leave',requestedOn:todayInCafe(),status:'Pending',paid:type!=='unpaid',forceUnpaid:type==='unpaid'}
}

export const leaveRequestLabel=r=>r.type==='sick'?'Sick leave':'Vacation leave'

export const staff = [
 ['Maya Chen','Shift lead',23,6,10],['Amara Okafor','Barista',19,5,8],['Leo Rivera','Barista',18.5,4,2],
 ['Sofia Patel','Kitchen',21,4,7],['Noah Kim','Barista',18,5,7],['Isla Brooks','Counter',16,3,5,true],
 ['Finn Murphy','Counter',16,3,5,true],['Jules Martin','Kitchen',20,4,8]
].map(([name,role,rate,sick,vacation,minor],id)=>({id,name,role,rate:rate*10,sick,vacation,minor, unavailable:[[5,6],[5,6],[0,1],[1,2],[5,6],[2,3],[3,4],[0,1]][id]}))
export const templates=[{name:'Opening',start:540,end:1020,tone:'mint'},{name:'Midday',start:600,end:1080,tone:'blue'},{name:'Closing',start:780,end:1260,tone:'peach'}]
export const staffingSlots=[{name:'Opening',start:540,end:660,minimum:1},{name:'Lunch',start:660,end:900,minimum:3},{name:'Afternoon',start:900,end:1020,minimum:2},{name:'Evening',start:1020,end:1260,minimum:1}]
export const date=(iso,offset=0)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)}
export const monday=iso=>date(iso,-((new Date(iso+'T12:00:00Z').getUTCDay()+6)%7))
export const asOf='2026-11-23'
export const week='2026-11-30'
export const holidays=['2026-10-02','2026-11-11']
export const rosterStart='2026-09-28'
export const rosterShift=(id,day)=>day<rosterStart||holidays.includes(day)||staff[id].unavailable.includes((new Date(day+'T12:00:00Z').getUTCDay()+6)%7)?null:0
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
export const requestDays=r=>range(r.start,r.end).filter(day=>scheduledHours(r.staff,day)>0)
export const leaveAllocation=(requests,r)=>{
 const days=requestDays(r),available=r.type==='unpaid'||!r.paid?0:Math.max(0,balance(requests,r.staff,r.type))
 const paidDays=r.status==='Approved'?(r.paidDays??(r.paid?days:[])):days.slice(0,available)
 return {days,available,paidDays,lopDays:days.filter(day=>!paidDays.includes(day))}
}
export function approveLeave(requests,id){
 const r=requests.find(item=>item.id===id)
 if(!r||r.status!=='Pending')throw new Error('This request has already been reviewed.')
 const allocation=leaveAllocation(requests,r)
 if(!allocation.days.length)throw new Error('This request has no scheduled working days.')
 if(allocation.days.some(day=>leaveAt(requests,r.staff,day)))throw new Error('These dates overlap approved leave.')
 return requests.map(item=>item.id===id?{...item,status:'Approved',paid:allocation.paidDays.length>0,paidDays:allocation.paidDays}:item)
}
export const leaveAt=(requests,id,day)=>scheduledHours(id,day)>0?(()=>{const r=requests.find(r=>r.staff===id&&r.status==='Approved'&&r.start<=day&&day<=r.end);return r?{...r,paid:r.paidDays?r.paidDays.includes(day):r.paid}:undefined})():undefined
export const balance=(requests,id,type)=>type==='unpaid'?Infinity:staff[id][type]-requests.filter(r=>r.staff===id&&r.type===type&&r.status==='Approved'&&r.paid).reduce((n,r)=>n+(r.paidDays??requestDays(r)).length,0)
export const unavailable=(id,day)=>staff[id].unavailable.includes((new Date(day+'T12:00:00Z').getUTCDay()+6)%7)
export const leaveSummary=(requests,id,month)=>monthDays(month).filter(day=>day<=asOf).reduce((sum,day)=>{const r=leaveAt(requests,id,day);if(r)sum[r.paid?'paid':'unpaid']++;return sum},{paid:0,unpaid:0})
// One clean rota for all demo weeks. Time off is not an assigned shift.
export function buildRoster(requests,start=rosterStart,end=date(week,6)){
 const shifts={}
 for(const day of range(start,end)){
  const available=staff.filter(p=>scheduledHours(p.id,day)>0&&!leaveAt(requests,p.id,day))
  if(!available.length)continue
  const preferred=[4,2,7,3,1,0].find(id=>available.some(p=>p.id===id))
  for(const p of available)shifts[p.id+'|'+day]=p.id===preferred?2:p.id===1&&available.length>=5?1:0
 }
 return shifts
}
export const initialShifts=buildRoster(initialRequests)
// The brief does not prescribe severity. These are explicit prototype policies.
export const rulePolicy={
 minor:{level:'Error',guidance:'Under-18 shifts must end by 22:00.'},
 rest:{level:'Error',guidance:'Allow at least 8 hours between shifts.'},
 leave:{level:'Error',guidance:'Remove or reassign shifts during approved leave.'},
 weekly:{level:'Warning',guidance:'Review weekly hours above 40.'},
 coverage:{level:'Warning',guidance:'Review staffing below the required level.'},
 availability:{level:'Warning',guidance:'Review assignments outside availability.'}
}
export const canPublish=(issues,acknowledged=false)=>!issues.some(i=>i.level==='Error')&&(!issues.some(i=>i.level==='Warning')||acknowledged)
// Rest checks span week boundaries, so edits can invalidate adjacent published weeks.
export const affectedWeeks=days=>[...new Set(days.flatMap(day=>[-1,0,1].map(offset=>monday(date(day,offset)))))]
export function validate(shifts,requests,start){
 const days=range(start,date(start,6)), issues=[]
 const add=(level,label,keys=[])=>issues.push({level,label,keys})
 for(const person of staff){
  let total=0
  for(const day of days){
   const key=person.id+'|'+day, t=templates[shifts[key]]
   if(!t)continue
   total+=(t.end-t.start)/60
   if(person.minor&&t.end>1320)add(rulePolicy.minor.level,person.name+' is under 18. The shift on '+day+' ends at '+time(t.end)+', past 22:00. Choose a shift ending by 22:00.',[key])
   if(leaveAt(requests,person.id,day))add(rulePolicy.leave.level,person.name+' has approved leave on '+day+'. Remove or reassign this shift.',[key])
   if(unavailable(person.id,day))add(rulePolicy.availability.level,person.name+' is on time-off on '+day+'. Reassign the shift or confirm availability.',[key])
   for(const offset of [-1,1]){
    if(offset===1&&day!==days[6])continue
    const adjacent=person.id+'|'+date(day,offset), other=templates[shifts[adjacent]]
    if(other){
     const previousDay=offset===1?day:date(day,-1)
     const nextDay=date(previousDay,1)
     const previousShift=offset===1?t:other, nextShift=offset===1?other:t
     const rest=(1440-previousShift.end+nextShift.start)/60
     if(rest<8)add(rulePolicy.rest.level,person.name+' has only '+rest+' hours of rest before the shift on '+nextDay+' (previous shift ends '+previousDay+' at '+time(previousShift.end)+', next shift starts '+nextDay+' at '+time(nextShift.start)+'). At least 8 hours are required. Choose a later start or an earlier previous shift.',[person.id+'|'+nextDay,person.id+'|'+previousDay])
    }
   }
  }
  if(total>40)add(rulePolicy.weekly.level,person.name+' is scheduled for '+total+' hours this week, '+(total-40)+' hours over the 40-hour limit. Reduce the hours or acknowledge this warning when publishing.',days.map(d=>person.id+'|'+d).filter(k=>shifts[k]!=null))
 }
 for(const day of days){
  if(holidays.includes(day))continue
  for(const slot of staffingSlots){
   for(let at=slot.start;at<slot.end;at+=30){
    const count=staff.filter(p=>{const t=templates[shifts[p.id+'|'+day]];return t&&t.start<=at&&at<t.end&&!leaveAt(requests,p.id,day)&&!unavailable(p.id,day)}).length
    if(count<slot.minimum){add(rulePolicy.coverage.level,slot.name+' coverage on '+day+' at '+time(at)+': '+count+' staff available; '+slot.minimum+' required. Assign '+(slot.minimum-count)+' more staff.',[day]);break}
   }
  }
 }
 return issues.sort((a,b)=>(a.level==='Error'?0:1)-(b.level==='Error'?0:1))
}
function rawAttendance(requests,id,day,shifts=initialShifts){
 const assigned=templates[shifts[id+'|'+day]],leave=leaveAt(requests,id,day)
 const scheduled=leave?scheduledHours(id,day):assigned?(assigned.end-assigned.start)/60:0
 if(day<rosterStart||day>asOf)return {status:'Not recorded',scheduled,actual:0}
 if(holidays.includes(day))return {status:'Holiday',scheduled:0,actual:0}
 if(leave)return {status:'Leave',scheduled,actual:0,paid:leave.paid,type:leave.type}
 const recorded=templates[initialShifts[id+'|'+day]]
 if(!recorded)return {status:scheduled?'Absent':'Off',scheduled,actual:0}
 const n=Number(day.slice(-2)),late=(n+id)%11===0
 if((n+id*3)%23===0)return {status:'Absent',scheduled,actual:0}
 const clockIn=recorded.start+(late?15:0),clockOut=recorded.end+((n+id)%13===0?60:0)
 return {status:late?'Late':'Present',scheduled,actual:(clockOut-clockIn)/60,clockIn,clockOut}
}
export function attendance(requests,id,day,shifts=initialShifts){
 const r=rawAttendance(requests,id,day,shifts),previous=date(day,-1)
 const prior=previous<monday(day)?0:range(monday(day),previous).reduce((n,d)=>n+rawAttendance(requests,id,d,shifts).actual,0)
 return {...r,overtime:Math.max(0,prior+r.actual-40)-Math.max(0,prior-40)}
}
export const monthDays=month=>range(month+'-01',date(month+'-01',32).slice(0,7)+'-01').filter(d=>d.startsWith(month))
export function payroll(requests,id,month,shifts=initialShifts){
 let base=0,overtime=0,paidLeave=0,unpaid=0,scheduled=0,absent=0,paidLeaveDays=0,unpaidDays=0
 for(const day of monthDays(month)){
  const record=attendance(requests,id,day,shifts)
  if(day<=asOf){scheduled+=record.scheduled;if(record.status==='Absent')absent+=record.scheduled}
  const previous=date(day,-1)
  const prior=previous< monday(day)?0:range(monday(day),previous).reduce((n,d)=>n+attendance(requests,id,d,shifts).actual,0)
  const regular=Math.min(record.actual,Math.max(0,40-prior))
  base+=regular
  overtime+=record.actual-regular
  if(record.status==='Leave'){if(record.paid){paidLeave+=record.scheduled;paidLeaveDays++}else{unpaid+=record.scheduled;unpaidDays++}}
 }
 const rate=staff[id].rate,tips=(base+overtime)*12,gross=(base+paidLeave)*rate+overtime*rate*1.5+tips,deductions=Math.round(gross*8)/100
 return {base,overtime,paidLeave,paidLeaveDays,unpaid,unpaidDays,scheduled,absent,rate,tips,gross,deductions,net:gross-deductions}
}


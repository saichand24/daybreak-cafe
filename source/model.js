export const staff = [
 ['Maya Chen','Shift lead',23,6,10],['Amara Okafor','Barista',19,5,8],['Leo Rivera','Barista',18.5,4,2],
 ['Sofia Patel','Kitchen',21,4,7],['Noah Kim','Barista',18,5,7],['Isla Brooks','Counter',16,3,5,true],
 ['Finn Murphy','Counter',16,3,5,true],['Jules Martin','Kitchen',20,4,8]
].map(([name,role,rate,sick,vacation,minor],id)=>({id,name,role,rate:rate*10,sick,vacation,minor, unavailable:[(id+5)%7]}))
export const templates=[{name:'Opening',start:360,end:840,tone:'mint'},{name:'Midday',start:600,end:1080,tone:'blue'},{name:'Closing',start:900,end:1350,tone:'peach'}]
export const date=(iso,offset=0)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)}
export const monday=iso=>date(iso,-((new Date(iso+'T12:00:00Z').getUTCDay()+6)%7))
export const week='2026-11-16'
export const range=(start,end)=>{const result=[];for(let day=start;day<=end;day=date(day,1)) result.push(day);return result}
export const time=m=>m==null?'—':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')
const plan=[[0,1,0,1,0,1,-1],[1,0,1,-1,-1,0,1],[2,2,-1,0,1,2,-1],[0,-1,0,0,-1,1,0],[-1,1,-1,1,2,2,2],[1,-1,1,-1,1,2,-1],[-1,0,-1,0,-1,-1,1],[2,-1,2,2,-1,2,0]]
export const initialShifts=Object.fromEntries([-7,0].flatMap(offset=>plan.flatMap((row,id)=>row.flatMap((type,i)=>type<0?[]:[[id+'|'+date(week,offset+i),type]]))))
export const initialRequests=[
 {id:1,staff:1,type:'vacation',start:'2026-11-19',end:'2026-11-20',reason:'Family visit',status:'Pending',paid:false},
 {id:2,staff:2,type:'vacation',start:'2026-11-25',end:'2026-11-27',reason:'Travel',status:'Pending',paid:false},
 {id:3,staff:4,type:'sick',start:'2026-11-17',end:'2026-11-17',reason:'Medical appointment',status:'Pending',paid:true},
 {id:4,staff:3,type:'vacation',start:'2026-11-06',end:'2026-11-06',reason:'Personal day',status:'Approved',paid:false}
]
export const leaveAt=(requests,id,day)=>requests.find(r=>r.staff===id&&r.status==='Approved'&&r.start<=day&&day<=r.end)
export const balance=(requests,id,type)=>staff[id][type]-requests.filter(r=>r.staff===id&&r.type===type&&r.status==='Approved').reduce((n,r)=>n+range(r.start,r.end).length,0)
export const unavailable=(id,day)=>staff[id].unavailable.includes(range(monday(day),day).length-1)
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
   if(unavailable(person.id,day))add(rulePolicy.availability.level,person.name+' is unavailable on '+day+'. Reassign the shift or confirm availability.',[key])
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
  for(const [label,at,minimum] of [['Opening',450,1],['Lunch',720,3],['Closing',1260,1]]){
   const count=staff.filter(p=>{const t=templates[shifts[p.id+'|'+day]];return t&&t.start<=at&&at<t.end&&!leaveAt(requests,p.id,day)&&!unavailable(p.id,day)}).length
   if(count<minimum)add(rulePolicy.coverage.level,label+' coverage on '+day+' at '+time(at)+': '+count+' staff available; '+minimum+' required. Assign '+(minimum-count)+' more staff.',[day])
  }
 }
 return issues.sort((a,b)=>(a.level==='Error'?0:1)-(b.level==='Error'?0:1))
}
export function attendance(requests,id,day){
 const n=Number(day.slice(-2)), weekday=range(monday(day),day).length-1
 const historical=day>='2026-10-26'&&day<'2026-12-01', work=historical&&(id===0?weekday<6:(weekday+id)%7<5)
 const scheduled=work?8:0, leave=leaveAt(requests,id,day)
 if(leave)return {status:'Leave',scheduled,actual:0,paid:leave.paid,type:leave.type}
 if(day==='2026-11-11')return {status:'Holiday',scheduled:0,actual:0}
 if(!work)return {status:'Off',scheduled:0,actual:0}
 if((n+id*2)%19===0)return {status:'Absent',scheduled,actual:0}
 const late=(n+id)%8===0, clockIn=540+(late?15:0),clockOut=1020+((n+id)%9===0?60:0)
 return {status:late?'Late':'Present',scheduled,actual:(clockOut-clockIn)/60,clockIn,clockOut}
}
export const monthDays=month=>range(month+'-01',date(month+'-01',32).slice(0,7)+'-01').filter(d=>d.startsWith(month))
export function payroll(requests,id,month){
 let base=0,overtime=0,paidLeave=0,unpaid=0
 for(const day of monthDays(month)){
  const record=attendance(requests,id,day)
  const previous=date(day,-1)
  const prior=previous< monday(day)?0:range(monday(day),previous).reduce((n,d)=>n+attendance(requests,id,d).actual,0)
  const regular=Math.min(record.actual,Math.max(0,40-prior))
  base+=regular
  overtime+=record.actual-regular
  if(record.status==='Leave'){if(record.paid)paidLeave+=record.scheduled;else unpaid+=record.scheduled}
 }
 const rate=staff[id].rate,tips=(base+overtime)*12,gross=(base+paidLeave)*rate+overtime*rate*1.5+tips,deductions=Math.round(gross*8)/100
 return {base,overtime,paidLeave,unpaid,rate,tips,gross,deductions,net:gross-deductions}
}


import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { Search } from 'lucide-react';

export default function Attendance(){
 const [members,setMembers]=useState<any[]>([]); const [search,setSearch]=useState(''); const [date,setDate]=useState(new Date().toISOString().slice(0,10)); const [service,setService]=useState('Sunday Service'); const [statuses,setStatuses]=useState<Record<string,string>>({}); const [saved,setSaved]=useState(false); const [error,setError]=useState('');
 useEffect(()=>{api.members('?status=active').then(r=>setMembers(r.data)).catch(e=>setError(e.message))},[]);
 useEffect(()=>{setSaved(false)},[date,service,search,statuses]);
 useEffect(()=>{const handler=(e:BeforeUnloadEvent)=>{if(!saved&&Object.keys(statuses).length)e.preventDefault()};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler)},[saved,statuses]);
 const filtered=useMemo(()=>members.filter(m=>`${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())),[members,search]);
 function setAll(s:string){const next={...statuses};filtered.forEach(m=>next[m.id]=s);setStatuses(next)}
 async function save(){setError('');try{const entries=Object.entries(statuses);for(const [member_id,status] of entries) await api.recordAttendance({member_id,attendance_date:date,service_type:service,status});setSaved(true);alert('Attendance saved successfully.')}catch(e:any){setError(e.message)}}
 return <div><div className="mb-6"><h1 className="text-3xl font-bold">Attendance</h1><p className="text-slate-500">Fast Sunday-service attendance entry.</p></div>
 {error&&<div className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}
 <div className="card mb-4 grid gap-4 p-4 md:grid-cols-3"><div><label className="label">Service date</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div><div><label className="label">Service type</label><input className="input" value={service} onChange={e=>setService(e.target.value)}/></div><div><label className="label">Search member</label><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input className="input pl-10" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"/></div></div></div>
 <div className="mb-4 flex flex-wrap gap-2"><button className="btn btn-secondary" onClick={()=>setAll('present')}>Select All Present</button><button className="btn btn-secondary" onClick={()=>setStatuses({})}>Clear Attendance</button><button className="btn btn-primary ml-auto" onClick={save}>Save Attendance</button></div>
 <div className="card overflow-hidden"><div className="divide-y">{filtered.map(m=><div key={m.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="flex-1 font-semibold">{m.first_name} {m.last_name}</div><div className="grid grid-cols-3 gap-2 sm:w-72">{['present','absent','excused'].map(s=><button key={s} onClick={()=>setStatuses({...statuses,[m.id]:s})} className={`rounded-xl px-2 py-2 text-xs font-semibold capitalize ${statuses[m.id]===s ? s==='present'?'bg-green-600 text-white':s==='absent'?'bg-red-600 text-white':'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{s}</button>)}</div></div>)}</div></div>
 </div>
}

import { useEffect,useState } from 'react';
import { Link,useParams } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer } from 'recharts';

export default function MemberHistory(){
 const {id}=useParams(); const [member,setMember]=useState<any>(); const [rows,setRows]=useState<any[]>([]);
 useEffect(()=>{if(id){api.member(id).then(r=>setMember(r.data));api.history(id).then(r=>setRows(r.data))}},[id]);
 const present=rows.filter(r=>r.status==='present').length; const pct=rows.length?Math.round(present/rows.length*1000)/10:0;
 return <div><div className="mb-6"><Link to="/members" className="text-sm text-blue-700">← Members</Link><h1 className="mt-2 text-3xl font-bold">{member?.first_name} {member?.last_name}</h1><p className="text-slate-500">Individual attendance history</p></div>
 <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Attendance %" value={`${pct}%`}/><StatCard label="Total Services" value={rows.length}/><StatCard label="Present" value={present}/></div>
 <div className="card mt-6 p-5"><h2 className="mb-4 font-bold">Attendance trend</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={[...rows].reverse().map((r,i)=>({service:i+1,rate:r.status==='present'?1:0}))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="service"/><YAxis domain={[0,1]} ticks={[0,1]} tickFormatter={v=>v?'Present':'Not present'}/><Tooltip/><Line dataKey="rate" name="Status"/></LineChart></ResponsiveContainer></div></div>
 <div className="card mt-6 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Date</th><th className="p-4">Service</th><th className="p-4">Status</th></tr></thead><tbody>{rows.map(r=><tr className="border-t" key={r.id}><td className="p-4">{r.attendance_date.slice(0,10)}</td><td className="p-4">{r.service_type}</td><td className="p-4 capitalize">{r.status}</td></tr>)}</tbody></table></div>
 </div>
}

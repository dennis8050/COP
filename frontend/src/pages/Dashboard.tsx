import { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard(){
 const [range,setRange]=useState('month'); const [data,setData]=useState<any|null>(null); const [error,setError]=useState('');
 const dates=()=>{const now=new Date(); const to=now.toISOString().slice(0,10); if(range==='week'){const d=new Date(now);d.setDate(now.getDate()-6);return {from:d.toISOString().slice(0,10),to};} if(range==='lastMonth'){const first=new Date(now.getFullYear(),now.getMonth()-1,1);const last=new Date(now.getFullYear(),now.getMonth(),0);return {from:first.toISOString().slice(0,10),to:last.toISOString().slice(0,10)};} const first=new Date(now.getFullYear(),now.getMonth(),1);return {from:first.toISOString().slice(0,10),to};};
 useEffect(()=>{const d=dates();api.dashboard(`?from=${d.from}&to=${d.to}`).then(r=>setData(r.data)).catch(e=>setError(e.message));},[range]);
 return <div>
  <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-slate-500">Attendance overview and trends.</p></div><select className="input md:w-48" value={range} onChange={e=>setRange(e.target.value)}><option value="week">This week</option><option value="month">This month</option><option value="lastMonth">Last month</option></select></div>
  {error&&<div className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   <StatCard label="Active Members" value={data?.activeMembers??'—'}/>
   <StatCard label="Present" value={data?.present??'—'}/>
   <StatCard label="Absent" value={data?.absent??'—'}/>
   <StatCard label="Attendance %" value={data?`${data.attendancePercentage}%`:'—'}/>
  </div>
  <div className="mt-6 card p-5"><h2 className="mb-5 text-lg font-bold">Weekly attendance trend</h2><div className="h-80">{data&&<ResponsiveContainer width="100%" height="100%"><BarChart data={data.trends}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="week"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="present" name="Present"/></BarChart></ResponsiveContainer>}</div></div>
  <div className="mt-4 grid gap-4 sm:grid-cols-3"><StatCard label="Total Records" value={data?.totalAttendance??'—'}/><StatCard label="Excused" value={data?.excused??'—'}/><StatCard label="Church Health" value={data ? `${data.attendancePercentage}%` : '—'} sub="Attendance rate for selected period"/></div>
 </div>
}

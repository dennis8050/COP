import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, FileText, Settings, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const items = [
  {to:'/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {to:'/members',label:'Members',icon:Users},
  {to:'/attendance',label:'Attendance',icon:ClipboardCheck},
  {to:'/reports',label:'Reports',icon:FileText},
  {to:'/settings',label:'Settings',icon:Settings}
];

export default function Layout() {
  const [open,setOpen]=useState(false);
  const {user,logout}=useAuth();
  return <div className="min-h-screen bg-slate-50">
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-950 p-5 text-white transition md:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="mb-8 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-bold">Church Attendance</Link>
        <button className="md:hidden" onClick={()=>setOpen(false)}><X/></button>
      </div>
      <nav className="space-y-1">{items.map(({to,label,icon:Icon})=>
        <NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive?'bg-blue-700':'text-slate-300 hover:bg-slate-800'}`}>
          <Icon size={18}/>{label}
        </NavLink>)}</nav>
      <div className="absolute bottom-5 left-5 right-5 border-t border-slate-800 pt-4">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800"><LogOut size={18}/>Logout</button>
      </div>
    </aside>
    {open && <div onClick={()=>setOpen(false)} className="fixed inset-0 z-30 bg-black/40 md:hidden"/>}
    <div className="md:pl-64">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur md:px-8">
        <button className="md:hidden" onClick={()=>setOpen(true)}><Menu/></button>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs capitalize text-slate-500">{String(user?.role || '').replace('_',' ')}</div>
          </div>
        </div>
      </header>
      <main className="p-4 md:p-8"><Outlet/></main>
    </div>
  </div>
}

import { useAuth } from '../hooks/useAuth';

export default function Settings(){
 const {user}=useAuth();
 return <div><div className="mb-6"><h1 className="text-3xl font-bold">Settings</h1><p className="text-slate-500">Current account and system configuration.</p></div>
 <div className="card max-w-2xl p-6"><h2 className="text-lg font-bold">Current user</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Name</dt><dd className="font-semibold">{user?.name}</dd></div><div><dt className="text-xs text-slate-500">Email</dt><dd className="font-semibold">{user?.email}</dd></div><div><dt className="text-xs text-slate-500">Role</dt><dd className="font-semibold capitalize">{String(user?.role||'').replace('_',' ')}</dd></div></dl></div>
 </div>
}

export default function StatCard({label,value,sub}:{label:string,value:string|number,sub?:string}) {
  return <div className="card p-5">
    <div className="text-sm font-medium text-slate-500">{label}</div>
    <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
  </div>
}

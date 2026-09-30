import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmResetPassword, resetPassword, signIn } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export default function Login(){
  const nav=useNavigate(); const {refresh}=useAuth();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [code,setCode]=useState(''); const [newPassword,setNewPassword]=useState('');
  const [mode,setMode]=useState<'login'|'reset'|'confirm'>('login');
  const [error,setError]=useState(''); const [message,setMessage]=useState(''); const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();setError('');setMessage('');setLoading(true);
    try{
      if(mode==='login'){
        await signIn({username:email,password});await refresh();nav('/dashboard');
      } else if(mode==='reset'){
        await resetPassword({username:email});
        setMessage('If the account exists, a password-reset code has been sent to the registered email.');
        setMode('confirm');
      } else {
        await confirmResetPassword({username:email,confirmationCode:code,newPassword});
        setMessage('Password reset complete. You can now sign in.');
        setMode('login');setPassword('');
      }
    } catch(err:any){setError(err.message||'Unable to complete the request');}
    finally{setLoading(false);}
  }

  return <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
    <form onSubmit={submit} className="card w-full max-w-md p-8">
      <div className="mb-8"><div className="text-sm font-semibold text-blue-700">CHURCH ADMINISTRATION</div><h1 className="mt-2 text-3xl font-bold">{mode==='login'?'Welcome back':mode==='reset'?'Reset password':'Enter reset code'}</h1><p className="mt-2 text-sm text-slate-500">Secure church attendance administration.</p></div>
      {error&&<div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message&&<div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      <label className="label">Email</label><input className="input mb-4" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      {mode==='login'&&<><label className="label">Password</label><input className="input mb-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" className="mb-6 text-sm font-semibold text-blue-700" onClick={()=>{setMode('reset');setError('');setMessage('')}}>Forgot password?</button></>}
      {mode==='confirm'&&<><label className="label">Verification code</label><input className="input mb-4" value={code} onChange={e=>setCode(e.target.value)} required/><label className="label">New password</label><input className="input mb-6" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required minLength={12}/></>}
      {mode==='reset'&&<div className="mb-6 text-sm text-slate-500">Enter your account email and Cognito will send the reset code.</div>}
      <button disabled={loading} className="btn btn-primary w-full">{loading?'Please wait…':mode==='login'?'Sign in':mode==='reset'?'Send reset code':'Set new password'}</button>
      {mode!=='login'&&<button type="button" className="btn btn-secondary mt-3 w-full" onClick={()=>setMode('login')}>Back to sign in</button>}
    </form>
  </div>
}

import { createContext, useContext, useEffect, useState } from 'react';
import { session, signOut } from '../services/auth';

type AuthState = {
  loading: boolean;
  user: any | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};
const Context = createContext<AuthState>({loading:true,user:null,refresh:async()=>{},logout:async()=>{}});

export function AuthProvider({children}:{children:React.ReactNode}) {
  const [loading,setLoading] = useState(true);
  const [user,setUser] = useState<any|null>(null);
  const refresh = async()=>{ setUser(await session()); setLoading(false); };
  useEffect(()=>{refresh();},[]);
  const logout = async()=>{await signOut();setUser(null);};
  return <Context.Provider value={{loading,user,refresh,logout}}>{children}</Context.Provider>;
}
export const useAuth=()=>useContext(Context);

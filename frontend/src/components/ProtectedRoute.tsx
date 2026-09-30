import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({children}:{children:React.ReactNode}) {
  const {loading,user}=useAuth();
  if(loading) return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

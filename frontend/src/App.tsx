import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import MemberHistory from './pages/MemberHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App(){
  return <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route element={<ProtectedRoute><Layout/></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/members" element={<Members/>}/>
        <Route path="/members/:id/attendance" element={<MemberHistory/>}/>
        <Route path="/attendance" element={<Attendance/>}/>
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/settings" element={<Settings/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  </AuthProvider>
}

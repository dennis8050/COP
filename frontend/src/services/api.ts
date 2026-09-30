import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const tokens = await fetchAuthSession();
  const token = tokens.tokens?.idToken?.toString();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

export const api = {
  members: (params = '') => request<{data:any[]}>(`/members${params}`),
  member: (id: string) => request<{data:any}>(`/members/${id}`),
  createMember: (body: any) => request<{data:any}>('/members', {method:'POST', body:JSON.stringify(body)}),
  updateMember: (id:string, body:any) => request<{data:any}>(`/members/${id}`, {method:'PUT',body:JSON.stringify(body)}),
  deactivateMember: (id:string) => request<{data:any}>(`/members/${id}/deactivate`, {method:'PATCH'}),
  attendance: (params='') => request<{data:any[]}>(`/attendance${params}`),
  recordAttendance: (body:any) => request<{data:any}>('/attendance',{method:'POST',body:JSON.stringify(body)}),
  updateAttendance: (id:string, body:any) => request<{data:any}>(`/attendance/${id}`,{method:'PUT',body:JSON.stringify(body)}),
  history: (id:string) => request<{data:any[]}>(`/members/${id}/attendance`),
  dashboard: (params='') => request<{data:any}>(`/dashboard/statistics${params}`),
  report: (params='') => request<{data:any}>(`/reports/attendance${params}`)
};

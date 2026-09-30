import { describe,it,expect,vi } from 'vitest';
import { render,screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
vi.mock('../hooks/useAuth',()=>({useAuth:()=>({loading:false,user:null})}));
describe('ProtectedRoute',()=>{it('redirects unauthenticated users',()=>{render(<MemoryRouter initialEntries={['/dashboard']}><ProtectedRoute><div>private</div></ProtectedRoute></MemoryRouter>);expect(screen.queryByText('private')).not.toBeInTheDocument();});});

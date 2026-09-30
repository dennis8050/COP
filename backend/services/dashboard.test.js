import { describe,it,expect,vi,beforeEach } from 'vitest';
vi.mock('./db.js',()=>({query:vi.fn()}));
import { query } from './db.js';
import { dashboardStats } from './dashboard.js';

describe('dashboard calculations',()=>{
 beforeEach(()=>vi.clearAllMocks());
 it('calculates percentage from database counts',async()=>{
   query.mockResolvedValueOnce({rows:[{active_members:20,present:18,absent:1,excused:1,total:20}]});
   query.mockResolvedValueOnce({rows:[]});
   const result=await dashboardStats('2026-09-01','2026-09-30');
   expect(result.attendancePercentage).toBe(90);
 });
});

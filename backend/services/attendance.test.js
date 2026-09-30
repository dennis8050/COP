import { describe,it,expect,vi,beforeEach } from 'vitest';
vi.mock('./db.js',()=>({query:vi.fn()}));
vi.mock('./members.js',()=>({getMember:vi.fn()}));
import { query } from './db.js';
import { getMember } from './members.js';
import { recordAttendance } from './attendance.js';

describe('attendance persistence',()=>{
 beforeEach(()=>vi.clearAllMocks());
 it('rejects inactive members',async()=>{
   getMember.mockResolvedValue({id:'m1',status:'inactive'});
   await expect(recordAttendance({member_id:'m1',attendance_date:'2026-09-27',service_type:'Sunday Service',status:'present'},'u1'))
     .rejects.toMatchObject({statusCode:409});
   expect(query).not.toHaveBeenCalled();
 });
 it('maps duplicate DB constraint to conflict',async()=>{
   getMember.mockResolvedValue({id:'m1',status:'active'});
   query.mockRejectedValue({code:'23505'});
   await expect(recordAttendance({member_id:'m1',attendance_date:'2026-09-27',service_type:'Sunday Service',status:'present'},'u1'))
     .rejects.toMatchObject({statusCode:409});
 });
});

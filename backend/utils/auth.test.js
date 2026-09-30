import { describe,it,expect } from 'vitest';
import { currentUser, requireRole } from './auth.js';

function event(claims){return {requestContext:{authorizer:{claims}}};}

describe('authorization',()=>{
  it('rejects missing identity',()=>expect(()=>currentUser(event({}))).toThrow());
  it('rejects staff from admin-only operations',()=>{
    expect(()=>requireRole(event({sub:'s1',email:'staff@example.test','custom:role':'attendance_staff'}),['admin']))
      .toMatchObject({statusCode:403});
  });
  it('accepts an admin claim',()=>{
    expect(requireRole(event({sub:'a1',email:'admin@example.test','custom:role':'admin'}),['admin']).role).toBe('admin');
  });
});

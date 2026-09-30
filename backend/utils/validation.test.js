import { describe,it,expect } from 'vitest';
import { memberSchema,parse } from './validation.js';
describe('member validation',()=>{
 it('rejects missing names',()=>expect(()=>parse(memberSchema,{membership_date:'2026-09-01'})).toThrow());
 it('accepts valid member',()=>{
  const value=parse(memberSchema,{first_name:'John',last_name:'Smith',email:'john@example.test',phone:'416-555-0100',membership_date:'2026-09-01',status:'active'});
  expect(value.first_name).toBe('John');
 });
});

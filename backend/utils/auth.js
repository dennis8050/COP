import { HttpError } from './http.js';

export function claims(event) {
  return event?.requestContext?.authorizer?.claims || {};
}

export function currentUser(event) {
  const c = claims(event);
  const sub = c.sub;
  const email = c.email;
  const role = c['custom:role'] || 'attendance_staff';
  if (!sub || !email) throw new HttpError(401, 'Unauthenticated');
  return { cognitoUserId: sub, email, role, name: c.name || email };
}

export function requireRole(event, roles) {
  const user = currentUser(event);
  if (!roles.includes(user.role)) throw new HttpError(403, 'Insufficient permissions');
  return user;
}

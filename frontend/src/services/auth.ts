import { fetchAuthSession, getCurrentUser, signIn, signOut, resetPassword, confirmResetPassword } from 'aws-amplify/auth';

export async function session() {
  try {
    const user = await getCurrentUser();
    const tokens = await fetchAuthSession();
    const claims = tokens.tokens?.idToken?.payload || {};
    return {
      user,
      token: tokens.tokens?.accessToken?.toString(),
      name: String(claims.name || claims.email || user.username),
      email: String(claims.email || user.username),
      role: String(claims['custom:role'] || 'attendance_staff')
    };
  } catch {
    return null;
  }
}

export { signIn, signOut, resetPassword, confirmResetPassword };

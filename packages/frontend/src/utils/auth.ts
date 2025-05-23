// src/utils/auth.ts

// Utility to decode JWT and get role
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Utility to get auth info from localStorage
export function getAuthInfo() {
  // Example keys: 'token', 'role' ('admin' or 'student')
  const token = localStorage.getItem('token');
  let role = localStorage.getItem('role');
  let payload = null;
  if (token) {
     payload = parseJwt(token);
    if (payload && payload.role) {
      role = payload.role;
    }
  }
  return { token, role, user:payload };
}

// Returns true if user is authenticated (token exists and is not expired)
export function getAuth() {
  const { token } = getAuthInfo();
  if (!token) return false;
  // Optionally, check token expiry here
  return true;
}

export const getUserId = () => {
  const { token } = getAuthInfo();
  if (!token) return null;
  const payload = parseJwt(token);
  return payload ? payload.id : 'none';
};

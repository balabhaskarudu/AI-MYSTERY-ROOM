const ROOT = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:4000/api/v1');
export async function request(path, options = {}, refreshed = false) {
  const token = localStorage.getItem('afterlight-token');
  const response = await fetch(`${ROOT}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (response.status === 401 && token && path !== '/auth/refresh' && !refreshed) {
    try {
      const refreshResponse = await fetch(`${ROOT}/auth/refresh`, { method: 'POST', credentials: 'include' });
      const refreshedData = await refreshResponse.json();
      if (refreshResponse.ok && refreshedData.success) {
        localStorage.setItem('afterlight-token', refreshedData.data.token);
        localStorage.setItem('afterlight-user', JSON.stringify(refreshedData.data.user));
        return request(path, options, true);
      }
    } catch { /* Fall through to the original authentication error. */ }
  }
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.success) throw new Error(json.message || 'Something went wrong.');
  return json.data;
}

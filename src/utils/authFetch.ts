// Utility to ensure cross-origin requests to Render backend carry the Bearer token

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('driftlift_token')
}

export function getAuthHeaders(extraHeaders: HeadersInit = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return { ...headers, ...(extraHeaders as Record<string, string>) }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()
  const customHeaders = (options.headers || {}) as Record<string, string>
  
  const headers: Record<string, string> = {
    ...customHeaders,
  }
  
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  })
}


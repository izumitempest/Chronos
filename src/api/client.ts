const API_BASE = 'http://localhost:3001/api'

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    return fetchWithAuth(path, { method: 'GET' })
  },
  async post<T>(path: string, body?: any): Promise<T> {
    return fetchWithAuth(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  async put<T>(path: string, body?: any): Promise<T> {
    return fetchWithAuth(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  async patch<T>(path: string, body?: any): Promise<T> {
    return fetchWithAuth(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  async delete<T>(path: string): Promise<T> {
    return fetchWithAuth(path, { method: 'DELETE' })
  },
}

async function fetchWithAuth(path: string, options: RequestInit) {
  const token = localStorage.getItem('mandate_token')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  })

  // Hack for 204 No Content
  if (response.status === 204) {
    return {}
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

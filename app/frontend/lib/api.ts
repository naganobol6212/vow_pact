const API_BASE_URL = "/api/v1"

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
}

export class ApiError extends Error {
  status: number
  errors: unknown

  constructor(status: number, errors: unknown) {
    super(`API Error: ${status}`)
    this.status = status
    this.errors = errors
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let errors: unknown = null
    try {
      const data = await response.json()
      errors = data.errors
    } catch {
      errors = null
    }
    throw new ApiError(response.status, errors)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

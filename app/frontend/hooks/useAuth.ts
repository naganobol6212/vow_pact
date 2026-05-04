import { useQuery } from "@tanstack/react-query"
import { api, ApiError } from "../lib/api"
import type { User } from "../types/user"

export function useAuth() {
  const query = useQuery<User, ApiError>({
    queryKey: ["currentUser"],
    queryFn: () => api<User>("/auth/me"),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
  }
}

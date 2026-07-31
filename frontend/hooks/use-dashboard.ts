import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useHealth() {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/health");
      return res.json();
    },
  });
}

export function useUserDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "user-stats"],
    queryFn: () => api.get<any>("/dashboard/user-stats"),
  });
}

export function useUserDocuments() {
  return useQuery({
    queryKey: ["documents", "mine"],
    queryFn: () => api.get<any>("/documents"),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => api.delete<any>(`/documents/${documentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "documents"] });
    },
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.get<any>("/admin/analytics"),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get<any>("/admin/users"),
  });
}

export function useAdminDocuments() {
  return useQuery({
    queryKey: ["admin", "documents"],
    queryFn: () => api.get<any>("/admin/documents"),
  });
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ["admin", "activity-logs"],
    queryFn: () => api.get<any>("/admin/activity-logs"),
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch<any>(`/admin/users/${userId}/status`, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch<any>(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] });
    },
  });
}

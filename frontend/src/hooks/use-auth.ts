"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api-client";
import { clearToken, saveToken } from "@/lib/auth";
import type { User } from "@/types";
import type {
  ChangePasswordInput,
  LoginInput,
  ProfileInput,
  RegisterInput,
} from "@/schemas/auth";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<User>("/auth/me"),
    enabled,
    retry: false,
  });
}

export function useSetupStatus() {
  return useQuery({
    queryKey: ["setup-status"],
    queryFn: () => api.get<{ needs_setup: boolean }>("/auth/setup-status"),
    retry: false,
    staleTime: 0,
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const res = await api.post<{ access_token: string }>("/auth/register", {
        full_name: input.full_name,
        email: input.email,
        password: input.password,
      });
      saveToken(res.access_token, true);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await api.post<{ access_token: string }>("/auth/login", {
        email: input.email,
        password: input.password,
        remember: input.remember,
      });
      saveToken(res.access_token, input.remember);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    clearToken();
    queryClient.clear();
    router.push("/login");
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => api.put<User>("/auth/me", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      api.put<{ message: string }>("/auth/change-password", {
        current_password: input.current_password,
        new_password: input.new_password,
      }),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Payment } from "@/types";
import type { PaymentInput } from "@/schemas/payment";

export function usePayments(billId?: string) {
  const qs = billId ? `?bill_id=${billId}` : "";
  return useQuery({
    queryKey: ["payments", billId],
    queryFn: () => api.get<Payment[]>(`/payments${qs}`),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) =>
      api.post<Payment>("/payments", {
        ...input,
        transaction_code: input.transaction_code || null,
        payment_date: input.payment_date ? new Date(input.payment_date).toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

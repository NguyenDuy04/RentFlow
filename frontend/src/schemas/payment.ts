import { z } from "zod";

export const createPaymentSchema = (messages: { positiveAmount: string }) =>
  z.object({
    bill_id: z.string().min(1),
    amount: z.coerce.number().gt(0, messages.positiveAmount),
    method: z.enum(["cash", "bank_transfer"]),
    payment_date: z.string().optional().or(z.literal("")),
    transaction_code: z.string().optional().or(z.literal("")),
  });
export type PaymentFormInput = z.input<ReturnType<typeof createPaymentSchema>>;
export type PaymentInput = z.output<ReturnType<typeof createPaymentSchema>>;

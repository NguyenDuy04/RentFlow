import { z } from "zod";

export const paymentSchema = z.object({
  bill_id: z.string().min(1),
  amount: z.coerce.number().gt(0, "Số tiền phải lớn hơn 0"),
  method: z.enum(["cash", "bank_transfer"]),
  payment_date: z.string().optional().or(z.literal("")),
  transaction_code: z.string().optional().or(z.literal("")),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

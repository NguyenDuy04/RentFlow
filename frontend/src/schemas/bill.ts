import { z } from "zod";

export const generateBillSchema = z.object({
  month: z.string().min(1, "Vui lòng chọn tháng"),
  room_id: z.string().optional().or(z.literal("")),
});
export type GenerateBillInput = z.infer<typeof generateBillSchema>;

import { z } from "zod";

export const tenantSchema = z.object({
  full_name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  national_id: z.string().min(1, "Vui lòng nhập số CCCD"),
  address: z.string().optional().or(z.literal("")),
  room_id: z.string().optional().or(z.literal("")),
  lease_start_date: z.string().min(1, "Vui lòng chọn ngày bắt đầu thuê"),
  lease_end_date: z.string().optional().or(z.literal("")),
  deposit_amount: z.coerce.number().min(0).default(0),
});
export type TenantInput = z.infer<typeof tenantSchema>;

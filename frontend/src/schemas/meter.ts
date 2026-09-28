import { z } from "zod";

export const meterSchema = z
  .object({
    room_id: z.string().min(1, "Vui lòng chọn phòng"),
    month: z.string().min(1, "Vui lòng chọn tháng"),
    electricity_old: z.coerce.number().min(0, "Chỉ số không hợp lệ"),
    electricity_new: z.coerce.number().min(0, "Chỉ số không hợp lệ"),
    water_old: z.coerce.number().min(0, "Chỉ số không hợp lệ"),
    water_new: z.coerce.number().min(0, "Chỉ số không hợp lệ"),
  })
  .refine((d) => d.electricity_new >= d.electricity_old, {
    message: "Chỉ số điện mới phải >= chỉ số cũ",
    path: ["electricity_new"],
  })
  .refine((d) => d.water_new >= d.water_old, {
    message: "Chỉ số nước mới phải >= chỉ số cũ",
    path: ["water_new"],
  });
export type MeterInput = z.infer<typeof meterSchema>;

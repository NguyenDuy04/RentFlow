import { z } from "zod";

export const roomSchema = z.object({
  room_code: z.string().min(1, "Vui lòng nhập mã phòng"),
  name: z.string().min(1, "Vui lòng nhập tên phòng"),
  floor: z.string().optional().or(z.literal("")),
  area: z.coerce.number().min(0).optional(),
  rent_price: z.coerce.number().min(0, "Giá thuê không hợp lệ"),
  deposit_required: z.coerce.number().min(0).default(0),
  max_occupants: z.coerce.number().int().min(1, "Tối thiểu 1 người"),
  status: z.enum(["available", "occupied", "maintenance"]).default("available"),
  note: z.string().optional().or(z.literal("")),
});
export type RoomInput = z.infer<typeof roomSchema>;

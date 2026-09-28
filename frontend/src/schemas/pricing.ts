import { z } from "zod";

export const pricingSchema = z.object({
  electricity_price: z.coerce.number().min(0, "Giá không hợp lệ"),
  water_price: z.coerce.number().min(0, "Giá không hợp lệ"),
  internet_fee: z.coerce.number().min(0).default(0),
  parking_fee: z.coerce.number().min(0).default(0),
  cleaning_fee: z.coerce.number().min(0).default(0),
  other_fee: z.coerce.number().min(0).default(0),
});
export type PricingInput = z.infer<typeof pricingSchema>;

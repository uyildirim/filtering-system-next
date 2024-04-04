import { z } from "zod";

export const AVAIlABLE_SIZES = ["S", "M", "L"] as const;
export const AVAIlABLE_COLORS = [
  "white",
  "beige",
  "green",
  "purple",
  "blue",
] as const;

export const AVAIlABLE_SORT = ["none", "price-asc", "price-desc"] as const;

export const ProductFilterValidator = z.object({
  size: z.array(z.enum(AVAIlABLE_SIZES)),
  color: z.array(z.enum(AVAIlABLE_COLORS)),
  sort: z.enum(AVAIlABLE_SORT),
  price: z.tuple([z.number(), z.number()]),
});

export type ProductState = Omit<
  z.infer<typeof ProductFilterValidator>,
  "price"
> & { price: { isCuston: boolean; range: [number, number] } };

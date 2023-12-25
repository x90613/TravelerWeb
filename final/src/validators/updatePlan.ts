import { z } from "zod";

export const updatePSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

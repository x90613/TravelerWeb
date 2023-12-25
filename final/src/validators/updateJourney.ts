import { z } from "zod";

export const updateJourneySchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

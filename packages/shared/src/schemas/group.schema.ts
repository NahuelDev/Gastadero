import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  currency: z.string().length(3).default("ARS"),
});

export const addMemberSchema = z.object({
  displayName: z.string().min(1).max(100),
});

import { z } from "zod";

export const createSettlementSchema = z.object({
  groupId: z.string().min(1),
  fromMemberId: z.string().min(1),
  toMemberId: z.string().min(1),
  amount: z.number().int().positive(),
  note: z.string().max(500).optional(),
});

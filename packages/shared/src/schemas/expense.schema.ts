import { z } from "zod";

const splitSchema = z.object({
  memberId: z.string().min(1),
  amount: z.number().int().positive(),
});

export const createExpenseSchema = z
  .object({
    groupId: z.string().min(1),
    description: z.string().max(500).optional(),
    amount: z.number().int().positive(),
    paidByMemberId: z.string().min(1),
    splits: z.array(splitSchema).min(1),
    receiptUrl: z.string().url().optional(),
  })
  .refine(
    (data) => {
      const splitsTotal = data.splits.reduce((sum, s) => sum + s.amount, 0);
      return splitsTotal === data.amount;
    },
    { message: "Sum of splits must equal the total amount" }
  );

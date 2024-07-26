import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/drizzle";
import { scheduledTransactions, transactions } from "@/db/schema";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      // Retrieve scheduled transactions from the database
      const data = await db
        .select({ id: transactions.id, date: transactions.date })
        .from(scheduledTransactions);

      console.log(data);

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    try {
      const insertScheduledTransactionSchema = z.object({
        amount: z.number(),
        payee: z.string(),
        notes: z.string().optional(),
        scheduledDate: z.date(),
        repeatInterval: z.string().optional(),
        userId: z.string(),
        accountId: z.string(),
        categoryId: z.string(),
      });

      const validatedData = insertScheduledTransactionSchema.parse(req.body);

      const newScheduledTransaction = {
        id: createId(),
        amount: validatedData.amount,
        payee: validatedData.payee,
        notes: validatedData.notes,
        scheduledDate: validatedData.scheduledDate,
        repeat_interval: validatedData.repeatInterval,
        userId: validatedData.userId,
        accountId: validatedData.accountId,
        categoryId: validatedData.categoryId,
      };

      const [data] = await db
        .insert(scheduledTransactions)
        .values(newScheduledTransaction)
        .returning();

      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default handler;

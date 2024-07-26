import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  scheduledTransactions,
  insertScheduledTransactionSchema,
  transactions,
} from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import moment from "moment";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select({
        id: scheduledTransactions.id,
        amount: scheduledTransactions.amount,
        date: scheduledTransactions.scheduledDate,
        payee: scheduledTransactions.payee,
        categoryId: scheduledTransactions.categoryId,
        accountId: scheduledTransactions.accountId,
        interval: scheduledTransactions.repeatInterval,
      })
      .from(scheduledTransactions);

    const now = new Date();

    const expired = data.filter((d) => (d.date as Date) <= now);

    async function handleExpired(transaction: {
      id: string;
      amount: number;
      date: Date;
      payee: string;
      categoryId: string | null;
      accountId: string;
      interval: number | null;
    }) {
      await db.insert(transactions).values([
        {
          ...transaction,
          id: createId(),
          type: "scheduled",
        },
      ]);
      await db.update(scheduledTransactions).set({
        scheduledDate: new Date(
          moment(transaction.date)
            .add({
              days: transaction?.interval ? transaction.interval : 0,
            })
            .format("YYYY-MM-DD")
        ),
      });
    }

    expired.map(async (e) => await handleExpired(e));

    return c.json({ data });
  })
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertScheduledTransactionSchema.omit({
        id: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(scheduledTransactions)
        .values({
          id: createId(), // Generate a unique ID for the scheduled transaction
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  );

app.post(
  "/scheduled-transactions",
  clerkMiddleware(),
  zValidator(
    "json",
    insertScheduledTransactionSchema.omit({
      id: true,
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    const values = c.req.valid("json");

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [data] = await db
      .insert(scheduledTransactions)
      .values({
        id: createId(), // Generate a unique ID for the scheduled transaction
        ...values,
      })
      .returning();

    return c.json({ data });
  }
);

export default app;

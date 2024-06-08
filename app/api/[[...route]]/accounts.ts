import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accounts, inseartAccountSchema, transactions } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

type Transaction = {
  amount: number;
};

const app = new Hono()
  .use('*', clerkMiddleware())  // Apply clerk middleware to all routes

  .get("/", async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const accountData = await db
      .select({
        id: accounts.id,
        name: accounts.name,
        budget: accounts.budget,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId));

    const accountsWithRemainingBudget = await Promise.all(
      accountData.map(async (account) => {
        const transactionsData: Transaction[] = await db
          .select({
            amount: transactions.amount,
          })
          .from(transactions)
          .where(eq(transactions.accountId, account.id));
        const netTransactions = transactionsData.reduce((sum, transaction) => {
          const amount = transaction.amount / 1000; 
          if (isNaN(amount)) {
            console.error(`Invalid transaction amount: ${transaction.amount}`);
            return sum;
          }
          return sum + amount;  
        }, 0);
        const initialBudget = account.budget ?? 0;  
        let remainingBudget = initialBudget + netTransactions;
        return {
          ...account,
          budget: account.budget === 0 ? null : account.budget, // Adjust budget to null if it is 0
          remainingBudget: remainingBudget === 0 ? null : remainingBudget,  // Adjust remainingBudget to null if it is 0
        };
      })
    );

    return c.json({ data: accountsWithRemainingBudget });
  })

  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .select({
          id: accounts.id,
          name: accounts.name,
          budget: accounts.budget,
        })
        .from(accounts)
        .where(
          and(eq(accounts.userId, auth.userId), eq(accounts.id, id))
        );
      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data: { ...data, budget: data.budget === 0 ? null : data.budget } });
    }
  )

  .post(
    "/",
    zValidator(
      "json",
      inseartAccountSchema.pick({
        name: true,
        budget: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          name: values.name,
          budget: values.budget ?? 0, // Allow budget to be 0 or null during creation
        })
        .returning();

      return c.json({ data: { ...data, budget: data.budget === 0 ? null : data.budget } });
    }
  )

  .post(
    "/bulk-delete",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, auth.userId),
            inArray(accounts.id, values.ids)
          )
        )
        .returning({
          id: accounts.id,
        });
      return c.json({ data });
    }
  )

  .patch(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    zValidator(
      "json",
      inseartAccountSchema.pick({
        name: true,
        budget: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .update(accounts)
        .set({
          name: values.name,
          budget: values.budget ?? 0, // Allow budget to be 0 or null during update
        })
        .where(
          and(eq(accounts.userId, auth.userId), eq(accounts.id, id))
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { ...data, budget: data.budget === 0 ? null : data.budget } });
    }
  )

  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .delete(accounts)
        .where(
          and(eq(accounts.userId, auth.userId), eq(accounts.id, id))
        )
        .returning({
          id: accounts.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  )

  .patch(
    "/:id/budget",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    zValidator(
      "json",
      z.object({
        budget: z.number(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      const { budget } = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .update(accounts)
        .set({ budget: budget ?? 0 }) // Allow budget to be 0 or null during update
        .where(
          and(eq(accounts.userId, auth.userId), eq(accounts.id, id))
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { ...data, budget: data.budget === 0 ? null : data.budget } });
    }
  );

export default app;

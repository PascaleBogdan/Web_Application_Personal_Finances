import { z } from "zod";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Update the accounts table schema to include a budget field
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  budget: integer("budget").default(0), // Define the budget field with a default of null
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const inseartAccountSchema = createInsertSchema(accounts).extend({
  budget: z.number().positive("Budget must be a positive number").nullable(), // Ensure the schema reflects that budget can be null
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const inseartCategoriesSchema = createInsertSchema(categories);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
  date: timestamp("date", { mode: "date" }).notNull(),
  accountId: text("account_id")
    .references(() => accounts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  type: text("type").default("default"),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  categories: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const inseartTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});

export const scheduledTransactions = pgTable("scheduled_transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
  scheduledDate: timestamp("scheduled_date", { mode: "date" }).notNull(),
  repeatInterval: integer("repeat_interval"), // Number of days to repeat
  userId: text("user_id").notNull(),
  accountId: text("account_id")
    .references(() => accounts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
});

// Define relations for scheduled transactions
export const scheduledTransactionsRelations = relations(
  scheduledTransactions,
  ({ one }) => ({
    account: one(accounts, {
      fields: [scheduledTransactions.accountId],
      references: [accounts.id],
    }),
    categories: one(categories, {
      fields: [scheduledTransactions.categoryId],
      references: [categories.id],
    }),
  })
);

export const insertScheduledTransactionSchema = createInsertSchema(
  scheduledTransactions,
  {
    scheduledDate: z.coerce.date(),
    notes: z.string().optional(), // Ensure notes is treated as an optional string
    repeatInterval: z
      .number()
      .positive("Repeat interval must be a positive number")
      .nullable(),
  }
);

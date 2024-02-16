import { relations } from "drizzle-orm";
import {
  index, // text,
  pgTable,
  serial,
  uuid,
  varchar, // boolean,
  // timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    username: varchar("username", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 100 }),
    token: varchar("access_token"),
    provider: varchar("provider", {
      length: 100,
      enum: ["github", "credentials", "google"],
    })
      .notNull()
      .default("credentials"),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
    emailIndex: index("username_index").on(table.email),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  plansUsersTable: many(usersToPlansTable),
}));

// Plans (e.g., PlanA, PlanB)
// usersTable is many-to-many relationship with Plans
export const plansTable = pgTable(
  "plans",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    name: varchar("title", { length: 100 }).notNull(),
    description: varchar("description", { length: 100 }).notNull(),
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
  }),
);

export const plansRelations = relations(plansTable, ({ many }) => ({
  plansUsersTable: many(usersToPlansTable),
}));

// ManyToMany需要建表維護
export const usersToPlansTable = pgTable(
  "users_to_plans",
  {
    id: serial("id").primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plansTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.displayId, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => ({
    planAndUserIndex: index("plan_and_user_index").on(
      table.planId,
      table.userId,
    ),
    // This is a unique constraint on the combination of planId and userId.
    // This ensures that there is no duplicate entry in the table.
    uniqCombination: unique().on(table.planId, table.userId),
  }),
);

export const plansToUsersRelations = relations(
  usersToPlansTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToPlansTable.userId],
      references: [usersTable.displayId],
    }),

    plan: one(plansTable, {
      fields: [usersToPlansTable.planId],
      references: [plansTable.displayId],
    }),
  }),
);

export const journeysTable = pgTable(
  "journeys",
  {
    id: serial("id").primaryKey(),
    displayId: uuid("display_id").defaultRandom().notNull().unique(),
    title: varchar("title", { length: 100 }).notNull(),
    start: varchar("start").notNull(),
    end: varchar("end").notNull(),
    location: varchar("location").notNull(),
    note: varchar("note", { length: 100 }).notNull(),
    plansId: uuid("plans_id")
      .references(() => plansTable.displayId, {
        onDelete: "cascade", // Add cascade on delete
        onUpdate: "cascade",
      })
  },
  (table) => ({
    displayIdIndex: index("display_id_index").on(table.displayId),
  }),
);

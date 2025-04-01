import { pgTable, text, serial, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Team schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  icon: text("icon"),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  color: true,
  icon: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Event schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  categoryId: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Results schema - stores the medal/result for each team in each event
export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  eventId: integer("event_id").notNull(),
  medal: varchar("medal", { length: 20 }).notNull(),
  points: integer("points").notNull(),
});

export const insertResultSchema = createInsertSchema(results).pick({
  teamId: true,
  eventId: true,
  medal: true,
  points: true,
});

export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof results.$inferSelect;

// Medal types and points
export const MEDALS = {
  GOLD: "gold",
  SILVER: "silver",
  BRONZE: "bronze",
  NON_WINNER: "non_winner",
  NO_ENTRY: "no_entry",
} as const;

export const POINTS = {
  [MEDALS.GOLD]: 10,
  [MEDALS.SILVER]: 7,
  [MEDALS.BRONZE]: 5,
  [MEDALS.NON_WINNER]: 1,
  [MEDALS.NO_ENTRY]: 0,
} as const;

export type MedalType = "gold" | "silver" | "bronze" | "non_winner" | "no_entry";

// Standings type - represents the aggregated team standings
export type TeamStanding = {
  teamId: number;
  teamName: string;
  teamColor: string;
  icon?: string | null;
  totalPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
};

// Event results type - represents the medal results for one event
export type EventResult = {
  eventId: number;
  eventName: string;
  gold?: { teamId: number; teamName: string; teamColor: string };
  silver?: { teamId: number; teamName: string; teamColor: string };
  bronze?: { teamId: number; teamName: string; teamColor: string };
  results: Result[];
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

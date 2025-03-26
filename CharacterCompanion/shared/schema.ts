import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(false).notNull(), // Controls if user shares characters publicly
});

// Character Schema
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Owner of the character
  name: text("name").notNull(),
  hp: integer("hp").notNull(),
  speed: integer("speed").notNull(),
  ac: integer("ac").notNull(),
  initiative: integer("initiative").notNull(),
  tags: text("tags"),
  abilities: jsonb("abilities").notNull().$type<Ability[]>(),
  isPublic: boolean("is_public").default(false).notNull(), // Controls if character is publicly visible
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Team Schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Owner of the team
  name: text("name").notNull(),
  characterIds: jsonb("character_ids").notNull().$type<number[]>(),
  characterAbilities: jsonb("character_abilities").notNull().$type<Record<number, string[]>>(), // Maps character IDs to ability IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Battle Schema
export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Owner of the battle
  name: text("name").notNull(),
  teamId: integer("team_id"),
  opponentTeamId: integer("opponent_team_id"),
  currentTurn: integer("current_turn").default(1),
  battleState: jsonb("battle_state").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for Zod validation
export type Ability = {
  id: string;
  name: string;
  description: string;
  damage?: string;
  range?: string;
  effect?: string;
  isPassive: boolean;
};

export type BattleCharacterState = {
  characterId: number;
  uniqueId: string;
  currentHp: number;
  status: string;
  turnOrder: number;
};

export type BattleState = {
  allies: BattleCharacterState[];
  opponents: BattleCharacterState[];
};

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertBattleSchema = createInsertSchema(battles).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertBattle = z.infer<typeof insertBattleSchema>;
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Battle = typeof battles.$inferSelect;

// Safely exclude sensitive fields
export type PublicUser = Omit<User, 'password'>;
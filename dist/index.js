var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/auth-utils.ts
var auth_utils_exports = {};
__export(auth_utils_exports, {
  comparePasswords: () => comparePasswords,
  hashPassword: () => hashPassword
});
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
var scryptAsync;
var init_auth_utils = __esm({
  "server/auth-utils.ts"() {
    "use strict";
    scryptAsync = promisify(scrypt);
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  icon: text("icon")
});
var insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  color: true,
  icon: true
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull()
});
var insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true
});
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull()
});
var insertEventSchema = createInsertSchema(events).pick({
  name: true,
  categoryId: true
});
var results = pgTable("results", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  eventId: integer("event_id").notNull(),
  medal: varchar("medal", { length: 20 }).notNull(),
  points: integer("points").notNull()
});
var insertResultSchema = createInsertSchema(results).pick({
  teamId: true,
  eventId: true,
  medal: true,
  points: true
});
var MEDALS = {
  GOLD: "gold",
  SILVER: "silver",
  BRONZE: "bronze",
  NON_WINNER: "non_winner",
  NO_ENTRY: "no_entry"
};
var POINTS = {
  [MEDALS.GOLD]: 10,
  [MEDALS.SILVER]: 7,
  [MEDALS.BRONZE]: 5,
  [MEDALS.NON_WINNER]: 1,
  [MEDALS.NO_ENTRY]: 0
};
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true
});

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  _teams;
  _categories;
  _events;
  _results;
  _users;
  _teamIdCounter;
  _categoryIdCounter;
  _eventIdCounter;
  _resultIdCounter;
  _userIdCounter;
  sessionStore;
  constructor() {
    this._teams = /* @__PURE__ */ new Map();
    this._categories = /* @__PURE__ */ new Map();
    this._events = /* @__PURE__ */ new Map();
    this._results = /* @__PURE__ */ new Map();
    this._users = /* @__PURE__ */ new Map();
    this._teamIdCounter = 1;
    this._categoryIdCounter = 1;
    this._eventIdCounter = 1;
    this._resultIdCounter = 1;
    this._userIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
    this._teams.clear();
    this._categories.clear();
    this._events.clear();
    this._results.clear();
    this._users.clear();
  }
  // User methods
  async getUser(id) {
    return this._users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this._users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this._userIdCounter++;
    const user = { ...insertUser, id };
    this._users.set(id, user);
    return user;
  }
  // Team methods
  async getTeams() {
    return Array.from(this._teams.values());
  }
  async getTeam(id) {
    return this._teams.get(id);
  }
  async getTeamByName(name) {
    return Array.from(this._teams.values()).find((team) => team.name === name);
  }
  async createTeam(insertTeam) {
    const id = this._teamIdCounter++;
    const team = { ...insertTeam, id, icon: insertTeam.icon || null };
    this._teams.set(id, team);
    return team;
  }
  async updateTeamIcon(teamId, icon) {
    const team = this._teams.get(teamId);
    if (!team) return void 0;
    const updatedTeam = { ...team, icon };
    this._teams.set(teamId, updatedTeam);
    return updatedTeam;
  }
  // Category methods
  async getCategories() {
    return Array.from(this._categories.values());
  }
  async getCategory(id) {
    return this._categories.get(id);
  }
  async createCategory(insertCategory) {
    const id = this._categoryIdCounter++;
    const category = { ...insertCategory, id };
    this._categories.set(id, category);
    return category;
  }
  // Event methods
  async getEvents() {
    return Array.from(this._events.values());
  }
  async getEvent(id) {
    return this._events.get(id);
  }
  async createEvent(insertEvent) {
    const id = this._eventIdCounter++;
    const event = { ...insertEvent, id };
    this._events.set(id, event);
    return event;
  }
  async getEventsByCategory(categoryId) {
    return Array.from(this._events.values()).filter((event) => event.categoryId === categoryId);
  }
  // Result methods
  async getResults() {
    return Array.from(this._results.values());
  }
  async getResult(id) {
    return this._results.get(id);
  }
  async getResultsByTeamAndEvent(teamId, eventId) {
    return Array.from(this._results.values()).filter(
      (result) => result.teamId === teamId && result.eventId === eventId
    );
  }
  async getResultByTeamAndEvent(teamId, eventId) {
    const results3 = await this.getResultsByTeamAndEvent(teamId, eventId);
    return results3.length > 0 ? results3[0] : void 0;
  }
  async getResultsByEvent(eventId) {
    return Array.from(this._results.values()).filter((result) => result.eventId === eventId);
  }
  async getResultsByTeam(teamId) {
    return Array.from(this._results.values()).filter((result) => result.teamId === teamId);
  }
  async createResult(insertResult) {
    const id = this._resultIdCounter++;
    const result = { ...insertResult, id };
    this._results.set(id, result);
    return result;
  }
  async updateResult(id, medal, points) {
    const result = this._results.get(id);
    if (!result) return void 0;
    const updatedResult = { ...result, medal, points };
    this._results.set(id, updatedResult);
    return updatedResult;
  }
  async deleteResult(id) {
    if (this._results.has(id)) {
      this._results.delete(id);
    }
  }
  // Results publication setting
  // This flag controls whether results are visible to non-admin users (true)
  // or if they are hidden until explicitly published (false)
  _resultsPublished = false;
  // We'll keep track of when the last publish happened
  _lastPublishTime = Date.now();
  async setResultsPublished(publish) {
    this._resultsPublished = publish;
    if (publish) {
      this._lastPublishTime = Date.now();
    }
  }
  async getResultsPublished() {
    return this._resultsPublished;
  }
  // Get the last publish time (for timestamp-based filtering)
  getLastPublishTime() {
    return this._lastPublishTime;
  }
  // Computed data methods
  async getTeamStandings() {
    const teams3 = await this.getTeams();
    const standings = [];
    for (const team of teams3) {
      const results3 = await this.getResultsByTeam(team.id);
      const totalPoints = results3.reduce((sum, result) => sum + result.points, 0);
      const goldCount = results3.filter((result) => result.medal === MEDALS.GOLD).length;
      const silverCount = results3.filter((result) => result.medal === MEDALS.SILVER).length;
      const bronzeCount = results3.filter((result) => result.medal === MEDALS.BRONZE).length;
      standings.push({
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        icon: team.icon,
        totalPoints,
        goldCount,
        silverCount,
        bronzeCount
      });
    }
    return standings.sort((a, b) => b.totalPoints - a.totalPoints);
  }
  async getEventResults(eventId) {
    const event = await this.getEvent(eventId);
    if (!event) return void 0;
    const results3 = await this.getResultsByEvent(eventId);
    const teams3 = await this.getTeams();
    const goldResults = results3.filter((r) => r.medal === MEDALS.GOLD);
    const silverResults = results3.filter((r) => r.medal === MEDALS.SILVER);
    const bronzeResults = results3.filter((r) => r.medal === MEDALS.BRONZE);
    const gold = goldResults.length > 0 ? goldResults[0] : void 0;
    const silver = silverResults.length > 0 ? silverResults[0] : void 0;
    const bronze = bronzeResults.length > 0 ? bronzeResults[0] : void 0;
    const goldTeam = gold ? teams3.find((t) => t.id === gold.teamId) : void 0;
    const silverTeam = silver ? teams3.find((t) => t.id === silver.teamId) : void 0;
    const bronzeTeam = bronze ? teams3.find((t) => t.id === bronze.teamId) : void 0;
    return {
      eventId: event.id,
      eventName: event.name,
      gold: goldTeam ? { teamId: goldTeam.id, teamName: goldTeam.name, teamColor: goldTeam.color } : void 0,
      silver: silverTeam ? { teamId: silverTeam.id, teamName: silverTeam.name, teamColor: silverTeam.color } : void 0,
      bronze: bronzeTeam ? { teamId: bronzeTeam.id, teamName: bronzeTeam.name, teamColor: bronzeTeam.color } : void 0,
      results: results3
    };
  }
  async getCategoryWithEvents() {
    const categories3 = await this.getCategories();
    const result = [];
    for (const category of categories3) {
      const categoryEvents = await this.getEventsByCategory(category.id);
      result.push({
        category,
        events: categoryEvents
      });
    }
    return result;
  }
  // Initialize data
  async initializeData() {
    const teamData = [
      { name: "Royal Blue Dragons", color: "dragon" },
      { name: "Ninja Turquoise", color: "ninja" },
      { name: "Green Pythons", color: "python" },
      { name: "Yellow Hornets", color: "hornet" },
      { name: "Orange Jaguars", color: "jaguar" },
      { name: "Red Bulls", color: "bull" },
      { name: "Purple Wasps", color: "wasp" },
      { name: "Pink Panthers", color: "panther" },
      { name: "White Falcons", color: "falcon" },
      { name: "Gray Stallions", color: "stallion" },
      { name: "Brown Wolves", color: "wolf" },
      { name: "Maroon Tigers", color: "tiger" }
    ];
    for (const team of teamData) {
      if (!await this.getTeamByName(team.name)) {
        await this.createTeam(team);
      }
    }
    const categoryData = [
      { name: "VISUAL ARTS", color: "indigo" },
      { name: "QUIZ BOWL", color: "blue" },
      { name: "MUSICAL", color: "purple" },
      { name: "DANCES", color: "pink" },
      { name: "LITERARY", color: "amber" }
    ];
    const categoryMap = {};
    for (const category of categoryData) {
      const existing = Array.from(this._categories.values()).find((c) => c.name === category.name);
      if (!existing) {
        const created = await this.createCategory(category);
        categoryMap[category.name] = created.id;
      } else {
        categoryMap[category.name] = existing.id;
      }
    }
    const eventData = [
      // VISUAL ARTS
      { name: "On-the-Spot Poster Making", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "Pencil Drawing", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "In Situ Painting", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "Charcoal Rendering", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "Photo Contest", categoryId: categoryMap["VISUAL ARTS"] },
      // QUIZ BOWL
      { name: "Quiz Bowl", categoryId: categoryMap["QUIZ BOWL"] },
      // MUSICAL
      { name: "Instrumental Solo (Classical Guitar)", categoryId: categoryMap["MUSICAL"] },
      { name: "Instrumental Solo (Acoustic)", categoryId: categoryMap["MUSICAL"] },
      { name: "Live Band", categoryId: categoryMap["MUSICAL"] },
      { name: "Vocal Solo (Kundiman)", categoryId: categoryMap["MUSICAL"] },
      { name: "Vocal Duet", categoryId: categoryMap["MUSICAL"] },
      { name: "Pop Solo", categoryId: categoryMap["MUSICAL"] },
      // DANCES
      { name: "Contemporary Dance", categoryId: categoryMap["DANCES"] },
      { name: "Hip-Hop", categoryId: categoryMap["DANCES"] },
      // LITERARY
      { name: "Pagsusulat ng Sanaysay", categoryId: categoryMap["LITERARY"] },
      { name: "Essay Writing", categoryId: categoryMap["LITERARY"] },
      { name: "Pagkukwento", categoryId: categoryMap["LITERARY"] },
      { name: "Storytelling", categoryId: categoryMap["LITERARY"] },
      { name: "Dagliang Talumpati", categoryId: categoryMap["LITERARY"] },
      { name: "Extemporaneous Speaking", categoryId: categoryMap["LITERARY"] },
      { name: "Radio Drama", categoryId: categoryMap["LITERARY"] }
    ];
    for (const event of eventData) {
      const existing = Array.from(this._events.values()).find(
        (e) => e.name === event.name && e.categoryId === event.categoryId
      );
      if (!existing) {
        await this.createEvent(event);
      }
    }
    const teams3 = await this.getTeams();
    const allEvents = await this.getEvents();
    for (const team of teams3) {
      for (const event of allEvents) {
        const existing = await this.getResultByTeamAndEvent(team.id, event.id);
        if (!existing) {
          await this.createResult({
            teamId: team.id,
            eventId: event.id,
            medal: MEDALS.NO_ENTRY,
            points: POINTS[MEDALS.NO_ENTRY]
          });
        }
      }
    }
    const adminUsername = "arcuadmin";
    const existingAdmin = await this.getUserByUsername(adminUsername);
    if (!existingAdmin) {
      try {
        const { hashPassword: hashPassword3 } = await Promise.resolve().then(() => (init_auth_utils(), auth_utils_exports));
        const password = "ArCuAdmin2025";
        const hashedPassword = await hashPassword3(password);
        await this.createUser({
          username: adminUsername,
          password: hashedPassword,
          email: "admin@ustp.edu.ph",
          name: "ArCu Admin"
        });
        console.log("Admin user created with username 'arcuadmin'");
      } catch (error) {
        console.error("Failed to create admin user:", error);
        const { scrypt: scrypt2 } = await import("crypto");
        const { promisify: promisify2 } = await import("util");
        const { randomBytes: randomBytes2 } = await import("crypto");
        const scryptAsync2 = promisify2(scrypt2);
        const salt = randomBytes2(16).toString("hex");
        const password = "ArCuAdmin2025";
        const buf = await scryptAsync2(password, salt, 64);
        const hashedPassword = `${buf.toString("hex")}.${salt}`;
        await this.createUser({
          username: adminUsername,
          password: hashedPassword,
          email: "admin@ustp.edu.ph",
          name: "ArCu Admin"
        });
        console.log("Admin user created with username 'arcuadmin' (fallback method)");
      }
    }
  }
};
var storage = new MemStorage();
storage.initializeData();

// server/routes.ts
import { z } from "zod";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
init_auth_utils();
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "2025-ustp-claveria-arcu-days",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res) => {
    return res.status(403).json({ message: "Registration is disabled. Please contact system administrator." });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
}

// server/routes.ts
var updateResultSchema = z.object({
  teamId: z.number(),
  eventId: z.number(),
  medal: z.enum([MEDALS.GOLD, MEDALS.SILVER, MEDALS.BRONZE, MEDALS.NON_WINNER, MEDALS.NO_ENTRY])
});
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/teams", async (req, res) => {
    const teams3 = await storage.getTeams();
    return res.json(teams3);
  });
  app2.get("/api/categories", async (req, res) => {
    const categoriesWithEvents = await storage.getCategoryWithEvents();
    return res.json(categoriesWithEvents);
  });
  app2.get("/api/standings", async (req, res) => {
    const standings = await storage.getTeamStandings();
    const isAdmin = req.isAuthenticated();
    if (!isAdmin) {
      const published = await storage.getResultsPublished();
      if (!published) {
        const teams3 = await storage.getTeams();
        const zeroScoreStandings = teams3.map((team) => ({
          teamId: team.id,
          teamName: team.name,
          teamColor: team.color,
          icon: team.icon,
          totalPoints: 0,
          goldCount: 0,
          silverCount: 0,
          bronzeCount: 0
        }));
        return res.json(zeroScoreStandings);
      }
    }
    return res.json(standings);
  });
  app2.get("/api/events/:eventId/results", async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const eventResults = await storage.getEventResults(eventId);
    if (!eventResults) {
      return res.status(404).json({ message: "Event not found" });
    }
    const isAdmin = req.isAuthenticated();
    if (!isAdmin) {
      const published = await storage.getResultsPublished();
      if (!published) {
        const teams3 = await storage.getTeams();
        return res.json({
          eventId: eventResults.eventId,
          eventName: eventResults.eventName,
          gold: void 0,
          silver: void 0,
          bronze: void 0,
          results: []
          // Empty results
        });
      }
    }
    return res.json(eventResults);
  });
  app2.delete("/api/results/:resultId", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Please log in as admin" });
    }
    next();
  }, async (req, res) => {
    try {
      const resultId = parseInt(req.params.resultId);
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }
      const result = await storage.getResult(resultId);
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      await storage.deleteResult(resultId);
      return res.json({ message: "Result deleted successfully" });
    } catch (error) {
      console.error("Error deleting result:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/results/publish", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Please log in as admin" });
    }
    next();
  }, async (req, res) => {
    try {
      const { publish } = req.body;
      if (typeof publish !== "boolean") {
        return res.status(400).json({ message: "Publish flag must be a boolean" });
      }
      await storage.setResultsPublished(publish);
      return res.json({
        message: publish ? "Results published successfully" : "Results hidden successfully",
        published: publish
      });
    } catch (error) {
      console.error("Error toggling result visibility:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/events", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Please log in as admin" });
    }
    next();
  }, async (req, res) => {
    try {
      const { name, categoryId } = req.body;
      if (!name || !categoryId) {
        return res.status(400).json({ message: "Event name and category ID are required" });
      }
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const event = await storage.createEvent({ name, categoryId });
      return res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/results/update", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Please log in as admin" });
    }
    next();
  }, async (req, res) => {
    try {
      const { teamId, eventId, medal } = updateResultSchema.parse(req.body);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      const eventResults = await storage.getResultsByEvent(eventId);
      const points = POINTS[medal];
      const newResult = await storage.createResult({
        teamId,
        eventId,
        medal,
        points
      });
      const updatedStandings = await storage.getTeamStandings();
      const updatedEventResults = await storage.getEventResults(eventId);
      return res.json({
        message: "Result created successfully",
        result: newResult,
        standings: updatedStandings,
        eventResults: updatedEventResults
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    const events3 = await storage.getEvents();
    return res.json(events3);
  });
  app2.get("/api/results/published", async (req, res) => {
    const published = await storage.getResultsPublished();
    return res.json({ published });
  });
  app2.post("/api/teams/:teamId/icon", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Please log in as admin" });
    }
    next();
  }, async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      const { icon } = req.body;
      if (!icon || typeof icon !== "string") {
        return res.status(400).json({ message: "Icon data is required and must be a string" });
      }
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      const updatedTeam = await storage.updateTeamIcon(teamId, icon);
      return res.json({
        message: "Team icon updated successfully",
        team: updatedTeam
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "5mb" }));
app.use(express2.urlencoded({ limit: "5mb", extended: true }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

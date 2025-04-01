import { 
  Team, InsertTeam, teams,
  Category, InsertCategory, categories,
  Event, InsertEvent, events,
  Result, InsertResult, results,
  User, InsertUser, users,
  TeamStanding, EventResult,
  MEDALS, POINTS, MedalType
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Team methods
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  getTeamByName(name: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeamIcon(teamId: number, icon: string): Promise<Team | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByCategory(categoryId: number): Promise<Event[]>;
  
  // Result methods
  getResults(): Promise<Result[]>;
  getResult(id: number): Promise<Result | undefined>;
  getResultByTeamAndEvent(teamId: number, eventId: number): Promise<Result | undefined>;
  getResultsByTeamAndEvent(teamId: number, eventId: number): Promise<Result[]>;
  getResultsByEvent(eventId: number): Promise<Result[]>;
  getResultsByTeam(teamId: number): Promise<Result[]>;
  createResult(result: InsertResult): Promise<Result>;
  updateResult(id: number, medal: MedalType, points: number): Promise<Result | undefined>;
  deleteResult(id: number): Promise<void>;
  
  // Publication settings
  setResultsPublished(publish: boolean): Promise<void>;
  getResultsPublished(): Promise<boolean>;
  
  // Computed data methods
  getTeamStandings(): Promise<TeamStanding[]>;
  getEventResults(eventId: number): Promise<EventResult | undefined>;
  getCategoryWithEvents(): Promise<{category: Category, events: Event[]}[]>;
  
  // Initialize data
  initializeData(): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private _teams: Map<number, Team>;
  private _categories: Map<number, Category>;
  private _events: Map<number, Event>;
  private _results: Map<number, Result>;
  private _users: Map<number, User>;
  
  private _teamIdCounter: number;
  private _categoryIdCounter: number;
  private _eventIdCounter: number;
  private _resultIdCounter: number;
  private _userIdCounter: number;
  
  public sessionStore: session.Store;
  
  constructor() {
    this._teams = new Map();
    this._categories = new Map();
    this._events = new Map();
    this._results = new Map();
    this._users = new Map();
    
    this._teamIdCounter = 1;
    this._categoryIdCounter = 1;
    this._eventIdCounter = 1;
    this._resultIdCounter = 1;
    this._userIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Reset all data collections
    this._teams.clear();
    this._categories.clear();
    this._events.clear();
    this._results.clear();
    this._users.clear();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this._users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this._users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this._userIdCounter++;
    const user: User = { ...insertUser, id };
    this._users.set(id, user);
    return user;
  }
  
  // Team methods
  async getTeams(): Promise<Team[]> {
    return Array.from(this._teams.values());
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this._teams.get(id);
  }
  
  async getTeamByName(name: string): Promise<Team | undefined> {
    return Array.from(this._teams.values()).find(team => team.name === name);
  }
  
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this._teamIdCounter++;
    const team: Team = { ...insertTeam, id, icon: insertTeam.icon || null };
    this._teams.set(id, team);
    return team;
  }
  
  async updateTeamIcon(teamId: number, icon: string): Promise<Team | undefined> {
    const team = this._teams.get(teamId);
    if (!team) return undefined;
    
    const updatedTeam: Team = { ...team, icon };
    this._teams.set(teamId, updatedTeam);
    return updatedTeam;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this._categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this._categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this._categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this._categories.set(id, category);
    return category;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this._events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this._events.get(id);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this._eventIdCounter++;
    const event: Event = { ...insertEvent, id };
    this._events.set(id, event);
    return event;
  }
  
  async getEventsByCategory(categoryId: number): Promise<Event[]> {
    return Array.from(this._events.values()).filter(event => event.categoryId === categoryId);
  }
  
  // Result methods
  async getResults(): Promise<Result[]> {
    return Array.from(this._results.values());
  }
  
  async getResult(id: number): Promise<Result | undefined> {
    return this._results.get(id);
  }
  
  async getResultsByTeamAndEvent(teamId: number, eventId: number): Promise<Result[]> {
    return Array.from(this._results.values()).filter(
      (result) => result.teamId === teamId && result.eventId === eventId,
    );
  }
  
  async getResultByTeamAndEvent(teamId: number, eventId: number): Promise<Result | undefined> {
    // Keep this for backward compatibility, but it now returns only the first result
    const results = await this.getResultsByTeamAndEvent(teamId, eventId);
    return results.length > 0 ? results[0] : undefined;
  }
  
  async getResultsByEvent(eventId: number): Promise<Result[]> {
    return Array.from(this._results.values()).filter(result => result.eventId === eventId);
  }
  
  async getResultsByTeam(teamId: number): Promise<Result[]> {
    return Array.from(this._results.values()).filter(result => result.teamId === teamId);
  }
  
  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = this._resultIdCounter++;
    const result: Result = { ...insertResult, id };
    this._results.set(id, result);
    return result;
  }
  
  async updateResult(id: number, medal: MedalType, points: number): Promise<Result | undefined> {
    const result = this._results.get(id);
    if (!result) return undefined;
    
    const updatedResult: Result = { ...result, medal, points };
    this._results.set(id, updatedResult);
    return updatedResult;
  }
  
  async deleteResult(id: number): Promise<void> {
    if (this._results.has(id)) {
      this._results.delete(id);
    }
  }
  
  // Results publication setting
  // This flag controls whether results are visible to non-admin users (true)
  // or if they are hidden until explicitly published (false)
  private _resultsPublished: boolean = false;
  // We'll keep track of when the last publish happened
  private _lastPublishTime: number = Date.now();
  
  async setResultsPublished(publish: boolean): Promise<void> {
    this._resultsPublished = publish;
    if (publish) {
      // When explicitly publishing, update the last publish time to now
      this._lastPublishTime = Date.now();
    }
  }
  
  async getResultsPublished(): Promise<boolean> {
    return this._resultsPublished;
  }
  
  // Get the last publish time (for timestamp-based filtering)
  getLastPublishTime(): number {
    return this._lastPublishTime;
  }
  
  // Computed data methods
  async getTeamStandings(): Promise<TeamStanding[]> {
    const teams = await this.getTeams();
    const standings: TeamStanding[] = [];
    
    for (const team of teams) {
      const results = await this.getResultsByTeam(team.id);
      
      const totalPoints = results.reduce((sum, result) => sum + result.points, 0);
      const goldCount = results.filter(result => result.medal === MEDALS.GOLD).length;
      const silverCount = results.filter(result => result.medal === MEDALS.SILVER).length;
      const bronzeCount = results.filter(result => result.medal === MEDALS.BRONZE).length;
      
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
    
    // Sort standings by total points (descending)
    return standings.sort((a, b) => b.totalPoints - a.totalPoints);
  }
  
  async getEventResults(eventId: number): Promise<EventResult | undefined> {
    const event = await this.getEvent(eventId);
    if (!event) return undefined;
    
    const results = await this.getResultsByEvent(eventId);
    const teams = await this.getTeams();
    
    // Get all gold, silver, and bronze medals (there can be multiple for each)
    const goldResults = results.filter(r => r.medal === MEDALS.GOLD);
    const silverResults = results.filter(r => r.medal === MEDALS.SILVER);
    const bronzeResults = results.filter(r => r.medal === MEDALS.BRONZE);
    
    // Just get the first one for the summary display
    // The complete list is in the results array
    const gold = goldResults.length > 0 ? goldResults[0] : undefined;
    const silver = silverResults.length > 0 ? silverResults[0] : undefined;
    const bronze = bronzeResults.length > 0 ? bronzeResults[0] : undefined;
    
    const goldTeam = gold ? teams.find(t => t.id === gold.teamId) : undefined;
    const silverTeam = silver ? teams.find(t => t.id === silver.teamId) : undefined;
    const bronzeTeam = bronze ? teams.find(t => t.id === bronze.teamId) : undefined;
    
    return {
      eventId: event.id,
      eventName: event.name,
      gold: goldTeam ? { teamId: goldTeam.id, teamName: goldTeam.name, teamColor: goldTeam.color } : undefined,
      silver: silverTeam ? { teamId: silverTeam.id, teamName: silverTeam.name, teamColor: silverTeam.color } : undefined,
      bronze: bronzeTeam ? { teamId: bronzeTeam.id, teamName: bronzeTeam.name, teamColor: bronzeTeam.color } : undefined,
      results
    };
  }
  
  async getCategoryWithEvents(): Promise<{category: Category, events: Event[]}[]> {
    const categories = await this.getCategories();
    const result = [];
    
    for (const category of categories) {
      const categoryEvents = await this.getEventsByCategory(category.id);
      result.push({
        category,
        events: categoryEvents
      });
    }
    
    return result;
  }
  
  // Initialize data
  async initializeData(): Promise<void> {
    // We've removed this part because we now create the admin user later in the function
    // Admin user is created at the end of initializeData() with proper hashing
    
    // Create teams
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
      if (!(await this.getTeamByName(team.name))) {
        await this.createTeam(team);
      }
    }
    
    // Create categories
    const categoryData = [
      { name: "VISUAL ARTS", color: "indigo" },
      { name: "QUIZ BOWL", color: "blue" },
      { name: "MUSICAL", color: "purple" },
      { name: "DANCES", color: "pink" },
      { name: "LITERARY", color: "amber" },
      { name: "USG CONTESTS", color: "yellow"}
    ];
    
    const categoryMap: Record<string, number> = {};
    
    for (const category of categoryData) {
      const existing = Array.from(this._categories.values()).find(c => c.name === category.name);
      if (!existing) {
        const created = await this.createCategory(category);
        categoryMap[category.name] = created.id;
      } else {
        categoryMap[category.name] = existing.id;
      }
    }
    
    // Create events
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
        e => e.name === event.name && e.categoryId === event.categoryId
      );
      
      if (!existing) {
        await this.createEvent(event);
      }
    }
    
    // Initialize with no entries for all teams and events
    const teams = await this.getTeams();
    const allEvents = await this.getEvents();
    
    for (const team of teams) {
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
    
    // Create admin user if it doesn't exist
    const adminUsername = "arcuadmin";
    const existingAdmin = await this.getUserByUsername(adminUsername);
    
    if (!existingAdmin) {
      try {
        // Import the hashPassword function from auth-utils.ts
        const { hashPassword } = await import('./auth-utils');
        
        const password = "ArCuAdmin2025";
        const hashedPassword = await hashPassword(password);
        
        await this.createUser({
          username: adminUsername,
          password: hashedPassword,
          email: "admin@ustp.edu.ph",
          name: "ArCu Admin"
        });
        console.log("Admin user created with username 'arcuadmin'");
      } catch (error) {
        console.error("Failed to create admin user:", error);
        
        // Fallback to manual password hashing if import fails
        const { scrypt } = await import('crypto');
        const { promisify } = await import('util');
        const { randomBytes } = await import('crypto');
        
        const scryptAsync = promisify(scrypt);
        
        // Create proper hash with random salt
        const salt = randomBytes(16).toString("hex");
        const password = "ArCuAdmin2025";
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
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
}

export const storage = new MemStorage();
storage.initializeData(); // Initialize data when server starts

import { 
  Character, 
  Team, 
  Battle, 
  User,
  InsertCharacter, 
  InsertTeam, 
  InsertBattle,
  InsertUser
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Character operations
  getCharacters(userId?: number): Promise<Character[]>;
  getPublicCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Team operations
  getTeams(userId?: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Battle operations
  getBattles(userId?: number): Promise<Battle[]>;
  getBattle(id: number): Promise<Battle | undefined>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  updateBattle(id: number, battle: Partial<InsertBattle>): Promise<Battle | undefined>;
  deleteBattle(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private teams: Map<number, Team>;
  private battles: Map<number, Battle>;
  private userIdCounter: number;
  private characterIdCounter: number;
  private teamIdCounter: number;
  private battleIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.teams = new Map();
    this.battles = new Map();
    this.userIdCounter = 1;
    this.characterIdCounter = 1;
    this.teamIdCounter = 1;
    this.battleIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt, isPublic: false };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Character methods
  async getCharacters(userId?: number): Promise<Character[]> {
    const characters = Array.from(this.characters.values());
    if (userId !== undefined) {
      return characters.filter(character => character.userId === userId);
    }
    return characters;
  }

  async getPublicCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (character) => character.isPublic
    );
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = this.characterIdCounter++;
    const createdAt = new Date();
    const newCharacter: Character = { 
      ...character, 
      id, 
      createdAt,
      isPublic: character.isPublic || false
    };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined> {
    const existingCharacter = this.characters.get(id);
    if (!existingCharacter) return undefined;

    const updatedCharacter = { ...existingCharacter, ...character };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Team methods
  async getTeams(userId?: number): Promise<Team[]> {
    const teams = Array.from(this.teams.values());
    if (userId !== undefined) {
      return teams.filter(team => team.userId === userId);
    }
    return teams;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.teamIdCounter++;
    const createdAt = new Date();
    // Initialize characterAbilities if not provided
    const characterAbilities = team.characterAbilities || {};
    const newTeam: Team = { ...team, characterAbilities, id, createdAt };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined> {
    const existingTeam = this.teams.get(id);
    if (!existingTeam) return undefined;

    const updatedTeam = { ...existingTeam, ...team };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<boolean> {
    return this.teams.delete(id);
  }

  // Battle methods
  async getBattles(userId?: number): Promise<Battle[]> {
    const battles = Array.from(this.battles.values());
    if (userId !== undefined) {
      return battles.filter(battle => battle.userId === userId);
    }
    return battles;
  }

  async getBattle(id: number): Promise<Battle | undefined> {
    return this.battles.get(id);
  }

  async createBattle(battle: InsertBattle): Promise<Battle> {
    const id = this.battleIdCounter++;
    const createdAt = new Date();
    const newBattle: Battle = { 
      ...battle, 
      id, 
      createdAt,
      currentTurn: battle.currentTurn || 1
    };
    this.battles.set(id, newBattle);
    return newBattle;
  }

  async updateBattle(id: number, battle: Partial<InsertBattle>): Promise<Battle | undefined> {
    const existingBattle = this.battles.get(id);
    if (!existingBattle) return undefined;

    const updatedBattle = { ...existingBattle, ...battle };
    this.battles.set(id, updatedBattle);
    return updatedBattle;
  }

  async deleteBattle(id: number): Promise<boolean> {
    return this.battles.delete(id);
  }
}

export const storage = new MemStorage();

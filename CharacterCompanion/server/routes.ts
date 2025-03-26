import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCharacterSchema, 
  insertTeamSchema, 
  insertBattleSchema 
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // Character routes
  app.get("/api/characters", async (req, res) => {
    try {
      let characters = [];
      
      if (req.query.public === "true") {
        // Return public characters with creator info
        characters = await storage.getPublicCharactersWithCreator();
      } else if (req.isAuthenticated()) {
        // Return user's characters
        characters = await storage.getCharacters(req.user!.id);
      }
      
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to get characters", error });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to get character", error });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const characterData = insertCharacterSchema.parse({
        ...req.body,
        userId: req.user!.id // Add the current user's ID
      });
      
      const newCharacter = await storage.createCharacter(characterData);
      res.status(201).json(newCharacter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create character", error });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const characterData = insertCharacterSchema.partial().parse(req.body);
      const updatedCharacter = await storage.updateCharacter(id, characterData);
      
      if (!updatedCharacter) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.json(updatedCharacter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update character", error });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }

      const success = await storage.deleteCharacter(id);
      if (!success) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character", error });
    }
  });

  // Team routes
  app.get("/api/teams", async (req, res) => {
    try {
      let teams = [];
      
      if (req.isAuthenticated()) {
        // Return user's teams
        teams = await storage.getTeams(req.user!.id);
      }
      
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get teams", error });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }

      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to get team", error });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const teamData = insertTeamSchema.parse({
        ...req.body,
        userId: req.user!.id // Add the current user's ID
      });
      
      const newTeam = await storage.createTeam(teamData);
      res.status(201).json(newTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create team", error });
    }
  });

  app.put("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }

      const teamData = insertTeamSchema.partial().parse(req.body);
      const updatedTeam = await storage.updateTeam(id, teamData);
      
      if (!updatedTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.json(updatedTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update team", error });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }

      const success = await storage.deleteTeam(id);
      if (!success) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team", error });
    }
  });

  // Battle routes
  app.get("/api/battles", async (req, res) => {
    try {
      let battles = [];
      
      if (req.isAuthenticated()) {
        // Return user's battles
        battles = await storage.getBattles(req.user!.id);
      }
      
      res.json(battles);
    } catch (error) {
      res.status(500).json({ message: "Failed to get battles", error });
    }
  });

  app.get("/api/battles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }

      const battle = await storage.getBattle(id);
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }

      res.json(battle);
    } catch (error) {
      res.status(500).json({ message: "Failed to get battle", error });
    }
  });

  app.post("/api/battles", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const battleData = insertBattleSchema.parse({
        ...req.body,
        userId: req.user!.id // Add the current user's ID
      });
      
      const newBattle = await storage.createBattle(battleData);
      res.status(201).json(newBattle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid battle data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create battle", error });
    }
  });

  app.put("/api/battles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }

      const battleData = insertBattleSchema.partial().parse(req.body);
      const updatedBattle = await storage.updateBattle(id, battleData);
      
      if (!updatedBattle) {
        return res.status(404).json({ message: "Battle not found" });
      }

      res.json(updatedBattle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid battle data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update battle", error });
    }
  });

  app.delete("/api/battles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }

      const success = await storage.deleteBattle(id);
      if (!success) {
        return res.status(404).json({ message: "Battle not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete battle", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

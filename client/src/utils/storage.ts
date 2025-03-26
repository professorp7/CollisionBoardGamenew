import { Character, Team, Battle } from "@shared/schema";

// Character Storage
export const loadCharacters = (): Character[] => {
  try {
    const storedCharacters = localStorage.getItem('characters');
    return storedCharacters ? JSON.parse(storedCharacters) : [];
  } catch (error) {
    console.error('Error loading characters from localStorage:', error);
    return [];
  }
};

export const saveCharacters = (characters: Character[]): void => {
  try {
    localStorage.setItem('characters', JSON.stringify(characters));
  } catch (error) {
    console.error('Error saving characters to localStorage:', error);
  }
};

// Team Storage
export const loadTeams = (): Team[] => {
  try {
    const storedTeams = localStorage.getItem('teams');
    return storedTeams ? JSON.parse(storedTeams) : [];
  } catch (error) {
    console.error('Error loading teams from localStorage:', error);
    return [];
  }
};

export const saveTeams = (teams: Team[]): void => {
  try {
    localStorage.setItem('teams', JSON.stringify(teams));
  } catch (error) {
    console.error('Error saving teams to localStorage:', error);
  }
};

// Battle Storage
export const loadBattles = (): Battle[] => {
  try {
    const storedBattles = localStorage.getItem('battles');
    return storedBattles ? JSON.parse(storedBattles) : [];
  } catch (error) {
    console.error('Error loading battles from localStorage:', error);
    return [];
  }
};

export const saveBattles = (battles: Battle[]): void => {
  try {
    localStorage.setItem('battles', JSON.stringify(battles));
  } catch (error) {
    console.error('Error saving battles to localStorage:', error);
  }
};

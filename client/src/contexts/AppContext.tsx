import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  Character, 
  Team, 
  Battle, 
  Ability, 
  BattleState, 
  BattleCharacterState 
} from "@shared/schema";
import { loadCharacters, saveCharacters, loadTeams, saveTeams, loadBattles, saveBattles } from "../utils/storage";

interface AppContextType {
  // Characters
  characters: Character[];
  selectedCharacter: Character | null;
  setSelectedCharacter: (character: Character | null) => void;
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: number) => void;

  // Teams
  teams: Team[];
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team | null) => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (id: number) => void;

  // Battles
  battles: Battle[];
  currentBattle: Battle | null;
  setCurrentBattle: (battle: Battle | null) => void;
  addBattle: (battle: Omit<Battle, 'id'>) => void;
  updateBattle: (battle: Battle) => void;
  deleteBattle: (id: number) => void;

  // Dice
  diceRolls: Array<{
    id: string;
    formula: string;
    result: number;
    breakdown: string;
    timestamp: Date;
    name?: string;
  }>;
  rollDice: (formula: string, name?: string) => { 
    result: number; 
    breakdown: string; 
  };
  clearRollHistory: () => void;
  savedRolls: Array<{
    id: string;
    name: string;
    formula: string;
  }>;
  saveDiceRoll: (name: string, formula: string) => void;
  deleteSavedRoll: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Characters state
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Teams state
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Battles state
  const [battles, setBattles] = useState<Battle[]>([]);
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null);

  // Dice state
  const [diceRolls, setDiceRolls] = useState<AppContextType['diceRolls']>([]);
  const [savedRolls, setSavedRolls] = useState<AppContextType['savedRolls']>([]);

  // Load data from local storage on component mount
  useEffect(() => {
    const loadedCharacters = loadCharacters();
    setCharacters(loadedCharacters);

    const loadedTeams = loadTeams();
    setTeams(loadedTeams);

    const loadedBattles = loadBattles();
    setBattles(loadedBattles);

    // Load dice rolls and saved rolls from local storage
    const storedRolls = localStorage.getItem('diceRolls');
    if (storedRolls) {
      try {
        const parsedRolls = JSON.parse(storedRolls).map((roll: any) => ({
          ...roll,
          timestamp: new Date(roll.timestamp)
        }));
        setDiceRolls(parsedRolls);
      } catch (e) {
        console.error('Error loading dice rolls:', e);
      }
    }

    const storedSavedRolls = localStorage.getItem('savedRolls');
    if (storedSavedRolls) {
      try {
        setSavedRolls(JSON.parse(storedSavedRolls));
      } catch (e) {
        console.error('Error loading saved rolls:', e);
      }
    }
  }, []);

  // Save characters to local storage when they change
  useEffect(() => {
    if (characters.length > 0) {
      saveCharacters(characters);
    }
  }, [characters]);

  // Save teams to local storage when they change
  useEffect(() => {
    if (teams.length > 0) {
      saveTeams(teams);
    }
  }, [teams]);

  // Save battles to local storage when they change
  useEffect(() => {
    if (battles.length > 0) {
      saveBattles(battles);
    }
  }, [battles]);

  // Save dice rolls to local storage when they change
  useEffect(() => {
    localStorage.setItem('diceRolls', JSON.stringify(diceRolls));
  }, [diceRolls]);

  // Save saved rolls to local storage when they change
  useEffect(() => {
    localStorage.setItem('savedRolls', JSON.stringify(savedRolls));
  }, [savedRolls]);

  // Character functions
  const addCharacter = (character: Omit<Character, 'id'>) => {
    const newId = characters.length > 0 
      ? Math.max(...characters.map(c => c.id)) + 1 
      : 1;
    const newCharacter = { ...character, id: newId };
    setCharacters([...characters, newCharacter]);
  };

  const updateCharacter = (updatedCharacter: Character) => {
    setCharacters(characters.map(char => 
      char.id === updatedCharacter.id ? updatedCharacter : char
    ));
  };

  const deleteCharacter = (id: number) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  // Team functions
  const addTeam = (team: Omit<Team, 'id'>) => {
    const newId = teams.length > 0 
      ? Math.max(...teams.map(t => t.id)) + 1 
      : 1;
    const newTeam = { ...team, id: newId };
    setTeams([...teams, newTeam]);
  };

  const updateTeam = (updatedTeam: Team) => {
    setTeams(teams.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    ));
  };

  const deleteTeam = (id: number) => {
    setTeams(teams.filter(team => team.id !== id));
  };

  // Battle functions
  const addBattle = (battle: Omit<Battle, 'id'>) => {
    const newId = battles.length > 0 
      ? Math.max(...battles.map(b => b.id)) + 1 
      : 1;
    const newBattle = { ...battle, id: newId };
    setBattles([...battles, newBattle]);
  };

  const updateBattle = (updatedBattle: Battle) => {
    setBattles(battles.map(battle => 
      battle.id === updatedBattle.id ? updatedBattle : battle
    ));
  };

  const deleteBattle = (id: number) => {
    setBattles(battles.filter(battle => battle.id !== id));
  };

  // Dice functions
  const rollDice = (formula: string, name?: string) => {
      // Import dice utility function
      const result = Math.floor(Math.random() * parseInt(formula.split('d')[1])) + 1;
      const breakdown = `${formula} = ${result}`;

    // Add roll to history
    const newRoll = {
      id: Date.now().toString(),
      formula,
      result,
      breakdown,
      timestamp: new Date(),
      name
    };

    setDiceRolls(prev => [newRoll, ...prev.slice(0, 19)]);  // Keep only last 20 rolls

    return { result, breakdown };
  };

  const clearRollHistory = () => {
    setDiceRolls([]);
  };

  const saveDiceRoll = (name: string, formula: string) => {
    const newSavedRoll = {
      id: Date.now().toString(),
      name,
      formula
    };

    setSavedRolls(prev => [...prev, newSavedRoll]);
  };

  const deleteSavedRoll = (id: string) => {
    setSavedRolls(prev => prev.filter(roll => roll.id !== id));
  };

  const value = {
    characters,
    selectedCharacter,
    setSelectedCharacter,
    addCharacter,
    updateCharacter,
    deleteCharacter,

    teams,
    selectedTeam,
    setSelectedTeam,
    addTeam,
    updateTeam,
    deleteTeam,

    battles,
    currentBattle,
    setCurrentBattle,
    addBattle,
    updateBattle,
    deleteBattle,

    diceRolls,
    rollDice,
    clearRollHistory,
    savedRolls,
    saveDiceRoll,
    deleteSavedRoll
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
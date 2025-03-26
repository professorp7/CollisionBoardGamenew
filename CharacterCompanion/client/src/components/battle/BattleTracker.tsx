import { useState, useEffect, useCallback } from "react";
import { Character, BattleState, BattleCharacterState, Ability } from "@shared/schema";
import { Button } from "@/components/ui/button";
import BattleCharacter from "./BattleCharacter";
import { useAppContext } from "../../contexts/AppContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droppable, DraggableItem } from "@/components/ui/draggable";

interface BattleTrackerProps {
  characters: Character[];
  onEndBattle: () => void;
}

export default function BattleTracker({ characters, onEndBattle }: BattleTrackerProps) {
  const { currentBattle, rollDice, teams } = useAppContext();

  // Tabs state
  const [activeTab, setActiveTab] = useState<'battle' | 'setup'>('setup');

  // Initial battle state
  const [battleState, setBattleState] = useState<BattleState>({
    allies: [],
    opponents: []
  });

  // Team setup state
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<number | null>(null);
  const [battleCharacters, setBattleCharacters] = useState<BattleCharacterState[]>([]);

  // Battle state
  const [currentTurn, setCurrentTurn] = useState(1);
  const [showQuickDiceDialog, setShowQuickDiceDialog] = useState(false);
  const [diceResult, setDiceResult] = useState<{ result: number; formula: string } | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<{ ability: Ability; character: Character } | null>(null);

  // Load initial battle state from current battle
  useEffect(() => {
    if (currentBattle) {
      setBattleState(currentBattle.battleState as BattleState);
      setCurrentTurn(currentBattle.currentTurn || 1);

      if (currentBattle.teamId) {
        setSelectedTeamId(currentBattle.teamId);
      }

      if (currentBattle.opponentTeamId) {
        setSelectedOpponentTeamId(currentBattle.opponentTeamId);
      }

      // If battle is already in progress, switch to battle tab
      if (
        currentBattle.battleState && 
        (
          (currentBattle.battleState as BattleState).allies?.length > 0 ||
          (currentBattle.battleState as BattleState).opponents?.length > 0
        )
      ) {
        setActiveTab('battle');
      }
    }
  }, [currentBattle]);

  // Get the character data for a battle character
  const getCharacterById = (id: number) => {
    return characters.find(c => c.id === id);
  };

  // Setup teams when selected
  useEffect(() => {
    // Initialize battle characters from selected teams
    const selectedTeam = teams.find(t => t.id === selectedTeamId);
    const opponentTeam = teams.find(t => t.id === selectedOpponentTeamId);

    const allBattleCharacters: BattleCharacterState[] = [];

    // Add characters from selected team
    if (selectedTeam) {
      selectedTeam.characterIds.forEach((charId, index) => {
        const character = getCharacterById(charId);
        if (character) {
          allBattleCharacters.push({
            characterId: charId,
            uniqueId: `ally-${charId}-${Date.now()}-${index}`,
            currentHp: character.hp,
            status: '',
            turnOrder: index + 1,
            isAlly: true
          });
        }
      });
    }

    // Add characters from opponent team
    if (opponentTeam) {
      opponentTeam.characterIds.forEach((charId, index) => {
        const character = getCharacterById(charId);
        if (character) {
          allBattleCharacters.push({
            characterId: charId,
            uniqueId: `opponent-${charId}-${Date.now()}-${index}`,
            currentHp: character.hp,
            status: '',
            turnOrder: allBattleCharacters.length + index + 1,
            isAlly: false
          });
        }
      });
    }

    // Sort by initiative if starting a new battle
    if (battleState.allies.length === 0 && battleState.opponents.length === 0) {
      allBattleCharacters.sort((a, b) => {
        const charA = getCharacterById(a.characterId);
        const charB = getCharacterById(b.characterId);
        return (charB?.initiative || 0) - (charA?.initiative || 0);
      });

      // Re-assign turn order based on initiative
      allBattleCharacters.forEach((char, index) => {
        char.turnOrder = index + 1;
      });
    }

    setBattleCharacters(allBattleCharacters);
  }, [selectedTeamId, selectedOpponentTeamId, teams, characters]);

  // Handle starting the battle
  const handleStartBattle = () => {
    if (!selectedTeamId) {
      // Show an error or alert
      return;
    }

    // Separate characters into allies and opponents
    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    if (!selectedTeam) return;

    const allies: BattleCharacterState[] = [];
    const opponents: BattleCharacterState[] = [];

    battleCharacters.forEach(char => {
      if (selectedTeam.characterIds.includes(char.characterId)) {
        allies.push(char);
      } else {
        opponents.push(char);
      }
    });

    // Set the battle state
    setBattleState({
      allies,
      opponents
    });

    // Switch to battle tab
    setActiveTab('battle');

    // Reset turn counter
    setCurrentTurn(1);
  };

  // Handle next turn
  const handleNextTurn = () => {
    setCurrentTurn(prevTurn => prevTurn + 1);
  };

  // Handle rolling quick dice
  const handleQuickDice = () => {
    setShowQuickDiceDialog(true);
  };

  const handleRollDice = (formula: string) => {
    try {
      const { result, breakdown } = rollDice(formula);
      setDiceResult({ result, formula });
    } catch (error) {
      console.error('Error rolling dice:', error);
    }
  };

  // Update a battle character's HP or status
  const updateBattleCharacter = (
    side: 'allies' | 'opponents',
    characterId: number,
    updates: Partial<BattleCharacterState>
  ) => {
    setBattleState(prev => ({
      ...prev,
      [side]: prev[side].map(char => 
        char.characterId === characterId ? { ...char, ...updates } : char
      )
    }));
  };

  // Handle using an ability
  const handleUseAbility = (character: Character, ability: Ability) => {
    setSelectedAbility({ character, ability });

    // If the ability has a damage formula, roll it automatically
    if (ability.damage) {
      handleRollDice(ability.damage);
      setShowQuickDiceDialog(true);
    }
  };

  // Get the current active character
  const getCurrentActiveCharacter = () => {
    // Combine allies and opponents and sort by turn order
    const allBattleCharacters = [...battleState.allies, ...battleState.opponents]
      .sort((a, b) => a.turnOrder - b.turnOrder);

    if (allBattleCharacters.length === 0) return null;

    // Get the active character based on current turn
    const activeCharacterIndex = (currentTurn - 1) % allBattleCharacters.length;
    const activeCharacter = allBattleCharacters[activeCharacterIndex];

    if (!activeCharacter) return null;

    const characterData = getCharacterById(activeCharacter.characterId);
    return characterData ? { ...activeCharacter, character: characterData } : null;
  };

  const activeCharacter = getCurrentActiveCharacter();

  // Get the side (allies or opponents) for a character
  const getCharacterSide = (characterId: number): 'allies' | 'opponents' | null => {
    if (battleState.allies.some(c => c.characterId === characterId)) {
      return 'allies';
    } else if (battleState.opponents.some(c => c.characterId === characterId)) {
      return 'opponents';
    }
    return null;
  };

  // Skip turns for characters at 0 HP
  const advanceTurn = useCallback(() => {
    setBattleCharacters(prevChars => {
      let nextIndex = (currentTurn % prevChars.length);
      let attempts = 0;
      
      // Find next valid character (not at 0 HP)
      while (attempts < prevChars.length) {
        const nextChar = prevChars[nextIndex];
        if (nextChar.currentHp > 0) {
          break;
        }
        nextIndex = (nextIndex + 1) % prevChars.length;
        attempts++;
      }
      
      return prevChars;
    });
    
    setCurrentTurn(prev => prev + 1);
  }, [currentTurn]);

  // Handle reordering characters via drag and drop
  const handleReorderCharacters = useCallback((result: { sourceIndex: number; destinationIndex: number }) => {
    if (typeof result.sourceIndex !== 'number' || typeof result.destinationIndex !== 'number') {
      console.error("Invalid drag result:", result);
      return;
    }

    setBattleCharacters(prevChars => {
      const updated = [...prevChars];
      const [draggedItem] = updated.splice(result.sourceIndex, 1);
      updated.splice(result.destinationIndex, 0, {
        ...draggedItem,
        uniqueId: draggedItem.uniqueId || `${draggedItem.characterId}-${Date.now()}`
      });

      // Update turn order
      return updated.map((char, idx) => ({
        ...char,
        turnOrder: idx + 1
      }));
    });
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg text-white p-4 md:p-5">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'battle' | 'setup')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="setup" className="data-[state=active]:bg-primary">
              Battle Setup
            </TabsTrigger>
            <TabsTrigger value="battle" className="data-[state=active]:bg-primary">
              Battle Arena
            </TabsTrigger>
          </TabsList>

          <div>
            {activeTab === 'setup' ? (
              <Button onClick={handleStartBattle} disabled={!selectedTeamId}>
                <i className="fas fa-play mr-1"></i> Start Battle
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <i className="fas fa-flag mr-1"></i> End Battle
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End Battle</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to end this battle? All progress will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onEndBattle}>
                      End Battle
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <TabsContent value="setup" className="mt-0">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-heading text-xl mb-4">Battle Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Your Team Selection */}
              <div>
                <Label className="text-sm text-gray-300 mb-2 block">Select Your Team</Label>
                <div className="space-y-2">
                  {teams.map(team => (
                    <div
                      key={team.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedTeamId === team.id 
                          ? 'bg-primary/20 border-primary' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{team.name}</span>
                        <span className="text-sm text-gray-400">{team.characterIds.length} members</span>
                      </div>
                    </div>
                  ))}

                  {teams.length === 0 && (
                    <div className="text-center p-6 border border-dashed border-gray-700 rounded-md">
                      <p className="text-gray-400">No teams available</p>
                      <p className="text-sm text-gray-500 mt-1">Create a team first in the Teams tab</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Opponent Team Selection */}
              <div>
                <Label className="text-sm text-gray-300 mb-2 block">Select Opponent Team</Label>
                <div className="space-y-2">
                  {teams.filter(t => t.id !== selectedTeamId).map(team => (
                    <div
                      key={team.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedOpponentTeamId === team.id 
                          ? 'bg-red-500/20 border-red-500' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedOpponentTeamId(team.id)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{team.name}</span>
                        <span className="text-sm text-gray-400">{team.characterIds.length} members</span>
                      </div>
                    </div>
                  ))}

                  {teams.length <= 1 && (
                    <div className="text-center p-6 border border-dashed border-gray-700 rounded-md">
                      <p className="text-gray-400">No opponent teams available</p>
                      <p className="text-sm text-gray-500 mt-1">Create another team to battle against</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Turn Order Adjustment */}
          {battleCharacters.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-heading text-lg mb-4 flex items-center">
                <i className="fas fa-sort-numeric-down mr-2"></i> 
                Turn Order
                <span className="text-sm font-normal ml-2 text-gray-400">
                  (Drag to reorder)
                </span>
              </h3>

              <Droppable
                id="turn-order"
                className="space-y-2"
                onDrop={result => handleReorderCharacters(result)}
              >
                {battleCharacters.map((char, index) => {
                  const character = getCharacterById(char.characterId);
                  if (!character) return null;

                  const isAlly = selectedTeamId && teams.find(t => t.id === selectedTeamId)?.characterIds.includes(char.characterId);

                  return (
                    <DraggableItem
                      key={char.uniqueId}
                      id={char.uniqueId}
                      index={index}
                      data={char}
                      onDragEnd={() => {}} // Handled by the Droppable
                    >
                      <div className={`
                        flex items-center p-3 rounded-md
                        ${isAlly ? 'bg-primary/20 border border-primary/30' : 'bg-red-500/20 border border-red-500/30'}
                      `}>
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 mr-3 cursor-move">
                          {char.turnOrder}
                        </div>
                        <div>
                          <div className="font-medium">{character.name}</div>
                          <div className="text-xs text-gray-400">
                            Initiative: {character.initiative} | HP: {character.hp} | Speed: {character.speed}
                          </div>
                        </div>
                      </div>
                    </DraggableItem>
                  );
                })}
              </Droppable>
            </div>
          )}
        </TabsContent>

        <TabsContent value="battle" className="mt-0">
          {/* Battle Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Team Side */}
            <div>
              <h3 className="font-heading text-lg mb-3 border-b border-gray-700 pb-2">Your Team</h3>
              <div className="space-y-3">
                {battleState.allies.map(ally => {
                  const character = getCharacterById(ally.characterId);
                  if (!character) return null;

                  const isActive = activeCharacter?.characterId === ally.characterId;

                  return (
                    <BattleCharacter
                      key={ally.characterId}
                      character={character}
                      currentHp={ally.currentHp}
                      status={ally.status}
                      turnOrder={ally.turnOrder}
                      isActive={isActive}
                      onUpdateHp={(hp) => updateBattleCharacter('allies', ally.characterId, { currentHp: hp })}
                      onUpdateStatus={(status) => updateBattleCharacter('allies', ally.characterId, { status })}
                      onUseAbility={(ability) => handleUseAbility(character, ability)}
                    />
                  );
                })}

                {battleState.allies.length === 0 && (
                  <div className="text-center p-6 border border-dashed border-gray-700 rounded-md">
                    <p className="text-gray-400">No allies in battle</p>
                    <p className="text-sm text-gray-500 mt-1">Set up your team in the Battle Setup tab</p>
                  </div>
                )}
              </div>
            </div>

            {/* Opponent Team Side */}
            <div>
              <h3 className="font-heading text-lg mb-3 border-b border-gray-700 pb-2">Opponent Team</h3>
              <div className="space-y-3">
                {battleState.opponents.map(opponent => {
                  const character = getCharacterById(opponent.characterId);
                  if (!character) return null;

                  const isActive = activeCharacter?.characterId === opponent.characterId;

                  return (
                    <BattleCharacter
                      key={opponent.characterId}
                      character={character}
                      currentHp={opponent.currentHp}
                      status={opponent.status}
                      turnOrder={opponent.turnOrder}
                      isActive={isActive}
                      isOpponent={true}
                      onUpdateHp={(hp) => updateBattleCharacter('opponents', opponent.characterId, { currentHp: hp })}
                      onUpdateStatus={(status) => updateBattleCharacter('opponents', opponent.characterId, { status })}
                      onUseAbility={(ability) => handleUseAbility(character, ability)}
                    />
                  );
                })}

                {battleState.opponents.length === 0 && (
                  <div className="text-center p-6 border border-dashed border-gray-700 rounded-md">
                    <p className="text-gray-400">No opponents in battle</p>
                    <p className="text-sm text-gray-500 mt-1">Set up opponent team in the Battle Setup tab</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Battle Controls */}
          <div className="mt-6 flex flex-wrap justify-between items-center bg-gray-800 p-3 rounded-md">
            <div className="flex items-center space-x-3">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleNextTurn}
                disabled={battleState.allies.length === 0 || battleState.opponents.length === 0}
              >
                <i className="fas fa-step-forward mr-1"></i> Next Turn
              </Button>
              <div>
                <span className="text-sm">Turn: <span className="font-medium">{currentTurn}</span></span>
                <span className="text-sm block md:inline md:ml-4">
                  Current: <span className="font-medium">{activeCharacter ? getCharacterById(activeCharacter.characterId)?.name : 'None'}</span>
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                className="bg-gray-700 hover:bg-gray-600"
                onClick={handleQuickDice}
              >
                <i className="fas fa-dice mr-1"></i> Quick Dice
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Dice Dialog */}
      <Dialog open={showQuickDiceDialog} onOpenChange={setShowQuickDiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAbility ? `${selectedAbility.character.name}: ${selectedAbility.ability.name}` : 'Quick Dice Roll'}
            </DialogTitle>
            <DialogDescription>
              {selectedAbility 
                ? selectedAbility.ability.description 
                : 'Select a dice to roll or enter a custom formula'}
            </DialogDescription>
          </DialogHeader>

          {selectedAbility && (
            <div className="bg-gray-100 p-3 rounded-md mb-4 text-gray-800 text-sm">
              {selectedAbility.ability.damage && (
                <div><span className="font-medium">Damage:</span> {selectedAbility.ability.damage}</div>
              )}
              {selectedAbility.ability.range && (
                <div><span className="font-medium">Range:</span> {selectedAbility.ability.range}</div>
              )}
              {selectedAbility.ability.effect && (
                <div><span className="font-medium">Effect:</span> {selectedAbility.ability.effect}</div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 my-4">
            {[4, 6, 8, 10, 12, 20].map(sides => (
              <Button
                key={sides}
                variant="outline"
                className="h-12 w-full text-lg"
                onClick={() => handleRollDice(`1d${sides}`)}
              >
                d{sides}
              </Button>
            ))}
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label>Custom Roll</Label>
              <Input
                placeholder="e.g. 2d6+3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRollDice((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            <Button 
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling?.querySelector('input');
                if (input) {
                  handleRollDice(input.value || '1d20');
                } else {
                  handleRollDice('1d20');
                }
              }}
            >
              Roll
            </Button>
          </div>

          {diceResult && (
            <div className="bg-gray-100 p-4 rounded-md text-center mt-4">
              <p className="text-sm text-gray-500">{diceResult.formula}</p>
              <p className="text-4xl font-bold text-primary mt-1">{diceResult.result}</p>
            </div>
          )}

          <DialogFooter>
            <Button 
              onClick={() => {
                setShowQuickDiceDialog(false);
                setSelectedAbility(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
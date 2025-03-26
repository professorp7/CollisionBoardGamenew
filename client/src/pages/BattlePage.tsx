import { useState, useEffect } from "react";
import BattleTracker from "../components/battle/BattleTracker";
import { useAppContext } from "../contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Character, Team, Battle, BattleState, BattleCharacterState } from "@shared/schema";

export default function BattlePage() {
  const { teams, characters, battles, addBattle, updateBattle, currentBattle, setCurrentBattle } = useAppContext();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<string>("");
  const [showNewOpponentDialog, setShowNewOpponentDialog] = useState(false);
  const [isBattleActive, setIsBattleActive] = useState(false);
  
  // Reset selections when battle ends
  useEffect(() => {
    if (!isBattleActive) {
      setCurrentBattle(null);
    }
  }, [isBattleActive, setCurrentBattle]);
  
  const handleStartBattle = () => {
    const playerTeam = teams.find(t => t.id.toString() === selectedTeamId);
    const opponentTeam = teams.find(t => t.id.toString() === selectedOpponentTeamId);
    
    if (!playerTeam) return;
    
    // Setup battle characters and their initial states
    const alliesState: BattleCharacterState[] = playerTeam.characterIds
      .map((charId, index) => {
        const character = characters.find(c => c.id === charId);
        if (!character) return null;
        
        return {
          characterId: charId,
          currentHp: character.hp,
          status: "",
          turnOrder: index + 1
        };
      })
      .filter(Boolean) as BattleCharacterState[];
    
    const opponentsState: BattleCharacterState[] = [];
    
    if (opponentTeam) {
      opponentTeam.characterIds.forEach((charId, index) => {
        const character = characters.find(c => c.id === charId);
        if (!character) return;
        
        opponentsState.push({
          characterId: charId,
          currentHp: character.hp,
          status: "",
          turnOrder: index + 1
        });
      });
    }
    
    const battleState: BattleState = {
      allies: alliesState,
      opponents: opponentsState
    };
    
    const newBattle: Omit<Battle, 'id'> = {
      name: `${playerTeam.name} vs ${opponentTeam?.name || 'Custom Opponent'}`,
      teamId: playerTeam.id,
      opponentTeamId: opponentTeam?.id,
      currentTurn: 1,
      battleState
    };
    
    addBattle(newBattle);
    setIsBattleActive(true);
  };
  
  const getTeamSelectOptions = () => {
    return teams.map(team => {
      const memberCount = team.characterIds.length;
      return (
        <SelectItem key={team.id} value={team.id.toString()}>
          {team.name} ({memberCount} members)
        </SelectItem>
      );
    });
  };
  
  if (isBattleActive) {
    return (
      <BattleTracker 
        characters={characters}
        onEndBattle={() => setIsBattleActive(false)}
      />
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Battle Tracker</h2>
        <div>
          <Button variant="outline" className="mr-2">
            <i className="fas fa-cog mr-1"></i> Settings
          </Button>
          <Button
            onClick={handleStartBattle}
            disabled={!selectedTeamId}
          >
            <i className="fas fa-play mr-1"></i> Start Battle
          </Button>
        </div>
      </div>

      {/* Team Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label className="block mb-2 font-medium">Your Team</Label>
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {getTeamSelectOptions()}
            </SelectContent>
          </Select>
          {teams.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Create a team in the Teams tab first
            </p>
          )}
        </div>
        <div>
          <Label className="block mb-2 font-medium">Opponent Team</Label>
          <Select value={selectedOpponentTeamId} onValueChange={setSelectedOpponentTeamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an opponent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Create New Opponent</SelectItem>
              {getTeamSelectOptions()}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Create Opponent Dialog */}
      <Dialog open={showNewOpponentDialog} onOpenChange={setShowNewOpponentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Opponent</DialogTitle>
          </DialogHeader>
          {/* Opponent creation form goes here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}

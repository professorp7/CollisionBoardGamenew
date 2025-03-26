import { useState, useEffect } from "react";
import { Character, Team, Ability } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface TeamBuilderProps {
  team: Team | null;
  allCharacters: Character[];
  onSave: (team: Team) => void;
  onCancel: () => void;
}

export default function TeamBuilder({
  team,
  allCharacters,
  onSave,
  onCancel
}: TeamBuilderProps) {
  const [name, setName] = useState("");
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>([]);
  const [selectedCharacterAbilities, setSelectedCharacterAbilities] = useState<Record<number, string[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacterForAbilities, setSelectedCharacterForAbilities] = useState<Character | null>(null);
  const [showAbilitySelection, setShowAbilitySelection] = useState(false);
  const [tempSelectedAbilityIds, setTempSelectedAbilityIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize form when a team is selected
  useEffect(() => {
    if (team) {
      setName(team.name);
      setSelectedCharacterIds(team.characterIds);
      setSelectedCharacterAbilities(team.characterAbilities || {});
    } else {
      // Reset form
      setName("");
      setSelectedCharacterIds([]);
      setSelectedCharacterAbilities({});
    }
  }, [team]);

  // Initialize ability selection when character changes
  useEffect(() => {
    if (selectedCharacterForAbilities) {
      // Initialize with current selection or empty array
      setTempSelectedAbilityIds(
        selectedCharacterAbilities[selectedCharacterForAbilities.id] || []
      );
    }
  }, [selectedCharacterForAbilities, selectedCharacterAbilities]);

  // Handle save team
  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required",
        variant: "destructive"
      });
      return;
    }
    
    const updatedTeam = {
      id: team?.id || 0,
      name,
      characterIds: selectedCharacterIds,
      characterAbilities: selectedCharacterAbilities
    };
    
    onSave(updatedTeam);
    toast({
      title: "Success",
      description: team?.id ? "Team updated" : "Team created",
    });
  };
  
  // Open ability selection dialog for a character
  const handleSelectAbilities = (character: Character) => {
    setSelectedCharacterForAbilities(character);
    setShowAbilitySelection(true);
  };
  
  // Save the selected abilities for a character
  const handleSaveAbilities = (characterId: number, selectedAbilityIds: string[]) => {
    setSelectedCharacterAbilities({
      ...selectedCharacterAbilities,
      [characterId]: selectedAbilityIds
    });
    setShowAbilitySelection(false);
    setSelectedCharacterForAbilities(null);
    
    toast({
      title: "Abilities Updated",
      description: `Selected ${selectedAbilityIds.length}/7 abilities for battle`,
    });
  };
  
  // Add character to team
  const handleAddCharacter = (id: number) => {
    if (!selectedCharacterIds.includes(id)) {
      setSelectedCharacterIds([...selectedCharacterIds, id]);
    }
  };
  
  // Remove character from team
  const handleRemoveCharacter = (id: number) => {
    setSelectedCharacterIds(selectedCharacterIds.filter(charId => charId !== id));
  };
  
  // Toggle ability selection in dialog
  const toggleAbilitySelection = (abilityId: string) => {
    if (tempSelectedAbilityIds.includes(abilityId)) {
      setTempSelectedAbilityIds(tempSelectedAbilityIds.filter(id => id !== abilityId));
    } else {
      if (tempSelectedAbilityIds.length < 7) {
        setTempSelectedAbilityIds([...tempSelectedAbilityIds, abilityId]);
      } else {
        toast({
          title: "Maximum Abilities Reached",
          description: "You can only select up to 7 abilities for battle",
          variant: "destructive"
        });
      }
    }
  };
  
  // Filter available characters based on search
  const filteredCharacters = allCharacters.filter(character => 
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedCharacterIds.includes(character.id)
  );
  
  // Get selected characters
  const selectedCharacters = selectedCharacterIds
    .map(id => allCharacters.find(c => c.id === id))
    .filter(Boolean) as Character[];

  // Render empty state if no team is selected
  if (!team) {
    return (
      <Card className="w-full md:w-2/3 h-[calc(100vh-180px)]">
        <CardContent className="pt-6 flex h-full items-center justify-center">
          <div className="text-center text-gray-500">
            <i className="fas fa-users text-4xl mb-2"></i>
            <p>Select a team from the list or create a new one</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Return main team builder UI
  return (
    <>
      <Card className="w-full md:w-2/3 h-[calc(100vh-180px)]">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold">Team Builder</h2>
            <span className="text-sm text-gray-600">
              <span id="team-count">{selectedCharacterIds.length}</span>/6 Members
            </span>
          </div>
          
          <ScrollArea className="h-[calc(100vh-260px)]">
            <div className="mb-4">
              <Label className="mb-1 font-medium">Team Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>

            {/* Character Selection */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-heading font-medium mb-3">Available Characters</h3>
              <div className="mb-3">
                <Input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {allCharacters.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No characters available</p>
                  <p className="text-sm mt-1">Create characters in the Characters tab first</p>
                </div>
              ) : filteredCharacters.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No matching characters found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredCharacters.map(character => (
                    <div
                      key={character.id}
                      className="bg-white border rounded-md p-2 cursor-pointer hover:border-primary transition flex items-center text-sm"
                      onClick={() => handleAddCharacter(character.id)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-2 text-xs font-medium">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate font-medium">{character.name}</div>
                        <div className="text-xs text-gray-500">HP: {character.hp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Team Members */}
            <div>
              <h3 className="font-heading font-medium mb-3">Team Members</h3>
              <div className="space-y-2">
                {selectedCharacters.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-md">
                    <p className="text-gray-500">No team members selected</p>
                    <p className="text-sm text-gray-500 mt-1">Select characters from the list above</p>
                  </div>
                ) : (
                  selectedCharacters.map(character => {
                    const selectedAbilityCount = selectedCharacterAbilities[character.id]?.length || 0;
                    
                    return (
                      <div
                        key={character.id}
                        className="border rounded-md p-3 bg-white"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full mr-3">
                              <i className="fas fa-user"></i>
                            </div>
                            <div>
                              <div className="font-medium">{character.name}</div>
                              <div className="text-xs text-gray-500">
                                HP: {character.hp} | AC: {character.ac} | Speed: {character.speed}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button
                              className="text-gray-400 hover:text-destructive transition ml-2"
                              title="Remove from team"
                              onClick={() => handleRemoveCharacter(character.id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <span className={selectedAbilityCount === 0 ? 'text-amber-500' : ''}>
                              Abilities: {selectedAbilityCount}/7 selected
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSelectAbilities(character)}
                          >
                            <i className="fas fa-cog mr-1"></i> Manage Abilities
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Team
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Ability Selection Dialog */}
      <Dialog open={showAbilitySelection} onOpenChange={setShowAbilitySelection}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select Abilities for {selectedCharacterForAbilities?.name || "Character"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCharacterForAbilities && (
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Select up to 7 abilities that this character will use in battle
              </p>
              
              <div className="space-y-3">
                {selectedCharacterForAbilities.abilities.map((ability) => (
                  <div 
                    key={ability.id}
                    className="border rounded-md p-3 bg-white cursor-pointer"
                    onClick={() => toggleAbilitySelection(ability.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={`ability-${ability.id}`}
                        checked={tempSelectedAbilityIds.includes(ability.id)}
                        onCheckedChange={() => toggleAbilitySelection(ability.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label 
                            htmlFor={`ability-${ability.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {ability.name}
                          </Label>
                          {ability.isPassive && (
                            <Badge variant="secondary" className="text-xs">Passive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {ability.description}
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          {ability.damage && (
                            <div>
                              <span className="text-gray-500">Damage:</span> {ability.damage}
                            </div>
                          )}
                          {ability.range && (
                            <div>
                              <span className="text-gray-500">Range:</span> {ability.range}
                            </div>
                          )}
                          {ability.effect && (
                            <div>
                              <span className="text-gray-500">Effect:</span> {ability.effect}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm">
              <span className={tempSelectedAbilityIds.length === 7 ? "text-amber-500" : ""}>
                {tempSelectedAbilityIds.length}/7 abilities selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAbilitySelection(false);
                  setSelectedCharacterForAbilities(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedCharacterForAbilities) {
                    handleSaveAbilities(
                      selectedCharacterForAbilities.id,
                      tempSelectedAbilityIds
                    );
                  }
                }}
              >
                Save Abilities
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

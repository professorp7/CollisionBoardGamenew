import { useState, useEffect } from "react";
import { Character, Ability } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import AbilityItem from "./AbilityItem";

interface CharacterFormProps {
  character: Character | null;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export default function CharacterForm({ character, onSave, onCancel }: CharacterFormProps) {
  const [name, setName] = useState("");
  const [hp, setHp] = useState(10);
  const [speed, setSpeed] = useState(30);
  const [ac, setAc] = useState(10);
  const [initiative, setInitiative] = useState(0);
  const [tags, setTags] = useState("");
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const { toast } = useToast();

  // Initialize form when a character is selected
  useEffect(() => {
    if (character) {
      setName(character.name);
      setHp(character.hp);
      setSpeed(character.speed);
      setAc(character.ac);
      setInitiative(character.initiative);
      setTags(character.tags || "");
      setAbilities(character.abilities);
    } else {
      // Reset form
      setName("");
      setHp(10);
      setSpeed(30);
      setAc(10);
      setInitiative(0);
      setTags("");
      setAbilities([]);
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Character name is required",
        variant: "destructive"
      });
      return;
    }
    
    const updatedCharacter: Character = {
      id: character?.id || 0,
      name,
      hp,
      speed,
      ac,
      initiative,
      tags,
      abilities
    };
    
    onSave(updatedCharacter);
    toast({
      title: "Success",
      description: character?.id ? "Character updated" : "Character created",
    });
  };
  
  const handleAddAbility = () => {
    const newAbility: Ability = {
      id: Date.now().toString(),
      name: "New Ability",
      description: "",
      isPassive: false
    };
    
    setAbilities([...abilities, newAbility]);
  };
  
  const handleUpdateAbility = (updatedAbility: Ability) => {
    setAbilities(abilities.map(ability => 
      ability.id === updatedAbility.id ? updatedAbility : ability
    ));
  };
  
  const handleDeleteAbility = (id: string) => {
    setAbilities(abilities.filter(ability => ability.id !== id));
  };

  if (!character) {
    return (
      <Card className="w-full md:w-2/3 h-[calc(100vh-180px)]">
        <CardContent className="pt-6 flex h-full items-center justify-center">
          <div className="text-center text-gray-500">
            <i className="fas fa-user-alt text-4xl mb-2"></i>
            <p>Select a character from the list or create a new one</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-2/3 h-[calc(100vh-180px)]">
      <CardContent className="pt-5">
        <h2 className="text-xl font-heading font-bold mb-6">Character Editor</h2>
        
        <ScrollArea className="h-[calc(100vh-260px)]">
          <form id="character-form" onSubmit={handleSubmit}>
            {/* Character Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="mb-1 font-medium">Character Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Share with Community</span>
                </label>
              </div>
              <div>
                <Label className="mb-1 font-medium">Tags (optional)</Label>
                <Input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tank, Knight, Human (comma separated)"
                />
              </div>
            </div>

            {/* Character Stats */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-heading font-medium mb-3">Character Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm mb-1">HP</Label>
                  <Input
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1">Speed</Label>
                  <Input
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1">AC</Label>
                  <Input
                    type="number"
                    value={ac}
                    onChange={(e) => setAc(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1">Initiative</Label>
                  <Input
                    type="number"
                    value={initiative}
                    onChange={(e) => setInitiative(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Character Abilities */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-heading font-medium">Abilities ({abilities.length})</h3>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  onClick={handleAddAbility}
                  className="text-primary"
                >
                  <i className="fas fa-plus-circle mr-1"></i> Add Ability
                </Button>
              </div>

              <div className="space-y-4">
                {abilities.map(ability => (
                  <AbilityItem 
                    key={ability.id}
                    ability={ability}
                    onUpdate={handleUpdateAbility}
                    onDelete={handleDeleteAbility}
                  />
                ))}
                
                {abilities.length === 0 && (
                  <div className="text-center py-6 border border-dashed rounded-md">
                    <p className="text-gray-500">No abilities added yet</p>
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleAddAbility}
                      className="mt-2"
                    >
                      Add your first ability
                    </Button>
                  </div>
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
              <Button type="submit">
                Save Character
              </Button>
            </div>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

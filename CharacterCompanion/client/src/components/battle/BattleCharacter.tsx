import { Character, Ability } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DraggableItemProps } from "@/components/ui/draggable";

interface BattleCharacterProps {
  character: Character;
  currentHp: number;
  status: string;
  turnOrder: number;
  isActive: boolean;
  isOpponent?: boolean;
  onUpdateHp: (hp: number) => void;
  onUpdateStatus: (status: string) => void;
  onUseAbility?: (ability: Ability) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function BattleCharacter({
  character,
  currentHp,
  status,
  turnOrder,
  isActive,
  isOpponent = false,
  onUpdateHp,
  onUpdateStatus,
  onUseAbility,
  dragHandleProps
}: BattleCharacterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeAbilities = character.abilities.filter(ability => !ability.isPassive); //Filter out passive abilities

  // Calculate HP percentage for health bar
  const hpPercentage = Math.max(0, Math.min(100, (currentHp / character.hp) * 100));
  const healthBarColor = hpPercentage > 60 ? 'bg-green-500' : hpPercentage > 30 ? 'bg-amber-500' : 'bg-red-500';

  // Handle updating HP with +/- buttons
  const handleHpChange = (amount: number) => {
    const newHp = Math.max(0, currentHp + amount);
    onUpdateHp(newHp);
  };

  // Handle direct HP input
  const handleHpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHp = parseInt(e.target.value);
    if (!isNaN(newHp) && newHp >= 0) {
      onUpdateHp(newHp);
    }
  };

  // Handle status update
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateStatus(e.target.value);
  };

  return (
    <Collapsible 
      open={isExpanded} 
      onOpenChange={setIsExpanded}
      className={`battle-character bg-battleui-light rounded-md overflow-hidden transition-shadow ${
        isActive ? 'ring-2 ring-offset-0 ring-primary/50' : ''
      } ${
        isExpanded ? 'shadow-lg' : ''
      }`}
    >
      <div className="relative">
        {isActive && (
          <div className={`absolute top-0 left-0 w-1 h-full ${isOpponent ? 'bg-error' : 'bg-primary'}`}></div>
        )}

        {/* Character Header with Drag Handle */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                {...dragHandleProps} 
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-700 cursor-move"
              >
                <span className="text-xs">{turnOrder}</span>
              </div>
              <span className="font-medium">{character.name}</span>
              {status && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-400">
                  {status}
                </Badge>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <button className="h-5 w-5 rounded-full hover:bg-gray-700 flex items-center justify-center">
                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
              </button>
            </CollapsibleTrigger>
          </div>

          {/* Health Bar */}
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${healthBarColor} transition-all duration-500`}
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>

          {/* Character Stats */}
          <div className="mt-2 grid grid-cols-4 gap-1 text-xs text-gray-300">
            <div>HP: {currentHp}/{character.hp}</div>
            <div>AC: {character.ac}</div>
            <div>SPD: {character.speed}</div>
            <div>INIT: {character.initiative}</div>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <CollapsibleContent>
        <div className="p-3 pt-0 border-t border-gray-700 mt-2">
          {/* HP Controls */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-gray-300 text-xs mb-1">HP</label>
              <div className="flex">
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2 h-8 bg-battleui border-gray-600 rounded-l-md hover:bg-gray-700 text-white"
                  onClick={() => handleHpChange(-1)}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={currentHp}
                  onChange={handleHpInput}
                  className="h-8 w-full bg-battleui border-t border-b border-gray-600 text-center text-white"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2 h-8 bg-battleui border-gray-600 rounded-r-md hover:bg-gray-700 text-white"
                  onClick={() => handleHpChange(1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-xs mb-1">Status</label>
              <Input
                type="text"
                value={status}
                onChange={handleStatusChange}
                placeholder="None"
                className="h-8 w-full bg-battleui border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Abilities Section */}
          <div>
            {activeAbilities.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Abilities</h4>
                  <div className="space-y-2">
                    {activeAbilities.map((ability) => (
                      <div 
                        key={ability.id}
                        className="p-2 bg-gray-800 rounded-md text-sm"
                        onClick={() => onUseAbility?.(ability)}
                      >
                        <div className="font-medium">{ability.name}</div>
                        {ability.damage && (
                          <div className="text-xs text-red-400">Damage: {ability.damage}</div>
                        )}
                        {ability.effect && (
                          <div className="text-xs text-blue-400">Effect: {ability.effect}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
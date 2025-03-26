import { useState } from "react";
import { Ability } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AbilityItemProps {
  ability: Ability;
  onUpdate: (ability: Ability) => void;
  onDelete: (id: string) => void;
}

export default function AbilityItem({ ability, onUpdate, onDelete }: AbilityItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleChange = (field: keyof Ability, value: string | boolean) => {
    onUpdate({
      ...ability,
      [field]: value
    });
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-md overflow-hidden"
    >
      <CollapsibleTrigger className="w-full bg-gray-100 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-medium">{ability.name}</span>
          <span className={`ml-2 text-xs text-white px-2 py-0.5 rounded-full ${ability.isPassive ? 'bg-secondary' : 'bg-primary'}`}>
            {ability.isPassive ? 'Passive' : 'Active'}
          </span>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-400 hover:text-primary mr-2"
            title="Edit ability"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            type="button"
            className="text-gray-400 hover:text-destructive mr-2"
            title="Remove ability"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ability.id);
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
          <i className={`fas fa-chevron-down transform ${isOpen ? 'rotate-180' : ''} transition-transform`}></i>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm mb-1">Ability Name</Label>
              <Input
                type="text"
                value={ability.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm mb-1">Type</Label>
              <Select
                value={ability.isPassive ? "passive" : "active"}
                onValueChange={(value) => handleChange('isPassive', value === "passive")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="passive">Passive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm mb-1">Damage</Label>
              <Input
                type="text"
                value={ability.damage || ""}
                onChange={(e) => handleChange('damage', e.target.value)}
                placeholder={ability.isPassive ? "N/A" : "e.g. 2d6+3"}
              />
            </div>
            <div>
              <Label className="text-sm mb-1">Range</Label>
              <Input
                type="text"
                value={ability.range || ""}
                onChange={(e) => handleChange('range', e.target.value)}
                placeholder="e.g. 5 ft, Self"
              />
            </div>
            <div>
              <Label className="text-sm mb-1">Special Effect</Label>
              <Input
                type="text"
                value={ability.effect || ""}
                onChange={(e) => handleChange('effect', e.target.value)}
                placeholder="e.g. Knockback 5 ft"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1">Description</Label>
            <Textarea
              value={ability.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              placeholder="Describe what this ability does"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

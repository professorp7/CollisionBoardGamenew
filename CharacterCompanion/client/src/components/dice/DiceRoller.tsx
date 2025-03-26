import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "../../contexts/AppContext";
import { rollDice } from "../../utils/dice";

interface DiceRollerProps {
  onRollDie: (sides: number) => void;
  customDiceCount: number;
  setCustomDiceCount: (count: number) => void;
  customDiceType: string;
  setCustomDiceType: (type: string) => void;
  customDiceModifier: number;
  setCustomDiceModifier: (modifier: number) => void;
  onRollCustom: () => void;
  currentRoll: {
    formula: string;
    result: number;
    breakdown: string;
  } | null;
  savedRolls: Array<{
    id: string;
    name: string;
    formula: string;
  }>;
  onRollSaved: (formula: string, name: string) => void;
  onSaveCurrentRoll: () => void;
  className?: string;
}

export default function DiceRoller({
  onRollDie,
  customDiceCount,
  setCustomDiceCount,
  customDiceType,
  setCustomDiceType,
  customDiceModifier,
  setCustomDiceModifier,
  onRollCustom,
  currentRoll,
  savedRolls,
  onRollSaved,
  onSaveCurrentRoll,
  className = ""
}: DiceRollerProps) {
  const handleDiceCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setCustomDiceCount(value);
    }
  };

  const handleModifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setCustomDiceModifier(value);
    }
  };

  const handleRollDie = (sides: number) => {
    onRollDie(sides);
  };


  const handleRollCustom = () => {
    const numDice = customDiceCount;
    const dieType = parseInt(customDiceType);
    const modifier = customDiceModifier;
    const result = rollDice(numDice, dieType, modifier);
    dispatch({ type: 'SET_CURRENT_ROLL', payload: result });
  };

  return (
    <Card className={className}>
      <CardContent className="pt-5">
        <h2 className="text-xl font-heading font-bold mb-6">Dice Roller</h2>

        {/* Dice Selection */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {[4, 6, 8, 10, 12, 20].map(sides => (
            <div key={sides} className="dice-container">
              <Button
                variant="primary"
                className="dice w-full aspect-square bg-primary text-white rounded-lg shadow-md flex items-center justify-center hover:bg-primary-dark transition"
                onClick={() => handleRollDie(sides)}
              >
                <span className="text-2xl font-mono">d{sides}</span>
              </Button>
            </div>
          ))}
        </div>

        {/* Custom Roll */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="font-heading font-medium mb-3">Custom Roll</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1">
              <Label className="text-sm mb-1">Number of Dice</Label>
              <Input
                type="number"
                value={customDiceCount}
                onChange={handleDiceCountChange}
                min={1}
                max={10}
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm mb-1">Dice Type</Label>
              <Select value={customDiceType} onValueChange={setCustomDiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">d4</SelectItem>
                  <SelectItem value="6">d6</SelectItem>
                  <SelectItem value="8">d8</SelectItem>
                  <SelectItem value="10">d10</SelectItem>
                  <SelectItem value="12">d12</SelectItem>
                  <SelectItem value="20">d20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-sm mb-1">Modifier</Label>
              <Input
                type="number"
                value={customDiceModifier}
                onChange={handleModifierChange}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleRollCustom}>Roll</Button>
            </div>
          </div>
        </div>

        {/* Current Roll Result */}
        <div className="bg-white border-2 border-primary rounded-md p-6 text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            {currentRoll ? `Current Roll (${currentRoll.formula})` : 'Roll a die to see result'}
          </div>
          <div className="text-5xl font-mono font-bold text-primary">
            {currentRoll ? currentRoll.result : '-'}
          </div>
          {currentRoll && currentRoll.breakdown !== currentRoll.result.toString() && (
            <div className="text-xs text-gray-500 mt-2">
              {currentRoll.breakdown}
            </div>
          )}
        </div>

        {/* Saved Rolls */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-heading font-medium">Saved Rolls</h3>
            <Button
              variant="link"
              size="sm"
              className="text-primary"
              onClick={onSaveCurrentRoll}
              disabled={!currentRoll}
            >
              <i className="fas fa-plus-circle mr-1"></i> Save Current
            </Button>
          </div>
          <div className="space-y-2">
            {savedRolls.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No saved rolls yet</p>
                <p className="text-sm mt-1">Save a roll to quickly use it again</p>
              </div>
            ) : (
              savedRolls.map(roll => (
                <div
                  key={roll.id}
                  className="bg-gray-50 p-3 rounded-md flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{roll.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{roll.formula}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onRollSaved(roll.formula, roll.name)}
                  >
                    Roll
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
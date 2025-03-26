import { useState } from "react";
import DiceRoller from "../components/dice/DiceRoller";
import RollHistory from "../components/dice/RollHistory";
import { useAppContext } from "../contexts/AppContext";

export default function DicePage() {
  const { diceRolls, rollDice, clearRollHistory, savedRolls, saveDiceRoll, deleteSavedRoll } = useAppContext();
  const [customDiceCount, setCustomDiceCount] = useState<number>(1);
  const [customDiceType, setCustomDiceType] = useState<string>("20");
  const [customDiceModifier, setCustomDiceModifier] = useState<number>(0);
  const [currentRoll, setCurrentRoll] = useState<{
    formula: string;
    result: number;
    breakdown: string;
  } | null>(null);
  
  // Handle rolling a single die (d4, d6, d8, etc.)
  const handleRollDie = (sides: number) => {
    const formula = `1d${sides}`;
    const { result, breakdown } = rollDice(formula);
    setCurrentRoll({
      formula,
      result,
      breakdown
    });
  };
  
  // Handle rolling custom dice formula
  const handleRollCustomDice = () => {
    let formula = `${customDiceCount}d${customDiceType}`;
    if (customDiceModifier !== 0) {
      formula += customDiceModifier > 0 ? `+${customDiceModifier}` : customDiceModifier;
    }
    
    const { result, breakdown } = rollDice(formula);
    setCurrentRoll({
      formula,
      result,
      breakdown
    });
  };
  
  // Handle rolling a saved formula
  const handleRollSaved = (formula: string, name: string) => {
    const { result, breakdown } = rollDice(formula, name);
    setCurrentRoll({
      formula,
      result,
      breakdown
    });
  };
  
  // Handle saving the current formula
  const handleSaveCurrentRoll = () => {
    if (currentRoll) {
      saveDiceRoll("Custom Roll", currentRoll.formula);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <DiceRoller 
        onRollDie={handleRollDie}
        customDiceCount={customDiceCount}
        setCustomDiceCount={setCustomDiceCount}
        customDiceType={customDiceType}
        setCustomDiceType={setCustomDiceType}
        customDiceModifier={customDiceModifier}
        setCustomDiceModifier={setCustomDiceModifier}
        onRollCustom={handleRollCustomDice}
        currentRoll={currentRoll}
        savedRolls={savedRolls}
        onRollSaved={handleRollSaved}
        onSaveCurrentRoll={handleSaveCurrentRoll}
        className="lg:col-span-2"
      />
      
      <RollHistory 
        rollHistory={diceRolls}
        onClearHistory={clearRollHistory}
      />
    </div>
  );
}

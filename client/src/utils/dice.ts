// Utility function to roll a single die with given number of sides
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

// Dice rolling utility functions
export function rollDice(formula: string): { result: number; breakdown: string } {
  if (typeof formula !== 'string') {
    throw new Error('Formula must be a string');
  }

  // Normalize the formula by removing spaces
  const normalizedFormula = formula.replace(/\s/g, '');

  // Parse the formula into number of dice, sides, and modifier
  const match = normalizedFormula.match(/^(\d+)?d(\d+)([+-]\d+)?$/);
  if (!match) {
    throw new Error('Invalid dice formula');
  }

  const [, countStr, sidesStr, modifierStr] = match;
  const count = parseInt(countStr || '1');
  const sides = parseInt(sidesStr);
  const modifier = modifierStr ? parseInt(modifierStr) : 0;

  // Roll the dice
  let total = 0;
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  // Add modifier
  total += modifier;

  // Create breakdown string
  const breakdown = `[${rolls.join(' + ')}]${modifier ? (modifier > 0 ? ' + ' + modifier : ' - ' + Math.abs(modifier)) : ''}`;

  return {
    result: total,
    breakdown
  };
}
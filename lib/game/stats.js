export const STAT_KEYS = ["STR", "DEX", "MA", "EN", "ACC", "INT", "CHR"];

export const STAT_LABELS = {
  STR: "Strength",
  DEX: "Dexterity",
  MA: "Mana / Aura",
  EN: "Endurance",
  ACC: "Accuracy",
  INT: "Intelligence",
  CHR: "Charisma",
};

export const CLASS_BONUSES = {
  Warrior: "STR",
  Rogue: "DEX",
  Mage: "MA",
  Cleric: "EN",
  Ranger: "ACC",
  Bard: "CHR",
};

export const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Tiefling", "Orc"];
export const CLASSES = Object.keys(CLASS_BONUSES);
export const BASE_STAT_TOTAL = 70;
export const CLASS_BONUS_VALUE = 3;

export function calculateModifier(score) {
  return Math.floor((Number(score) - 10) / 2);
}

export function validateBaseStats(baseStats) {
  if (!baseStats || typeof baseStats !== "object") return "Missing stats.";

  const total = STAT_KEYS.reduce((sum, key) => {
    const value = Number(baseStats[key]);
    if (!Number.isInteger(value) || value < 1 || value > 20) return Number.NaN;
    return sum + value;
  }, 0);

  if (Number.isNaN(total)) return "Each stat must be a whole number from 1 to 20.";
  if (total !== BASE_STAT_TOTAL) return `Stats must total ${BASE_STAT_TOTAL}.`;
  return "";
}

export function buildFinalStats(className, baseStats) {
  const bonusStat = CLASS_BONUSES[className];
  const finalStats = {};

  for (const key of STAT_KEYS) {
    const score = Number(baseStats[key]) + (key === bonusStat ? CLASS_BONUS_VALUE : 0);
    finalStats[key] = {
      score,
      modifier: calculateModifier(score),
    };
  }

  return { finalStats, bonusStat };
}

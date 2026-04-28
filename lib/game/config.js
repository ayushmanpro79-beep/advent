import { CLASS_BONUSES, STAT_LABELS } from "./stats";

export const races = ["Human", "Elf", "Dwarf", "Halfling", "Tiefling", "Orc"];
export const classes = Object.keys(CLASS_BONUSES);

export const classDetails = classes.map((className) => {
  const bonusStat = CLASS_BONUSES[className];
  return {
    name: className,
    bonusStat,
    bonusLabel: STAT_LABELS[bonusStat],
  };
});

export const emptyCharacterDisplay = {
  name: "No Character Yet",
  race: "Unknown",
  className: "Unassigned",
  level: 1,
  xp: "0 / 1,000",
  stats: {
    STR: { score: 0, modifier: 0 },
    DEX: { score: 0, modifier: 0 },
    MA: { score: 0, modifier: 0 },
    EN: { score: 0, modifier: 0 },
    ACC: { score: 0, modifier: 0 },
    INT: { score: 0, modifier: 0 },
    CHR: { score: 0, modifier: 0 },
  },
  hp: "0 / 0",
  ac: "-",
  speed: "-",
  proficiencies: "Create a character to unlock your sheet.",
  inventory: [],
};

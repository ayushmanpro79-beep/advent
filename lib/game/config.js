export const races = ["Human", "Elf", "Dwarf", "Halfling", "Tiefling", "Orc"];
export const classes = ["Warrior", "Rogue", "Mage", "Cleric", "Ranger", "Bard"];

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

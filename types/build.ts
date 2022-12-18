import { Engraving } from './engravings';

export enum ItemType {
  NECKLACE = 'NECKLACE',
  EARRING = 'EARRING',
  RING = 'RING',
  STONE = 'STONE',
  BOOK = 'BOOK',
}

interface EngravingValue {
  [key: string]: number;
}

export interface Item {
  type: ItemType;
  engravings: EngravingValue;
}

export interface Build {
  name?: string;
  goal: EngravingValue;
  books: EngravingValue;
  items: Item[];
  remainingGoal?: EngravingValue;
  optimizedItems?: Item[];
  destructedEngravings: EngravingValue[];
}

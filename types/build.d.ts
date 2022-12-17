import { Engraving } from './engravings';

export enum ItemType {
  NECKLACE = 'NECKLACE',
  EARRING = 'EARRING',
  RING = 'RING',
  STONE = 'STONE',
}

export interface Build {
  name?: string;
  goal: Map<Engraving, number>;
  books: Map<Engraving, number>;
  items: [
    {
      type: ItemType;
      engravings: Map<Engraving, number>;
    }
  ];
}

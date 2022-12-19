import { Engraving } from './engravings';
export declare enum ItemType {
    NECKLACE = "NECKLACE",
    EARRING = "EARRING",
    RING = "RING",
    STONE = "STONE",
    BOOK = "BOOK"
}
export declare enum ItemStatus {
    BUY = "BUY",
    OWNED = "OWNED"
}
interface EngravingValue {
    engraving: Engraving;
    value: number;
}
export interface Item {
    type: ItemType;
    engravings: EngravingValue[];
    status?: ItemStatus;
}
export interface Build {
    name?: string;
    goal: EngravingValue[];
    books: EngravingValue[];
    items: Item[];
}
export interface ProcessBuild extends Build {
    remainingGoal?: EngravingValue[];
    optimizedItems?: Item[];
    destructedEngravings?: EngravingValue[];
}
export {};

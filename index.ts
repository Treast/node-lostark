#! /usr/bin/env node

import { join } from 'path';
import Table from 'cli-table';
import { argv } from 'process';
import { readFileSync } from 'fs';

import { Build, Item, ItemType, ProcessBuild } from './types/build';
import { Engraving } from './types/engravings';

const buildFile = argv[2];

const VAL_MIN = 3;
const VAL_MAX = 5;

const openBuildFile = (file): Promise<Build> => {
  const filePath = join(process.cwd(), file);

  return new Promise((resolve) => {
    const contents = readFileSync(filePath, 'utf8');
    resolve(JSON.parse(contents) as Build);
  });
};

const removeItemEngravingToGoal = (processBuild: ProcessBuild, item: Item): Promise<ProcessBuild> => {
  return new Promise((resolve) => {
    item.engravings.forEach((engraving) => {
      processBuild.remainingGoal.find((eng) => eng.engraving === engraving.engraving).value -= engraving.value;
    });

    resolve(processBuild);
  });
};

const initBuild = (build: Build): Promise<ProcessBuild> => {
  return new Promise((resolve) => {
    const processBuild: ProcessBuild = build;
    processBuild.remainingGoal = build.goal;
    processBuild.destructedEngravings = [];

    resolve(processBuild);
  });
};

const removeBooks = (processBuild: ProcessBuild): Promise<ProcessBuild> => {
  return new Promise(async (resolve) => {
    const item: Item = {
      type: ItemType.BOOK,
      engravings: processBuild.books,
    };

    processBuild = await removeItemEngravingToGoal(processBuild, item);
    resolve(processBuild);
  });
};

const removeStone = (processBuild: ProcessBuild): Promise<ProcessBuild> => {
  return new Promise(async (resolve) => {
    const stone = processBuild.items.find((item) => item.type === ItemType.STONE);

    if (!stone) resolve(processBuild);

    processBuild = await removeItemEngravingToGoal(processBuild, stone);
    resolve(processBuild);
  });
};

const debugRemainingGoals = (processBuild: ProcessBuild): void => {
  const engravings = processBuild.remainingGoal.map((engraving) => [engraving.engraving, engraving.value]);

  const table = new Table({
    head: ['Engraving', 'Value'],
    rows: engravings,
  });

  console.log(table.toString());
};

const debugDestructed = (processBuild: ProcessBuild): void => {
  const engravings = processBuild.destructedEngravings.map((engraving) => [engraving.engraving, engraving.value]);

  const table = new Table({
    head: ['Engraving', 'Value'],
    rows: engravings,
  });

  console.log(table.toString());
};

const debugItems = (items: Item[]): void => {
  const emplacementItems = items.map((item) => {
    return [item.type, item.engravings.map((engraving) => `${Engraving[engraving.engraving]} ${engraving.value}`).join(' / ')];
  });

  const table = new Table({
    head: ['Emplacement', 'Engravings'],
    rows: emplacementItems,
  });

  console.log(table.toString());
};

const destructedEngravings = (processBuild: ProcessBuild): Promise<ProcessBuild> => {
  return new Promise((resolve) => {
    processBuild.remainingGoal.forEach((engraving) => {
      let value = engraving.value;
      while (value > 0) {
        if (value % VAL_MIN === 0 && value <= 3 * VAL_MIN) {
          processBuild.destructedEngravings.push({ engraving: engraving.engraving, value: VAL_MIN });
          value -= VAL_MIN;
        } else {
          if (value / VAL_MIN > 1) {
            if (value / VAL_MAX >= 1) {
              processBuild.destructedEngravings.push({ engraving: engraving.engraving, value: VAL_MAX });
              value -= VAL_MAX;
            } else {
              processBuild.destructedEngravings.push({ engraving: engraving.engraving, value });
              value = 0;
            }
          } else {
            processBuild.destructedEngravings.push({ engraving: engraving.engraving, value: VAL_MIN });
            value -= VAL_MIN;
          }
        }
      }
    });

    resolve(processBuild);
  });
};

const checkIfBuildIsPossible = (processBuild: ProcessBuild): void => {
  const engravingAboveMinimal = processBuild.destructedEngravings.filter((engraving) => engraving.value > VAL_MIN);

  if (processBuild.destructedEngravings.length <= 10 && engravingAboveMinimal.length <= 5) {
    console.log('✅ Build is possible');
  } else {
    console.log('⛔ Build is impossible');
  }
};

const createPerfectStuff = (processBuild: ProcessBuild): Promise<Item[]> => {
  return new Promise((resolve) => {
    const items = [];
    const destructedEngravings = [...processBuild.destructedEngravings.sort((a, b) => b.value - a.value)];

    for (let i = 0; i < 5; i++) {
      const item: Item = {
        type: getItemType(i),
        engravings: [],
      };

      const firstEngraving = destructedEngravings.shift();

      if (firstEngraving) {
        item.engravings.push(firstEngraving);

        const secondEngraving = destructedEngravings.pop();

        if (secondEngraving) item.engravings.push(secondEngraving);
      }

      items.push(item);
    }

    resolve(items);
  });
};

const getItemType = (emplacement: number): ItemType => {
  if (emplacement === 1) return ItemType.NECKLACE;
  if (emplacement === 2 || emplacement === 3) return ItemType.EARRING;
  return ItemType.RING;
};

openBuildFile(buildFile)
  .then((build) => {
    console.log(build.name);
    return build;
  })
  .then((build) => initBuild(build))
  .then((build) => removeBooks(build))
  .then((build) => removeStone(build))
  .then((build) => {
    // debugRemainingGoals(build);
    return build;
  })
  .then((build) => destructedEngravings(build))
  .then((build) => {
    // debugDestructed(build);
    checkIfBuildIsPossible(build);
    return build;
  })
  .then(async (build) => {
    const items = await createPerfectStuff(build);
    debugItems(items);
  });

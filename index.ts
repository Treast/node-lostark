#! /usr/bin/env node

import { join } from 'path';
import Table from 'cli-table';
import { argv } from 'process';
import { readFileSync } from 'fs';

import { Build, Item, ItemType } from './types/build';
import { Engraving } from './types/engravings';

const buildFile = argv[2];

const openBuildFile = (file): Promise<Build> => {
  const filePath = join(process.cwd(), file);

  return new Promise((resolve) => {
    const contents = readFileSync(filePath, 'utf8');
    resolve(JSON.parse(contents) as Build);
  });
};

const removeItemEngravingToGoal = (build: Build, item: Item): Promise<Build> => {
  return new Promise((resolve) => {
    Object.entries(item.engravings).forEach(([engraving, value]) => {
      if (build.remainingGoal[engraving]) {
        build.remainingGoal[engraving] -= value;
      }
    });
    resolve(build);
  });
};

const initBuild = (build: Build): Promise<Build> => {
  return new Promise((resolve) => {
    build.remainingGoal = build.goal;
    build.destructedEngravings = [];
    resolve(build);
  });
};

const removeBooks = (build: Build): Promise<Build> => {
  return new Promise((resolve) => {
    Object.entries(build.books).forEach(async ([engraving, value]) => {
      const bookEngraving = { [engraving]: value };

      const item: Item = {
        type: ItemType.BOOK,
        engravings: bookEngraving,
      };

      build = await removeItemEngravingToGoal(build, item);
      resolve(build);
    });
  });
};

const removeStone = (build: Build): Promise<Build> => {
  return new Promise(async (resolve) => {
    const stone = build.items.find((item) => item.type === ItemType.STONE);

    if (!stone) resolve(build);

    build = await removeItemEngravingToGoal(build, stone);
    resolve(build);
  });
};

const debugRemainingGoals = (build: Build): void => {
  const engravings = Object.entries(build.remainingGoal).map(([engraving, value]) => {
    return [Engraving[engraving], value];
  });

  const table = new Table({
    head: ['Engraving', 'Value'],
    rows: engravings,
  });

  console.log(table.toString());
};

const debugDestructed = (build: Build): void => {
  const engravings = build.destructedEngravings.map((destructedEngravings) => {
    return Object.entries(destructedEngravings).map(([engraving, value]) => {
      return [Engraving[engraving], value];
    })[0];
  });

  const table = new Table({
    head: ['Engraving', 'Value'],
    rows: engravings,
  });

  console.log(table.toString());
};

const destructedEngravings = (build: Build): Promise<Build> => {
  return new Promise((resolve) => {
    Object.entries(build.remainingGoal).forEach(([engraving, value]) => {
      while (value > 0) {
        if (value % 3 === 0 && value <= 9) {
          build.destructedEngravings.push({ [engraving]: 3 });
          value -= 3;
        } else {
          if (value / 3 > 1) {
            if (value / 5 >= 1) {
              build.destructedEngravings.push({ [engraving]: 5 });
              value -= 5;
            } else {
              build.destructedEngravings.push({ [engraving]: value });
              value = 0;
            }
          } else {
            build.destructedEngravings.push({ [engraving]: 3 });
            value -= 3;
          }
        }
      }
    });
    resolve(build);
  });
};

const checkIfBuildIsPossible = (build: Build): void => {
  const engravingAboveMinimal = build.destructedEngravings.filter((value) => value[0] > 3);
  if (build.destructedEngravings.length <= 10 && engravingAboveMinimal.length <= 5) {
    console.log('✅ Build is possible');
  } else {
    console.log('⛔ Build is impossible');
  }
};

openBuildFile(buildFile)
  .then((build) => {
    console.log(build.name);
    return build;
  })
  .then((build) => initBuild(build))
  .then((build) => removeBooks(build))
  .then((build) => removeStone(build))
  .then((build) => destructedEngravings(build))
  .then((build) => {
    debugDestructed(build);
    checkIfBuildIsPossible(build);
  });

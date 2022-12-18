#! /usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { argv } from 'process';
import { Build, Item, ItemType } from './types/build';
import Table from 'cli-table';
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

openBuildFile(buildFile)
  .then((build) => {
    console.log(build.name);
    return build;
  })
  .then((build) => initBuild(build))
  .then((build) => removeBooks(build))
  .then((build) => removeStone(build))
  .then((build) => {
    debugRemainingGoals(build);
  });

#! /usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { argv } from 'process';
import { Build } from './types/build';

const buildFile = argv[2];

const openBuildFile = (file): Promise<Build> => {
  const filePath = join(process.cwd(), file);

  return new Promise((resolve) => {
    const contents = readFileSync(filePath, 'utf8');
    resolve(JSON.parse(contents) as Build);
  });
};

openBuildFile(buildFile).then((build) => {
  console.log(build.name);
});

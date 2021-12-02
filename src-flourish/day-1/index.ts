

import { readFileSync } from "fs";
import * as path from "path";

const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const depths = data.trim().split("\n").map(Number);

function windowedCount(depths: number[], window: number): number {
  let count = 0;
  for (let i=window; i<depths.length; i++) {
    const prev = depths[i - window];
    const current = depths[i];
    if (current > prev) count++;
  }
  return count;
}

console.log(windowedCount(depths, 1));
console.log(windowedCount(depths, 3));

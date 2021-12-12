import { readFileSync } from "fs";
import * as path from "path";

function isLowPoint(grid: number[][], i: number, j: number): boolean {
  const cell = grid[i][j];
  if (i > 0 && grid[i - 1][j] <= cell) return false;
  if (i < grid.length - 1 && grid[i + 1][j] <= cell) return false;
  if (j > 0 && grid[i][j - 1] <= cell) return false;
  if (j < grid[i].length - 1 && grid[i][j + 1] <= cell) return false;

  return true;
}

function findBasinSize(grid: number[][], i: number, j: number): number {
  if (i < 0) return 0;
  if (i > grid.length - 1) return 0;
  if (j < 0) return 0;
  if (j > grid[i].length - 1) return 0;
  if (grid[i][j] === 9) return 0;

  grid[i][j] = 9;
  const left = findBasinSize(grid, i - 1, j);
  const right = findBasinSize(grid, i + 1, j);
  const up = findBasinSize(grid, i, j - 1);
  const down = findBasinSize(grid, i, j + 1);
  return left + right + up + down + 1;
}

function main(): void {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const grid = data
    .trim()
    .split("\n")
    .map((row) => row.split("").map(Number));

  let risk = 0;
  const basinSizes = [];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (isLowPoint(grid, i, j)) {
        risk += grid[i][j] + 1;
        const basinSize = findBasinSize(grid, i, j);
        basinSizes.push(basinSize);
      }
    }
  }

  basinSizes.sort((a, b) => b - a);
  console.log("Risk", risk);
  console.log("Basin risk:", basinSizes[0] * basinSizes[1] * basinSizes[2]);
}

main();

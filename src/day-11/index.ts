import { readFileSync } from "fs";
import * as path from "path";

interface Octopus {
  energy: number;
  hasFlashed: boolean;
}

type Coordinates = [number, number];

function increase(
  grid: Octopus[][],
  i: number,
  j: number,
  stack: Coordinates[]
): void {
  if (i < 0) return;
  if (j < 0) return;
  if (i > grid.length - 1) return;
  if (j > grid[i].length - 1) return;

  const octopus = grid[i][j];

  const newEnergy = ++octopus.energy;
  if (newEnergy > 9 && !octopus.hasFlashed) {
    octopus.hasFlashed = true;
    stack.push([i, j]);
  }
}

function step(grid: Octopus[][]): number {
  const stack: Coordinates[] = [];
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    for (let j = 0; j < row.length; j++) {
      increase(grid, i, j, stack);
    }
  }

  while (stack.length) {
    const [i, j] = stack.pop() as Coordinates;
    increase(grid, i - 1, j - 1, stack);
    increase(grid, i - 1, j, stack);
    increase(grid, i - 1, j + 1, stack);
    increase(grid, i, j - 1, stack);
    increase(grid, i, j + 1, stack);
    increase(grid, i + 1, j - 1, stack);
    increase(grid, i + 1, j, stack);
    increase(grid, i + 1, j + 1, stack);
  }

  let flashes = 0;
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    for (let j = 0; j < row.length; j++) {
      const octopus = row[j];
      const { hasFlashed } = octopus;
      if (!hasFlashed) continue;
      flashes++;
      octopus.energy = 0;
      octopus.hasFlashed = false;
    }
  }
  return flashes;
}

function main(): void {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const grid = data
    .trim()
    .split("\n")
    .map((row) =>
      row.split("").map((energy) => ({
        energy: Number(energy),
        hasFlashed: false,
      }))
    );

  // Part 1
  /*
  let flashes = 0;
  for (let i=0; i<100; i++) {
    flashes += step(grid);
  }
  console.log("Flashes", flashes);
  */

  // Part 2
  const numberOfOctopi = grid.length * grid[0].length;
  for (let i = 0; ; i++) {
    const flashes = step(grid);
    if (flashes === numberOfOctopi) {
      console.log("Flashed simultaneously", i + 1);
      break;
    }
  }
}

main();

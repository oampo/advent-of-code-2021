import { readFileSync } from "fs";
import * as path from "path";

type Grid = number[][];
type Vec = {
  x: number;
  y: number;
};

class VecSet {
  private _set: Set<string>;

  constructor(values?: Vec[]) {
    this._set = new Set(
      values ? values.map(({ x, y }) => `${x},${y}`) : values
    );
  }

  add({ x, y }: Vec): VecSet {
    this._set.add(`${x},${y}`);
    return this;
  }

  has({ x, y }: Vec): boolean {
    return this._set.has(`${x},${y}`);
  }

  delete({ x, y }: Vec): boolean {
    return this._set.delete(`${x},${y}`);
  }

  get size(): number {
    return this._set.size;
  }

  *values(): IterableIterator<Vec> {
    for (const value of this._set) {
      const [x, y] = value.split(",").map(Number);
      yield { x, y };
    }
  }
}

class VecMap<T> {
  private _map: Map<string, T>;

  constructor() {
    this._map = new Map();
  }

  set({ x, y }: Vec, value: T): VecMap<T> {
    this._map.set(`${x},${y}`, value);
    return this;
  }

  get({ x, y }: Vec): T | undefined {
    return this._map.get(`${x},${y}`);
  }
}

function getNeighbors(grid: Grid, { x, y }: Vec): Vec[] {
  const result = [];
  if (x > 0) result.push({ x: x - 1, y });
  if (x < grid[y].length - 1) result.push({ x: x + 1, y });
  if (y > 0) result.push({ x, y: y - 1 });
  if (y < grid.length - 1) result.push({ x, y: y + 1 });
  return result;
}

function heuristic(from: Vec, to: Vec): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

function aStar(
  grid: Grid,
  start: Vec,
  end: Vec,
  heuristic: (from: Vec, to: Vec) => number
) {
  const nodes = new VecSet([start]);

  const bestScores = new VecMap<number>();
  bestScores.set(start, 0);

  const guessedScores = new VecMap<number>();
  guessedScores.set(start, heuristic(start, end));

  while (nodes.size) {
    const it = nodes.values();
    let current: Vec = it.next().value;
    let lowestScore = guessedScores.get(current) || Infinity;
    for (const node of it) {
      const score = guessedScores.get(node);
      if (score && score <= lowestScore) {
        current = node;
        lowestScore = score;
      }
    }

    if (current.x === end.x && current.y === end.y) {
      return lowestScore;
    }

    nodes.delete(current);

    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const score =
        (bestScores.get(current) as number) + grid[neighbor.y][neighbor.x];
      if (score < (bestScores.get(neighbor) || Infinity)) {
        bestScores.set(neighbor, score);
        guessedScores.set(neighbor, score + heuristic(neighbor, end));
        if (!nodes.has(neighbor)) nodes.add(neighbor);
      }
    }
  }
  throw new Error("Could not find path");
}

function main(): void {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const grid = data
    .trim()
    .split("\n")
    .map((row) => row.split("").map(Number));

  const biggerGrid = [];
  for (let i = 0; i < grid.length * 5; i++) {
    const y = i % grid.length;
    const yRepeat = Math.floor(i / grid.length);

    const row = [];
    for (let j = 0; j < grid[y].length * 5; j++) {
      const x = j % grid.length;
      const xRepeat = Math.floor(j / grid[y].length);
      const value = grid[y][x] + xRepeat + yRepeat;
      row.push(value > 9 ? value - 9 : value);
    }
    biggerGrid.push(row);
  }

  console.log(
    aStar(
      biggerGrid,
      { x: 0, y: 0 },
      { x: biggerGrid.length - 1, y: biggerGrid[0].length - 1 },
      heuristic
    )
  );
}

main();

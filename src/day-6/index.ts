import { readFileSync } from "fs";
import * as path from "path";

class Fish {
  timer: number;
  constructor(timer: number) {
    this.timer = timer;
  }

  tick(): Fish | null {
    if (this.timer === 0) {
      this.timer = 6;
      return new Fish(8);
    }
    this.timer--;
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function naive(fishes: Fish[], days: number): number {
  for (let i = 0; i < days; i++) {
    const newFishes = [];
    for (const fish of fishes) {
      const newFish = fish.tick();
      if (newFish) newFishes.push(newFish);
    }
    fishes.push(...newFishes);
  }

  return fishes.length;
}

function lessNaive(fishes: Fish[], days: number): number {
  const fishCounts = Array.from({ length: 9 }, () => 0);
  let dayZero = 0;
  for (const fish of fishes) {
    fishCounts[fish.timer]++;
  }

  for (let i = 0; i < days; i++) {
    const newFishes = fishCounts[dayZero];
    dayZero = (dayZero + 1) % fishCounts.length;
    const daySix = (dayZero + 6) % fishCounts.length;
    fishCounts[daySix] += newFishes;
  }

  let sum = 0;
  for (const count of fishCounts) {
    sum += count;
  }
  return sum;
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const fishes = data
    .trim()
    .split(",")
    .map((t) => t.trim())
    .map((t) => new Fish(Number(t)));

  // console.log(naive(fishes, 80));
  console.log(lessNaive(fishes, 256));
}

main();

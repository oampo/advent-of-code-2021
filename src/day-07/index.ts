import { readFileSync } from "fs";
import * as path from "path";

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function mean(arr: number[]): number {
  let sum = 0;
  for (const x of arr) {
    sum += x;
  }
  return sum / arr.length;
}

function calculateFuelConstant(positions: number[], to: number): number {
  let fuel = 0;
  for (const position of positions) {
    fuel += Math.abs(position - to);
  }
  return fuel;
}

function calculateFuelLinear(positions: number[], to: number): number {
  let fuel = 0;
  for (const position of positions) {
    const distance = Math.abs(position - to);
    fuel += (distance ** 2 + distance) / 2;
  }
  return fuel;
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const positions = data.trim().split(",").map(Number);

  const medianPosition = median(positions);

  console.log(calculateFuelConstant(positions, medianPosition));

  const meanPosition = mean(positions);
  // Best will either be at the floor or ceil position
  console.log(
    Math.min(
      calculateFuelLinear(positions, Math.floor(meanPosition)),
      calculateFuelLinear(positions, Math.ceil(meanPosition))
    )
  );
}

main();

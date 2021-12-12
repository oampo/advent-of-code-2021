import { readFileSync } from "fs";
import * as path from "path";

function bitArrayToNumber(bitArray: number[]): number {
  let result = 0;
  for (const [index, bit] of bitArray.reverse().entries()) {
    result += bit << index;
  }
  return result;
}

function invertBits(x: number, n: number) {
  return (1 << n) - 1 - x;
}

function mostCommonBit(bitArrays: number[][], bit: number): number {
  const sum = bitArrays.reduce((sum, bitArray) => (sum += bitArray[bit]), 0);
  return sum * 2 >= bitArrays.length ? 1 : 0;
}

function sieve(
  bitArrays: number[][],
  predicate: (x: number, mcb: number) => boolean,
  bit = 0
): number[] {
  if (bitArrays.length === 1) return bitArrays[0];
  const mcb = mostCommonBit(bitArrays, bit);
  bitArrays = bitArrays.filter((bitArray) => predicate(bitArray[bit], mcb));
  return sieve(bitArrays, predicate, bit + 1);
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const bitArrays = data
    .trim()
    .split("\n")
    .map((line) => line.split("").map(Number));

  const numberOfBits = bitArrays[0].length;

  const mostCommonBits = Array.from({ length: numberOfBits }, (_, i) =>
    mostCommonBit(bitArrays, i)
  );

  const gamma = bitArrayToNumber(mostCommonBits);
  const epsilon = invertBits(gamma, numberOfBits);
  console.log("Power of submarine", gamma * epsilon);

  const oxygen = bitArrayToNumber(sieve(bitArrays, (bit, mcb) => bit === mcb));
  const co2 = bitArrayToNumber(sieve(bitArrays, (bit, mcb) => bit !== mcb));
  console.log("Oxygen generator rating", oxygen * co2);
}

main();

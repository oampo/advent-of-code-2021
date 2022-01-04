import { readFileSync } from "fs";
import * as path from "path";

type CountMap = Map<string, number>;
type RuleMap = Map<string, string>;

function insertOrIncrement(map: CountMap, key: string, n: number): void {
  if (!map.has(key)) map.set(key, n);
  else map.set(key, (map.get(key) as number) + n);
}

function tick(pairs: CountMap, rules: RuleMap): CountMap {
  const newPairs: CountMap = new Map();
  for (const [from, to] of rules.entries()) {
    if (!pairs.has(from)) continue;

    const numberOfPairs = pairs.get(from) as number;
    const leftPair = from[0] + to;
    const rightPair = to + from[1];
    insertOrIncrement(newPairs, leftPair, numberOfPairs);
    insertOrIncrement(newPairs, rightPair, numberOfPairs);
    pairs.set(from, 0);
  }
  return newPairs;
}

function merge(a: CountMap, b: CountMap) {
  for (const [pair, numberOfPairs] of b.entries()) {
    insertOrIncrement(a, pair, numberOfPairs);
  }
}

function getLetterFrequency(pairs: CountMap): CountMap {
  const letters = new Map();
  for (const [pair, numberOfPairs] of pairs.entries()) {
    insertOrIncrement(letters, pair[0], numberOfPairs);
    insertOrIncrement(letters, pair[1], numberOfPairs);
  }

  for (const [letter, frequency] of letters) {
    letters.set(letter, Math.ceil(frequency / 2));
  }
  return letters;
}

function main(): void {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const [template, , ...rules] = data.trim().split("\n");

  const ruleMap: RuleMap = new Map();
  for (const rule of rules) {
    const [from, to] = rule.split(" -> ");
    ruleMap.set(from, to);
  }

  const pairMap: CountMap = new Map();
  for (let i = 0; i < template.length - 1; i++) {
    const pair = template.slice(i, i + 2);
    insertOrIncrement(pairMap, pair, 1);
  }

  for (let i = 0; i < 40; i++) {
    const newPairs = tick(pairMap, ruleMap);
    merge(pairMap, newPairs);
  }

  const frequency = getLetterFrequency(pairMap);

  const max = Math.max(...frequency.values());
  const min = Math.min(...frequency.values());
  console.log(max - min);
}

main();

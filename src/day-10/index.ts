import { readFileSync } from "fs";
import * as path from "path";

const PAIRS: Map<string, string> = new Map();
PAIRS.set("(", ")");
PAIRS.set("[", "]");
PAIRS.set("{", "}");
PAIRS.set("<", ">");

const PAIRS_REVERSE: Map<string, string> = new Map();
PAIRS_REVERSE.set(")", "(");
PAIRS_REVERSE.set("]", "[");
PAIRS_REVERSE.set("}", "{");
PAIRS_REVERSE.set(">", "<");

const INVALID_SCORES: Map<string, number> = new Map();
INVALID_SCORES.set(")", 3);
INVALID_SCORES.set("]", 57);
INVALID_SCORES.set("}", 1197);
INVALID_SCORES.set(">", 25137);

const VALID_SCORES: Map<string, number> = new Map();
VALID_SCORES.set(")", 1);
VALID_SCORES.set("]", 2);
VALID_SCORES.set("}", 3);
VALID_SCORES.set(">", 4);

interface Result {
  isValid: boolean;
  score: number;
}

function isLineValid(line: string): Result {
  const stack = [];
  for (const char of line) {
    if (!PAIRS_REVERSE.has(char)) {
      stack.push(char);
      continue;
    }
    const pair = stack.pop();
    if (pair !== PAIRS_REVERSE.get(char)) {
      return {
        isValid: false,
        score: INVALID_SCORES.get(char) as number,
      };
    }
  }

  let score = 0;
  for (const char of stack.reverse()) {
    const pair = PAIRS.get(char) as string;
    score = score * 5 + (VALID_SCORES.get(pair) as number);
  }
  return { isValid: true, score };
}

function main(): void {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const lines = data.trim().split("\n");

  let invalidScore = 0;
  const validScores = [];
  for (const line of lines) {
    const { isValid, score } = isLineValid(line);
    if (isValid) validScores.push(score);
    else invalidScore += score;
  }

  console.log("Invalid score:", invalidScore);

  validScores.sort((a, b) => a - b);
  const validScore = validScores[Math.floor(validScores.length / 2)];
  console.log("Valid score:", validScore);
}

main();

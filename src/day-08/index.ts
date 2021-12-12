import { readFileSync } from "fs";
import * as path from "path";

const CHAR_CODE_LOWERCASE_A = 97;

enum Segment {
  Top,
  TopLeft,
  TopRight,
  Middle,
  BottomLeft,
  BottomRight,
  Bottom,
}

type Pattern = Set<Segment>;

interface Entry {
  patterns: Pattern[];
  output: Pattern[];
}

type PatternFingerprint = {
  intersections: number;
  differences: number;
  from: number;
  to: number;
}[];

const NUMBERS: Pattern[] = [
  new Set([
    Segment.Top,
    Segment.TopLeft,
    Segment.TopRight,
    Segment.BottomLeft,
    Segment.BottomRight,
    Segment.Bottom,
  ]),
  new Set([Segment.TopRight, Segment.BottomRight]),
  new Set([
    Segment.Top,
    Segment.TopRight,
    Segment.Middle,
    Segment.BottomLeft,
    Segment.Bottom,
  ]),
  new Set([
    Segment.Top,
    Segment.TopRight,
    Segment.Middle,
    Segment.BottomRight,
    Segment.Bottom,
  ]),
  new Set([
    Segment.TopLeft,
    Segment.TopRight,
    Segment.Middle,
    Segment.BottomRight,
  ]),
  new Set([
    Segment.Top,
    Segment.TopLeft,
    Segment.Middle,
    Segment.BottomRight,
    Segment.Bottom,
  ]),
  new Set([
    Segment.Top,
    Segment.TopLeft,
    Segment.Middle,
    Segment.BottomRight,
    Segment.BottomLeft,
    Segment.Bottom,
  ]),
  new Set([Segment.Top, Segment.TopRight, Segment.BottomRight]),
  new Set([
    Segment.Top,
    Segment.TopLeft,
    Segment.TopRight,
    Segment.Middle,
    Segment.BottomLeft,
    Segment.BottomRight,
    Segment.Bottom,
  ]),
  new Set([
    Segment.Top,
    Segment.TopLeft,
    Segment.TopRight,
    Segment.Middle,
    Segment.BottomRight,
    Segment.Bottom,
  ]),
];

function equal<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((x) => b.has(x)));
}

function symmetricDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([
    ...[...a].filter((x) => !b.has(x)),
    ...[...b].filter((x) => !a.has(x)),
  ]);
}

function patternFromString(s: string): Pattern {
  return new Set(
    s.split("").map((c) => c.charCodeAt(0) - CHAR_CODE_LOWERCASE_A)
  );
}

namespace Entry {
  export function fromString(s: string): Entry {
    const [patternsStr, outputStr] = s.split("|").map((s) => s.trim());
    const patterns = patternsStr.split(" ").map(patternFromString);
    const output = outputStr.split(" ").map(patternFromString);
    return {
      patterns,
      output,
    };
  }
}

function getFingerprints(patterns: Pattern[]): PatternFingerprint[] {
  const fingerprints = [];
  for (const [from, patternA] of patterns.entries()) {
    const fingerprint = [];
    for (const [to, patternB] of patterns.entries()) {
      if (patternA === patternB) continue;
      const intersections = intersection(patternA, patternB).size;
      const differences = symmetricDifference(patternA, patternB).size;
      fingerprint.push({ intersections, differences, from, to });
    }

    fingerprint.sort((a, b) => {
      if (a.intersections === b.intersections)
        return a.differences - b.differences;
      return a.intersections - b.intersections;
    });

    fingerprints.push(fingerprint);
  }

  return fingerprints;
}

function fingerprintsAreEqual(
  a: PatternFingerprint,
  b: PatternFingerprint
): boolean {
  for (let i = 0; i < a.length; i++) {
    const { intersections: intersectionsA, differences: differencesA } = a[i];
    const { intersections: intersectionsB, differences: differencesB } = b[i];
    if (intersectionsA !== intersectionsB || differencesA !== differencesB) {
      return false;
    }
  }
  return true;
}

function getOutputValue(entry: Entry, patternNumbers: number[]): number {
  const { patterns, output } = entry;
  let value = 0;
  for (const [digit, outputPattern] of output.entries()) {
    for (const [i, pattern] of patterns.entries()) {
      if (equal(outputPattern, pattern)) {
        const number = patternNumbers[i];
        value += number * 10 ** (output.length - digit - 1);
      }
    }
  }
  return value;
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const entries = data.trim().split("\n").map(Entry.fromString);

  let result = 0;
  for (const entry of entries) {
    const { patterns } = entry;
    const patternFingerprints = getFingerprints(patterns);
    const numberFingerprints = getFingerprints(NUMBERS);

    const patternNumbers = [];
    for (const patternFingerprint of patternFingerprints) {
      const index = numberFingerprints.findIndex((numberFingerprint) =>
        fingerprintsAreEqual(patternFingerprint, numberFingerprint)
      );
      patternNumbers.push(index);
    }

    result += getOutputValue(entry, patternNumbers);
  }

  console.log(result);
}

main();

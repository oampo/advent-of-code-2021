import { readFileSync } from "fs";
import * as path from "path";

type IntersectionMap = { [key: string]: number };

class Vec2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  equals(a: Vec2): boolean {
    return this.x === a.x && this.y === a.y;
  }

  add(a: Vec2): Vec2 {
    const x = this.x + a.x;
    const y = this.y + a.y;
    return new Vec2(x, y);
  }

  sub(a: Vec2): Vec2 {
    const x = this.x - a.x;
    const y = this.y - a.y;
    return new Vec2(x, y);
  }

  sign(): Vec2 {
    const x = Math.sign(this.x);
    const y = Math.sign(this.y);
    return new Vec2(x, y);
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  static fromString(s: string): Vec2 {
    const [x, y] = s
      .split(",")
      .map((s) => s.trim())
      .map(Number);
    return new Vec2(x, y);
  }
}

class Segment {
  start: Vec2;
  end: Vec2;

  constructor(start: Vec2, end: Vec2) {
    this.start = start;
    this.end = end;
  }

  isVertical(): boolean {
    return this.start.x === this.end.x;
  }

  isHorizontal(): boolean {
    return this.start.y === this.end.y;
  }

  toString(): string {
    return `${this.start.toString()} => ${this.end.toString()}`;
  }

  static fromString(s: string): Segment {
    const [startStr, endStr] = s.split("->").map((s) => s.trim());
    const start = Vec2.fromString(startStr);
    const end = Vec2.fromString(endStr);
    return new Segment(start, end);
  }
}

function countDangerous(intersections: IntersectionMap): number {
  let count = 0;
  for (const value of Object.values(intersections)) {
    if (value > 1) {
      count++;
    }
  }
  return count;
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const segments = data.trim().split("\n").map(Segment.fromString);
  //    .filter((l) => l.isHorizontal() || l.isVertical());

  const intersections: IntersectionMap = {};

  for (const segment of segments) {
    const { start, end } = segment;
    const step = end.sub(start).sign();
    let position = start.clone();
    while (!position.equals(end)) {
      const positionStr = position.toString();
      if (!(positionStr in intersections)) intersections[positionStr] = 0;
      intersections[positionStr]++;
      position = position.add(step);
    }
    const positionStr = position.toString();
    if (!(positionStr in intersections)) intersections[positionStr] = 0;
    intersections[positionStr]++;
  }

  console.log("Dangerous points:", countDangerous(intersections));
}

main();

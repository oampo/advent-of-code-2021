import { readFileSync } from "fs";
import * as path from "path";

const EPSILON = 0.05;

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

  scale(a: number): Vec2 {
    const x = this.x * a;
    const y = this.y * a;
    return new Vec2(x, y);
  }

  cross(a: Vec2): number {
    return this.x * a.y - this.y * a.x;
  }

  distance(a: Vec2): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  squaredDistance(a: Vec2): number {
    const dx = this.x - a.x;
    const dy = this.y - a.y;
    return dx ** 2 + dy ** 2;
  }

  floor(): Vec2 {
    const x = Math.floor(this.x);
    const y = Math.floor(this.y);
    return new Vec2(x, y);
  }

  round(): Vec2 {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    return new Vec2(x, y);
  }

  roundToNearest(n: number): Vec2 {
    const x = Math.round(this.x / n) * n;
    const y = Math.round(this.y / n) * n;
    return new Vec2(x, y);
  }

  sign(): Vec2 {
    const x = Math.sign(this.x);
    const y = Math.sign(this.y);
    return new Vec2(x, y);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  squaredLength(): number {
    return this.x ** 2 + this.y ** 2;
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

  toString(): string {
    return `${this.start.toString()} => ${this.end.toString()}`;
  }

  isVertical(): boolean {
    return this.start.x === this.end.x;
  }

  isHorizontal(): boolean {
    return this.start.y === this.end.y;
  }

  isPoint(): boolean {
    return this.start.equals(this.end);
  }

  length(): number {
    return this.end.sub(this.start).length();
  }

  squaredLength(): number {
    return this.end.sub(this.start).squaredLength();
  }

  static fromString(s: string): Segment {
    const [startStr, endStr] = s.split("->").map((s) => s.trim());
    const start = Vec2.fromString(startStr);
    const end = Vec2.fromString(endStr);
    return new Segment(start, end);
  }
}

function pointOnSegment(point: Vec2, segment: Segment): boolean {
  const lengthA = point.distance(segment.start);
  const lengthB = point.distance(segment.end);
  const totalLength = segment.length();
  return Math.abs(lengthA + lengthB - totalLength) < EPSILON;
}

function segmentIntersectsSegment(
  segmentA: Segment,
  segmentB: Segment
): Segment | Vec2 | null {
  if (segmentA.isPoint() && pointOnSegment(segmentA.start, segmentB)) {
    return segmentA.start;
  }
  if (segmentB.isPoint() && pointOnSegment(segmentB.start, segmentA)) {
    return segmentB.start;
  }

  const { start: startA, end: endA } = segmentA;
  const { start: startB, end: endB } = segmentB;
  const diffA = endA.sub(startA);
  const diffB = endB.sub(startB);

  const diffStarts = startB.sub(startA);

  const crossA = diffStarts.cross(diffA);
  const crossB = diffStarts.cross(diffB);
  const crossAB = diffA.cross(diffB);

  if (crossA === 0 && crossB === 0 && crossAB === 0) {
    // startA, endA, startB, and endB are collinear
    if (
      (startA.equals(startB) && endA.equals(endB)) ||
      (startA.equals(endB) && startB.equals(endA))
    )
      return new Segment(startA, endA);
    if (startA.equals(startB)) {
      if (pointOnSegment(endA, segmentB)) return new Segment(startA, endA);
      else if (pointOnSegment(endB, segmentA)) return new Segment(startA, endB);
      else return new Segment(startA, startA);
    }
    if (startA.equals(endB)) {
      if (pointOnSegment(endA, segmentB)) return new Segment(startA, endA);
      if (pointOnSegment(startB, segmentA)) return new Segment(startA, startB);
      else return new Segment(startA, startA);
    }
    if (endA.equals(endB)) {
      if (pointOnSegment(startA, segmentB)) return new Segment(endA, startA);
      if (pointOnSegment(startB, segmentA)) return new Segment(endA, startB);
      else return new Segment(endA, endA);
    }

    const points = [];
    if (pointOnSegment(startA, segmentB)) points.push(startA);
    if (pointOnSegment(endA, segmentB)) points.push(endA);
    if (pointOnSegment(startB, segmentA)) points.push(startB);
    if (pointOnSegment(endB, segmentA)) points.push(endB);

    if (!points.length) return null;
    return new Segment(points[0], points[1]);
  }

  const s = crossA / crossAB;
  const t = crossB / crossAB;

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return startA.add(diffA.scale(t));
  }
  return null;
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const segments = data.trim().split("\n").map(Segment.fromString);
  //    .filter((l) => l.isHorizontal() || l.isVertical());

  const intersections = new Set<string>();

  for (let i = 0; i < segments.length; i++) {
    const segmentA = segments[i];
    for (let j = i + 1; j < segments.length; j++) {
      const segmentB = segments[j];

      let intersection = segmentIntersectsSegment(segmentA, segmentB);
      if (!intersection) {
        continue;
      }

      if (intersection instanceof Segment) {
        const { start, end } = intersection;
        const step = end.sub(start).sign();
        let position = start.clone();
        while (position.x !== end.x || position.y !== end.y) {
          intersections.add(position.toString());
          position = position.add(step);
        }
        intersections.add(position.toString());
        continue;
      }

      // Intersections can be at whole or half squares, plus a bit of float innacuracy
      // Deal with the float innacuracy first...
      intersection = intersection.roundToNearest(0.5);

      // Ones on half squares should be floored
      intersection = intersection.floor();

      intersections.add(intersection.toString());
    }
  }

  console.log("Dangerous points", intersections.size);
}

main();

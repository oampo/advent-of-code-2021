import { readFileSync } from "fs";
import * as path from "path";

type Axis = "x" | "y";

interface Fold {
  index: number;
  axis: Axis;
}

function fold(points: Set<string>, fold: Fold): Set<string> {
  const axis = fold.axis === "x" ? 0 : 1;
  const newPoints = new Set<string>();
  for (const point of points) {
    const coordinates = point.split(",").map(Number);

    if (coordinates[axis] < fold.index) {
      newPoints.add(point);
    } else if (coordinates[axis] > fold.index) {
      coordinates[axis] = 2 * fold.index - coordinates[axis];
      newPoints.add(`${coordinates[0]},${coordinates[1]}`);
    }
  }

  return newPoints;
}

function plot(points: Set<string>) {
  const coordinates = [...points].map((point) => point.split(",").map(Number));
  const minX = Math.min(...coordinates.map((c) => c[0]));
  const maxX = Math.max(...coordinates.map((c) => c[0]));
  const minY = Math.min(...coordinates.map((c) => c[1]));
  const maxY = Math.max(...coordinates.map((c) => c[1]));

  for (let i = minY; i <= maxY; i++) {
    for (let j = minX; j < maxX; j++) {
      if (points.has(`${j},${i}`)) {
        process.stdout.write("x");
      } else {
        process.stdout.write(".");
      }
    }
    console.log("");
  }
}

function main(): void {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const [pointData, foldData] = data.trim().split("\n\n");

  let points = new Set(pointData.split("\n"));
  const folds = foldData.split("\n").map((foldString) => {
    const match = foldString.match(/^fold along (x|y)=(\d+)$/);
    if (!match) throw new Error("Unknown fold string");
    return { index: Number(match[2]), axis: match[1] as Axis };
  });

  for (const f of folds) {
    points = fold(points, f);
  }

  plot(points);
}

main();

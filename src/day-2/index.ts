import { readFileSync } from "fs";
import * as path from "path";

enum Direction {
  UP = "up",
  DOWN = "down",
  FORWARD = "forward",
}

function directionFromString(s: string): Direction {
  if (!Object.values(Direction).includes(s as Direction))
    throw new Error(`Unknown direction: ${s}`);
  return s as Direction;
}

interface Command {
  direction: Direction;
  distance: number;
}

function toCommand(s: string): Command {
  const [direction, distance] = s.split(" ");
  return {
    direction: directionFromString(direction),
    distance: Number(distance),
  };
}

interface Result {
  depth: number;
  position: number;
}

function part1(commands: Command[]): Result {
  let depth = 0;
  let position = 0;
  for (const command of commands) {
    if (command.direction === Direction.UP) {
      depth -= command.distance;
    } else if (command.direction === Direction.DOWN) {
      depth += command.distance;
    } else if (command.direction === Direction.FORWARD) {
      position += command.distance;
    }
  }
  return { depth, position };
}

function part2(commands: Command[]): Result {
  let aim = 0;
  let depth = 0;
  let position = 0;
  for (const command of commands) {
    if (command.direction === Direction.UP) {
      aim -= command.distance;
    } else if (command.direction === Direction.DOWN) {
      aim += command.distance;
    } else if (command.direction === Direction.FORWARD) {
      position += command.distance;
      depth += aim * command.distance;
    }
  }
  return { depth, position };
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const commands = data.trim().split("\n").map(toCommand);

  const { depth: depthA, position: positionA} = part1(commands);
  console.log("Part 1");
  console.log("Depth is", depthA);
  console.log("Position is", positionA);
  console.log("Depth times position is", depthA * positionA);

  const { depth: depthB, position: positionB} = part2(commands);
  console.log("Part 2");
  console.log("Depth is", depthB);
  console.log("Position is", positionB);
  console.log("Depth times position is", depthB * positionB);
}

main();

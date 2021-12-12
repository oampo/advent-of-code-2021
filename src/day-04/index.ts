import { readFileSync } from "fs";
import * as path from "path";

interface Cell {
  value: number;
  checked: boolean;
}

type Line = Cell[];
type Board = Line[];

function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((x) => !b.has(x)));
}

function checkLine(line: Line): number | null {
  for (const [index, cell] of line.entries()) {
    if (!cell.checked) {
      return index;
    }
  }
  return null;
}

function isWinner(board: Board): boolean {
  const columnsToCheck = new Set(
    Array.from({ length: board.length }, (_, i) => i)
  );

  for (const row of board) {
    const columnIndex = checkLine(row);
    if (columnIndex === null) {
      return true;
    }

    columnsToCheck.delete(columnIndex);
  }

  for (const columnIndex of columnsToCheck) {
    if (checkLine(board.map((row) => row[columnIndex])) === null) {
      return true;
    }
  }

  return false;
}

function updateBoard(board: Board, value: number) {
  for (const row of board) {
    for (const cell of row) {
      if (cell.value === value) {
        cell.checked = true;
        return;
      }
    }
  }
}

function tick(boards: Set<Board>, value: number): Set<Board> {
  const winners = new Set<Board>();
  for (const board of boards) {
    updateBoard(board, value);

    if (isWinner(board)) {
      winners.add(board);
    }
  }
  return winners;
}

function calculateScore(board: Board, value: number): number {
  let sum = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell.checked) {
        sum += cell.value;
      }
    }
  }

  return sum * value;
}

function main() {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const split = data.trim().split("\n\n");
  const [drawString, ...boardsString] = split;
  const draw = drawString.split(",").map(Number);

  let boards = new Set<Board>();
  boardsString.forEach((board) =>
    boards.add(
      board.split("\n").map((row) =>
        row
          .trim()
          .split(/ +/)
          .map((value) => ({
            value: Number(value),
            checked: false,
          }))
      )
    )
  );

  let winners = new Set<Board>();
  for (const value of draw) {
    if (!boards.size) {
      break;
    }

    winners = tick(boards, value);

    if (winners.size) {
      const scores = Array.from(winners).map((board) =>
        calculateScore(board, value)
      );
      console.log(
        `${winners.size} winners, with scores of ${scores.join(", ")}`
      );
      boards = difference(boards, winners);
    }
  }
}

main();

import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";

async function* readLinesAsNumbers(pathName: string): AsyncIterable<number> {
  const stream = fs.createReadStream(pathName);

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    yield Number(line);
  }
}

function isIterable<T>(iterator: Iterable<T> | AsyncIterable<T>): iterator is Iterable<T> {
  return Symbol.iterator in (iterator as Iterable<T>);
}

async function* windowed<T>(
  iterable: Iterable<T> | AsyncIterable<T>,
  windowSize: number
): AsyncIterable<T[]> {
  let iterator: Iterator<T> | AsyncIterator<T>;
  if (isIterable(iterable)) {
    iterator = iterable[Symbol.iterator]();
  }
  else {
    iterator = iterable[Symbol.asyncIterator]();
  }

  const window = [];
  for (let i = 0; i < windowSize; i++) {
    const result = await iterator.next();
    if (result.done) {
      // Not enough to fill a single window
      return;
    }
    window.push(result.value);
  }

  yield window;

  for await (const value of iterable) {
    window.shift();
    window.push(value);
    yield [...window];
  }
}

async function* sum(iterable: Iterable<number[]> | AsyncIterable<number[]>): AsyncIterable<number> {
  for await (const values of iterable) {
    yield values.reduce((sum, x) => sum + x, 0);
  }
}

async function countIncreases(values: Iterable<number> | AsyncIterable<number>): Promise<number> {
  let iterator: Iterator<number> | AsyncIterator<number>;
  if (isIterable(values)) {
    iterator = values[Symbol.iterator]();
  }
  else {
    iterator = values[Symbol.asyncIterator]();
  }

  const result = await iterator.next();

  if (result.done) {
    return 0;
  }

  let lastValue = result.value;
  let increaseCount = 0;
  for await (const value of values) {
    if (value > lastValue) {
      increaseCount++;
    }

    lastValue = value;
  }

  return increaseCount;
}

async function main() {
  const increases = await countIncreases(
    readLinesAsNumbers(path.join(__dirname, "input.txt"))
  );
  console.log("Number of increases:", increases);
  const lines = readLinesAsNumbers(path.join(__dirname, "input.txt"));
  const windows = windowed(lines, 3);
  const sums = sum(windows);
  const windowedIncreases = await countIncreases(sums);
  console.log("Number of windowed increases:", windowedIncreases);
}

main();

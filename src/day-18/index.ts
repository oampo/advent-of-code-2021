import { readFileSync } from "fs";

type Node = {
  left: Node | null;
  right: Node | null;
  value: number | null;
};

type Token = {
  kind: "left-bracket" | "right-bracket" | "number" | "comma";
  start: number;
  end: number;
};

function lex(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    let token;
    if (s[i] === "[") {
      token = {
        kind: "left-bracket",
        start: i,
        end: ++i,
      };
    } else if (s[i] === "]") {
      token = {
        kind: "right-bracket",
        start: i,
        end: ++i,
      };
    } else if (s[i] === ",") {
      token = {
        kind: "comma",
        start: i,
        end: ++i,
      };
    } else {
      const match = s.slice(i).match(/^[0-9]+/);
      if (match) {
        token = {
          kind: "number",
          start: i,
          end: (i += match[0].length),
        };
      } else {
        throw new Error(`Could not lex at character: ${i}`);
      }
    }
    tokens.push(token as Token);
  }
  return tokens;
}

function parse(s: string, tokens: IterableIterator<Token>): Node {
  const { value: token, done } = tokens.next();
  if (done) throw new Error("Unexpected end of line");
  if (token.kind === "number") {
    return {
      left: null,
      right: null,
      value: Number(s.slice(token.start, token.end)),
    };
  } else if (token.kind === "left-bracket") {
    const left = parse(s, tokens);

    let { value: token, done } = tokens.next();
    if (done) throw new Error("Unexpected end of line");
    else if (token.kind !== "comma")
      throw new Error(`Unexpected token: ${s.slice(token.start, token.end)}`);

    const right = parse(s, tokens);

    ({ value: token, done } = tokens.next());
    if (done) throw new Error("Unexpected end of line");
    else if (token.kind !== "right-bracket")
      throw new Error(`Unexpected token: ${s.slice(token.start, token.end)}`);

    return {
      left: left,
      right: right,
      value: null,
    };
  } else {
    throw new Error(`Unexpected token: ${s.slice(token.start, token.end)}`);
  }
}

function explodeStep(
  node: Node,
  prevLeaf: Node | null = null,
  shouldAct = true,
  toAdd: number | null = null,
  depth = 0
): { shouldAct: boolean; toAdd: number | null; prevLeaf: Node | null } {
  if (!shouldAct && !toAdd) return { shouldAct, toAdd, prevLeaf };
  if (node.left && node.right) {
    if (shouldAct && depth === 4) {
      if (prevLeaf) (prevLeaf.value as number) += node.left.value as number;
      toAdd = node.right.value as number;
      node.value = 0;
      node.left = null;
      node.right = null;
      shouldAct = false;
    } else {
      ({ shouldAct, toAdd, prevLeaf } = explodeStep(
        node.left,
        prevLeaf,
        shouldAct,
        toAdd,
        depth + 1
      ));
      ({ shouldAct, toAdd, prevLeaf } = explodeStep(
        node.right,
        prevLeaf,
        shouldAct,
        toAdd,
        depth + 1
      ));
    }
  } else if (node.value !== null) {
    if (toAdd !== null) {
      node.value += toAdd;
      toAdd = null;
    }
    prevLeaf = node;
  }
  return { shouldAct, toAdd, prevLeaf };
}

function explode(node: Node): boolean {
  let didExplode = false;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { shouldAct: done } = explodeStep(node);
    didExplode = didExplode || !done;
    if (done) return didExplode;
  }
}

function split(node: Node): boolean {
  if (!node.left && !node.right && node.value !== null && node.value >= 10) {
    node.left = { left: null, right: null, value: Math.floor(node.value / 2) };
    node.right = { left: null, right: null, value: Math.ceil(node.value / 2) };
    node.value = null;
    return true;
  } else if (node.left && node.right) {
    let didSplit = false;
    didSplit = didSplit || split(node.left);
    didSplit = didSplit || split(node.right);
    return didSplit;
  } else {
    return false;
  }
}

function reduce(node: Node) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const didExplode = explode(node);
    const didSplit = split(node);
    if (!didExplode && !didSplit) break;
  }
}

function add(nodes: Node[]): Node {
  let result = nodes[0];
  for (const node of nodes.slice(1)) {
    result = {
      left: result,
      right: node,
      value: null,
    };
    reduce(result);
  }
  return result;
}

function magnitude(node: Node): number {
  if (node.left && node.right) {
    return 3 * magnitude(node.left) + 2 * magnitude(node.right);
  } else if (node.value !== null) {
    return node.value;
  }
  throw new Error("Broken node");
}

function _print(node: Node) {
  if (node.left && node.right) {
    process.stdout.write("[");
    _print(node.left);
    process.stdout.write(",");
    _print(node.right);
    process.stdout.write("]");
  } else if (node.value !== null) {
    process.stdout.write(node.value.toString());
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function print(node: Node) {
  _print(node);
  process.stdout.write("\n");
}

function clone(node: Node): Node {
  if (node.left && node.right) {
    return { left: clone(node.left), right: clone(node.right), value: null };
  } else {
    return { left: null, right: null, value: node.value };
  }
}

function main(): void {
  const data = readFileSync(__dirname + "/input.txt", "utf-8");
  const nodes = data
    .trim()
    .split("\n")
    .map((s) => parse(s, lex(s).values()));
  //const result = add(nodes);
  //console.log(magnitude(result));

  let largest = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const result = magnitude(add([clone(nodes[i]), clone(nodes[j])]));
      if (result > largest) largest = result;
    }
  }
  console.log(largest);
}

main();

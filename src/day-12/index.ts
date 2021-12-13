import { readFileSync } from "fs";
import * as path from "path";

interface Cave {
  name: string;
  connections: string[];
}

type Graph = { [name: string]: Cave };

type Edge = {
  from: string;
  to: string;
};

function makeCave(name: string): Cave {
  return {
    name,
    connections: [],
  };
}

function isSmall(cave: Cave): boolean {
  const { name } = cave;
  return name[0] === name[0].toLowerCase();
}

function buildGraph(edges: Edge[]): Graph {
  const graph: Graph = {};

  for (const { from, to } of edges) {
    if (!(from in graph)) graph[from] = makeCave(from);
    if (!(to in graph)) graph[to] = makeCave(to);
    graph[from].connections.push(to);
    graph[to].connections.push(from);
  }

  return graph;
}

function traverse(
  graph: Graph,
  start: string,
  end: string,
  doubleVisited = false,
  path: string[] = []
): string[][] {
  if (isSmall(graph[start])) {
    if (path.includes(start)) {
      if (doubleVisited) return [];
      if (start === "start") return [];
      else doubleVisited = true;
    }
  }

  if (start === end) return [[...path, start]];

  const paths = [];
  for (const connection of graph[start].connections) {
    paths.push(
      ...traverse(graph, connection, end, doubleVisited, [...path, start])
    );
  }
  return paths;
}

function main(): void {
  const data = readFileSync(path.join(__dirname, "input.txt"), "utf-8");
  const edges = data
    .trim()
    .split("\n")
    .map((line) => {
      const [from, to] = line.split("-");
      return { from, to };
    });
  const graph = buildGraph(edges);
  const paths = traverse(graph, "start", "end");
  console.log(paths.length);
}

main();

import { readFileSync } from "fs";

enum LengthType {
  FifteenBit = 0,
  ElevenBit = 1,
}

enum PacketType {
  Sum = 0,
  Product = 1,
  Minimum = 2,
  Maximum = 3,
  Literal = 4,
  GreaterThan = 5,
  LessThan = 6,
  EqualTo = 7,
}

interface PacketHeader {
  version: number;
  type: PacketType;
}

interface Literal extends PacketHeader {
  number: bigint;
}

interface Operator extends PacketHeader {
  subpackets: Packet[];
}

type Packet = Literal | Operator;

function isLiteral(p: Packet): p is Literal {
  return p.type === PacketType.Literal;
}

function isOperator(p: Packet): p is Operator {
  return p.type !== PacketType.Literal;
}

function readBits(s: string, start: number, end: number): number {
  const bits = end - start;
  const wordStart = start & ~3;
  const wordEnd = (end + 3) & ~3;

  const num = parseInt(s.slice(wordStart >> 2, wordEnd >> 2), 16);

  return (num >> (wordEnd - end)) & ((1 << bits) - 1);
}

function readPacketHeader(
  s: string,
  i: number
): { header: PacketHeader; i: number } {
  const version = readBits(s, i, (i += 3));
  const type = readBits(s, i, (i += 3));
  return { header: { version, type }, i };
}

function readNumber(s: string, i: number): { number: bigint; i: number } {
  let number = 0n;
  let hasMore = 1;
  do {
    hasMore = readBits(s, i, ++i);
    number = (number << 4n) | BigInt(readBits(s, i, (i += 4)));
  } while (hasMore);
  return { number, i };
}

function readPacket(s: string, i: number): { packet: Packet; i: number } {
  const result = readPacketHeader(s, i);
  const { header } = result;
  ({ i } = result);
  switch (header.type) {
    case PacketType.Literal: {
      const result = readNumber(s, i);
      const { number } = result;
      ({ i } = result);
      return {
        packet: {
          ...header,
          number,
        },
        i,
      };
    }
    case PacketType.Sum:
    case PacketType.Product:
    case PacketType.Minimum:
    case PacketType.Maximum:
    case PacketType.GreaterThan:
    case PacketType.LessThan:
    case PacketType.EqualTo: {
      const subpackets = [];
      const lengthType = readBits(s, i, ++i);
      switch (lengthType) {
        case LengthType.FifteenBit: {
          const lengthOfSubpackets = readBits(s, i, (i += 15));
          const subpacketStart = i;
          while (i - subpacketStart < lengthOfSubpackets) {
            const result = readPacket(s, i);
            if (!result) throw new Error("Invalid subpacket structure");
            const { packet } = result;
            ({ i } = result);
            subpackets.push(packet);
          }
          break;
        }
        case LengthType.ElevenBit: {
          const numberOfSubpackets = readBits(s, i, (i += 11));
          for (let j = 0; j < numberOfSubpackets; j++) {
            const result = readPacket(s, i);
            if (!result) throw new Error("Invalid subpacket structure");
            const { packet } = result;
            ({ i } = result);
            subpackets.push(packet);
          }
          break;
        }
        default:
          throw new Error("Unknown length type");
      }

      return { packet: { ...header, subpackets }, i };
    }
    default:
      throw new Error("Unknown packet type");
  }
}

function readPackets(s: string): Packet[] {
  const packets = [];
  let i = 0;
  while (i < s.length << 2) {
    const result = readPacket(s, i);
    const { packet } = result;
    ({ i } = result);
    packets.push(packet);
  }
  return packets;
}

function sumPacketVersions(packets: Packet[]): number {
  let sum = 0;
  for (const packet of packets) {
    sum += packet.version;
    if (isOperator(packet)) {
      sum += sumPacketVersions(packet.subpackets);
    }
  }
  return sum;
}

function evaluate(p: Packet): bigint {
  if (isLiteral(p)) {
    return p.number;
  }

  switch (p.type) {
    case PacketType.Sum:
      return p.subpackets.reduce((sum, packet) => sum + evaluate(packet), 0n);
    case PacketType.Product:
      return p.subpackets.reduce(
        (product, packet) => product * evaluate(packet),
        1n
      );
    case PacketType.Minimum:
      return p.subpackets.reduce((min, p) => {
        const value = evaluate(p);
        return value < min ? value : min;
      }, 2n ** 54n);
    case PacketType.Maximum:
      return p.subpackets.reduce((max, p) => {
        const value = evaluate(p);
        return value > max ? value : max;
      }, -(2n ** 54n));
    case PacketType.GreaterThan:
      if (p.subpackets.length > 2)
        throw new Error("Unexpected number of subpackets");
      return evaluate(p.subpackets[0]) > evaluate(p.subpackets[1]) ? 1n : 0n;
    case PacketType.LessThan:
      if (p.subpackets.length > 2)
        throw new Error("Unexpected number of subpackets");
      return evaluate(p.subpackets[0]) < evaluate(p.subpackets[1]) ? 1n : 0n;
    case PacketType.EqualTo:
      if (p.subpackets.length > 2)
        throw new Error("Unexpected number of subpackets");
      return evaluate(p.subpackets[0]) === evaluate(p.subpackets[1]) ? 1n : 0n;
    default:
      throw new Error("Unknown packet type");
  }
}

function main(): void {
  const s = readFileSync(__dirname + "/input.txt", "utf-8").trim();
  const packets = readPackets(s);

  console.log(sumPacketVersions(packets));
  console.log(evaluate(packets[0]));
}

main();

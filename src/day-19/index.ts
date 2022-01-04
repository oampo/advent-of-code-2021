function countEqual(a:any, b: any) {
  let count = 0;
  let i=0, j=0;
  while (i !== a.length && j !== b.length) {
    if (a[i] === b[j]) {
      count++;
      i++;
      j++;
    }
    else if (a[i] < b[j]) i++;
    else if (a[i] > b[j]) j++;
  }
  return count;
}

function overlaps(distancesA: any, distancesB: any) {

  for (const beaconDistancesA of distancesA) {
    for (const beaconDistancesB of distancesB) {
      console.log(countEqual(beaconDistancesA, beaconDistancesB));
    }
  }
}

function main() {
  const scanners = [
    [
      [0, 2],
      [4, 1],
      [3, 3],
    ],
    [
      [-1, -1],
      [-5, 0],
      [-2, 1],
    ],
  ];

  const distances = [];
  for (const scanner of scanners) {
    const scannerDistances = [];
    for (let i=0; i<scanner.length; i++) {
      const beaconDistances = [];
      const beaconA = scanner[i];
      for (let j=0; j<scanner.length; j++) {
        if (j === i) continue;
        const beaconB = scanner[j];
        beaconDistances.push((beaconA[0] - beaconB[0]) ** 2 + (beaconA[1] - beaconB[1]) ** 2);
      }
      beaconDistances.sort();
      scannerDistances.push(beaconDistances);
    }
    distances.push(scannerDistances);
  }

  for (let i=0; i<distances.length; i++) {
    const scannerDistancesA = distances[i];
    for (let j=i + 1; j<distances.length; j++) {
      const scannerDistancesB = distances[j];
      overlaps(scannerDistancesA, scannerDistancesB);
    }
  }

  console.log(distances);
}

main();

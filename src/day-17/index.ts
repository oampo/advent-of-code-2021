function simulate(
  xVel: number,
  yVel: number,
  left: number,
  right: number,
  top: number,
  bottom: number
): boolean {
  let x = 0;
  let y = 0;
  while (x <= right && y >= bottom) {
    if (x >= left && x <= right && y <= top && y >= bottom) return true;

    x += xVel;
    y += yVel;
    xVel = xVel === 0 ? 0 : xVel - 1;
    yVel -= 1;
  }
  return false;
}

function main() {
  const left = 241;
  const right = 273;
  const top = -63;
  const bottom = -97;

  const minXVel = Math.ceil(-1 + Math.sqrt(1 + 4 * 2 * left) / 2);
  const maxXVel = right;

  const minYVel = bottom;
  const maxYVel = -bottom - 1;
  let count = 0;
  for (let i = minXVel; i <= maxXVel; i++) {
    for (let j = minYVel; j <= maxYVel; j++) {
      if (simulate(i, j, left, right, top, bottom)) {
        count++;
      }
    }
  }
  console.log(count);
}

main();

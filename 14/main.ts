import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Point {
    x: number;
    y: number;
}

const rocks: Point[] = input
    .split('\n')
    .map(line => line.split(' -> ').map(point => ({ x: Number(point.split(',')[0]), y: Number(point.split(',')[1]) })))
    .map(path => {
        const rockPositions: Point[] = [];

        for (let i = 0; i < path.length - 1; i++) {
            const point1 = path[i];
            const point2 = path[i + 1];

            for (let x = Math.min(point1.x, point2.x); x <= Math.max(point1.x, point2.x); x++) {
                for (let y = Math.min(point1.y, point2.y); y <= Math.max(point1.y, point2.y); y++) {
                    rockPositions.push({ x, y });
                }
            }
        }

        return rockPositions;
    })
    .flat();

const pointToString = (point: Point): string => `${point.x}|${point.y}`;

const originalOccupiedPositions = new Set<string>(rocks.map(pointToString));
const highestRock = Math.max(...rocks.map(rock => rock.y));

const simulateSand = (hasFloor: boolean): number => {
    let unitsOfSand = 0;

    const occupiedPositions = new Set<string>(originalOccupiedPositions);

    let sandIsFallingIntoVoid = false;
    let sandBlocksSource = false;

    while ((!hasFloor && !sandIsFallingIntoVoid) || (hasFloor && !sandBlocksSource)) {
        let sandPosition: Point = { x: 500, y: 0 };

        if (occupiedPositions.has(pointToString(sandPosition))) {
            sandBlocksSource = true;
            break;
        }

        while (true) {
            if (!hasFloor && sandPosition.y > highestRock) {
                sandIsFallingIntoVoid = true;
                break;
            }

            const newPositions = [
                { x: sandPosition.x, y: sandPosition.y + 1 },
                { x: sandPosition.x - 1, y: sandPosition.y + 1 },
                { x: sandPosition.x + 1, y: sandPosition.y + 1 },
            ];

            let found = false;

            for (const newPosition of newPositions) {
                if (hasFloor && sandPosition.y >= highestRock + 1) {
                    continue;
                }

                if (!occupiedPositions.has(pointToString(newPosition))) {
                    sandPosition = newPosition;
                    found = true;
                    break;
                }
            }

            if (!found) {
                occupiedPositions.add(pointToString(sandPosition));
                unitsOfSand++;
                break;
            }
        }
    }

    return unitsOfSand;
};

console.log('PART 1:', simulateSand(false));
console.log('PART 2:', simulateSand(true));

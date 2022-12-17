import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const jetDirections: number[] = input.split('').map(direction => (direction === '>' ? 1 : -1));

interface Position {
    x: number;
    y: number;
}

interface Rock {
    leftX: number;
    bottomY: number;
    shape: Position[];
}

const shapes: Position[][] = [
    [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
    ],
    [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
    ],
    [
        { x: 2, y: 2 },
        { x: 2, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
    ],
    [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
    ],
    [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
    ],
];

const doesRockIntersect = (rock: Rock, cave: Set<string>): boolean => {
    return rock.shape.some(part => cave.has(`${rock.leftX + part.x}|${rock.bottomY + part.y}`));
};

const canRockMoveSideways = (rock: Rock, x: number, cave: Set<string>): boolean => {
    return !rock.shape.some(
        part => x + part.x < 0 || x + part.x >= 7 || cave.has(`${x + part.x}|${rock.bottomY + part.y}`),
    );
};

const calculateGroundShapeFingerprint = (
    highestRockY: number,
    cave: Set<string>,
    maxSearchDistance: number,
): string => {
    const queue: (Position & { distance: number })[] = [];
    const visitedPositions = new Set();

    for (let x = 0; x < 7; x++) {
        queue.push({ x, y: highestRockY, distance: 0 });
        visitedPositions.add(`${x}|${highestRockY}`);
    }

    const groundShape: Position[] = [];

    while (queue.length > 0) {
        const position = queue.shift()!;

        if (cave.has(`${position.x}|${position.y}`)) {
            groundShape.push({ x: position.x, y: position.y - highestRockY });
        }

        if (position.distance > maxSearchDistance) {
            continue;
        }

        for (const adjacentPosition of [
            { x: position.x + 1, y: position.y },
            { x: position.x - 1, y: position.y },
            { x: position.x, y: position.y + 1 },
            { x: position.x, y: position.y - 1 },
        ] as Position[]) {
            if (
                adjacentPosition.x < 0 ||
                adjacentPosition.x >= 7 ||
                adjacentPosition.y < -1 ||
                adjacentPosition.y > highestRockY ||
                visitedPositions.has(`${adjacentPosition.x}|${adjacentPosition.y}`)
            ) {
                continue;
            }

            visitedPositions.add(`${adjacentPosition.x}|${adjacentPosition.y}`);
            queue.push({ ...adjacentPosition, distance: position.distance + 1 });
        }
    }

    groundShape.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y));
    return groundShape.map(position => `${position.x}|${position.y}`).join(';');
};

const calculateTowerHeight = (rockCount: number) => {
    const cave = new Set<string>();
    const stateFingerprints = new Map<string, { rockNumber: number; highestRockY: number }>();

    let jetDirectionIndex = 0;
    let shapeIndex = 0;

    let highestRockY = -1;

    let additionalHeight = 0;
    let searchForCycles = true;

    for (let rockNumber = 1; rockNumber <= rockCount; rockNumber++) {
        const rock: Rock = {
            leftX: 2,
            bottomY: highestRockY + 4,
            shape: shapes[shapeIndex],
        };

        while (true) {
            const newX = rock.leftX + jetDirections[jetDirectionIndex];
            if (canRockMoveSideways(rock, newX, cave)) {
                rock.leftX = newX;
            }
            jetDirectionIndex = (jetDirectionIndex + 1) % jetDirections.length;

            rock.bottomY--;
            if (rock.bottomY < 0 || doesRockIntersect(rock, cave)) {
                rock.bottomY++;
                break;
            }
        }

        for (const part of rock.shape) {
            cave.add(`${rock.leftX + part.x}|${rock.bottomY + part.y}`);
            highestRockY = Math.max(highestRockY, rock.bottomY + part.y);
        }

        shapeIndex = (shapeIndex + 1) % shapes.length;

        if (searchForCycles) {
            const groundStateFingerprint = calculateGroundShapeFingerprint(highestRockY, cave, 50);
            const stateFingerprint = `${groundStateFingerprint}#${jetDirectionIndex}#${shapeIndex}`;
            if (stateFingerprints.has(stateFingerprint)) {
                const cycleStart = stateFingerprints.get(stateFingerprint)!;
                const cycleLength = rockNumber - cycleStart.rockNumber;

                const skippedCycles = Math.floor((rockCount - rockNumber) / cycleLength);
                rockNumber += skippedCycles * cycleLength;

                additionalHeight += skippedCycles * (highestRockY - cycleStart.highestRockY);
                searchForCycles = false;
            }

            stateFingerprints.set(stateFingerprint, { rockNumber, highestRockY });
        }
    }

    return highestRockY + 1 + additionalHeight;
};

console.log('PART 1:', calculateTowerHeight(2022));
console.log('PART 2:', calculateTowerHeight(1000000000000));

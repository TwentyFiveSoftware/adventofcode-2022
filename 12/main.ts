import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Position {
    x: number;
    y: number;
}

let startingPosition: Position = { x: 0, y: 0 };
let targetPosition: Position = { x: 0, y: 0 };

const heightMap: number[][] = input.split('\n').map((line, y) =>
    line.split('').map((tile, x) => {
        let tileCode = tile.charCodeAt(0);
        if (tile === 'S') {
            startingPosition = { x, y };
            tileCode = 'a'.charCodeAt(0);
        } else if (tile === 'E') {
            targetPosition = { x, y };
            tileCode = 'z'.charCodeAt(0);
        }
        return tileCode - 'a'.charCodeAt(0);
    }),
);

const findShortestPathToTarget = (startingPosition: Position): number => {
    const queue: (Position & { steps: number })[] = [{ ...startingPosition, steps: 0 }];
    const visitedPositions = new Set(`0|0`);

    while (queue.length > 0) {
        const currentPosition = queue.shift()!;

        if (currentPosition.x === targetPosition.x && currentPosition.y === targetPosition.y) {
            return currentPosition.steps;
        }

        const adjacentPositions: Position[] = [
            { x: currentPosition.x + 1, y: currentPosition.y },
            { x: currentPosition.x - 1, y: currentPosition.y },
            { x: currentPosition.x, y: currentPosition.y + 1 },
            { x: currentPosition.x, y: currentPosition.y - 1 },
        ]
            .filter(
                (position: Position) =>
                    position.x >= 0 &&
                    position.y >= 0 &&
                    position.y < heightMap.length &&
                    position.x < heightMap[position.y].length,
            )
            .filter((position: Position) => !visitedPositions.has(`${position.x}|${position.y}`))
            .filter(
                (position: Position) =>
                    heightMap[position.y][position.x] - heightMap[currentPosition.y][currentPosition.x] <= 1,
            );

        for (const adjacentPosition of adjacentPositions) {
            queue.push({ ...adjacentPosition, steps: currentPosition.steps + 1 });
            visitedPositions.add(`${adjacentPosition.x}|${adjacentPosition.y}`);
        }
    }

    return -1;
};

const findBestStartingPositionForShortestPath = (): number => {
    const possibleStartingPositions = heightMap
        .map((row, y) => row.map((height, x) => ({ x, y, height })))
        .flat()
        .filter(tile => tile.height === 0);

    const stepsPerStartingPosition = possibleStartingPositions
        .map(startingPosition => findShortestPathToTarget(startingPosition))
        .filter(steps => steps >= 0);

    return Math.min(...stepsPerStartingPosition);
};

console.log('PART 1:', findShortestPathToTarget(startingPosition));
console.log('PART 2:', findBestStartingPositionForShortestPath());

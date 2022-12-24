import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Blizzard {
    x: number;
    y: number;
    dx: number;
    dy: number;
}

const initialBlizzards: Blizzard[] = [];

const lines = input.split('\n');
for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
        switch (lines[y].charAt(x)) {
            case '>':
                initialBlizzards.push({ x, y, dx: 1, dy: 0 });
                break;
            case '<':
                initialBlizzards.push({ x, y, dx: -1, dy: 0 });
                break;
            case '^':
                initialBlizzards.push({ x, y, dx: 0, dy: -1 });
                break;
            case 'v':
                initialBlizzards.push({ x, y, dx: 0, dy: 1 });
                break;
        }
    }
}

const blizzardMinX = 1;
const blizzardMaxX = lines[0].length - 2;
const blizzardMinY = 1;
const blizzardMaxY = lines.length - 2;

const calculateNextBlizzardLocations = (currentBlizzards: Blizzard[]): Blizzard[] => {
    const nextBlizzards: Blizzard[] = [];

    for (const blizzard of currentBlizzards) {
        let newX = blizzard.x + blizzard.dx;
        if (newX < blizzardMinX) {
            newX = blizzardMaxX;
        } else if (newX > blizzardMaxX) {
            newX = blizzardMinX;
        }

        let newY = blizzard.y + blizzard.dy;
        if (newY < blizzardMinY) {
            newY = blizzardMaxY;
        } else if (newY > blizzardMaxY) {
            newY = blizzardMinY;
        }

        nextBlizzards.push({ x: newX, y: newY, dx: blizzard.dx, dy: blizzard.dy });
    }

    return nextBlizzards;
};

interface Position {
    x: number;
    y: number;
}

const playerStartingPosition: Position = { x: lines[0].indexOf('.'), y: 0 };
const playerTargetPosition: Position = { x: lines[lines.length - 1].indexOf('.'), y: lines.length - 1 };

const blizzardsAtTime = new Map<number, Blizzard[]>();
blizzardsAtTime.set(0, initialBlizzards);
for (let time = 1; time < (blizzardMaxX - blizzardMinX + 1) * (blizzardMaxY - blizzardMinY + 1); time++) {
    const blizzards = calculateNextBlizzardLocations(blizzardsAtTime.get(time - 1)!);

    if (JSON.stringify(initialBlizzards) === JSON.stringify(blizzards)) {
        break;
    }

    blizzardsAtTime.set(time, blizzards);
}

interface Move {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    time: number;
}

const getMovesAtPosition = (x: number, y: number): Move[] => {
    const movesAtPosition: Move[] = [];

    for (let time = 0; time < blizzardsAtTime.size; time++) {
        const blizzardsNow = blizzardsAtTime.get(time)!;
        const blizzardsNext = blizzardsAtTime.get((time + 1) % blizzardsAtTime.size)!;

        const movablePositions = [
            { x: x + 1, y },
            { x: x - 1, y },
            { x, y: y + 1 },
            { x, y: y - 1 },
            { x, y },
        ]
            .filter(
                position =>
                    (position.x >= blizzardMinX &&
                        position.x <= blizzardMaxX &&
                        position.y >= blizzardMinX &&
                        position.y <= blizzardMaxX) ||
                    (position.x === playerTargetPosition.x && position.y === playerTargetPosition.y) ||
                    (position.x === playerStartingPosition.x && position.y === playerStartingPosition.y),
            )
            .filter(
                position =>
                    !blizzardsNow.some(blizzard => blizzard.x === x && blizzard.y === y) &&
                    !blizzardsNext.some(blizzard => blizzard.x === position.x && blizzard.y === position.y),
            );

        movesAtPosition.push(
            ...movablePositions.map(position => ({
                fromX: x,
                fromY: y,
                toX: position.x,
                toY: position.y,
                time,
            })),
        );
    }

    return movesAtPosition;
};

const possibleMovesForPosition = new Map<string, Move[]>();
possibleMovesForPosition.set(
    `${playerStartingPosition.x};${playerStartingPosition.y}`,
    getMovesAtPosition(playerStartingPosition.x, playerStartingPosition.y),
);
possibleMovesForPosition.set(
    `${playerTargetPosition.x};${playerTargetPosition.y}`,
    getMovesAtPosition(playerTargetPosition.x, playerTargetPosition.y),
);
for (let y = blizzardMinY; y <= blizzardMaxY; y++) {
    for (let x = blizzardMinX; x <= blizzardMaxX; x++) {
        possibleMovesForPosition.set(`${x};${y}`, getMovesAtPosition(x, y));
    }
}

const findPath = (from: Position, to: Position, startSteps: number): number => {
    const queue: (Position & { steps: number })[] = [{ ...from, steps: startSteps }];
    const movesMade = new Set<string>();

    while (queue.length > 0) {
        const position = queue.shift()!;

        if (position.x === to.x && position.y === to.y) {
            return position.steps;
        }

        if (!possibleMovesForPosition.has(`${position.x};${position.y}`)) {
            continue;
        }

        const moves = possibleMovesForPosition.get(`${position.x};${position.y}`)!;
        const movesAtCurrentTime = moves.filter(move => move.time === position.steps % blizzardsAtTime.size);

        for (const move of movesAtCurrentTime) {
            if (movesMade.has(JSON.stringify(move))) {
                continue;
            }

            movesMade.add(JSON.stringify(move));
            queue.push({ x: move.toX, y: move.toY, steps: position.steps + 1 });
        }
    }

    return -1;
};

(() => {
    console.log('PART 1:', findPath(playerStartingPosition, playerTargetPosition, 0));
})();

(() => {
    const first = findPath(playerStartingPosition, playerTargetPosition, 0);
    const second = findPath(playerTargetPosition, playerStartingPosition, first);
    const third = findPath(playerStartingPosition, playerTargetPosition, second);
    console.log('PART 2:', third);
})();

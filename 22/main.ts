import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const [boardLinesBlock, movementLine] = input.split('\n\n');
const boardLines = boardLinesBlock.split('\n');

interface Position {
    x: number;
    y: number;
}

const positionToBoardIndex = (position: Position): string => `${position.x};${position.y}`;

const board = new Map<string, boolean>();
for (let y = 0; y < boardLines.length; y++) {
    for (let x = 0; x < boardLines[y].length; x++) {
        if (boardLines[y].charAt(x) === ' ') {
            continue;
        }

        board.set(positionToBoardIndex({ x, y }), boardLines[y].charAt(x) === '.');
    }
}

const leftDirection = (direction: string): string => {
    switch (direction) {
        case 'R':
            return 'U';
        case 'L':
            return 'D';
        case 'U':
            return 'L';
        case 'D':
            return 'R';
        default:
            return direction;
    }
};

const rightDirection = (direction: string): string => {
    switch (direction) {
        case 'R':
            return 'D';
        case 'L':
            return 'U';
        case 'U':
            return 'R';
        case 'D':
            return 'L';
        default:
            return direction;
    }
};

const invertedDirection = (direction: string): string => {
    switch (direction) {
        case 'R':
            return 'L';
        case 'L':
            return 'R';
        case 'U':
            return 'D';
        case 'D':
            return 'U';
        default:
            return direction;
    }
};

interface Movement {
    direction: string;
    distance: number;
}

const parseMovements = (movementLine: string): Movement[] => {
    const movements: Movement[] = [];

    let currentDirection: string = 'R';
    for (let i = 0; i < movementLine.length; i++) {
        let movement: Movement = { direction: currentDirection, distance: 0 };

        let distanceLength = 0;
        for (let j = i + 1; j <= movementLine.length; j++) {
            const distance = Number(movementLine.substring(i, j));

            if (!isNaN(distance)) {
                movement.distance = distance;
                distanceLength = j - i;
            } else {
                break;
            }
        }

        if (distanceLength > 0) {
            movements.push(movement);
            i += distanceLength - 1;
        } else {
            if (movementLine.charAt(i) === 'L') {
                currentDirection = leftDirection(currentDirection);
            } else if (movementLine.charAt(i) === 'R') {
                currentDirection = rightDirection(currentDirection);
            }
        }
    }

    return movements;
};

const findWrappedAroundPosition = (position: Position, direction: string): Position => {
    const inverseDirection = invertedDirection(direction);
    const currentPosition = { ...position };
    let previousPosition = currentPosition;

    while (board.has(positionToBoardIndex(currentPosition))) {
        previousPosition = { ...currentPosition };

        switch (inverseDirection) {
            case 'R':
                currentPosition.x++;
                break;
            case 'L':
                currentPosition.x--;
                break;
            case 'U':
                currentPosition.y--;
                break;
            case 'D':
                currentPosition.y++;
                break;
        }
    }

    return previousPosition;
};

const simulateMovements = (movements: Movement[]): Position => {
    let currentPosition: Position = { x: boardLines[0].indexOf('.'), y: 0 };

    for (const movement of movements) {
        for (let i = 0; i < movement.distance; i++) {
            const previousPosition = { ...currentPosition };

            switch (movement.direction) {
                case 'R':
                    currentPosition.x++;
                    break;
                case 'L':
                    currentPosition.x--;
                    break;
                case 'U':
                    currentPosition.y--;
                    break;
                case 'D':
                    currentPosition.y++;
                    break;
            }

            if (board.has(positionToBoardIndex(currentPosition))) {
                if (!board.get(positionToBoardIndex(currentPosition))!) {
                    currentPosition = previousPosition;
                    break;
                }
            } else {
                currentPosition = findWrappedAroundPosition(previousPosition, movement.direction);

                if (!board.get(positionToBoardIndex(currentPosition))!) {
                    currentPosition = previousPosition;
                    break;
                }
            }
        }
    }

    return currentPosition;
};

const directionToPassword = (direction: string) => ['R', 'D', 'L', 'U'].indexOf(direction);

(() => {
    const movements: Movement[] = parseMovements(movementLine);

    const finalPosition = simulateMovements(movements);

    const finalPassword =
        1000 * (finalPosition.y + 1) +
        4 * (finalPosition.x + 1) +
        directionToPassword(movements[movements.length - 1].direction);

    console.log('PART 1:', finalPassword);
})();

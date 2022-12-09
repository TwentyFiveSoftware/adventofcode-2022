import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

type Direction = 'U' | 'D' | 'L' | 'R';

interface Motion {
    direction: Direction;
    steps: number;
}

const motions: Motion[] = input.split('\n').map(line => {
    const [direction, steps] = line.split(' ');
    return { direction: direction as Direction, steps: Number(steps) };
});

interface Position {
    x: number;
    y: number;
}

const moveInDirection = (position: Position, direction: Direction): Position => {
    switch (direction) {
        case 'U':
            return { x: position.x, y: position.y - 1 };
        case 'D':
            return { x: position.x, y: position.y + 1 };
        case 'L':
            return { x: position.x - 1, y: position.y };
        case 'R':
            return { x: position.x + 1, y: position.y };
    }
};

const getDirectionsToCloseGap = (target: Position, current: Position): Direction[] => {
    // touching
    if (Math.abs(target.x - current.x) <= 1 && Math.abs(target.y - current.y) <= 1) {
        return [];
    }

    // same column, row diff = 2
    if (Math.abs(target.x - current.x) === 2 && Math.abs(target.y - current.y) === 0) {
        return target.x > current.x ? ['R'] : ['L'];
    }

    // same row, column diff = 2
    if (Math.abs(target.x - current.x) === 0 && Math.abs(target.y - current.y) === 2) {
        return target.y > current.y ? ['D'] : ['U'];
    }

    // diagonals
    if (target.x > current.x) {
        return ['R', target.y > current.y ? 'D' : 'U'];
    } else {
        return ['L', target.y > current.y ? 'D' : 'U'];
    }
};

const simulateRopeMovement = (ropeLength: number): number => {
    const rope: Position[] = [];
    for (let i = 0; i < ropeLength; i++) {
        rope.push({ x: 0, y: 0 });
    }

    const uniquePositions = new Set();

    for (const motion of motions) {
        for (let step = 0; step < motion.steps; step++) {
            rope[0] = moveInDirection(rope[0], motion.direction);

            for (let i = 1; i < rope.length; i++) {
                for (const direction of getDirectionsToCloseGap(rope[i - 1], rope[i])) {
                    rope[i] = moveInDirection(rope[i], direction);
                }
            }

            const tail: Position = rope[rope.length - 1];
            uniquePositions.add(`${tail.x}|${tail.y}`);
        }
    }

    return uniquePositions.size;
};

console.log('PART 1:', simulateRopeMovement(2));
console.log('PART 2:', simulateRopeMovement(10));

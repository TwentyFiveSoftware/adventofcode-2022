import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Position {
    x: number;
    y: number;
}

interface Elf {
    position: Position;
    proposedPosition: Position;
}

const originalElves: Elf[] = [];

const lines = input.split('\n');
for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
        if (lines[y].charAt(x) === '#') {
            originalElves.push({ position: { x, y }, proposedPosition: { x, y } });
        }
    }
}

interface Direction {
    freeOffsets: Position[];
    moveOffset: Position;
}

const originalDirectionOrder: Direction[] = [
    {
        freeOffsets: [
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
        ],
        moveOffset: { x: 0, y: -1 },
    },
    {
        freeOffsets: [
            { x: -1, y: 1 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
        moveOffset: { x: 0, y: 1 },
    },
    {
        freeOffsets: [
            { x: -1, y: 1 },
            { x: -1, y: 0 },
            { x: -1, y: -1 },
        ],
        moveOffset: { x: -1, y: 0 },
    },
    {
        freeOffsets: [
            { x: 1, y: 1 },
            { x: 1, y: 0 },
            { x: 1, y: -1 },
        ],
        moveOffset: { x: 1, y: 0 },
    },
];

const isSomeElfAtPosition = (position: Position, offset: Position, elves: Elf[]): boolean =>
    elves.some(elf => elf.position.x === position.x + offset.x && elf.position.y === position.y + offset.y);

const findProposedPosition = (elfPosition: Position, directionOrder: Direction[], elves: Elf[]): Position => {
    if (
        !directionOrder
            .map(direction => direction.freeOffsets)
            .flat()
            .some(offset => isSomeElfAtPosition(elfPosition, offset, elves))
    ) {
        return elfPosition;
    }

    for (const direction of directionOrder) {
        let free = true;

        for (const offset of direction.freeOffsets) {
            if (isSomeElfAtPosition(elfPosition, offset, elves)) {
                free = false;
                break;
            }
        }

        if (free) {
            return { x: elfPosition.x + direction.moveOffset.x, y: elfPosition.y + direction.moveOffset.y };
        }
    }

    return elfPosition;
};

const simulateRound = (elves: Elf[], directionOrder: Direction[]) => {
    for (const elf of elves) {
        elf.proposedPosition = findProposedPosition(elf.position, directionOrder, elves);
    }

    for (const elf of elves) {
        if (
            elves.some(
                otherElf =>
                    otherElf !== elf &&
                    otherElf.proposedPosition.x === elf.proposedPosition.x &&
                    otherElf.proposedPosition.y === elf.proposedPosition.y,
            )
        ) {
            continue;
        }

        elf.position = elf.proposedPosition;
    }
};

(() => {
    let elves: Elf[] = [...originalElves.map(elf => ({ ...elf }))];
    let directionOrder: Direction[] = [...originalDirectionOrder];

    for (let round = 1; round <= 10; round++) {
        simulateRound(elves, directionOrder);
        directionOrder.push(directionOrder.shift()!);
    }

    const rectangleSize =
        (Math.max(...elves.map(elf => elf.position.x)) - Math.min(...elves.map(elf => elf.position.x)) + 1) *
        (Math.max(...elves.map(elf => elf.position.y)) - Math.min(...elves.map(elf => elf.position.y)) + 1);

    const groundTiles = rectangleSize - elves.length;
    console.log('PART 1:', groundTiles);
})();

(() => {
    let elves: Elf[] = [...originalElves.map(elf => ({ ...elf }))];
    let directionOrder: Direction[] = [...originalDirectionOrder];

    let round = 1;
    while (true) {
        if (
            !elves.some(elf => {
                const proposedPosition = findProposedPosition(elf.position, directionOrder, elves);
                return proposedPosition.x !== elf.position.x || proposedPosition.y !== elf.position.y;
            })
        ) {
            break;
        }

        simulateRound(elves, directionOrder);
        directionOrder.push(directionOrder.shift()!);
        round++;
    }

    console.log('PART 2:', round);
})();

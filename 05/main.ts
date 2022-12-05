import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();
const [initialStacks, procedure] = input.split('\n\n');

const initialStackLines: string[] = initialStacks.split('\n');

const stacks: string[][] = [];
for (let i = 0; i < initialStackLines.length - 1; i++) {
    for (let stackIndex = 0; stackIndex < (initialStackLines[i].length + 1) / 4; stackIndex++) {
        const crate = initialStackLines[i].substring(stackIndex * 4, (stackIndex + 1) * 4).trim();
        if (crate.length === 0) {
            continue;
        }

        if (!stacks[stackIndex]) {
            stacks[stackIndex] = [];
        }

        stacks[stackIndex].unshift(crate.substring(1, 2));
    }
}

interface Step {
    quantity: number;
    from: number;
    to: number;
}

const steps: Step[] = procedure.split('\n').map<Step>(line => {
    const [, quantity, from, to] = line.match(/move (\d+) from (\d+) to (\d+)/) ?? [];
    return { quantity: Number(quantity), from: Number(from) - 1, to: Number(to) - 1 };
});

// PART 1
(() => {
    const modifiedStacks = [...stacks.map(stack => [...stack])];

    for (const step of steps) {
        for (let i = 0; i < step.quantity; i++) {
            modifiedStacks[step.to].push(modifiedStacks[step.from].pop() ?? '');
        }
    }

    const topMostCrates: string = modifiedStacks.map(stack => stack[stack.length - 1]).join('');
    console.log('PART 1:', topMostCrates);
})();

// PART 2
(() => {
    const modifiedStacks = [...stacks.map(stack => [...stack])];

    for (const step of steps) {
        const cratesToMove = modifiedStacks[step.from].splice(
            modifiedStacks[step.from].length - step.quantity,
            step.quantity,
        );
        modifiedStacks[step.to].push(...cratesToMove);
    }

    const topMostCrates: string = modifiedStacks.map(stack => stack[stack.length - 1]).join('');
    console.log('PART 2:', topMostCrates);
})();

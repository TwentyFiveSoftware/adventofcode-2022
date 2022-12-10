import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Instruction {
    opcode: string;
    operand: number;
    cycles: number;
}

const instructions: Instruction[] = input.split('\n').map(line => {
    const [opcode, operand] = line.split(' ');
    return { opcode, operand: Number(operand ?? ''), cycles: opcode === 'addx' ? 2 : 1 };
});

const executeInstructions = (instructions: Instruction[]): number[] => {
    let xRegister = 1;

    let currentInstructionIndex = 0;
    let cyclesLeftForCurrentInstruction = instructions[currentInstructionIndex].cycles;

    const xRegisterValuesPerCycle: number[] = [xRegister];

    while (currentInstructionIndex < instructions.length) {
        xRegisterValuesPerCycle.push(xRegister);

        cyclesLeftForCurrentInstruction--;
        if (cyclesLeftForCurrentInstruction === 0) {
            if (instructions[currentInstructionIndex].opcode === 'addx') {
                xRegister += instructions[currentInstructionIndex].operand;
            }

            currentInstructionIndex++;
            cyclesLeftForCurrentInstruction = instructions[currentInstructionIndex]?.cycles;
        }
    }

    return xRegisterValuesPerCycle;
};

(() => {
    const signalStrengthSum = executeInstructions(instructions)
        .map((signalStrength, cycle) => signalStrength * cycle)
        .filter((_, cycle) => (cycle - 20) % 40 === 0)
        .reduce((sum, signalStrength) => sum + signalStrength, 0);

    console.log('PART 1:', signalStrengthSum);
})();

(() => {
    const xRegisterValues = executeInstructions(instructions).slice(1);

    let pixels: string[] = Array(240)
        .fill('.')
        .map((_, cycle) => {
            const currentPixelX = cycle % 40;
            if (Math.abs(xRegisterValues[cycle] - currentPixelX) <= 1) {
                return '#';
            }
            return '.';
        });

    let display: string = '';
    for (let i = 0; i < pixels.length; i += 40) {
        display += pixels.slice(i, i + 40).join('') + '\n';
    }

    console.log('PART 2:');
    console.log(display);
})();

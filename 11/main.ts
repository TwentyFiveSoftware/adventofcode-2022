import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Monkey {
    items: number[];
    operation: (old: number) => number;
    nextMonkey: (item: number) => number;
    modulo: number;
    itemsInspected: number;
}

const initialMonkeys: Monkey[] = input.split('\n\n').map(paragraph => {
    const [, startingItemsLine, operationLine, divisibleTestLine, testTrueLine, testFalseLine] = paragraph.split('\n');

    // Starting Items
    const startingItems: number[] = startingItemsLine.substring(18).split(', ').map(Number);

    // Operation
    const [, operator, operand] = operationLine.substring(13).match(/new = old ([+*]) (\d+|old)/) ?? [];
    const operation = (old: number): number => {
        const secondOperand = operand === 'old' ? old : Number(operand);
        return operator === '+' ? old + secondOperand : old * secondOperand;
    };

    // Test
    const divisibleTestConstant: number = Number(divisibleTestLine.substring(21));

    const testTrueMonkey: number = Number(testTrueLine.substring(29));
    const testFalseMonkey: number = Number(testFalseLine.substring(30));

    const nextMonkey = (item: number): number =>
        item % divisibleTestConstant === 0 ? testTrueMonkey : testFalseMonkey;

    //
    return { items: startingItems, operation, nextMonkey, modulo: divisibleTestConstant, itemsInspected: 0 };
});

const calculateMonkeyBusiness = (rounds: number, divideByThree: boolean = false): number => {
    const monkeys: Monkey[] = initialMonkeys.map(monkey => ({ ...monkey, items: [...monkey.items] }));
    const modulo: number = monkeys.map(monkey => monkey.modulo).reduce((acc, modulo) => acc * modulo, 1);

    for (let round = 1; round <= rounds; round++) {
        for (const monkey of monkeys) {
            while (monkey.items.length > 0) {
                let item = monkey.items.shift()!;
                item = monkey.operation(item);

                if (divideByThree) {
                    item = Math.floor(item / 3);
                }

                item = item % modulo;

                const nextMonkey = monkey.nextMonkey(item);
                monkeys[nextMonkey].items.push(item);

                monkey.itemsInspected++;
            }
        }
    }

    const perMonkeyBusiness: number[] = monkeys.map(monkey => monkey.itemsInspected).sort((a, b) => b - a);
    return perMonkeyBusiness[0] * perMonkeyBusiness[1];
};

console.log('PART 1:', calculateMonkeyBusiness(20, true));
console.log('PART 2:', calculateMonkeyBusiness(10000));

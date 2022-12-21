import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Monkey {
    name: string;
    leftDependency: string | null;
    rightDependency: string | null;
    constant?: number;
    operation?: (left: number, right: number) => number;
    solveForLeft?: (result: number, right: number) => number;
    solveForRight?: (result: number, left: number) => number;
}

const monkeys: Monkey[] = input.split('\n').map(line => {
    const [name, job] = line.split(': ');

    if (!isNaN(Number(job))) {
        return { name, leftDependency: null, rightDependency: null, constant: Number(job) };
    }

    const [, leftDependency, operator, rightDependency] = job.match(/([a-z]{4}) ([+*/-]) ([a-z]{4})/) ?? [];

    const operation = (left: number, right: number): number => {
        switch (operator) {
            case '+':
                return left + right;
            case '-':
                return left - right;
            case '*':
                return left * right;
            case '/':
                return left / right;
        }
        return NaN;
    };

    const solveForLeft = (result: number, right: number): number => {
        switch (operator) {
            case '+':
                return result - right;
            case '-':
                return result + right;
            case '*':
                return result / right;
            case '/':
                return result * right;
        }
        return NaN;
    };

    const solveForRight = (result: number, left: number): number => {
        switch (operator) {
            case '+':
                return result - left;
            case '-':
                return left - result;
            case '*':
                return result / left;
            case '/':
                return left / result;
        }
        return NaN;
    };

    return { name, leftDependency, rightDependency, operation, solveForLeft, solveForRight };
});

const monkeyIndex = new Map<string, Monkey>();
for (const monkey of monkeys) {
    monkeyIndex.set(monkey.name, monkey);
}

(() => {
    const evaluateMonkey = (monkeyName: string): number => {
        const monkey = monkeyIndex.get(monkeyName)!;

        if (monkey.leftDependency === null || monkey.rightDependency === null) {
            return monkey.constant!;
        }

        return monkey.operation!(evaluateMonkey(monkey.leftDependency), evaluateMonkey(monkey.rightDependency));
    };

    console.log('PART 1:', evaluateMonkey('root'));
})();

(() => {
    interface Node {
        solveForLeft?: (result: number, right: number) => number;
        solveForRight?: (result: number, left: number) => number;
        left: Node | number;
        right: Node | number;
        isHuman: boolean;
    }

    const buildEvaluationTree = (monkeyName: string): Node | number => {
        const monkey = monkeyIndex.get(monkeyName)!;

        if (monkeyName === 'humn') {
            return { isHuman: true, left: NaN, right: NaN };
        }

        if (monkey.leftDependency === null || monkey.rightDependency === null) {
            return monkey.constant!;
        }

        const leftSide = buildEvaluationTree(monkey.leftDependency);
        const rightSide = buildEvaluationTree(monkey.rightDependency);

        if (typeof leftSide === 'number' && typeof rightSide === 'number') {
            return monkey.operation!(leftSide, rightSide);
        }

        return {
            isHuman: false,
            left: leftSide,
            right: rightSide,
            solveForLeft: monkey.solveForLeft,
            solveForRight: monkey.solveForRight,
        };
    };

    const evaluateHumanConstant = (): number => {
        const rootMonkey = monkeyIndex.get('root')!;
        const leftRootTree = buildEvaluationTree(rootMonkey.leftDependency!);
        const rightRootTree = buildEvaluationTree(rootMonkey.rightDependency!);

        let evaluationTree = (typeof leftRootTree === 'number' ? rightRootTree : leftRootTree) as Node;
        let humanConstant = (typeof leftRootTree === 'number' ? leftRootTree : rightRootTree) as number;

        while (!evaluationTree.isHuman) {
            if (typeof evaluationTree.left === 'number') {
                humanConstant = evaluationTree.solveForRight!(humanConstant, evaluationTree.left as number);
                evaluationTree = evaluationTree.right as Node;
            } else {
                humanConstant = evaluationTree.solveForLeft!(humanConstant, evaluationTree.right as number);
                evaluationTree = evaluationTree.left as Node;
            }
        }

        return humanConstant;
    };

    console.log('PART 2:', evaluateHumanConstant());
})();

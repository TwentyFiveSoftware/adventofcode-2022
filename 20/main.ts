import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const decrypt = (times: number = 1, multiplier: number = 1): number => {
    const numbers: { n: number }[] = input
        .split('\n')
        .map(Number)
        .map(n => ({ n: n * multiplier }));

    let mixedNumbers = [...numbers];

    for (let i = 0; i < times; i++) {
        for (const number of numbers) {
            const oldIndex = mixedNumbers.indexOf(number);
            mixedNumbers.splice(oldIndex, 1);

            let newIndex = oldIndex + number.n;
            newIndex = ((newIndex % mixedNumbers.length) + mixedNumbers.length) % mixedNumbers.length;

            mixedNumbers.splice(newIndex, 0, number);
        }
    }

    const indexOfZero = mixedNumbers.findIndex(n => n.n === 0);
    return [1000, 2000, 3000].reduce(
        (sum, indexOffset) => sum + mixedNumbers[(indexOfZero + indexOffset) % mixedNumbers.length].n,
        0,
    );
};

console.log('PART 1:', decrypt());
console.log('PART 2:', decrypt(10, 811589153));

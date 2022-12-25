import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const snafuNumbers: string[][] = input.split('\n').map(line => line.split('').reverse());

const snafuToDecimal = (snafu: string[]): number => {
    const snafuDigits: { [key: string]: number } = { '0': 0, '1': 1, '2': 2, '-': -1, '=': -2 };
    return snafu.reduce((acc, n, i) => acc + snafuDigits[n] * Math.pow(5, i), 0);
};

const decimalToSnafu = (n: number): string[] => {
    const snafuDigits: { [digit: number]: string } = { 0: '0', 1: '1', 2: '2', '-1': '-', '-2': '=' };

    const snafu: number[] = [];

    const highestPower = Math.floor(Math.log(n) / Math.log(5));
    for (let power = highestPower; power >= 0; power--) {
        const fiveToPower = Math.pow(5, power);
        const times = Math.floor(n / fiveToPower);
        snafu[power] = times;
        n -= fiveToPower * times;
    }

    for (let i = 0; i < snafu.length; i++) {
        if (snafu[i] === 3) {
            snafu[i + 1] = (snafu[i + 1] ?? 0) + 1;
            snafu[i] = -2;
        } else if (snafu[i] === 4) {
            snafu[i + 1] = (snafu[i + 1] ?? 0) + 1;
            snafu[i] = -1;
        } else if(snafu[i] === 5) {
            snafu[i + 1] = (snafu[i + 1] ?? 0) + 1;
            snafu[i] = 0;
        }
    }

    return snafu.map(digit => snafuDigits[digit]).reverse();
};

const decimalSum: number = snafuNumbers.map(snafuToDecimal).reduce((sum, n) => sum + n, 0);
const result: string = decimalToSnafu(decimalSum).join('');
console.log('PART 1:', result);

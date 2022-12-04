import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const pairs = input.split('\n').map(line => line.split(',').map(range => range.split('-').map(Number)));

(() => {
    const fullyContainedPairs = pairs.filter(
        ([range1, range2]) =>
            (range1[0] <= range2[0] && range1[1] >= range2[1]) || (range1[0] >= range2[0] && range1[1] <= range2[1]),
    );

    console.log('PART 1:', fullyContainedPairs.length);
})();

(() => {
    const overlappingPairs = pairs.filter(
        ([range1, range2]) =>
            (range1[1] >= range2[0] && range1[0] <= range2[0]) || (range2[1] >= range1[0] && range2[0] <= range1[0]),
    );

    console.log('PART 2:', overlappingPairs.length);
})();

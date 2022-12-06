import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const findFirstUniqueCharacters = (amountOfCharacters: number) => {
    const rollingWindow = ['', ...input.slice(0, amountOfCharacters - 1)];
    for (let i = amountOfCharacters - 1; i < input.length; i++) {
        rollingWindow.shift();
        rollingWindow.push(input[i]);

        const isPacketMarker = [...new Set(rollingWindow)].length === amountOfCharacters;
        if (isPacketMarker) {
            return i + 1;
        }
    }

    return -1;
};

console.log('PART 1:', findFirstUniqueCharacters(4));
console.log('PART 2:', findFirstUniqueCharacters(14));

import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const elves: number[][] = input.split('\n\n').map(inventory => inventory.split('\n').map(Number));
const elvCalorieSums = elves.map(inventory => inventory.reduce((calories, snack) => calories + snack, 0));
elvCalorieSums.sort((a, b) => b - a);

// PART 1
const maxCalories = elvCalorieSums[0];
console.log('PART 1:', maxCalories);

// PART 2
const maxThreeCalorieSums = elvCalorieSums[0] + elvCalorieSums[1] + elvCalorieSums[2];
console.log('PART 2:', maxThreeCalorieSums);

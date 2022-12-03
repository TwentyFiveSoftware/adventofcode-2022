import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const mapToPriority = (item: string): number =>
    item >= 'a' && item <= 'z'
        ? item.charCodeAt(0) - 'a'.charCodeAt(0) + 1
        : item.charCodeAt(0) - 'A'.charCodeAt(0) + 27;

(() => {
    const backpacks = input.split('\n').map(backpack => {
        const half = backpack.length / 2;
        const compartments = [backpack.substring(0, half), backpack.substring(half)];
        return compartments.map(compartment => compartment.split(''));
    });

    const sharedItemPerBackpack: string[] = backpacks.map(
        compartments => compartments[0].find(item => compartments[1].find(otherItem => item === otherItem)) ?? '',
    );

    const prioritySum = sharedItemPerBackpack.reduce((sum, item) => sum + mapToPriority(item), 0);
    console.log('PART 1:', prioritySum);
})();

(() => {
    const backpacks: string[][] = input.split('\n').map(items => items.split(''));

    const groups: string[][][] = [];
    for (let i = 0; i < backpacks.length; i += 3) {
        groups.push(backpacks.slice(i, i + 3));
    }

    const groupBadges = groups.map(group => {
        let intersections = group[0];

        group.slice(1).forEach(items => {
            intersections = intersections.filter(item => items.includes(item));
        });

        return intersections[0];
    });

    const prioritySum = groupBadges.reduce((sum, badge) => sum + mapToPriority(badge), 0);
    console.log('PART 2:', prioritySum);
})();

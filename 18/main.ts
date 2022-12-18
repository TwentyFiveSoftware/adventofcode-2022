import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Cube {
    x: number;
    y: number;
    z: number;
}

const cubes: Cube[] = input.split('\n').map(line => {
    const [x, y, z] = line.split(',').map(Number);
    return { x, y, z };
});

const getAdjacentCubes = (cube: Cube): Cube[] => [
    { ...cube, x: cube.x + 1 },
    { ...cube, x: cube.x - 1 },
    { ...cube, y: cube.y + 1 },
    { ...cube, y: cube.y - 1 },
    { ...cube, z: cube.z + 1 },
    { ...cube, z: cube.z - 1 },
];

const calculateSurface = (): Set<string> => {
    const surface = new Set<string>();

    for (const cube of cubes) {
        const cubeString = `${cube.x},${cube.y},${cube.z}`;

        for (const adjacentCube of getAdjacentCubes(cube)) {
            const adjacentCubeString = `${adjacentCube.x},${adjacentCube.y},${adjacentCube.z}`;
            if (
                surface.has(`${cubeString}|${adjacentCubeString}`) ||
                surface.has(`${adjacentCubeString}|${cubeString}`)
            ) {
                surface.delete(`${cubeString}|${adjacentCubeString}`);
                surface.delete(`${adjacentCubeString}|${cubeString}`);
            } else {
                surface.add(`${cubeString}|${adjacentCubeString}`);
            }
        }
    }

    return surface;
};

const calculateOutsideSurface = (): Set<string> => {
    const surface = calculateSurface();

    const queue: Cube[] = [{ x: 0, y: 0, z: 0 }];
    const visited = new Set<string>('0,0,0');

    const outsideSurface = new Set<string>();

    const minCoordinate = Math.min(...cubes.map(cube => Math.min(cube.x, cube.y, cube.z))) - 1;
    const maxCoordinate = Math.max(...cubes.map(cube => Math.max(cube.x, cube.y, cube.z))) + 1;

    while (queue.length > 0) {
        const cube = queue.shift()!;
        const cubeString = `${cube.x},${cube.y},${cube.z}`;

        for (const adjacentCube of getAdjacentCubes(cube)) {
            const adjacentCubeString = `${adjacentCube.x},${adjacentCube.y},${adjacentCube.z}`;
            if (
                (surface.has(`${cubeString}|${adjacentCubeString}`) ||
                    surface.has(`${adjacentCubeString}|${cubeString}`)) &&
                !(
                    outsideSurface.has(`${cubeString}|${adjacentCubeString}`) ||
                    outsideSurface.has(`${adjacentCubeString}|${cubeString}`)
                )
            ) {
                outsideSurface.add(`${cubeString}|${adjacentCubeString}`);
                continue;
            }

            if (Math.min(cube.x, cube.y, cube.z) < minCoordinate || Math.max(cube.x, cube.y, cube.z) > maxCoordinate) {
                continue;
            }

            if (!visited.has(adjacentCubeString)) {
                visited.add(adjacentCubeString);
                queue.push(adjacentCube);
            }
        }
    }

    return outsideSurface;
};

console.log('PART 1:', calculateSurface().size);
console.log('PART 2:', calculateOutsideSurface().size);

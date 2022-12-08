import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

const trees: number[][] = input.split('\n').map(row => row.split('').map(Number));

(() => {
    const visibleTrees: boolean[][] = trees.map((row, rowIndex) =>
        row.map((treeHeight, columnIndex) => {
            if (
                rowIndex === 0 ||
                rowIndex === trees.length - 1 ||
                columnIndex === 0 ||
                columnIndex === row.length - 1
            ) {
                return true;
            }

            // left
            if (Math.max(...row.slice(0, columnIndex)) < treeHeight) {
                return true;
            }

            // right
            if (Math.max(...row.slice(columnIndex + 1)) < treeHeight) {
                return true;
            }

            // up
            if (Math.max(...trees.slice(0, rowIndex).map(row => row[columnIndex])) < treeHeight) {
                return true;
            }

            // down
            if (Math.max(...trees.slice(rowIndex + 1).map(row => row[columnIndex])) < treeHeight) {
                return true;
            }

            return false;
        }),
    );

    const visibleTreeCount = visibleTrees.flat().filter(isVisible => isVisible).length;
    console.log('PART 1:', visibleTreeCount);
})();

(() => {
    const scenicScores: number[][] = trees.map((row, rowIndex) =>
        row.map((treeHeight, columnIndex) => {
            const axis = [
                // left
                row.slice(0, columnIndex).reverse(),
                // right
                row.slice(columnIndex + 1),
                // up
                trees
                    .slice(0, rowIndex)
                    .map(row => row[columnIndex])
                    .reverse(),
                // down
                trees.slice(rowIndex + 1).map(row => row[columnIndex]),
            ];

            return axis.reduce((scenicScore, axis) => {
                let distance = axis.findIndex(height => height >= treeHeight);
                distance = distance === -1 ? axis.length : distance + 1;
                return scenicScore * distance;
            }, 1);
        }),
    );

    const highestScenicScore = Math.max(...scenicScores.flat());
    console.log('PART 2:', highestScenicScore);
})();

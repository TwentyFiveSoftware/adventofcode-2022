import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Turn {
    left: string;
    right: string;
}

const turns: Turn[] = input.split('\n').map<Turn>(line => {
    const [left, right] = line.split(' ');
    return { left, right };
});

const shapeScores: { [shape: string]: number } = { A: 1, B: 2, C: 3 };
const shapeWinAgainstMap: { [shape: string]: string } = { A: 'C', B: 'A', C: 'B' };

// PART 1
(() => {
    const shapeTranslation: { [shape: string]: string } = { X: 'A', Y: 'B', Z: 'C' };

    const isWin = (turn: Turn) => shapeWinAgainstMap[shapeTranslation[turn.right]] === turn.left;
    const isDraw = (turn: Turn) => shapeTranslation[turn.right] === turn.left;

    const totalScore: number = turns.reduce((score, turn) => {
        const shapeScore = shapeScores[shapeTranslation[turn.right]];
        const outcomeScore = isWin(turn) ? 6 : isDraw(turn) ? 3 : 0;
        return score + shapeScore + outcomeScore;
    }, 0);

    console.log('PART 1:', totalScore);
})();

(() => {
    const totalScore: number = turns.reduce((score, turn) => {
        switch (turn.right) {
            case 'X':
                return score + shapeScores[shapeWinAgainstMap[turn.left]];
            case 'Y':
                return score + shapeScores[turn.left] + 3;
            case 'Z':
                const shapeToChoose = ['A', 'B', 'C'].find(shape => shapeWinAgainstMap[shape] === turn.left) ?? '';
                return score + shapeScores[shapeToChoose] + 6;
            default:
                return score;
        }
    }, 0);

    console.log('PART 2:', totalScore);
})();

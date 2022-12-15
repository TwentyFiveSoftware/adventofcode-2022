import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Sensor {
    x: number;
    y: number;
    beaconX: number;
    beaconY: number;
    distanceToBeacon: number;
}

const calculateManhattanDistance = (x1: number, y1: number, x2: number, y2: number): number =>
    Math.abs(x1 - x2) + Math.abs(y1 - y2);

const sensors: Sensor[] = input.split('\n').map(line => {
    const [, sensorX, sensorY, beaconX, beaconY] =
        line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)?.map(Number) ?? [];

    return {
        x: sensorX,
        y: sensorY,
        beaconX: beaconX,
        beaconY: beaconY,
        distanceToBeacon: calculateManhattanDistance(sensorX, sensorY, beaconX, beaconY),
    };
});

const isPositionCovered = (x: number, y: number): boolean => {
    for (const sensor of sensors) {
        if (calculateManhattanDistance(x, y, sensor.x, sensor.y) <= sensor.distanceToBeacon) {
            return true;
        }
    }

    return false;
};

const isBeaconAtPosition = (x: number, y: number): boolean =>
    sensors.some(sensor => sensor.beaconX === x && sensor.beaconY === y);


const countPositionsInRowWithNoPossibleBeacon = (): number => {
    const rowY = 2000000;

    const minX = Math.min(...sensors.map(sensor => sensor.x - sensor.distanceToBeacon));
    const maxX = Math.max(...sensors.map(sensor => sensor.y + sensor.distanceToBeacon));

    let positionsCoveredInRow = 0;
    for (let x = minX; x <= maxX; x++) {
        if (isPositionCovered(x, rowY) && !isBeaconAtPosition(x, rowY)) {
            positionsCoveredInRow++;
        }
    }

    return positionsCoveredInRow;
};

const findUnknownBeaconPosition = (): { x: number; y: number } => {
    const maxCoordinate = 4000000;

    for (const sensor of sensors) {
        const minY = sensor.y - sensor.distanceToBeacon - 1;
        const maxY = sensor.y + sensor.distanceToBeacon + 1;

        for (let delta = 0; delta <= sensor.distanceToBeacon + 1; delta++) {
            const positions = [
                { x: sensor.x + delta, y: minY + delta },
                { x: sensor.x - delta, y: minY + delta },
                { x: sensor.x + delta, y: maxY - delta },
                { x: sensor.x - delta, y: maxY - delta },
            ];

            for (const position of positions) {
                if (
                    position.x >= 0 &&
                    position.y >= 0 &&
                    position.x <= maxCoordinate &&
                    position.y <= maxCoordinate &&
                    !isPositionCovered(position.x, position.y)
                ) {
                    return position;
                }
            }
        }
    }

    return { x: 0, y: 0 };
};

(() => {
    console.log('PART 1:', countPositionsInRowWithNoPossibleBeacon());
})();

(() => {
    const beaconPosition = findUnknownBeaconPosition();
    const tuningFrequency = beaconPosition.x * 4000000 + beaconPosition.y;
    console.log('PART 2:', tuningFrequency);
})();

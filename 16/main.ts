import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface Room {
    name: string;
    flowRate: number;
    adjacentRooms: string[];
}

const rooms: Room[] = input.split('\n').map(line => {
    const [, name, flowRate, adjacentRooms] =
        line.match(/^Valve ([A-Z]{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-Z, ]+)$/) ?? [];

    return {
        name,
        flowRate: Number(flowRate),
        adjacentRooms: adjacentRooms?.split(', '),
    };
});

const graph = new Map<string, Room>();
for (const room of rooms) {
    graph.set(room.name, room);
}

interface Move {
    room: string;
    distance: number;
}

const calculateDistancesToAllValves = (currentRoom: string): Move[] => {
    const queue: Move[] = [{ room: currentRoom, distance: 0 }];
    const roomsVisited = new Set<string>(currentRoom);

    const valves: Move[] = [];

    while (queue.length > 0) {
        const move = queue.shift()!;

        if (graph.get(move.room)!.flowRate > 0) {
            valves.push(move);
        }

        for (const adjacentRoom of graph.get(move.room)!.adjacentRooms) {
            if (!roomsVisited.has(adjacentRoom)) {
                roomsVisited.add(move.room);
                queue.push({ room: adjacentRoom, distance: move.distance + 1 });
            }
        }
    }

    return valves;
};

const distanceGraph = new Map<string, number>();
for (const room of rooms) {
    const moves = calculateDistancesToAllValves(room.name);
    for (const move of moves) {
        distanceGraph.set(`${room.name}|${move.room}`, move.distance);
    }
}

(() => {
    interface Path {
        closedValves: Set<string>;
        releasedPressure: number;
        currentRoom: string;
        timeLeft: number;
    }

    const calculateMaxPressureRelease = (): number => {
        const pathsWithTimeLeft: Path[] = [
            {
                currentRoom: 'AA',
                closedValves: new Set<string>(rooms.filter(room => room.flowRate > 0).map(room => room.name)),
                releasedPressure: 0,
                timeLeft: 30,
            },
        ];

        let maxPressureRelease = 0;

        while (pathsWithTimeLeft.length > 0) {
            const previousPath = pathsWithTimeLeft.shift()!;
            maxPressureRelease = Math.max(maxPressureRelease, previousPath.releasedPressure);

            for (const valve of previousPath.closedValves) {
                const path: Path = { ...previousPath, closedValves: new Set(previousPath.closedValves) };

                const distance = distanceGraph.get(`${previousPath.currentRoom}|${valve}`)!;
                path.timeLeft = path.timeLeft - distance - 1;

                if (path.timeLeft <= 0) {
                    maxPressureRelease = Math.max(maxPressureRelease, path.releasedPressure);
                    continue;
                }

                path.releasedPressure += path.timeLeft * graph.get(valve)!.flowRate;
                path.closedValves.delete(valve);
                path.currentRoom = valve;

                if (path.closedValves.size === 0) {
                    maxPressureRelease = Math.max(maxPressureRelease, path.releasedPressure);
                    continue;
                }

                const maxPressureLeftToRelease = [...path.closedValves]
                    .map(closedValve => graph.get(closedValve)!.flowRate * path.timeLeft)
                    .reduce((sum, v) => sum + v, 0);
                if (maxPressureLeftToRelease + path.releasedPressure < maxPressureRelease) {
                    continue;
                }

                pathsWithTimeLeft.unshift(path);
            }
        }

        return maxPressureRelease;
    };

    console.log('PART 1:', calculateMaxPressureRelease());
})();

(() => {
    interface Actor {
        room: string;
        timeLeft: number;
    }

    interface Path {
        closedValves: Set<string>;
        releasedPressure: number;
        actors: Actor[];
    }

    const calculateMaxPressureRelease = (): number => {
        const pathsWithTimeLeft: Path[] = [
            {
                closedValves: new Set<string>(rooms.filter(room => room.flowRate > 0).map(room => room.name)),
                releasedPressure: 0,
                actors: [
                    { room: 'AA', timeLeft: 26 },
                    { room: 'AA', timeLeft: 26 },
                ],
            },
        ];

        let maxPressureRelease = 0;

        while (pathsWithTimeLeft.length > 0) {
            const previousPath = pathsWithTimeLeft.shift()!;
            maxPressureRelease = Math.max(maxPressureRelease, previousPath.releasedPressure);

            for (const valve of previousPath.closedValves) {
                const path: Path = {
                    ...previousPath,
                    actors: [...previousPath.actors.map(actor => ({ ...actor }))].sort(
                        (a, b) => b.timeLeft - a.timeLeft,
                    ),
                    closedValves: new Set(previousPath.closedValves),
                };

                const distance = distanceGraph.get(`${path.actors[0].room}|${valve}`)!;
                path.actors[0].timeLeft -= distance + 1;

                if (path.actors[0].timeLeft < 0) {
                    maxPressureRelease = Math.max(maxPressureRelease, path.releasedPressure);
                    continue;
                }

                path.releasedPressure += path.actors[0].timeLeft * graph.get(valve)!.flowRate;
                path.closedValves.delete(valve);
                path.actors[0].room = valve;

                if (path.closedValves.size === 0 || !path.actors.some(actor => actor.timeLeft > 0)) {
                    maxPressureRelease = Math.max(maxPressureRelease, path.releasedPressure);
                    continue;
                }

                const maxPressureLeftToRelease = [...path.closedValves]
                    .map(
                        closedValve =>
                            graph.get(closedValve)!.flowRate * Math.max(...path.actors.map(actor => actor.timeLeft)),
                    )
                    .reduce((sum, v) => sum + v, 0);
                if (maxPressureLeftToRelease + path.releasedPressure < maxPressureRelease) {
                    continue;
                }

                pathsWithTimeLeft.unshift(path);
            }
        }

        return maxPressureRelease;
    };

    console.log('PART 2:', calculateMaxPressureRelease());
})();

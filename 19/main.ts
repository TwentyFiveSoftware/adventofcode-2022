import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

type MineralType = 'ore' | 'clay' | 'obsidian' | 'geode';

type MineralCosts = Map<MineralType, number>;

interface Blueprint {
    id: number;
    robotCosts: Map<MineralType, MineralCosts>;
}

const blueprints: Blueprint[] = input.split('\n').map(line => {
    const [
        ,
        blueprintID,
        oreRobotOreCost,
        clayRobotOreCost,
        obsidianRobotOreCost,
        obsidianRobotClayCost,
        geodeRobotOreCost,
        geodeRobotObsidianCost,
    ] =
        line
            .match(
                /Blueprint (\d+): Each ore robot costs (\d+) ore\. Each clay robot costs (\d+) ore\. Each obsidian robot costs (\d+) ore and (\d+) clay\. Each geode robot costs (\d+) ore and (\d+) obsidian\./,
            )
            ?.map(Number) ?? [];

    return {
        id: blueprintID,
        robotCosts: new Map<MineralType, MineralCosts>([
            ['ore', new Map<MineralType, number>([['ore', oreRobotOreCost]])],
            ['clay', new Map<MineralType, number>([['ore', clayRobotOreCost]])],
            [
                'obsidian',
                new Map<MineralType, number>([
                    ['ore', obsidianRobotOreCost],
                    ['clay', obsidianRobotClayCost],
                ]),
            ],
            [
                'geode',
                new Map<MineralType, number>([
                    ['ore', geodeRobotOreCost],
                    ['obsidian', geodeRobotObsidianCost],
                ]),
            ],
        ]),
    };
});

interface Simulation {
    minerals: Map<MineralType, number>;
    robots: Map<MineralType, number>;
    timeLeft: number;
}

const calculateTimeUntilRobotIsAffordable = (
    mineralType: MineralType,
    blueprint: Blueprint,
    simulation: Simulation,
): number => {
    const robotMineralCosts = blueprint.robotCosts.get(mineralType)!;

    for (const mineralType of robotMineralCosts.keys()) {
        // check if production per minute is > 0, otherwise the robot will never be affordable
        if (simulation.robots.get(mineralType)! === 0) {
            return Infinity;
        }
    }

    return (
        Math.ceil(
            Math.max(
                ...[...robotMineralCosts.keys()].map(mineralType => {
                    const productionRate = simulation.robots.get(mineralType)!;
                    const requiredAmountToProduce =
                        robotMineralCosts.get(mineralType)! - simulation.minerals.get(mineralType)!;
                    if (requiredAmountToProduce <= 0) {
                        return 0;
                    }

                    return requiredAmountToProduce / productionRate;
                }),
            ),
        ) + 1
    );
};

const simulateUntilRobotIsAffordable = (
    mineralType: MineralType,
    blueprint: Blueprint,
    simulation: Simulation,
): boolean => {
    const requiredMinutes = calculateTimeUntilRobotIsAffordable(mineralType, blueprint, simulation);
    if (requiredMinutes === Infinity || simulation.timeLeft < requiredMinutes) {
        return false;
    }

    simulation.timeLeft -= requiredMinutes;
    for (const [mineralType, productionRate] of simulation.robots) {
        simulation.minerals.set(mineralType, simulation.minerals.get(mineralType)! + productionRate * requiredMinutes);
    }

    const robotMineralCosts = blueprint.robotCosts.get(mineralType)!;

    for (const mineralType of robotMineralCosts.keys()) {
        simulation.minerals.set(
            mineralType,
            simulation.minerals.get(mineralType)! - robotMineralCosts.get(mineralType)!,
        );
    }
    simulation.robots.set(mineralType, simulation.robots.get(mineralType)! + 1);
    return true;
};

const cloneSimulation = (simulation: Simulation): Simulation => {
    return {
        timeLeft: simulation.timeLeft,
        robots: new Map<MineralType, number>(simulation.robots),
        minerals: new Map<MineralType, number>(simulation.minerals),
    };
};

const calculateMaxGeodesPerBlueprint = (
    blueprints: Blueprint[],
    time: number,
): { blueprint: Blueprint; maxGeodes: number }[] => {
    const maxGeodesPerBlueprint: { blueprint: Blueprint; maxGeodes: number }[] = [];

    for (const blueprint of blueprints) {
        const queue: Simulation[] = [
            {
                robots: new Map<MineralType, number>([
                    ['ore', 1],
                    ['clay', 0],
                    ['obsidian', 0],
                    ['geode', 0],
                ]),
                minerals: new Map<MineralType, number>([
                    ['ore', 0],
                    ['clay', 0],
                    ['obsidian', 0],
                    ['geode', 0],
                ]),
                timeLeft: time,
            },
        ];

        let maxGeodes = 0;

        const maximumRequiredRobotsPerMineral = new Map<MineralType, number>();
        for (const mineralType of ['ore', 'clay', 'obsidian', 'geode'] as MineralType[]) {
            maximumRequiredRobotsPerMineral.set(
                mineralType,
                Math.max(...[...blueprint.robotCosts.values()].map(cost => cost.get(mineralType)!)),
            );
        }

        while (queue.length > 0) {
            const simulation = queue.shift()!;

            maxGeodes = Math.max(
                maxGeodes,
                simulation.minerals.get('geode')! + simulation.robots.get('geode')! * simulation.timeLeft,
            );

            if (simulation.timeLeft <= 0) {
                continue;
            }

            let canBuildObsidianOrGeodeRobotImmediately = false;
            for (const mineralType of ['geode', 'obsidian'] as MineralType[]) {
                if (calculateTimeUntilRobotIsAffordable(mineralType, blueprint, simulation) === 1) {
                    const newSimulation = cloneSimulation(simulation);
                    if (simulateUntilRobotIsAffordable(mineralType, blueprint, newSimulation)) {
                        queue.unshift(newSimulation);
                    }

                    canBuildObsidianOrGeodeRobotImmediately = true;
                    break;
                }
            }
            if (canBuildObsidianOrGeodeRobotImmediately) {
                continue;
            }

            for (const mineralType of ['ore', 'clay', 'obsidian', 'geode'] as MineralType[]) {
                if (simulation.robots.get(mineralType)! > maximumRequiredRobotsPerMineral.get(mineralType)!) {
                    continue;
                }

                const newSimulation = cloneSimulation(simulation);
                if (simulateUntilRobotIsAffordable(mineralType, blueprint, newSimulation)) {
                    queue.unshift(newSimulation);
                }
            }
        }

        maxGeodesPerBlueprint.push({ blueprint, maxGeodes });
    }

    return maxGeodesPerBlueprint;
};

(() => {
    const blueprintQualityLevelSum = calculateMaxGeodesPerBlueprint(blueprints, 24).reduce(
        (sum, { maxGeodes, blueprint }) => sum + maxGeodes * blueprint.id,
        0,
    );

    console.log('PART 1:', blueprintQualityLevelSum);
})();

(() => {
    const blueprintQualityLevelSum = calculateMaxGeodesPerBlueprint(blueprints.slice(0, 3), 32).reduce(
        (product, { maxGeodes }) => product * maxGeodes,
        1,
    );

    console.log('PART 2:', blueprintQualityLevelSum);
})();

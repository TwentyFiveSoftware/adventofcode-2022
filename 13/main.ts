import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

type Packet = number | Packet[];
type Result = 'valid' | 'invalid' | 'continue';

const packets: Packet[][] = input.split('\n\n').map(packets => packets.split('\n').map(packet => JSON.parse(packet)));

const comparePackets = (packet1: Packet, packet2: Packet): Result => {
    if (!Array.isArray(packet1) && !Array.isArray(packet2)) {
        return packet1 < packet2 ? 'valid' : packet1 === packet2 ? 'continue' : 'invalid';
    }

    if (!Array.isArray(packet1)) {
        return comparePackets([packet1], packet2);
    }

    if (!Array.isArray(packet2)) {
        return comparePackets(packet1, [packet2]);
    }

    for (let i = 0; i < Math.min(packet1.length, packet2.length); i++) {
        const result = comparePackets(packet1[i], packet2[i]);
        if (result !== 'continue') {
            return result;
        }
    }

    return packet1.length === packet2.length ? 'continue' : packet1.length < packet2.length ? 'valid' : 'invalid';
};

(() => {
    const packetsInRightOrder = packets
        .map(([packetA, packetB], i) => (comparePackets(packetA, packetB) === 'valid' ? i + 1 : -1))
        .filter(index => index > -1);

    const sum = packetsInRightOrder.reduce((sum, e) => sum + e, 0);
    console.log('PART 1:', sum);
})();

(() => {
    const dividerPackets: Packet[] = [[[2]], [[6]]];

    const allPackets: Packet[] = [...packets.flat(), ...dividerPackets];
    allPackets.sort((a, b) => (comparePackets(a, b) === 'valid' ? -1 : 1));

    const dividerPacketIndexProduct = dividerPackets
        .map(packet => allPackets.indexOf(packet) + 1)
        .reduce((product, e) => product * e, 1);

    console.log('PART 2:', dividerPacketIndexProduct);
})();

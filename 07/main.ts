import * as fs from 'fs';

const input: string = fs.readFileSync(`${__dirname}/input.txt`).toString();

interface File {
    type: 'dir' | 'file';
    name: string;
    size?: number;
}

interface Command {
    cmd: string;
    arg: string;
    files: File[];
}

const commands: Command[] = input.split('$ ').map(command => {
    command = command.endsWith('\n') ? command.substring(0, command.length - 1) : command;

    const [input, ...output] = command.split('\n');
    const [cmd, arg] = input.split(' ');

    const files: File[] = output.map(file => {
        const [first, name] = file.split(' ');
        if (first === 'dir') {
            return { type: 'dir', name };
        } else {
            return { type: 'file', name, size: Number(first) };
        }
    });

    return { cmd, arg: arg ?? '', files };
});

const fileSystem: { [path: string]: File[] } = {};

let currentPath: string[] = [];
for (const command of commands) {
    switch (command.cmd) {
        case 'cd':
            switch (command.arg) {
                case '/':
                    currentPath = [];
                    break;
                case '..':
                    currentPath.pop();
                    break;
                default:
                    currentPath.push(command.arg);
                    break;
            }

            break;

        case 'ls':
            fileSystem[currentPath.join('/')] = command.files;
            break;
    }
}

const totalDirectorySize = (currentPath: string[] = []) => {
    let size = 0;

    for (const file of fileSystem[currentPath.join('/')]) {
        if (file.type === 'file') {
            size += file.size ?? 0;
        } else if (file.type === 'dir') {
            size += totalDirectorySize([...currentPath, file.name]);
        }
    }

    return size;
};

(() => {
    let sum = 0;
    for (const path of Object.keys(fileSystem)) {
        const directorySize = totalDirectorySize(path.split('/').filter(d => d !== ''));
        if (directorySize <= 100000) {
            sum += directorySize;
        }
    }

    console.log('PART 1:', sum);
})();

(() => {
    const freeSpaceRequired = 30000000 - (70000000 - totalDirectorySize([]));

    const directorySizes = Object.keys(fileSystem).map(path =>
        totalDirectorySize(path.split('/').filter(d => d !== '')),
    );
    directorySizes.sort((a, b) => a - b);

    const folderSize = directorySizes.find(size => size >= freeSpaceRequired);
    console.log('PART 2:', folderSize);
})();

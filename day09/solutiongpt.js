function defragHardDrive(hardDrive) {
    // Helper function to find the first block of free space that fits a given file
    function findFirstFreeSpace(freeSpaceMap, fileSize) {
        for (let start = 0; start < freeSpaceMap.length; start++) {
            const [freeStart, freeSize] = freeSpaceMap[start];
            if (fileSize <= freeSize) return start;
        }
        return -1; // No suitable space found
    }

    // Find all file chunks and free space chunks
    const freeSpaceMap = [];
    const fileChunks = [];
    let index = 0;

    while (index < hardDrive.length) {
        if (hardDrive[index] === '.') {
            // Detect free space
            let start = index;
            while (index < hardDrive.length && hardDrive[index] === '.') {
                index++;
            }
            freeSpaceMap.push([start, index - start]);
        } else {
            // Detect file chunk
            let fileId = hardDrive[index];
            let start = index;
            while (index < hardDrive.length && hardDrive[index] === fileId) {
                index++;
            }
            fileChunks.push({ id: fileId, start, size: index - start });
        }
    }

    // Move files to the first available free space that fits
    for (let i = fileChunks.length - 1; i >= 0; i--) {
        const file = fileChunks[i];
        const targetIndex = findFirstFreeSpace(freeSpaceMap, file.size);

        if (targetIndex !== -1) {
            const [freeStart, freeSize] = freeSpaceMap[targetIndex];

            // Move the file to the new location
            for (let j = 0; j < file.size; j++) {
                hardDrive[freeStart + j] = file.id;
                hardDrive[file.start + j] = '.'; // Mark the original location as free
            }

            // Update free space map
            freeSpaceMap[targetIndex] = [freeStart + file.size, freeSize - file.size];
        }
    }

    return hardDrive;
}

function customSum(arr) {
    return arr.reduce((sum, num, index) => {
        if (num === '.') {
            return sum; // Skip '.' elements
        }
        return sum + (parseInt(num, 10) * index); // Multiply number by its index
    }, 0);
}

//const input = [0, 0, '.', '.', '.', 1, 1, 1, '.', '.', '.', 2, '.', '.', 3, 3, 3, '.', 4, 4, '.', 5, 5, 5, 5, '.', 6, 6, 6, 6, '.', 7, 7, 7, '.', 8, 8, 8, 8, 9, 9];


const fs = require('fs');
const sample = '2333133121414131402'.split('').map(Number);
const diskmap = fs.readFileSync('input.txt', 'utf8').toString().trim().split('').map(Number);

let fulldisk = [];
let id = 0;
for (let i = 0; i < diskmap.length; i++) {
    if (i % 2 === 0) {
        //its a file
        for(let j = 0; j < diskmap[i]; j++) {
            fulldisk.push(id);
        }
        id++;
    } else {
        //its free space
        for(let j = 0; j < diskmap[i]; j++) {
            fulldisk.push('.');
        }
    }
}

const result = defragHardDrive(fulldisk);
console.log(customSum(result)); // Outputs: 00992111777.44.333....5555.6666.....8888..
function defragHardDrive(hardDrive) {
    // Parse the hard drive into free space chunks and file chunks
    const freeSpaces = [];
    const fileChunks = [];
    let index = 0;

    // Parse the hard drive array
    while (index < hardDrive.length) {
        if (hardDrive[index] === '.') {
            let start = index;
            while (index < hardDrive.length && hardDrive[index] === '.') {
                index++;
            }
            freeSpaces.push({ start, size: index - start });
        } else {
            let fileId = parseInt(hardDrive[index], 10);
            let start = index;
            while (index < hardDrive.length && parseInt(hardDrive[index], 10) === fileId) {
                index++;
            }
            fileChunks.push({ id: fileId, start, size: index - start });
        }
    }

    console.log("Initial Free Spaces:", JSON.stringify(freeSpaces, null, 2));
    console.log("Initial File Chunks:", JSON.stringify(fileChunks, null, 2));

    // Move files from the end to the first available free space
    for (let j = fileChunks.length - 1; j >= 0; j--) {
        const file = fileChunks[j];
        const fileSize = file.size;

        for (let k = 0; k < freeSpaces.length; k++) {
            const space = freeSpaces[k];

            if (space.size >= fileSize) {
                console.log(`Moving file ${file.id} from ${file.start} to ${space.start}`);

                // Move the file to the free space
                for (let m = 0; m < fileSize; m++) {
                    hardDrive[space.start + m] = file.id.toString();
                    hardDrive[file.start + m] = '.'; // Free the original space
                }

                // Update the free space map
                space.start += fileSize;
                space.size -= fileSize;

                // If space is fully used, remove it
                if (space.size === 0) {
                    freeSpaces.splice(k, 1);
                }

                console.log("Updated Free Spaces:", JSON.stringify(freeSpaces, null, 2));
                console.log("Updated Hard Drive:", hardDrive.join(''));
                break; // File has been moved, exit loop for this file
            }
        }
    }

    return hardDrive.join(',');
}

// Example test input
const input = [
    '0', '0', '.', '.', '.', '1', '1', '1', '.', '.', '.', '2', '.', '.', '3', '3', '3', '.', '4', '4', '.', 
    '5', '5', '5', '5', '.', '6', '6', '6', '6', '.', '7', '7', '7', '.', '8', '8', '8', '8', '9', '9', '.','10', '10'
];

// Run the function
const result = defragHardDrive(input);

console.log("Final Optimized Hard Drive:", result);

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

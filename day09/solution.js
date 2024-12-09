const fs = require('fs');
const sample = '2333133121414131402'.split('').map(Number);
const diskmap = fs.readFileSync('input.txt', 'utf8').toString().trim().split('').map(Number);

//track files
const files = {};
let freespace = [];
let optimizedhd = [];
let filestogetherhd = [];


//part1(diskmap);
//part2brute(sample);
part2new(sample);

function part1(diskmap) {

    let id = 0;
    for(let i = 0; i < diskmap.length; i++) {
        if(i % 2 === 0) {
            //its a file
            files[id++] = {"size":diskmap[i], "spaceremaining": diskmap[i], "processed": false};
        } else {
            //its free space
            freespace.push(diskmap[i]);
        }
    }

    //process the files, sizes, and free space. we want to move files from the end of the hard drive to the front of it, using up all free space along the way
    let blocksavailable = 0;
    let filepointer = 0;
    let freespacepointer = 0;
    let fileidtomove = id - 1;
    let processedfiles = [];

    while(processedfiles.length !== Object.keys(files).length) {
        if(blocksavailable === 0) {
            //we need to pick up the file from the front and put the whole thing onto the drive
            let file = files[filepointer];
            while(file.spaceremaining > 0) {
                optimizedhd.push(filepointer);
                file.spaceremaining--;
            }
            blocksavailable = freespace[freespacepointer++];
            processedfiles.push(filepointer++);
        } else {
            //we are working on a file from the back
            let file = files[fileidtomove];
            //we need to move as much of it as we can
            while (file.spaceremaining > 0 && blocksavailable > 0) {
                optimizedhd.push(fileidtomove);
                blocksavailable--;
                file.spaceremaining--;
            }
            if (file.spaceremaining === 0) {
                //we processed it and we need to move our fileidpointer
                processedfiles.push(fileidtomove--);
            }
        }
    }

    console.log(customSum(optimizedhd));
}

function part2new(diskmap) {
    let id = 0;
    let fulldisk = [];
    for (let i = 0; i < diskmap.length; i++) {
        if (i % 2 === 0) {
            //its a file
            files[id] = { "size": diskmap[i], "spaceremaining": diskmap[i], "processed": false };
            for(let i = 0; i < diskmap[i]; i++) {
                fulldisk.push(id);
            }
            id++;
        } else {
            //its free space
            freespace.push(diskmap[i]);
            for(let i = 0; i < diskmap[i]; i++) {
                fulldisk.push('.');
            }
        }
    }
    console.log(defragHardDrive(fulldisk));
}

function part2brute(diskmap) {
    let id = 0;
    let fulldisk = [];
    let optimizedhd = [];
    let processed = [];
    for (let i = 0; i < diskmap.length; i++) {
        if (i % 2 === 0) {
            //its a file
            files[id] = { "size": diskmap[i], "spaceremaining": diskmap[i], "processed": false };
            for(let i = 0; i < diskmap[i]; i++) {
                fulldisk.push(id);
            }
            id++;
        } else {
            //its free space
            freespace.push(diskmap[i]);
            for(let i = 0; i < diskmap[i]; i++) {
                fulldisk.push('.');
            }
        }
    }
    let locptr = 0;
    let lastfileptr = fulldisk.length - 1;

    //start by taking
    //we need to go ahead and process the 0 to not make it awkward later
    let file = files[0];
    for(let i = 0; i < file.size; i++) {
        optimizedhd.push(0);
        locptr++;
        file.spaceremaining--;
    }
    file.processed = true;
    processed.push(0);

    //now i need the loop
    while(processed.length !== Object.keys(files).length) {
        //get the element where i am, if its a file, drop it into the hd, if its space, find how much space and try to find a file that fits from the end
        let element = fulldisk[locptr];
        if(element === 0) {
            //find how much space we have available
            let tempptr = locptr;
            let space = 0;
            while (fulldisk[tempptr++] === 0) {
                space++;
            }
            //try to find a file to fit from the right until we find a file
            //we know where our last file is, see if it fits
            tempptr = lastfileptr;
            while(tempptr > locptr) {
                const fileid = fulldisk[tempptr];
                if(fileid !== 0) {
                    file = files[fileid];
                    if(file.size <= space) {
                        //it will fit
                        break;
                    } else {
                        tempptr--;
                    }
                }
            }

            //if there isn't one progress the locptr
        }
    }
}

function part2(diskmap) {

    let id = 0;
    for (let i = 0; i < diskmap.length; i++) {
        if (i % 2 === 0) {
            //its a file
            files[id++] = { "size": diskmap[i], "spaceremaining": diskmap[i], "processed": false };
        } else {
            //its free space
            freespace.push(diskmap[i]);
        }
    }

    let filepointer = 0;
    let blocksavailable = 0;
    let freespacepointer = 0;
    let fileidtomove = id - 1;
    let processedfiles = [];

    while(processedfiles.length !== Object.keys(files).length) {
        if(blocksavailable === 0) {
            //we need to pick up the file from the front and put the whole thing onto the drive
            let file = files[filepointer];
            if(!file.processed) {
                while(file.spaceremaining > 0) {
                    filestogetherhd.push(filepointer);
                    file.spaceremaining--;
                }
                file.processed = true;
                blocksavailable = freespace[freespacepointer++];
                processedfiles.push(filepointer++);
            } else {
                //we hit a file that has already been processed. i think we just move on?
                //find the first file that hasnt been processed?
                console.log("what to do here?");
            }
        } else {
            //we need to find the next file that will fit, if no files fit, we add empty blocks and move to the next file in the front
            let fileidtomoveworker = fileidtomove;
            while(fileidtomoveworker > 0) {
                let file = files[fileidtomoveworker];
                if(file.size <= blocksavailable && !file.processed) {
                    //move it and readd space to the appropriate place
                    while(file.spaceremaining > 0) {
                        filestogetherhd.push(fileidtomoveworker);
                        file.spaceremaining--;
                        freespace[fileidtomoveworker - 1] = freespace[fileidtomoveworker - 1] + 1;
                    }
                    file.processed = true;
                    blocksavailable = blocksavailable - file.size;
                    processedfiles.push(fileidtomoveworker);
                    fileidtomove--;
                    
                    break;
                } else {
                    //check the next file
                    fileidtomoveworker--;
                }
            }
            //if we made it to 0, we need to fill the space with 0s and continue
            if(fileidtomoveworker === 0) {
                while(blocksavailable > 0) {
                    filestogetherhd.push(0);
                    blocksavailable--;
                }
            }
        }
    }
    console.log(filestogetherhd.length);
}

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
    return arr.reduce((sum, num, index) => sum + (num * index), 0);
}
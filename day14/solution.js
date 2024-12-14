const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");
const width = 101;
const height = 103;

const nwbounds = {colmin: 0, colmax: Math.floor(width / 2), rowmin: 0, rowmax:Math.floor(height / 2)};
const nebounds = {colmin: Math.floor(width / 2), colmax: width, rowmin: 0, rowmax:Math.floor(height / 2)};
const swbounds = {colmin: 0, colmax: Math.floor(width / 2), rowmin: Math.floor(height / 2), rowmax: height};
const sebounds = {colmin: Math.floor(width / 2), colmax: width, rowmin: Math.floor(height / 2), rowmax: height};

//nw, ne, sw, se
let robotcount = [0,0,0,0];

const sample = {col: 2, row: 4, dcol: 2, drow: -3};

let robots = [];

input.forEach(robot => {
    robots.push(parseRobotInput(robot));

    //see where it is after 100 seconds, add the count to the quadrant
    const aftermoving = positionAfterNSeconds(robots[robots.length - 1], width, height, 100);
    const quad = quadrantForRobot(aftermoving);
    if(quad < 4) robotcount[quad]++;
}); 

//time to go crazy
let maxrobots = 100;
let afternseconds = 0;
for(let i = 0; i < 10000; i++) {
    //find the max number of robots down the middle in 100000 iterations
    //log every 10000
    if(i % 10000 === 0) console.log(`Working... ${i}`);
    const gridAtN = buildGrid(robots, width, height, i);
    const count = largestBlobSize(gridAtN);
    if (count > maxrobots) {
        maxrobots = count;
        afternseconds = i;
        console.log(`Found one - blob: ${maxrobots} after ${afternseconds} seconds...`);
    }
}

console.log(`Largest blob: ${maxrobots} after ${afternseconds} seconds...`);
printGrid(buildGrid(robots, width, height, afternseconds));

function parseRobotInput(input) {
    // Example input: "p=0,4 v=3,-3"
    
    // Split by space to separate position and velocity parts
    const parts = input.trim().split(' ');
  
    // Extract position: remove 'p='
    const positionPart = parts[0].replace('p=', '');
    const [colStr, rowStr] = positionPart.split(',');
    const col = parseInt(colStr, 10);
    const row = parseInt(rowStr, 10);
  
    // Extract velocity: remove 'v='
    const velocityPart = parts[1].replace('v=', '');
    const [dcolStr, drowStr] = velocityPart.split(',');
    const dcol = parseInt(dcolStr, 10);
    const drow = parseInt(drowStr, 10);
  
    return { col, row, dcol, drow };
}

function positionAfterNSeconds(robot, width, height, n) {
    // Compute new column
    let newCol = (robot.col + n * robot.dcol) % width;
    if (newCol < 0) newCol += width;
  
    // Compute new row
    let newRow = (robot.row + n * robot.drow) % height;
    if (newRow < 0) newRow += height;
  
    return { col: newCol, row: newRow };
}

function quadrantForRobot(robot) {
    if(robot.col >= nwbounds.colmin && robot.col < nwbounds.colmax && robot.row >= nwbounds.rowmin && robot.row < nwbounds.rowmax) return 0;
    if(robot.col > nebounds.colmin && robot.col < nebounds.colmax && robot.row >= nebounds.rowmin && robot.row < nebounds.rowmax) return 1;
    if(robot.col >= swbounds.colmin && robot.col < swbounds.colmax && robot.row > swbounds.rowmin && robot.row < swbounds.rowmax) return 2;
    if(robot.col > sebounds.colmin && robot.col < sebounds.colmax && robot.row > sebounds.rowmin && robot.row < sebounds.rowmax) return 3;
    return 4;
}

function buildGrid(robots, width, height, n) {
    // Initialize a grid of '.' (no robot)
    const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => ' '));

    // Place robots
    for (const robot of robots) {
        const { col, row } = positionAfterNSeconds(robot, width, height, n);
        grid[row][col] = '#';
    }

    return grid;
}

function largestBlobSize(grid) {
    const height = grid.length;
    const width = grid[0].length;

    const visited = Array.from({ length: height }, () => Array(width).fill(false));

    let maxBlobSize = 0;

    // Directions for up/down/left/right
    const directions = [
        { dc: 0, dr: 1 },   // down
        { dc: 0, dr: -1 },  // up
        { dc: 1, dr: 0 },   // right
        { dc: -1, dr: 0 }   // left
    ];

    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (grid[r][c] === '#' && !visited[r][c]) {
                const size = dfs(r, c);
                if (size > maxBlobSize) {
                    maxBlobSize = size;
                }
            }
        }
    }

    function dfs(row, col) {
        const stack = [{ row, col }];
        visited[row][col] = true;
        let count = 0;

        while (stack.length > 0) {
            const { row: cr, col: cc } = stack.pop();
            count++;
            for (const { dr, dc } of directions) {
                const nr = cr + dr;
                const nc = cc + dc;
                if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                    if (!visited[nr][nc] && grid[nr][nc] === '#') {
                        visited[nr][nc] = true;
                        stack.push({ row: nr, col: nc });
                    }
                }
            }
        }
        return count;
    }

    return maxBlobSize;
}

function printGrid(grid) {
    for (const row of grid) {
        console.log(row.join(''));
    }
}

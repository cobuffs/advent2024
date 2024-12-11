function findTrailScores(matrix) {
    let rows = matrix.length;
    let cols = matrix[0].length;

    let directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    // Identify all 0 positions (trailheads)
    let trailheads = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (matrix[r][c] === 0) {
                trailheads.push([r, c]);
            }
        }
    }

    function findReachableNines(startR, startC) {
        let visited = new Set();
        let reachableNines = new Set();
        let queue = [[startR, startC]];
        visited.add(`${startR},${startC}`);

        while (queue.length > 0) {
            let [curR, curC] = queue.shift();
            let curVal = matrix[curR][curC];

            // If current cell is 9, record it
            if (curVal === 9) {
                reachableNines.add(`${curR},${curC}`);
                // No need to continue from a 9 because there's no next value (10)
                continue;
            }

            // Move to next number (curVal+1)
            for (let [dr, dc] of directions) {
                let newR = curR + dr;
                let newC = curC + dc;
                if (newR < 0 || newR >= rows || newC < 0 || newC >= cols) continue;
                if (matrix[newR][newC] === curVal + 1) {
                    let key = `${newR},${newC}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push([newR, newC]);
                    }
                }
            }
        }

        return reachableNines.size;
    }

    let totalScore = 0;
    for (let [r, c] of trailheads) {
        totalScore += findReachableNines(r, c);
    }
    return totalScore;
}

function countDistinctTrails(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const directions = [
        [-1, 0], // up
        [1, 0],  // down
        [0, -1], // left
        [0, 1]   // right
    ];
    
    // Find all trailheads (cells with 0)
    let trailheads = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (matrix[r][c] === 0) {
                trailheads.push([r, c]);
            }
        }
    }
    
    // Memoization cache: key -> number of paths to 9 from that cell
    const memo = new Map();
    
    function key(r, c) {
        return r + ',' + c;
    }

    function countPaths(r, c) {
        // If out of bounds, no paths
        if (r < 0 || r >= rows || c < 0 || c >= cols) return 0;
        
        let val = matrix[r][c];
        
        // If we found a 9, that's one complete path
        if (val === 9) return 1;
        
        // If it's not 9, we need to move to val+1
        // If val is already 9 or greater (somehow), no more moves
        if (val < 0 || val > 9) return 0;

        // Check the memo cache
        let k = key(r, c);
        if (memo.has(k)) return memo.get(k);

        let nextVal = val + 1;
        let totalPaths = 0;
        for (let [dr, dc] of directions) {
            let nr = r + dr;
            let nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (matrix[nr][nc] === nextVal) {
                    totalPaths += countPaths(nr, nc);
                }
            }
        }

        memo.set(k, totalPaths);
        return totalPaths;
    }

    let totalRating = 0;
    // For each trailhead, compute how many distinct paths lead to a 9
    for (let [r, c] of trailheads) {
        totalRating += countPaths(r, c);
    }

    return totalRating;
}


// Example usage with the provided input:
let sample = [
    "89010123",
    "78121874",
    "87430965",
    "96549874",
    "45678903",
    "32019012",
    "01329801",
    "10456732"
];

const fs = require('fs');

const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");

let matrix = entries.map(row => row.split('').map(Number));
let result = countDistinctTrails(matrix);
console.log(result); // should print 36

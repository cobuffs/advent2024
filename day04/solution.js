const fs = require('fs');

const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");
const sample = [
    ['M', 'M', 'M', 'S', 'X', 'X', 'M', 'A', 'S', 'M'],
    ['M', 'S', 'A', 'M', 'X', 'M', 'S', 'M', 'S', 'A'],
    ['A', 'M', 'X', 'S', 'X', 'M', 'A', 'A', 'M', 'M'],
    ['M', 'S', 'A', 'M', 'A', 'S', 'M', 'S', 'M', 'X'],
    ['X', 'M', 'A', 'S', 'A', 'M', 'X', 'A', 'M', 'M'],
    ['X', 'X', 'A', 'M', 'M', 'X', 'X', 'A', 'M', 'A'],
    ['S', 'M', 'S', 'M', 'S', 'A', 'S', 'X', 'S', 'S'],
    ['S', 'A', 'X', 'A', 'M', 'A', 'S', 'A', 'A', 'A'],
    ['M', 'A', 'M', 'M', 'M', 'X', 'M', 'M', 'M', 'M'],
    ['M', 'X', 'M', 'X', 'A', 'X', 'M', 'A', 'S', 'X']
];

let grid = [];

//input is a grid of characters. need to find "XMAS" in any direction and keep a count of them
entries.forEach(entry => {
    grid.push(entry.split(''));
});

console.log(countWordInGrid(grid, "XMAS"));
console.log(countXPatterns(grid, "MAS"));
console.log(part2(grid));

function countWordInGrid(grid, word) {
    const rows = grid.length;
    const cols = grid[0].length;
    const directions = [
        [0, 1],   // Right
        [1, 0],   // Down
        [0, -1],  // Left
        [-1, 0],  // Up
        [1, 1],   // Down-right (diagonal)
        [1, -1],  // Down-left (diagonal)
        [-1, 1],  // Up-right (diagonal)
        [-1, -1]  // Up-left (diagonal)
    ];

    function isWordInDirection(x, y, dx, dy) {
        for (let k = 0; k < word.length; k++) {
            const nx = x + k * dx;
            const ny = y + k * dy;
            if (nx < 0 || nx >= rows || ny < 0 || ny >= cols || grid[nx][ny] !== word[k]) {
                return false;
            }
        }
        return true;
    }

    let count = 0;

    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            for (const [dx, dy] of directions) {
                if (isWordInDirection(x, y, dx, dy)) {
                    count++;
                }
            }
        }
    }

    return count;
}

function part2(grid) {
    const word = "MAS";
    const wordrev = "SAM";
    let count = 0;
    for(let row = 0; row < grid.length; row++) {
        for(let col = 0; col < grid[row].length; col++) {
            if(grid[row][col] == 'A' && (row-1) >= 0 && (col-1) >= 0 && (row+1) < grid.length && (col+1) < grid[row].length) {
                const diag1 = grid[row-1][col-1] + "A" + grid[row+1][col+1];
                const diag2 = grid[row-1][col+1] + "A" + grid[row+1][col-1];
                if ((diag1 === word || diag1 === wordrev) &&
                    (diag2 === word || diag2 === wordrev)) {
                    count++;
                }
            } 
        }
    }
    return count;
}

function countXPatterns(grid, word) {
    let n = grid.length;
    let m = grid[0].length;
    let L = word.length;

    let halfLength = Math.floor(L / 2);
    let count = 0;
    let wordReverse = word.split('').reverse().join('');
    
    for (let i = halfLength; i < n - halfLength; i++) {
        for (let j = halfLength; j < m - halfLength; j++) {
            let diag1 = '';
            let diag2 = '';
            for (let s = -halfLength; s <= halfLength; s++) {
                let x1 = i + s;
                let y1 = j + s;
                let x2 = i + s;
                let y2 = j - s;
                diag1 += grid[x1][y1];
                diag2 += grid[x2][y2];
            }
            // Check all combinations of word and its reverse
            if ((diag1 === word || diag1 === wordReverse) &&
                (diag2 === word || diag2 === wordReverse)) {
                count++;
            }
        }
    }
    return count;
}


const fs = require('fs');

const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");

let garden = [];
entries.forEach(entry => {
    garden.push(entry.split(''));
});

console.log(gardenValueWithSides(garden));

function gardenValueWithSides(garden) {
    const rows = garden.length;
    const cols = garden[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    let totalValue = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!visited[r][c]) {
                const { cells, plantType } = getPlotCells(garden, r, c, visited);
                const area = cells.length;
                const sides = countPlotSides(garden, cells);
                const value = area * sides;
                totalValue += value;
            }
        }
    }

    return totalValue;
}

function getPlotCells(garden, startR, startC, visited) {
    const rows = garden.length;
    const cols = garden[0].length;
    const plantType = garden[startR][startC];
    const stack = [[startR, startC]];
    visited[startR][startC] = true;
    const cells = [];

    while (stack.length > 0) {
        const [r, c] = stack.pop();
        cells.push([r, c]);

        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                !visited[nr][nc] && garden[nr][nc] === plantType) {
                visited[nr][nc] = true;
                stack.push([nr, nc]);
            }
        }
    }

    return { cells, plantType };
}

function countPlotSides(garden, cells) {
    const rows = garden.length;
    const cols = garden[0].length;

    // Create a boolean grid of "inside" for the plot
    const inside = Array.from({ length: rows }, () => Array(cols).fill(false));
    for (const [r, c] of cells) {
        inside[r][c] = true;
    }

    // We'll represent boundary edges on a grid of corners (r ranges 0..rows, c ranges 0..cols)
    // A corner is defined by coordinates (R, C) with R in [0..rows], C in [0..cols].
    // Horizontal edge between (R, C) and (R, C+1)
    // Vertical edge between (R, C) and (R+1, C)

    // Determine which edges are boundary edges
    // An edge is a boundary if it separates an inside cell from an outside cell or is at the garden boundary.
    const horizontalBoundary = Array.from({ length: rows + 1 }, () => Array(cols).fill(false));
    const verticalBoundary = Array.from({ length: rows }, () => Array(cols + 1).fill(false));

    // Check horizontal edges: These run between (r, c) and (r, c+1) at "row" r in corner space.
    // For a horizontal edge at corner row R and between C and C+1:
    // The cells immediately below that edge is (R, C) if R<rows and below is inside[R][C].
    // The cell above is (R-1, C) if R>0.
    for (let R = 0; R <= rows; R++) {
        for (let C = 0; C < cols; C++) {
            const cellAbove = (R > 0) ? inside[R - 1][C] : false;
            const cellBelow = (R < rows) ? inside[R][C] : false;
            if (cellAbove !== cellBelow) {
                // One side inside, one side outside
                horizontalBoundary[R][C] = true;
            }
        }
    }

    // Check vertical edges:
    for (let R = 0; R < rows; R++) {
        for (let C = 0; C <= cols; C++) {
            const cellLeft = (C > 0) ? inside[R][C - 1] : false;
            const cellRight = (C < cols) ? inside[R][C] : false;
            if (cellLeft !== cellRight) {
                verticalBoundary[R][C] = true;
            }
        }
    }

    // Now we have a grid of boundary edges. We must trace loops.
    // A loop is formed by following boundary edges corner-by-corner.

    // Directions: 0=Up,1=Right,2=Down,3=Left
    const DIRECTION_DELTAS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    // We'll find all loops. Each loop we find, we trace around and count direction changes.
    // We'll keep track of visited edges to avoid recounting loops.
    const visitedHorizontal = Array.from({ length: rows + 1 }, () => Array(cols).fill(false));
    const visitedVertical = Array.from({ length: rows }, () => Array(cols + 1).fill(false));

    function edgeVisited(R, C, dir) {
        // dir = 0 or 2 means vertical edge, dir = 1 or 3 means horizontal edge
        if (dir === 0) {
            // Up means we're moving from (R,C) to (R-1,C)
            // This corresponds to a vertical edge at R-1, C
            if (R - 1 >= 0) return visitedVertical[R - 1][C];
            return false;
        } else if (dir === 2) {
            // Down means vertical edge at R,C
            return visitedVertical[R][C];
        } else if (dir === 1) {
            // Right means horizontal edge at R,C
            return visitedHorizontal[R][C];
        } else {
            // Left means horizontal edge at R,C-1
            if (C - 1 >= 0) return visitedHorizontal[R][C - 1];
            return false;
        }
    }

    function markEdgeVisited(R, C, dir, val) {
        if (dir === 0) {
            if (R - 1 >= 0) visitedVertical[R - 1][C] = val;
        } else if (dir === 2) {
            visitedVertical[R][C] = val;
        } else if (dir === 1) {
            visitedHorizontal[R][C] = val;
        } else {
            if (C - 1 >= 0) visitedHorizontal[R][C - 1] = val;
        }
    }

    function isBoundaryEdge(R, C, dir) {
        // Check if moving in direction dir from (R,C) leads along a boundary edge
        // dir=0: up -> vertical edge above (R,C) is verticalBoundary[R-1][C] if R>0
        // dir=1: right -> horizontal edge (R,C) is horizontalBoundary[R][C]
        // dir=2: down -> vertical edge (R,C) is verticalBoundary[R][C]
        // dir=3: left -> horizontal edge (R,C-1) if C>0
        if (dir === 0) {
            if (R > 0) return verticalBoundary[R - 1][C];
            return false;
        } else if (dir === 2) {
            if (R < rows) return verticalBoundary[R][C];
            return false;
        } else if (dir === 1) {
            if (C < cols) return horizontalBoundary[R][C];
            return false;
        } else {
            if (C > 0) return horizontalBoundary[R][C - 1];
            return false;
        }
    }

    // Find an unvisited boundary edge to start a loop
    // We scan corners and see if any boundary edge exists and is not visited.
    function findStartEdge() {
        for (let R = 0; R <= rows; R++) {
            for (let C = 0; C <= cols; C++) {
                // Try all directions from this corner
                for (let dir = 0; dir < 4; dir++) {
                    if (isBoundaryEdge(R, C, dir) && !edgeVisited(R, C, dir)) {
                        return { R, C, dir };
                    }
                }
            }
        }
        return null;
    }

    // Turtle walk: always keep the inside of the plot on the left
    // This means if we are moving in some direction, we try to turn left first.
    // Turn order: left, straight, right, back
    function turnLeft(dir) { return (dir + 3) % 4; }
    function turnRight(dir) { return (dir + 1) % 4; }
    function turnBack(dir) { return (dir + 2) % 4; }

    // Given we want the inside on our left, the order of trying moves is:
    // left turn, straight, right turn, back
    // We'll do a standard contour following method.

    function traceLoop(Rstart, Cstart, Dstart) {
        let R = Rstart, C = Cstart, D = Dstart;
        // We'll record directions of moves to count direction changes.
        const moves = [];
        // Mark this edge visited
        markEdgeVisited(R, C, D, true);
        moves.push(D);
        // Move along this edge
        [R, C] = moveForward(R, C, D);

        // We'll continue until we return to start AND direction start
        while (!(R === Rstart && C === Cstart && D === Dstart)) {
            // Try turning left first
            let tried = [(curDir) => turnLeft(curDir), (curDir) => curDir, (curDir) => turnRight(curDir), (curDir) => turnBack(curDir)];
            let moved = false;
            for (const t of tried) {
                let Dnew = t(D);
                if (isBoundaryEdge(R, C, Dnew) && !edgeVisited(R, C, Dnew)) {
                    D = Dnew;
                    markEdgeVisited(R, C, D, true);
                    moves.push(D);
                    [R, C] = moveForward(R, C, D);
                    moved = true;
                    break;
                }
            }

            // If we fail to move, something’s off. Break to avoid infinite loop.
            if (!moved) break;
        }

        // Count sides: number of direction changes from horizontal to vertical or vice versa.
        // A "side" is a run of moves all in horizontal or all in vertical direction.
        let sides = 1;
        function isHorizontal(d) { return d === 1 || d === 3; } // right or left
        let prevHorizontal = isHorizontal(moves[0]);
        for (let i = 1; i < moves.length; i++) {
            let curHorizontal = isHorizontal(moves[i]);
            if (curHorizontal !== prevHorizontal) {
                sides++;
            }
            prevHorizontal = curHorizontal;
        }

        return sides;
    }

    function moveForward(R, C, dir) {
        const [dr, dc] = DIRECTION_DELTAS[dir];
        return [R + dr, C + dc];
    }

    let totalSides = 0;
    while (true) {
        const start = findStartEdge();
        if (!start) break; // no more loops
        totalSides += traceLoop(start.R, start.C, start.dir);
    }

    return totalSides;
}


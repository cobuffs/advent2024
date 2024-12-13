const fs = require('fs');

// Example input (could be loaded from a file or another source)
const sample = `
Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279
`.trim();

const input = fs.readFileSync('input.txt', 'utf8').toString().trim()

function parseClawMachines(input) {
    // Split by one or more blank lines to separate each machine block
    const blocks = input.split(/\n\s*\n/);

    // Regex patterns
    const buttonPattern = /Button [AB]: X([+-]\d+), Y([+-]\d+)/;
    const prizePattern = /Prize: X=(\d+), Y=(\d+)/;

    return blocks.map(block => {
        const lines = block.split('\n').map(line => line.trim());
        const modifier = 10000000000000;
        let Ax, Ay, Bx, By, Tx, Ty;

        for (const line of lines) {
            let match;
            if (line.startsWith('Button A:')) {
                match = buttonPattern.exec(line);
                if (match) {
                    Ax = parseInt(match[1], 10);
                    Ay = parseInt(match[2], 10);
                }
            } else if (line.startsWith('Button B:')) {
                match = buttonPattern.exec(line);
                if (match) {
                    Bx = parseInt(match[1], 10);
                    By = parseInt(match[2], 10);
                }
            } else if (line.startsWith('Prize:')) {
                match = prizePattern.exec(line);
                if (match) {
                    Tx = parseInt(match[1], 10) + modifier;
                    Ty = parseInt(match[2], 10) + modifier;
                }
            }
        }

        return { Ax, Ay, Bx, By, Tx, Ty };
    });
}

function findMinimumCost(Ax, Ay, Bx, By, Tx, Ty) {
    // Solve the system of equations:
    // Ax*a + Bx*b = Tx
    // Ay*a + By*b = Ty

    const D = Ax * By - Ay * Bx;

    // Attempt direct solution if D != 0
    if (D !== 0) {
        const a = (Tx * By - Ty * Bx) / D;
        const b = (Ax * Ty - Ay * Tx) / D;

        if (Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b >= 0) {
            // Direct solution found
            return 3 * a + b;
        }
    }

    // No direct solution: try brute force with limit on total presses
    let minCost = Infinity;
    const maxPresses = 10000000; // We can stop trying once we reach 100 total presses

    for (let a = 0; a <= maxPresses; a++) {
        for (let b = 0; b <= maxPresses - a; b++) {
            // Check if this combination hits the target
            if (Ax * a + Bx * b === Tx && Ay * a + By * b === Ty) {
                const cost = 3 * a + b;
                if (cost < minCost) {
                    minCost = cost;
                }
            }
        }
    }

    return (minCost === Infinity) ? 0 : minCost;
}
function extendedEuclidean(a, b) {
    // Returns {g, x, y} where g = gcd(a,b) and x,y satisfy a*x + b*y = g
    if (b === 0n) {
        return { g: a, x: 1n, y: 0n };
    }
    const { g, x: x1, y: y1 } = extendedEuclidean(b, a % b);
    return { g, x: y1, y: x1 - (a / b) * y1 };
}

function solveLarge(Ax, Ay, Bx, By, Tx, Ty) {
    // Convert all to BigInt for safety with large numbers
    Ax = BigInt(Ax);
    Ay = BigInt(Ay);
    Bx = BigInt(Bx);
    By = BigInt(By);
    Tx = BigInt(Tx);
    Ty = BigInt(Ty);

    const D = Ax * By - Ay * Bx;

    if (D !== 0n) {
        // Try direct solution
        if ((Tx * By - Ty * Bx) % D === 0n && (Ax * Ty - Ay * Tx) % D === 0n) {
            const a = (Tx * By - Ty * Bx) / D;
            const b = (Ax * Ty - Ay * Tx) / D;
            if (a >= 0n && b >= 0n) {
                return 3n * a + b; // minimal and only solution
            } else {
                return 0n; // no non-negative solution
            }
        } else {
            return 0n; // no integer solution
        }
    } else {
        // D = 0, equations are dependent.
        // Check if (Tx, Ty) lies on the same line.
        // If Ax and Ay are both zero, or Bx and By are zero, handle separately.
        // Otherwise, check ratio consistency:
        // We need (Tx,Ty) to be a scalar multiple of (Ax,Ay) (assuming Ax or Ay not zero)
        let c = null;

        // Find a c if possible
        if (Ax !== 0n) {
            if (Tx % Ax !== 0n) return 0n; // must divide
            c = Tx / Ax;
            if (Ay * c !== Ty) return 0n;
        } else {
            // Ax = 0n, then we must rely on Ay:
            if (Ay === 0n) {
                // Both Ax and Ay = 0 means no movement from A. Similar checks for B.
                // If we can't move at all, check if Tx=Ty=0.
                if (Tx === 0n && Ty === 0n) return 0n; // cost = 0 since already at prize
                return 0n; // no solution
            }
            if (Ty % Ay !== 0n) return 0n;
            c = Ty / Ay;
            if (Ax * c !== Tx) return 0n;
        }

        // Now we have one equation: Ax*a + Bx*b = Tx
        const { g, x, y } = extendedEuclidean(Ax, Bx);
        if (Tx % g !== 0n) return 0n; // no solution

        // Particular solution
        let a0 = x * (Tx / g);
        let b0 = y * (Tx / g);

        // General solution:
        // a = a0 + (Bx/g)*t
        // b = b0 - (Ax/g)*t

        const Bxg = Bx / g;
        const Axg = Ax / g;

        // We need a≥0 and b≥0:
        // a≥0 => t≥ -a0/(Bx/g) if Bxg > 0, else t ≤ -a0/(Bx/g)
        // b≥0 => t≤ b0/(Ax/g)  if Axg > 0, else t ≥ b0/(Ax/g)

        // Solve these inequalities for t. We'll have a range of feasible t values.
        // Then choose t that minimizes cost = 3a+b.

        // Let's handle the inequalities carefully.
        function ceilDiv(n, d) {
            // ceiling division for BigInt
            return (n >= 0n) ? ((n + d - 1n) / d) : (n / d);
        }

        function floorDiv(n, d) {
            // floor division for BigInt
            return (n >= 0n) ? (n / d) : ((n - d + 1n) / d);
        }

        let tMin = -Infinity, tMax = Infinity;

        // For a≥0:
        if (Bxg > 0n) {
            tMin = (tMin === -Infinity) ? ceilDiv(-a0, Bxg) : (tMin > ceilDiv(-a0, Bxg) ? tMin : ceilDiv(-a0, Bxg));
        } else if (Bxg < 0n) {
            tMax = (tMax === Infinity) ? floorDiv(-a0, Bxg) : (tMax < floorDiv(-a0, Bxg) ? tMax : floorDiv(-a0, Bxg));
        } else {
            // Bxg = 0 means Ax divides Bx fully. If Bxg=0, then a = a0 constant.
            if (a0 < 0n) return 0n; // no solution
        }

        // For b≥0:
        if (Axg > 0n) {
            tMax = (tMax === Infinity) ? floorDiv(b0, Axg) : (tMax < floorDiv(b0, Axg) ? tMax : floorDiv(b0, Axg));
        } else if (Axg < 0n) {
            tMin = (tMin === -Infinity) ? ceilDiv(b0, Axg) : (tMin > ceilDiv(b0, Axg) ? tMin : ceilDiv(b0, Axg));
        } else {
            // Axg=0, means b = b0 constant.
            if (b0 < 0n) return 0n; // no solution
        }

        // Now we have a range for t: tMin ≤ t ≤ tMax
        if (tMin === -Infinity) tMin = -999999999999999999n; // effectively no lower bound
        if (tMax === Infinity) tMax = 999999999999999999n;   // effectively no upper bound

        if (tMin > tMax) {
            return 0n; // no feasible t
        }

        // Cost function slope: S = (3*(Bx/g) - (Ax/g))
        const S = 3n * Bxg - Axg;

        let chosenT;
        if (S > 0n) {
            // Cost increases with t, pick the smallest feasible t
            chosenT = tMin;
        } else if (S < 0n) {
            // Cost decreases with t, pick the largest feasible t
            chosenT = tMax;
        } else {
            // Cost is same for all feasible t, pick tMin for simplicity
            chosenT = tMin;
        }

        // Compute final a,b
        const a = a0 + Bxg * chosenT;
        const b = b0 - Axg * chosenT;
        if (a < 0n || b < 0n) return 0n; // double check
        return 3n * a + b;
    }
}
// Main execution
const machines = parseClawMachines(input);
let totalCost = BigInt(0);

machines.forEach((machine) => {
    const { Ax, Ay, Bx, By, Tx, Ty } = machine;
    const cost = solveLarge(Ax, Ay, Bx, By, Tx, Ty);
    //console.log(cost);
    totalCost += cost;
});

console.log('Total:', totalCost);

const fs = require('fs');

// Read and parse the input
const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");

// Initialize counters
let safen = 0;
let part2n = 0;

// Process each entry
entries.forEach(entry => {
    const report = entry.split(" ").map(Number);

    if (checkForSafety(report).status) safen++;
    if (isSafeWithDampener(report)) part2n++;
});

console.log(safen);
console.log(part2n);

// Function to check if a report is safe
function checkForSafety(report) {
    let isIncreasing = report[0] < report[1];
    let isValid = true;

    for (let i = 0; i < report.length - 1; i++) {
        const diff = Math.abs(report[i + 1] - report[i]);

        if (diff < 1 || diff > 3 || (isIncreasing && report[i] > report[i + 1]) || (!isIncreasing && report[i] < report[i + 1])) {
            return { status: false, failingElement: i };
        }
    }

    return { status: isValid, failingElement: null };
}

// Function to check if a report is safe with the dampener
function isSafeWithDampener(report) {
    const state = checkForSafety(report);

    if (state.status) return true;

    // Attempt to fix by removing one element
    for (let i = 0; i < report.length; i++) {
        const modifiedReport = [...report.slice(0, i), ...report.slice(i + 1)];
        if (checkForSafety(modifiedReport).status) return true;
    }

    return false;
}
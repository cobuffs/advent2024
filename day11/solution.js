function simulateGame(initialStones, blinks) {
    // Start with initial stone counts
    let stoneCounts = new Map();
    
    // Initialize counts for initial stones
    for (let stone of initialStones) {
        stoneCounts.set(stone, (stoneCounts.get(stone) || 0) + 1);
    }

    // Simulate blinks
    for (let t = 0; t < blinks; t++) {
        // Create a new map to track next blink's stone counts
        const nextStoneCounts = new Map();

        // Process each unique stone type and its count
        for (let [stone, count] of stoneCounts) {
            if (stone === 0) {
                // Rule 1: Replace 0 with 1
                nextStoneCounts.set(1, (nextStoneCounts.get(1) || 0) + count);
            } else if (stone.toString().length % 2 === 0) {
                // Rule 2: Split stone into two parts
                const stoneStr = stone.toString();
                const mid = Math.floor(stoneStr.length / 2);
                const left = parseInt(stoneStr.slice(0, mid), 10);
                const right = parseInt(stoneStr.slice(mid), 10);
                
                // Add split stones with their respective counts
                nextStoneCounts.set(left, (nextStoneCounts.get(left) || 0) + count);
                nextStoneCounts.set(right, (nextStoneCounts.get(right) || 0) + count);
            } else {
                // Rule 3: Multiply the stone by 2024
                const newStone = stone * 2024;
                nextStoneCounts.set(newStone, (nextStoneCounts.get(newStone) || 0) + count);
            }
        }

        // Update stone counts for next iteration
        stoneCounts = nextStoneCounts;
    }

    // Sum total number of stones
    return Array.from(stoneCounts.values()).reduce((a, b) => a + b, 0);
}

// Test the function
const input = '773 79858 0 71 213357 2937 1 3998391'.split(' ').map(Number);
console.log(simulateGame(input, 75));
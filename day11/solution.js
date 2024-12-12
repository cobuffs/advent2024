//const input = '773 79858 0 71 213357 2937 1 3998391'.split(' ').map(Number);

// Game rules:
// The game progresses in a series of turns called "blinks". The number of blinks can be very high.
// If the stone is engraved with the number 0, it is replaced by a stone engraved with the number 1.
// If the stone is engraved with a number that has an even number of digits, it is replaced by two stones. The left half of the digits are engraved on the new left stone, and the right half of the digits are engraved on the new right stone. (The new numbers don't keep extra leading zeroes: 1000 would become stones 10 and 0.)
// If none of the other rules apply, the stone is replaced by a new stone; the old stone's number multiplied by 2024 is engraved on the new stone.
//


//console.log(simulateGame(input, 75));
const memo = new Map();

function simulateGame(initialStones, blinks) {
    // Memoization cache to store computed results

    function countStones(stone, remainingBlinks) {
        // Create a unique key for memoization
        const key = `${stone}-${remainingBlinks}`;
        
        // Check if we've already computed this state
        if (memo.has(key)) {
            return memo.get(key);
        }
        
        // Base case: no more blinks
        if (remainingBlinks === 0) {
            return 1;
        }
        
        // Apply game rules
        let stoneCount = 0;
        if (stone === 0) {
            // Rule 1: Replace 0 with 1
            stoneCount = countStones(1, remainingBlinks - 1);
        } else if (stone.toString().length % 2 === 0) {
            // Rule 2: Split stone into two parts
            const stoneStr = stone.toString();
            const mid = Math.floor(stoneStr.length / 2);
            const left = parseInt(stoneStr.slice(0, mid), 10);
            const right = parseInt(stoneStr.slice(mid), 10);
            
            // Recursively count stones for left and right parts
            stoneCount = countStones(left, remainingBlinks - 1) + 
                         countStones(right, remainingBlinks - 1);
        } else {
            // Rule 3: Multiply the stone by 2024
            const newStone = stone * 2024;
            stoneCount = countStones(newStone, remainingBlinks - 1);
        }
        
        // Memoize and return the result
        memo.set(key, stoneCount);
        return stoneCount;
    }
    
    // Sum the stone counts for all initial stones
    return initialStones.reduce((total, stone) => 
        total + countStones(stone, blinks), 0);
}

// Test the function
const input = '773 79858 0 71 213357 2937 1 3998391'.split(' ').map(Number);
const output = simulateGame(input, 75);
console.log(output);
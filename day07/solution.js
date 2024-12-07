const fs = require('fs');

// Read and parse the input
const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");
let equations = [];

entries.forEach(entry => {
    let [ans, numbers] = entry.split(": ");
    numbers = numbers.split(" ").map(Number);
    ans = parseInt(ans,10);
    equations.push([ans,numbers]);
});


let sum = 0;
let invalids = [];
for(let i = 0; i < equations.length; i++) {
    if(part2(equations[i])) sum += equations[i][0];
    else invalids.push(equations[i]);
}
console.log(sum);

function checkifvalid(equation){
    const target = equation[0];
    const numbers = equation[1];
    const n = numbers.length;

    //make a bitmask of all possible operator combos
    const totalCombinations = 1 << (n - 1); // 2^(n-1) combinations
    for (let mask = 0; mask < totalCombinations; mask++) {
        let result = numbers[0];
        
        for (let i = 0; i < n - 1; i++) {
            const operator = (mask & (1 << i)) ? '*' : '+';
            const nextVal = numbers[i + 1];
          
            if (operator === '+') {
                result = result + nextVal;
            } else {
                result = result * nextVal;
            }
            //we can go ahead and break if our result exceeds our target
            if(result > target) break;
        }
        
        if (result === target) {
            return true;
        }
    }
      
    return false;
}


function part2(equation) {
    const target = equation[0];
    const numbers = equation[1];
    const n = numbers.length;

    // If the array has only one element, just compare directly
    if (n === 1) {
        return numbers[0] === target;
    }

    // There are 3 operators for each of the (n-1) positions, so 3^(n-1) combos
    const totalCombinations = Math.pow(3, n - 1);

    // We'll map a numeric code to an operator:
    // 0 -> '+', 1 -> '*', 2 -> '||'
    for (let mask = 0; mask < totalCombinations; mask++) {
        let result = numbers[0];
        let temp = mask;

        // Evaluate expression for this combination
        for (let i = 0; i < n - 1; i++) {
            const opCode = temp % 3;
            temp = Math.floor(temp / 3);
            const nextVal = numbers[i + 1];

            if (opCode === 0) {
                // '+'
                result = result + nextVal;
            } else if (opCode === 1) {
                // '*'
                result = result * nextVal;
            } else {
                // '||'
                // Concatenate digits of result and nextVal
                result = Number(String(result) + String(nextVal));
            }
            if (result > target) break;
        }

        if (result === target) {
            return true;
        }
    }

    return false;
}
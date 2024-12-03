const fs = require('fs');

// Read and parse the input
const entry = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n")[0];

const parsed = extractValidMulExpressions(entry);
let processingStr = entry.replaceAll("don't()", "TURNMYCRAPOFF()");

let sum = 0;
let isOn = true;

parsed.forEach(mulExpression => {
  // Find the index of the current `mul` expression
  const instrIndex = processingStr.indexOf(mulExpression);

  // Get substring before the current `mul` expression
  const substring = processingStr.substring(0, instrIndex);

  // Find the closest "do" or "don't"
  const doIndex = substring.lastIndexOf("do()");
  const dontIndex = substring.lastIndexOf("TURNMYCRAPOFF()");

  // Determine if we need to switch on/off
  isOn = determineSwitchState(instrIndex, doIndex, dontIndex, isOn);

  if (isOn) {
    // Extract numbers from the `mul` expression and calculate the product
    const [x, y] = extractNumbersFromMul(mulExpression);
    sum += x * y;
  }

  // Remove the processed `mul` expression
  processingStr = processingStr.slice(0, instrIndex) + processingStr.slice(instrIndex + mulExpression.length);
});

console.log(sum);

/**
 * Extracts all valid `mul(x,y)` expressions from the input string.
 */
function extractValidMulExpressions(input) {
  const regex = /mul\(\d{1,3},\d{1,3}\)/g;
  return input.match(regex) || [];
}

/**
 * Extracts the two numbers from a `mul(x,y)` expression.
 */
function extractNumbersFromMul(expression) {
  const regex = /mul\((\d+),(\d+)\)/;
  const match = expression.match(regex);
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

/**
 * Determines whether the current state should be "on" or "off".
 */
function determineSwitchState(instrIndex, doIndex, dontIndex, currentState) {
  if (dontIndex < instrIndex && dontIndex > 0 && doIndex < instrIndex && doIndex > 0) {
    // If both "do" and "don't" exist, choose the one closer to the instruction
    return instrIndex - doIndex <= instrIndex - dontIndex;
  }
  if (dontIndex < instrIndex && dontIndex > 0) return false; // "Don't" is closer
  if (doIndex < instrIndex && doIndex > 0) return true; // "Do" is closer
  return currentState; // Maintain current state if no changes
}

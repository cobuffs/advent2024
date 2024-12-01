const fs = require('fs');

const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");
let list1 = [];
let list2 = [];
let diffs = [];

(entries).forEach(entry => {
    const parsedEntry = entry.split("   ");
    list1.push(parseInt(parsedEntry[0], 10));
    list2.push(parseInt(parsedEntry[1], 10));
});

//sort them
list1.sort((a, b) => a - b);
list2.sort((a, b) => a - b);

//get diffs with abs
for(let i = 0; i < list1.length; i++) {
    diffs.push(Math.abs(list1[i] - list2[i]));
}

//sum the diffs
const sum = diffs.reduce((acc, cur) => acc + cur, 0);
console.log(sum);

//part 2
let counts = [];
list1.forEach(entry => {
    counts.push(list2.filter(num => num === entry).length * entry);
});

const sumcounts = counts.reduce((acc, cur) => acc + cur, 0);
console.log(sumcounts);
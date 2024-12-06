const fs = require('fs');

// Read and parse the input
const entries = fs.readFileSync('input.txt', 'utf8').toString().trim().split("\r\n");
let rules = [];
let printqueues = [];

entries.forEach(entry => {
    if(entry.indexOf("|") !== -1){
        //its a rule
        const [before, after] = entry.split('|').map(Number);
        rules.push({before,after});
    } else if (entry.length > 0) {
        //its a queue
        printqueues.push(entry.split(',').map(Number));
    }
});

const results = checkPrintQueues(printqueues, rules);
//process the results
let sum = 0;
let correctedsum = 0;
for(let i = 0; i < results.length; i++) {
    if(results[i].isValid) {
        sum += results[i].queue[Math.floor(results[i].queue.length / 2)];
    } else {
        const corrected = correctQueue(results[i].queue, rules);
        //console.log(`Corrected queue ${results[i].queueNumber}: ${corrected}`);
        correctedsum += corrected[Math.floor(corrected.length / 2)];
    }
}

console.log(sum);
console.log(correctedsum);

function checkPrintQueues(queues, rules) {
    const results = [];
    queues.forEach((queue, index) => {
        const pagePositions = {};
        queue.forEach((page, idx) => {
          pagePositions[page] = idx;
        });
    
        let isValid = true;
        let violatedRule = null;
    
        for (const { before, after } of rules) {
            const beforePos = pagePositions[before];
            const afterPos = pagePositions[after];
    
            if (beforePos !== undefined && afterPos !== undefined) {
                if (beforePos >= afterPos) {
                    // Rule violated
                    isValid = false;
                    violatedRule = `${before}|${after}`;
                    break;
                }
            }
            // If one or both pages are missing, the rule is considered valid
        }
    
        results.push({
          queueNumber: index + 1,
          isValid,
          queue: queue,
          violatedRule,
        });
    });

    return results;
}

function correctQueue(queue, rules) {
    // Step 1: Extract relevant rules involving pages in the queue
    const pagesInQueue = new Set(queue);
    const relevantRules = rules.filter(({ before, after }) => pagesInQueue.has(before) && pagesInQueue.has(after));
  
    // Step 2: Build the graph (adjacency list) and in-degree map
    const graph = {};     // { page: [pages that come after] }
    const inDegree = {};  // { page: number of dependencies }
  
    // Initialize graph nodes and in-degree counts
    for (const page of queue) {
        graph[page] = [];
        inDegree[page] = 0;
    }
  
    // Build the graph based on relevant rules
    for (const { before, after } of relevantRules) {
        graph[before].push(after);
        inDegree[after]++;
    }
  
    // Step 3: Perform Topological Sort using Kahn's Algorithm
    const queueZeroInDegree = [];  // Pages with no remaining dependencies
  
    // Initialize queue with pages that have zero in-degree
    for (const page of queue) {
        if (inDegree[page] === 0) {
            queueZeroInDegree.push(page);
        }
    }
  
    const sortedPages = [];
    while (queueZeroInDegree.length > 0) {
        const node = queueZeroInDegree.shift();
        sortedPages.push(node);
  
        // Decrease the in-degree of neighboring pages
        for (const neighbor of graph[node]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queueZeroInDegree.push(neighbor);
            }
        }
    }
  
    // Check for cycles (if all pages are not sorted, there's a cycle)
    if (sortedPages.length < queue.length) {
        throw new Error('Cannot resolve dependencies due to a cycle in the rules.');
    }
  
    return sortedPages;
}
  
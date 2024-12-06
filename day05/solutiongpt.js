// Updated list of rules
const rulesInput = `
47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13
`;

const printQueuesInput = `
75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47
`;


// Step 1: Parse the rules
const parseRules = (rulesStr) => {
  return rulesStr.trim().split('\n').filter(line => line.trim() !== '').map(rule => {
    const [before, after] = rule.split('|').map(Number);
    if (!isNaN(before) && !isNaN(after)) {
      return { before, after };
    }
  }).filter(Boolean);
};

// Step 2: Check each print queue
const checkPrintQueues = (queuesStr, rules) => {
  const queues = queuesStr.trim().split('\n').map(queue => queue.split(',').map(Number));
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
      queue: queue.join(','),
      violatedRule,
    });
  });

  return results;
};

// Main Execution
const rules = parseRules(rulesInput);
const results = checkPrintQueues(printQueuesInput, rules);

// Output the results
results.forEach(result => {
  if (result.isValid) {
    console.log(`Print Queue ${result.queueNumber} (${result.queue}) is Valid`);
  } else {
    console.log(`Print Queue ${result.queueNumber} (${result.queue}) is Invalid (violated rule ${result.violatedRule})`);
  }
});

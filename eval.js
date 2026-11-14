
const fs = require('fs');

// --- 1. Load the inputs -----------------------------------------------------

// test-set.csv has a header row, then: query,correct_post_ids
// correct_post_ids may be a semicolon list, e.g. "1024;1025".

function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split('\n').slice(1);

  return lines.map(line => {
    const [query, ids] = line.split(',');

    return {
      query,
      correctIds: ids.split(';').map(Number)
    };
  });
}

const testSet = loadTestSet('test-set.csv');

// Load search results from JSON file.
const results = JSON.parse(
  fs.readFileSync('search-results.json', 'utf8')
);


// --- 2. Reciprocal Rank -----------------------------------------------------

// Return 1 / rank of the first correct ID.
// Return 0 if no correct ID is found.

function reciprocalRank(rankedIds, correctIds) {
  for (let i = 0; i < rankedIds.length; i++) {
    if (correctIds.includes(rankedIds[i])) {
      return 1 / (i + 1);
    }
  }

  return 0;
}


// Helper: the 1-based rank of the first correct ID,
// or null if it is a miss.

function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex(id =>
    correctIds.includes(id)
  );

  return index === -1 ? null : index + 1;
}


// --- 3. Run the evaluation loop --------------------------------------------

// Initialize totals and hit counters.

let keywordTotalRR = 0;
let semanticTotalRR = 0;

let keywordHits = 0;
let semanticHits = 0;

const totalQueries = testSet.length;

const comparisonRows = [];

for (const item of testSet) {

  const query = item.query;
  const correctIds = item.correctIds;

  // Get ranked results from both search systems.

  const keywordRanked = results[query].keyword;
  const semanticRanked = results[query].semantic;

  // Calculate Reciprocal Rank.

  const keywordRR = reciprocalRank(keywordRanked, correctIds);
  const semanticRR = reciprocalRank(semanticRanked, correctIds);

  // Find the rank of the first correct result.

  const keywordRank = rankOf(keywordRanked, correctIds);
  const semanticRank = rankOf(semanticRanked, correctIds);

  // Accumulate reciprocal ranks.

  keywordTotalRR += keywordRR;
  semanticTotalRR += semanticRR;

  // Count hits.

  if (keywordRR > 0) {
    keywordHits++;
  }

  if (semanticRR > 0) {
    semanticHits++;
  }

  // Store results for the comparison table.

  comparisonRows.push({
    query,
    keywordRank,
    semanticRank
  });
}


// Calculate Mean Reciprocal Rank (MRR).

const keywordMRR = keywordTotalRR / totalQueries;
const semanticMRR = semanticTotalRR / totalQueries;


// Calculate Recall@10.

const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;


// --- 4. Print Markdown comparison table ------------------------------------

// Print table header.

console.log('\n| Query | Keyword Rank | Semantic Rank |');
console.log('|---|---:|---:|');

// Print one row for every query.

for (const row of comparisonRows) {
  console.log(
    `| ${row.query} | ${row.keywordRank ?? 'miss'} | ${row.semanticRank ?? 'miss'} |`
  );
}

// Print final summary row.

console.log(
  `| **Summary** | **MRR: ${keywordMRR.toFixed(2)}, Recall@10: ${keywordRecall.toFixed(2)}** | **MRR: ${semanticMRR.toFixed(2)}, Recall@10: ${semanticRecall.toFixed(2)}** |`
);

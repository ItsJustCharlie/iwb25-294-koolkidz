const Fuse = require("fuse.js");
const products = require("./Scraping/search_results_toy_car.json");

// Fuse setup
const fuseOptions = {
  keys: ["title", "platform"],
  includeScore: true,
  threshold: 0.1
};

const fuse = new Fuse(products, fuseOptions);

// Search query
const query = "toy car";
const keywords = query.split(" ");

// Collect results per keyword
let resultMap = new Map();

keywords.forEach(keyword => {
  const keywordResults = fuse.search(keyword);
  keywordResults.forEach(r => {
    const key = r.item.title;
    if (!resultMap.has(key)) {
      resultMap.set(key, { 
        ...r, 
        matchCount: 1, 
        bestScore: r.score 
      });
    } else {
      let existing = resultMap.get(key);
      existing.matchCount += 1;
      existing.bestScore = Math.min(existing.bestScore, r.score); // keep best (lowest) score
      resultMap.set(key, existing);
    }
  });
});

const dedupedResults = Array.from(resultMap.values());

// Parse price helper
function parsePrice(priceStr) {
  const match = priceStr.replace(/[^\d.]/g, "");
  return parseFloat(match);
}

// Find max price for normalization
const maxPrice = Math.max(...dedupedResults.map(r => parsePrice(r.item.price)));

// Weighted scoring function
function calculateWeightedScore(result, maxPrice) {
  const { item, bestScore, matchCount } = result;
  const price = parsePrice(item.price);
  const normalizedPrice = price / maxPrice;
  const invertedPrice = 1 - normalizedPrice; // cheaper = better

  // Match score combines fuzziness + how many keywords matched
  const matchScore = (1 - bestScore) * (matchCount / keywords.length);

  // Weights (tune these if needed)
  const matchWeight = 0.6;
  const priceWeight = 0.4;

  return matchScore * matchWeight + invertedPrice * priceWeight;
}

// Add weighted scores and sort
const finalSortedResults = dedupedResults
  .map(result => ({
    ...result,
    weightedScore: calculateWeightedScore(result, maxPrice),
    priceValue: parsePrice(result.item.price)
  }))
  // Sort descending by weightedScore (best first)
  .sort((a, b) => b.weightedScore - a.weightedScore);

console.log(finalSortedResults.map(r => ({
  title: r.item.title,
  platform: r.item.platform,
  price: r.item.price,
  imageURL: r.item.imageURL,
  keywordsMatched: r.matchCount,
  score: r.weightedScore.toFixed(3)
})));

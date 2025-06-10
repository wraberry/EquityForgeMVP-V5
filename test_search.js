// Test script for search and filter functionality
console.log('Testing search and filter functionality...');

// Test data for search functionality
const testSearchTerms = [
  'alex',
  'taylor', 
  'engineer',
  'javascript',
  'react',
  'san francisco',
  'remote'
];

const testFilters = [
  { experienceLevel: 'senior' },
  { workStatus: 'open' },
  { equityInterest: 'true' },
  { availableFor: 'full-time' }
];

// Function to test search API endpoint
async function testSearch() {
  const baseUrl = 'http://localhost:5000/api/talent';
  
  try {
    // Test basic talent fetching
    console.log('1. Testing basic talent fetching...');
    const response = await fetch(baseUrl);
    const talents = await response.json();
    console.log(`   Found ${talents.length} talent profiles`);
    
    // Test search functionality
    console.log('2. Testing search functionality...');
    for (const term of testSearchTerms) {
      const searchResponse = await fetch(`${baseUrl}?search=${encodeURIComponent(term)}`);
      const searchResults = await searchResponse.json();
      console.log(`   Search "${term}": ${searchResults.length} results`);
    }
    
    // Test filter functionality
    console.log('3. Testing filter functionality...');
    for (const filter of testFilters) {
      const params = new URLSearchParams(filter);
      const filterResponse = await fetch(`${baseUrl}?${params.toString()}`);
      const filterResults = await filterResponse.json();
      const filterKey = Object.keys(filter)[0];
      console.log(`   Filter ${filterKey}="${filter[filterKey]}": ${filterResults.length} results`);
    }
    
    // Test combined search and filter
    console.log('4. Testing combined search and filter...');
    const combinedParams = new URLSearchParams({
      search: 'engineer',
      experienceLevel: 'senior'
    });
    const combinedResponse = await fetch(`${baseUrl}?${combinedParams.toString()}`);
    const combinedResults = await combinedResponse.json();
    console.log(`   Combined search + filter: ${combinedResults.length} results`);
    
    console.log('All tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  testSearch();
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.testSearch = testSearch;
}
// Simple detection logic - can be enhanced with geocoding API
export function detectSearchType(query: string): 'city' | 'state' | 'country' {
  const lowerQuery = query.toLowerCase().trim()
  
  // Common countries (can be expanded)
  const countries = [
    'india', 'usa', 'united states', 'united kingdom', 'uk', 'canada',
    'australia', 'france', 'germany', 'italy', 'spain', 'japan', 'china',
    'brazil', 'mexico', 'russia', 'south korea', 'thailand', 'singapore'
  ]
  
  // Common state indicators
  const stateIndicators = ['state', 'province', 'region']
  
  // Check if it's a country
  if (countries.some(country => lowerQuery.includes(country) || lowerQuery === country)) {
    return 'country'
  }
  
  // Check if it contains state indicators
  if (stateIndicators.some(indicator => lowerQuery.includes(indicator))) {
    return 'state'
  }
  
  // Check length - longer queries might be states
  if (lowerQuery.split(' ').length > 2) {
    return 'state'
  }
  
  // Default to city
  return 'city'
}

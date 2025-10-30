import { formatTextContent, createTextExcerpt, sanitizeText } from './formatText'

/**
 * Test function to verify text formatting is working correctly
 */
export function testTextFormatting() {
  console.log('Testing text formatting...')

  // Test case 1: Simple line breaks
  const test1 = "Człowiek wchodzi do baru.\nOuch!\nTo był żelazny bar."
  console.log('Test 1 - Line breaks:')
  console.log('Input:', test1)
  console.log('Output:', formatTextContent(sanitizeText(test1)))

  // Test case 2: Double line breaks
  const test2 = "Pierwsza linia\n\nDruga linia\n\nTrzecia linia"
  console.log('\nTest 2 - Double line breaks:')
  console.log('Input:', test2)
  console.log('Output:', formatTextContent(sanitizeText(test2)))

  // Test case 3: Excerpt creation
  const test3 = "To jest bardzo długi dowcip który powinien być przycięty do określonej długości aby nie zaśmiecać interfejsu użytkownika i zapewnić czytelność."
  console.log('\nTest 3 - Text excerpt:')
  console.log('Input:', test3)
  console.log('Excerpt (50 chars):', createTextExcerpt(test3, 50))
  console.log('Excerpt (100 chars):', createTextExcerpt(test3, 100))

  // Test case 4: Multiple spaces
  const test4 = "Tekst z  wieloma  spacjami  który powinien  zachować  formatowanie."
  console.log('\nTest 4 - Multiple spaces:')
  console.log('Input:', test4)
  console.log('Output:', formatTextContent(sanitizeText(test4)))

  console.log('\nText formatting tests completed!')
}

/**
 * You can run this in the browser console to test:
 * import('./src/lib/testFormatting.js').then(module => module.testTextFormatting())
 */
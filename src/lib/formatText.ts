/**
 * Format text content for display with proper line breaks and formatting
 */
export function formatTextContent(text: string): string {
  if (!text) return ''

  return text
    // Convert single newlines to <br>
    .replace(/\n/g, '<br />')
    // Convert double newlines to paragraph breaks for better spacing
    .replace(/\n\n/g, '<br /><br />')
    // Convert triple+ newlines to proper spacing
    .replace(/\n{3,}/g, '<br /><br />')
    // Preserve multiple spaces
    .replace(/  /g, ' &nbsp;')
}

/**
 * Create a text excerpt with proper formatting
 */
export function createTextExcerpt(text: string, maxLength: number = 160): string {
  if (!text) return ''

  // Remove HTML tags for excerpt
  const plainText = text.replace(/<[^>]*>/g, '')

  if (plainText.length <= maxLength) return plainText

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

/**
 * Sanitize text to prevent XSS while allowing basic formatting
 */
export function sanitizeText(text: string): string {
  if (!text) return ''

  return text
    // Remove potentially dangerous HTML tags
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/<form[^>]*>.*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<button[^>]*>.*?<\/button>/gi, '')
    // Remove JavaScript event handlers
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
}
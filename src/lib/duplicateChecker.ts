/**
 * Funkcje do wykrywania duplikatów w dowcipach
 * Wykorzystuje algorytm podobieństwa Levenshteina distance
 */

// Funkcja normalizująca tekst dla polskich dowcipów
export function normalizeText(text: string): string {
  return text
    // Usuń nadmiarowe białe znaki
    .replace(/\s+/g, ' ')
    // Usuń białe znaki na początku i końcu
    .trim()
    // Zamień na małe litery
    .toLowerCase()
    // Usuń podstawową interpunkcję (ale zachowaj sens dowcipu)
    .replace(/[.,!?;:'"]/g, '')
    // Usuń polskie znaki diakrytyczne dla lepszego porównania
    .replace(/[ą]/g, 'a')
    .replace(/[ć]/g, 'c')
    .replace(/[ę]/g, 'e')
    .replace(/[ł]/g, 'l')
    .replace(/[ń]/g, 'n')
    .replace(/[ó]/g, 'o')
    .replace(/[ś]/g, 's')
    .replace(/[ź]/g, 'z')
    .replace(/[ż]/g, 'z')
    .replace(/[Ą]/g, 'A')
    .replace(/[Ć]/g, 'C')
    .replace(/[Ę]/g, 'E')
    .replace(/[Ł]/g, 'L')
    .replace(/[Ń]/g, 'N')
    .replace(/[Ó]/g, 'O')
    .replace(/[Ś]/g, 'S')
    .replace(/[Ź]/g, 'Z')
    .replace(/[Ż]/g, 'Z');
}

// Obliczanie odległości Levenshteina
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Obliczanie podobieństwa w procentach
export function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);

  // Jeśli któryś tekst jest pusty po normalizacji
  if (!normalized1 || !normalized2) {
    return 0;
  }

  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) {
    return 100; // Oba teksty są puste - 100% podobieństwa
  }

  const distance = levenshteinDistance(normalized1, normalized2);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.max(0, Math.min(100, similarity)); // Ograniczenie do 0-100%
}

// Sprawdzanie czy tekst jest duplikatem
export function isDuplicate(
  newJokeContent: string,
  existingJokes: Array<{ content: string; id: number }>,
  threshold: number = 85
): { isDuplicate: boolean; similarJoke?: { content: string; id: number; similarity: number } } {
  const normalizedNewJoke = normalizeText(newJokeContent);

  for (const joke of existingJokes) {
    const similarity = calculateSimilarity(normalizedNewJoke, joke.content);

    if (similarity >= threshold) {
      return {
        isDuplicate: true,
        similarJoke: {
          content: joke.content,
          id: joke.id,
          similarity: Math.round(similarity * 10) / 10
        }
      };
    }
  }

  return { isDuplicate: false };
}

// Funkcja do sprawdzania czy fraza jest zbyt podobna do fragmentu innego dowcipu
export function containsSimilarFragment(
  newJokeContent: string,
  existingJokes: Array<{ content: string; id: number }>,
  fragmentLength: number = 20,
  threshold: number = 90
): { hasSimilarFragment: boolean; similarJoke?: { content: string; id: number; similarity: number } } {
  const normalizedNewJoke = normalizeText(newJokeContent);

  // Sprawdzaj fragmenty nowego dowcipu
  for (let i = 0; i <= normalizedNewJoke.length - fragmentLength; i++) {
    const fragment = normalizedNewJoke.substring(i, i + fragmentLength);

    for (const joke of existingJokes) {
      const normalizedJokeContent = normalizeText(joke.content);
      const similarity = calculateSimilarity(fragment, normalizedJokeContent);

      if (similarity >= threshold) {
        return {
          hasSimilarFragment: true,
          similarJoke: {
            content: joke.content,
            id: joke.id,
            similarity: Math.round(similarity * 10) / 10
          }
        };
      }
    }
  }

  return { hasSimilarFragment: false };
}

// Kompleksowe sprawdzanie duplikatów
export async function comprehensiveDuplicateCheck(
  newJokeContent: string,
  existingJokes: Array<{ content: string; id: number }>,
  options: {
    similarityThreshold?: number;
    checkFragments?: boolean;
    fragmentLength?: number;
    fragmentThreshold?: number;
  } = {}
): Promise<{
  isDuplicate: boolean;
  reason?: string;
  similarJoke?: { content: string; id: number; similarity: number };
}> {
  const {
    similarityThreshold = 85,
    checkFragments = true,
    fragmentLength = 20,
    fragmentThreshold = 90
  } = options;

  // Sprawdź dokładne duplikaty
  const duplicateCheck = isDuplicate(newJokeContent, existingJokes, similarityThreshold);
  if (duplicateCheck.isDuplicate) {
    return {
      isDuplicate: true,
      reason: 'Ten dowcip jest zbyt podobny do już istniejącego',
      similarJoke: duplicateCheck.similarJoke
    };
  }

  // Sprawdź podobne fragmenty
  if (checkFragments) {
    const fragmentCheck = containsSimilarFragment(
      newJokeContent,
      existingJokes,
      fragmentLength,
      fragmentThreshold
    );
    if (fragmentCheck.hasSimilarFragment) {
      return {
        isDuplicate: true,
        reason: 'Fragment tego dowcipu jest zbyt podobny do istniejącego dowcipu',
        similarJoke: fragmentCheck.similarJoke
      };
    }
  }

  return { isDuplicate: false };
}
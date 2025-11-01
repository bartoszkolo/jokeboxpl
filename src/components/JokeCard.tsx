import { JokeWithAuthor } from '@/types/database'
import { JokeCardSmart } from './JokeCardSmart'

/**
 * Main JokeCard component that uses the smart component by default.
 * This maintains backward compatibility while leveraging the new architecture.
 *
 * For advanced use cases, you can import JokeCardPresentational or JokeCardSmart directly.
 */
export interface JokeCardProps {
  joke: JokeWithAuthor
  onVoteChange?: (jokeId: number, voteData?: {upvotes?: number, downvotes?: number, score?: number, userVote?: any}) => void
}

export function JokeCard(props: JokeCardProps) {
  return <JokeCardSmart {...props} />
}

// Export the smart and presentational components for advanced usage
export { JokeCardSmart } from './JokeCardSmart'
export { JokeCardPresentational } from './JokeCardPresentational'
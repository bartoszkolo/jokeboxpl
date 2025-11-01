import { JokeWithAuthor } from '@/types/database'
import { JokeCardPresentational } from './JokeCardPresentational'
import { useJokeVote, useJokeFavorite, useJokeShare, useTextToSpeech } from '@/hooks/useJokeInteractions'
import { useAuth } from '@/contexts/AuthContext'

interface JokeCardSmartProps {
  joke: JokeWithAuthor
  onVoteChange?: (jokeId: number, voteData?: {upvotes?: number, downvotes?: number, score?: number, userVote?: any}) => void
}

/**
 * Smart component that manages all the state and logic for a JokeCard.
 * This component uses custom hooks to handle all interactions and passes
 * the processed data down to the presentational component.
 */
export function JokeCardSmart({ joke, onVoteChange }: JokeCardSmartProps) {
  const { user } = useAuth()

  // Custom hooks for different interactions
  const vote = useJokeVote(joke, onVoteChange)
  const favorite = useJokeFavorite(joke)
  const share = useJokeShare(joke)
  const textToSpeech = useTextToSpeech(joke.content)

  return (
    <JokeCardPresentational
      joke={joke}
      user={user}
      isVoting={vote.isVoting}
      isFavorite={favorite.isFavorite}
      showShare={share.showShare}
      showLoginPrompt={vote.showLoginPrompt || favorite.showLoginPrompt}
      scoreAnimation={vote.scoreAnimation}
      animatingScore={vote.animatingScore}
      animatingUpvotes={vote.animatingUpvotes}
      animatingDownvotes={vote.animatingDownvotes}
      shareUrl={share.shareUrl}
      shareTitle={share.shareTitle}
      isTextToSpeechSupported={textToSpeech.isSupported}
      isTextToSpeechSpeaking={textToSpeech.isSpeaking}
      onVote={vote.handleVote}
      onFavorite={favorite.handleFavorite}
      onShare={share.toggleShare}
      onTextToSpeech={textToSpeech.speak}
      onLoginPromptClose={() => {
        vote.setShowLoginPrompt(false)
        favorite.setShowLoginPrompt(false)
      }}
    />
  )
}
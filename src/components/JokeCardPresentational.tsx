import { JokeWithAuthor } from '@/types/database'
import { ThumbsUp, ThumbsDown, Heart, Share2, Volume2 } from 'lucide-react'
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share'
import { Link } from 'react-router-dom'
import { sanitizeText } from '@/lib/formatText'
import { LoginPrompt } from './LoginPrompt'

interface JokeCardPresentationalProps {
  joke: JokeWithAuthor
  user?: any
  isVoting?: boolean
  isFavorite?: boolean
  showShare?: boolean
  showLoginPrompt?: boolean
  scoreAnimation?: 'up' | 'down' | null
  animatingScore?: number
  animatingUpvotes?: number
  animatingDownvotes?: number
  shareUrl?: string
  shareTitle?: string
  isTextToSpeechSupported?: boolean
  isTextToSpeechSpeaking?: boolean
  onVote?: (type: 'upvote' | 'downvote') => void
  onFavorite?: () => void
  onShare?: () => void
  onTextToSpeech?: () => void
  onLoginPromptClose?: () => void
}

export function JokeCardPresentational({
  joke,
  user,
  isVoting = false,
  isFavorite = false,
  showShare = false,
  showLoginPrompt = false,
  scoreAnimation = null,
  animatingScore = joke.score,
  animatingUpvotes = joke.upvotes,
  animatingDownvotes = joke.downvotes,
  shareUrl = '',
  shareTitle = '',
  isTextToSpeechSupported = false,
  isTextToSpeechSpeaking = false,
  onVote,
  onFavorite,
  onShare,
  onTextToSpeech,
  onLoginPromptClose
}: JokeCardPresentationalProps) {
  const userVoteValue = joke.userVote?.vote_type

  return (
    <article className="joke-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {joke.categories && (
            <Link
              to={`/kategoria/${joke.categories.slug}`}
              className="text-sm text-secondary hover:text-secondary-dark font-ui font-medium transition-colors duration-200"
            >
              {joke.categories.name}
            </Link>
          )}
        </div>
        <button
          onClick={onTextToSpeech}
          disabled={!isTextToSpeechSupported}
          className="text-muted-foreground hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isTextToSpeechSupported ? "Przeczytaj na głos" : "Przeglądarka nie obsługuje funkcji mowy"}
        >
          <Volume2 size={18} className={isTextToSpeechSpeaking ? 'animate-pulse' : ''} />
        </button>
      </div>

      <Link to={`/dowcip/${joke.slug}`}>
        <div
          className="joke-content mb-6 hover:text-muted-foreground transition-colors duration-200 text-foreground leading-relaxed"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {sanitizeText(joke.content)}
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {/* Vote Buttons */}
          <button
            onClick={() => onVote?.('upvote')}
            disabled={isVoting}
            className={`vote-btn upvote transition-transform duration-200 ${
              userVoteValue === 1 ? 'active scale-105' : ''
            } ${!user ? 'opacity-60 hover:opacity-80' : 'hover:scale-105'} disabled:opacity-50`}
            title={!user ? "Zaloguj się, aby zagłosować" : "Głosuj na plus"}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className={`text-sm font-medium transition-all duration-300 ${
              scoreAnimation === 'up' ? 'animate-bounce text-secondary scale-125' : ''
            }`}>
              {animatingUpvotes}
            </span>
          </button>

          <button
            onClick={() => onVote?.('downvote')}
            disabled={isVoting}
            className={`vote-btn downvote transition-transform duration-200 ${
              userVoteValue === -1 ? 'active scale-105' : ''
            } ${!user ? 'opacity-60 hover:opacity-80' : 'hover:scale-105'} disabled:opacity-50`}
            title={!user ? "Zaloguj się, aby zagłosować" : "Głosuj na minus"}
          >
            <ThumbsDown className="h-4 w-4" />
            <span className={`text-sm font-medium transition-all duration-300 ${
              scoreAnimation === 'down' ? 'animate-bounce text-destructive scale-125' : ''
            }`}>
              {animatingDownvotes}
            </span>
          </button>

          {/* Score Display */}
          <div className="px-3 py-1 bg-muted rounded-lg transition-all duration-300">
            <span className={`text-sm font-bold transition-all duration-300 ${
              scoreAnimation === 'up' ? 'animate-bounce text-orange-500 scale-125' :
              scoreAnimation === 'down' ? 'animate-bounce text-red-500 scale-125' :
              animatingScore > 0 ? 'text-secondary' :
              animatingScore < 0 ? 'text-destructive' : 'text-foreground'
            }`}>
              {animatingScore > 0 ? '+' : ''}{animatingScore}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={onFavorite}
              id={`heart-${joke.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 transform ${
                isFavorite
                  ? 'text-destructive bg-destructive/10 hover:bg-destructive/20 scale-105'
                  : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:scale-105'
              }`}
              title="Dodaj do ulubionych"
            >
              <Heart
                size={16}
                className={`transition-all duration-300 ${isFavorite ? 'fill-current' : ''}`}
              />
              <span className="text-sm">Ulubione</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
              title="Udostępnij"
            >
              <Share2 size={16} />
              <span className="text-sm">Udostępnij</span>
            </button>

            {showShare && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg p-3 flex space-x-2 z-10">
                <FacebookShareButton url={shareUrl} quote={shareTitle}>
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white hover:bg-blue-700 transition">
                    f
                  </div>
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-white hover:bg-sky-600 transition">
                    X
                  </div>
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={shareTitle}>
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white hover:bg-green-600 transition">
                    W
                  </div>
                </WhatsappShareButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 meta-text pt-4 border-t border-border">
        <div className="flex items-center gap-1">
          <span>Dodane przez:</span>
          <span className="font-medium">{joke.profiles?.username || 'Anonim'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{new Date(joke.created_at).toLocaleDateString('pl-PL')}</span>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={onLoginPromptClose || (() => {})}
        message="Aby oddać głos na dowcip, musisz być zalogowany. Zaloguj się lub załóż konto, aby móc oceniać dowcipy!"
      />
    </article>
  )
}
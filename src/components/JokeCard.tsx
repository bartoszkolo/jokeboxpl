// @ts-nocheck
import { JokeWithAuthor } from '@/types/database'
import { ThumbsUp, ThumbsDown, Heart, Share2, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share'
import { Link } from 'react-router-dom'
import { formatTextContent, createTextExcerpt, sanitizeText } from '@/lib/formatText'

interface JokeCardProps {
  joke: JokeWithAuthor
  onVoteChange?: (jokeId: number, voteData?: {upvotes?: number, downvotes?: number, score?: number, userVote?: any}) => void
}

export function JokeCard({ joke, onVoteChange }: JokeCardProps) {
  const { user } = useAuth()
  const [isVoting, setIsVoting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(joke.isFavorite || false)
  const [showShare, setShowShare] = useState(false)
  const [scoreAnimation, setScoreAnimation] = useState<'up' | 'down' | null>(null)
  const [animatingScore, setAnimatingScore] = useState(joke.score)
  const [animatingUpvotes, setAnimatingUpvotes] = useState(joke.upvotes)
  const [animatingDownvotes, setAnimatingDownvotes] = useState(joke.downvotes)
  
  const shareUrl = `${window.location.origin}/dowcip/${joke.slug}`
  const shareTitle = createTextExcerpt(joke.content, 100)

  const handleVote = async (voteValue: number) => {
    if (!user || isVoting) return

    setIsVoting(true)
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('joke_id', joke.id)
        .single()

      let newScore = joke.score
      let newUpvotes = joke.upvotes
      let newDownvotes = joke.downvotes

      if (existingVote) {
        if (existingVote.vote_value === voteValue) {
          // Remove vote
          newScore = joke.score - voteValue
          if (voteValue === 1) {
            newUpvotes = joke.upvotes - 1
          } else {
            newDownvotes = joke.downvotes - 1
          }
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Update vote (switch from up to down or vice versa)
          newScore = joke.score + (voteValue * 2) // Remove old vote and add new one
          if (voteValue === 1) {
            newUpvotes = joke.upvotes + 1
            newDownvotes = joke.downvotes - 1
          } else {
            newUpvotes = joke.upvotes - 1
            newDownvotes = joke.downvotes + 1
          }
          await supabase
            .from('votes')
            .update({ vote_value: voteValue })
            .eq('id', existingVote.id)
        }
      } else {
        // Add new vote
        newScore = joke.score + voteValue
        if (voteValue === 1) {
          newUpvotes = joke.upvotes + 1
        } else {
          newDownvotes = joke.downvotes + 1
        }
        await supabase
          .from('votes')
          .insert({ user_id: user.id, joke_id: joke.id, vote_value: voteValue })
      }

      // Trigger animations
      setScoreAnimation(voteValue === 1 ? 'up' : 'down')
      setAnimatingScore(newScore)
      setAnimatingUpvotes(newUpvotes)
      setAnimatingDownvotes(newDownvotes)

      // Calculate new user vote
      let newUserVote = null
      if (existingVote) {
        if (existingVote.vote_value !== voteValue) {
          // User changed their vote
          newUserVote = { vote_value: voteValue }
        } else {
          // User removed their vote
          newUserVote = null
        }
      } else {
        // New vote
        newUserVote = { vote_value: voteValue }
      }

      // Reset animation after it completes
      setTimeout(() => {
        setScoreAnimation(null)
      }, 600)

      // Return the updated vote data to parent
      onVoteChange?.(joke.id, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newScore,
        userVote: newUserVote
      })
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) return

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('joke_id', joke.id)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, joke_id: joke.id })
      }

      // Toggle state for animation
      setIsFavorite(!isFavorite)

      // Add a small animation class to the heart
      const heartElement = document.getElementById(`heart-${joke.id}`)
      if (heartElement) {
        heartElement.classList.add('animate-pulse', 'scale-125')
        setTimeout(() => {
          heartElement.classList.remove('animate-pulse', 'scale-125')
        }, 400)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(joke.content)
      utterance.lang = 'pl-PL'
      window.speechSynthesis.speak(utterance)
    }
  }

  const userVoteValue = joke.userVote?.vote_value

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
          onClick={handleSpeak}
          className="text-muted-foreground hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-primary/5"
          title="Przeczytaj na głos"
        >
          <Volume2 size={18} />
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
            onClick={() => handleVote(1)}
            disabled={!user || isVoting}
            className={`vote-btn upvote ${
              userVoteValue === 1 ? 'active' : ''
            } disabled:opacity-50`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className={`text-sm font-medium transition-all duration-300 ${
              scoreAnimation === 'up' ? 'animate-pulse text-secondary scale-125' : ''
            }`}>
              {animatingUpvotes}
            </span>
          </button>

          <button
            onClick={() => handleVote(-1)}
            disabled={!user || isVoting}
            className={`vote-btn downvote ${
              userVoteValue === -1 ? 'active' : ''
            } disabled:opacity-50`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span className={`text-sm font-medium transition-all duration-300 ${
              scoreAnimation === 'down' ? 'animate-pulse text-destructive scale-125' : ''
            }`}>
              {animatingDownvotes}
            </span>
          </button>

          {/* Score Display */}
          <div className="px-3 py-1 bg-muted rounded-lg transition-all duration-300">
            <span className={`text-sm font-bold transition-all duration-300 ${
              scoreAnimation === 'up' ? 'animate-pulse text-secondary scale-125' :
              scoreAnimation === 'down' ? 'animate-pulse text-destructive scale-125' :
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
              onClick={handleFavorite}
              id={`heart-${joke.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isFavorite
                  ? 'text-destructive bg-destructive/10 hover:bg-destructive/20'
                  : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
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
              onClick={() => setShowShare(!showShare)}
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
    </article>
  )
}

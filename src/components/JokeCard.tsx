// @ts-nocheck
import { JokeWithAuthor } from '@/types/database'
import { ThumbsUp, ThumbsDown, Heart, Share2, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share'
import { Link } from 'react-router-dom'

interface JokeCardProps {
  joke: JokeWithAuthor
  onVoteChange?: () => void
}

export function JokeCard({ joke, onVoteChange }: JokeCardProps) {
  const { user } = useAuth()
  const [isVoting, setIsVoting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(joke.isFavorite || false)
  const [showShare, setShowShare] = useState(false)
  
  const shareUrl = `${window.location.origin}/dowcip/${joke.slug}`
  const shareTitle = joke.content.substring(0, 100)

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

      if (existingVote) {
        if (existingVote.vote_value === voteValue) {
          // Remove vote
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Update vote
          await supabase
            .from('votes')
            .update({ vote_value: voteValue })
            .eq('id', existingVote.id)
        }
      } else {
        // Add new vote
        await supabase
          .from('votes')
          .insert({ user_id: user.id, joke_id: joke.id, vote_value: voteValue })
      }

      onVoteChange?.()
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
        setIsFavorite(false)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, joke_id: joke.id })
        setIsFavorite(true)
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {joke.categories && (
            <Link
              to={`/kategoria/${joke.categories.slug}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              {joke.categories.name}
            </Link>
          )}
        </div>
        <button
          onClick={handleSpeak}
          className="text-gray-500 hover:text-blue-600 transition"
          title="Przeczytaj na głos"
        >
          <Volume2 size={20} />
        </button>
      </div>

      <Link to={`/dowcip/${joke.slug}`}>
        <p className="text-gray-800 text-lg mb-4 whitespace-pre-wrap hover:text-gray-600 transition">
          {joke.content}
        </p>
      </Link>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleVote(1)}
            disabled={!user || isVoting}
            className={`flex items-center space-x-1 ${
              userVoteValue === 1
                ? 'text-green-600'
                : 'text-gray-500 hover:text-green-600'
            } transition disabled:opacity-50`}
          >
            <ThumbsUp size={20} />
            <span className="font-medium">{joke.upvotes}</span>
          </button>

          <button
            onClick={() => handleVote(-1)}
            disabled={!user || isVoting}
            className={`flex items-center space-x-1 ${
              userVoteValue === -1
                ? 'text-red-600'
                : 'text-gray-500 hover:text-red-600'
            } transition disabled:opacity-50`}
          >
            <ThumbsDown size={20} />
            <span className="font-medium">{joke.downvotes}</span>
          </button>

          <div className="flex items-center space-x-1 text-gray-600 font-semibold">
            <span>Score:</span>
            <span className={joke.score > 0 ? 'text-green-600' : joke.score < 0 ? 'text-red-600' : ''}>
              {joke.score}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={handleFavorite}
              className={`${
                isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              } transition`}
              title="Dodaj do ulubionych"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowShare(!showShare)}
              className="text-gray-500 hover:text-blue-600 transition"
              title="Udostępnij"
            >
              <Share2 size={20} />
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

      <div className="mt-3 text-sm text-gray-500">
        <span>Dodane przez: {joke.profiles?.username || 'Anonim'}</span>
        <span className="mx-2">•</span>
        <span>{new Date(joke.created_at).toLocaleDateString('pl-PL')}</span>
      </div>
    </div>
  )
}

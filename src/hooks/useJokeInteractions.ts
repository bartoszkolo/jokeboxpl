import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useVoteMutation, useFavoriteMutation } from './useJokes'
import { JokeWithAuthor } from '@/types/database'

// Hook for handling joke voting with animations
export function useJokeVote(joke: JokeWithAuthor, onVoteChange?: (jokeId: number, voteData?: any) => void) {
  const { user } = useAuth()
  const voteMutation = useVoteMutation()

  const [isVoting, setIsVoting] = useState(false)
  const [scoreAnimation, setScoreAnimation] = useState<'up' | 'down' | null>(null)
  const [animatingScore, setAnimatingScore] = useState(joke.score)
  const [animatingUpvotes, setAnimatingUpvotes] = useState(joke.upvotes)
  const [animatingDownvotes, setAnimatingDownvotes] = useState(joke.downvotes)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const handleVote = useCallback(async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    if (isVoting) return

    setIsVoting(true)

    try {
      const voteValue = voteType === 'upvote' ? 1 : -1
      const currentVote = joke.userVote?.vote_type

      // Calculate optimistic updates
      let newScore = joke.score
      let newUpvotes = joke.upvotes
      let newDownvotes = joke.downvotes
      let newUserVote = { vote_type: voteType }

      if (currentVote === voteType) {
        // Removing vote
        if (voteType === 'upvote') {
          newScore = Math.max(0, newScore - 1)
          newUpvotes = Math.max(0, newUpvotes - 1)
        } else {
          newScore = Math.max(0, newScore + 1) // Score goes up when removing downvote
          newDownvotes = Math.max(0, newDownvotes - 1)
        }
        newUserVote = null
      } else if (currentVote) {
        // Changing vote type
        if (voteType === 'upvote') {
          newScore = newScore + 2 // From -1 to +1
          newUpvotes = newUpvotes + 1
          newDownvotes = Math.max(0, newDownvotes - 1)
        } else {
          newScore = newScore - 2 // From +1 to -1
          newUpvotes = Math.max(0, newUpvotes - 1)
          newDownvotes = newDownvotes + 1
        }
      } else {
        // Adding new vote
        if (voteType === 'upvote') {
          newScore = newScore + 1
          newUpvotes = newUpvotes + 1
        } else {
          newScore = newScore - 1
          newDownvotes = newDownvotes + 1
        }
      }

      // Animate the changes
      setScoreAnimation(voteType === 'upvote' ? 'up' : 'down')
      setAnimatingScore(newScore)
      setAnimatingUpvotes(newUpvotes)
      setAnimatingDownvotes(newDownvotes)

      // Reset animation after it completes
      setTimeout(() => {
        setScoreAnimation(null)
      }, 600)

      // Call the mutation
      await voteMutation.mutateAsync({
        jokeId: joke.id,
        userId: user.id,
        voteType
      })

      // Notify parent component
      onVoteChange?.(joke.id, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        score: newScore,
        userVote: newUserVote
      })

    } catch (error) {
      console.error('Error voting:', error)
      // Reset animation on error
      setAnimatingScore(joke.score)
      setAnimatingUpvotes(joke.upvotes)
      setAnimatingDownvotes(joke.downvotes)
    } finally {
      setIsVoting(false)
    }
  }, [user, isVoting, joke, voteMutation, onVoteChange])

  return {
    isVoting,
    scoreAnimation,
    animatingScore,
    animatingUpvotes,
    animatingDownvotes,
    showLoginPrompt,
    setShowLoginPrompt,
    handleVote,
    userVoteValue: joke.userVote?.vote_type
  }
}

// Hook for handling joke favorites with animations
export function useJokeFavorite(joke: JokeWithAuthor) {
  const { user } = useAuth()
  const favoriteMutation = useFavoriteMutation()

  const [isFavorite, setIsFavorite] = useState(joke.isFavorite || false)

  const handleFavorite = useCallback(async () => {
    if (!user) return

    try {
      // Optimistic update
      setIsFavorite(!isFavorite)

      // Add heart animation
      const heartElement = document.getElementById(`heart-${joke.id}`)
      if (heartElement) {
        heartElement.classList.add('animate-pulse', 'scale-125')
        setTimeout(() => {
          heartElement.classList.remove('animate-pulse', 'scale-125')
        }, 400)
      }

      // Call the mutation
      await favoriteMutation.mutateAsync({
        jokeId: joke.id,
        userId: user.id
      })

    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Revert on error
      setIsFavorite(!isFavorite)
    }
  }, [user, joke.id, isFavorite, favoriteMutation])

  return {
    isFavorite,
    handleFavorite
  }
}

// Hook for handling joke sharing
export function useJokeShare(joke: JokeWithAuthor) {
  const [showShare, setShowShare] = useState(false)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/dowcip/${joke.slug}`
  const shareTitle = joke.content.substring(0, 100) + (joke.content.length > 100 ? '...' : '')

  const toggleShare = useCallback(() => {
    setShowShare(!showShare)
  }, [showShare])

  const closeShare = useCallback(() => {
    setShowShare(false)
  }, [])

  return {
    showShare,
    shareUrl,
    shareTitle,
    toggleShare,
    closeShare
  }
}

// Hook for text-to-speech functionality
export function useTextToSpeech(text: string) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  // Check if speech synthesis is supported
  useState(() => {
    setIsSupported('speechSynthesis' in window)
  })

  const speak = useCallback(() => {
    if (!isSupported) return

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pl-PL'

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [text, isSupported])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  return {
    isSpeaking,
    isSupported,
    speak,
    stop
  }
}
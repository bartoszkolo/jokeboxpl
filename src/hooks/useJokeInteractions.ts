import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useVoteMutation, useFavoriteMutation } from './useJokes'
import { JokeWithAuthor } from '@/types/database'

// Create heart particle explosion effect
function createHeartParticles(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // Create 8 heart particles in a circular pattern
  const particleCount = 8
  const particles = []

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    const angle = (i * 360) / particleCount
    const distance = 40 + Math.random() * 20 // Random distance between 40-60px

    particle.innerHTML = '❤️'
    particle.style.position = 'fixed'
    particle.style.left = `${centerX}px`
    particle.style.top = `${centerY}px`
    particle.style.fontSize = `${12 + Math.random() * 8}px` // Random size 12-20px
    particle.style.pointerEvents = 'none'
    particle.style.zIndex = '9999'
    particle.style.opacity = '1'
    particle.style.transform = 'translate(-50%, -50%)'
    particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'

    document.body.appendChild(particle)
    particles.push(particle)

    // Animate to final position
    setTimeout(() => {
      const finalX = Math.cos((angle * Math.PI) / 180) * distance
      const finalY = Math.sin((angle * Math.PI) / 180) * distance

      particle.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)) scale(0.5)`
      particle.style.opacity = '0'
    }, 10)
  }

  // Clean up particles after animation
  setTimeout(() => {
    particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    })
  }, 1000)
}

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const handleFavorite = useCallback(async () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    try {
      // Optimistic update
      setIsFavorite(!isFavorite)

      // Enhanced heart animation with particle effect
      const heartElement = document.getElementById(`heart-${joke.id}`)
      if (heartElement) {
        // Add scale and rotate animation to heart
        heartElement.classList.add('animate-pulse', 'scale-125', 'rotate-12')
        setTimeout(() => {
          heartElement.classList.remove('animate-pulse', 'scale-125', 'rotate-12')
        }, 600)

        // Create particle explosion effect
        createHeartParticles(heartElement)
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
    handleFavorite,
    showLoginPrompt,
    setShowLoginPrompt
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
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  // Check if speech synthesis is supported
  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = useCallback(() => {
    if (!isSupported) return

    if (isPaused) {
      // Resume if paused
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    // Stop any ongoing speech and start new
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pl-PL'

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }

    utterance.onpause = () => {
      setIsPaused(true)
    }

    utterance.onresume = () => {
      setIsPaused(false)
    }

    setCurrentUtterance(utterance)
    window.speechSynthesis.speak(utterance)
  }, [text, isSupported, isPaused])

  const togglePlayPause = useCallback(() => {
    if (!isSupported) return

    if (!isSpeaking) {
      // Start speaking
      speak()
    } else if (isPaused) {
      // Resume if paused
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      // Pause if speaking
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [isSupported, isSpeaking, isPaused, speak])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }
  }, [isSupported])

  return {
    isSpeaking,
    isPaused,
    isSupported,
    speak,
    stop,
    togglePlayPause
  }
}
import { JokeWithAuthor } from '@/types/database'
import { JokeCardPresentational } from './JokeCardPresentational'
import { useJokeVote, useJokeFavorite, useJokeShare, useTextToSpeech } from '@/hooks/useJokeInteractions'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface JokeCardSmartProps {
  joke: JokeWithAuthor
  onVoteChange?: (jokeId: number, voteData?: {upvotes?: number, downvotes?: number, score?: number, userVote?: any}) => void
  onJokeUpdate?: (updatedJoke: JokeWithAuthor) => void
}

/**
 * Smart component that manages all the state and logic for a JokeCard.
 * This component uses custom hooks to handle all interactions and passes
 * the processed data down to the presentational component.
 */
export function JokeCardSmart({ joke, onVoteChange, onJokeUpdate }: JokeCardSmartProps) {
  const { user, profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(joke.content)
  const [editCategoryId, setEditCategoryId] = useState(joke.category_id)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  // Custom hooks for different interactions
  const vote = useJokeVote(joke, onVoteChange)
  const favorite = useJokeFavorite(joke)
  const share = useJokeShare(joke)
  const textToSpeech = useTextToSpeech(joke.content)

  const handleEditStart = () => {
    setIsEditing(true)
    setEditContent(joke.content)
    setEditCategoryId(joke.category_id)
    setEditError('')
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditContent(joke.content)
    setEditCategoryId(joke.category_id)
    setEditError('')
  }

  const handleEditSave = async () => {
    if (!profile?.is_admin) return

    if (editContent.trim().length < 10) {
      setEditError('Dowcip musi mieć minimum 10 znaków')
      return
    }

    setEditLoading(true)
    setEditError('')

    try {
      console.log('Updating joke:', { jokeId: joke.id, currentContent: joke.content, newContent: editContent.trim() })

      const { data: updatedJoke, error } = await supabase
        .from('jokes')
        .update({
          content: editContent.trim(),
          category_id: editCategoryId,
          updated_at: new Date().toISOString()
        })
        .eq('id', joke.id)
        .select('*')
        .single()

      console.log('Update result:', { updatedJoke, error })

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      if (!updatedJoke) {
        console.error('No joke returned from update')
        throw new Error('Joke not found or update failed')
      }

      // Manually attach the existing profile and category data
      const updatedJokeWithRelations = {
        ...updatedJoke,
        profiles: joke.profiles,
        categories: joke.categories
      }

      console.log('Final updated joke:', updatedJokeWithRelations)

      setIsEditing(false)
      onJokeUpdate?.(updatedJokeWithRelations)
    } catch (err: any) {
      console.error('Edit error:', err)
      setEditError(err.message || 'Błąd podczas edytowania dowcipu')
    } finally {
      setEditLoading(false)
    }
  }

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
      isTextToSpeechPaused={textToSpeech.isPaused}
      isEditing={isEditing}
      editContent={editContent}
      editCategoryId={editCategoryId}
      editLoading={editLoading}
      editError={editError}
      onVote={vote.handleVote}
      onFavorite={favorite.handleFavorite}
      onShare={share.toggleShare}
      onTextToSpeech={textToSpeech.togglePlayPause}
      onEditStart={handleEditStart}
      onEditCancel={handleEditCancel}
      onEditSave={handleEditSave}
      onEditContentChange={setEditContent}
      onEditCategoryChange={setEditCategoryId}
      onLoginPromptClose={() => {
        vote.setShowLoginPrompt(false)
        favorite.setShowLoginPrompt(false)
      }}
    />
  )
}
import { JokeWithAuthor, Category } from '@/types/database'
import { ThumbsUp, ThumbsDown, Heart, Share2, Volume2, VolumeX, Pause, Edit2, Save, X } from 'lucide-react'
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share'
import { Link } from 'react-router-dom'
import { sanitizeText } from '@/lib/formatText'
import { LoginPrompt } from './LoginPrompt'
import { useCategories } from '@/hooks/useJokes'
import { useAuth } from '@/contexts/AuthContext'

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
  isTextToSpeechPaused?: boolean
  isEditing?: boolean
  editContent?: string
  editCategoryId?: number | null
  editLoading?: boolean
  editError?: string
  onVote?: (type: 'upvote' | 'downvote') => void
  onFavorite?: () => void
  onShare?: () => void
  onTextToSpeech?: () => void
  onEditStart?: () => void
  onEditCancel?: () => void
  onEditSave?: () => void
  onEditContentChange?: (content: string) => void
  onEditCategoryChange?: (categoryId: number | null) => void
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
  isTextToSpeechPaused = false,
  isEditing = false,
  editContent = '',
  editCategoryId = null,
  editLoading = false,
  editError = '',
  onVote,
  onFavorite,
  onShare,
  onTextToSpeech,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditContentChange,
  onEditCategoryChange,
  onLoginPromptClose
}: JokeCardPresentationalProps) {

  const { data: categories = [] } = useCategories()
  const { profile } = useAuth()
  const isAdmin = profile?.is_admin
  const userVoteValue = joke.userVote?.vote_value

    return (
    <article className="joke-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <select
              value={editCategoryId || ''}
              onChange={(e) => onEditCategoryChange?.(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bez kategorii</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          ) : joke.categories ? (
            <Link
              to={`/kategoria/${joke.categories.slug}`}
              className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
            >
              {joke.categories.name}
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && !isEditing && (
            <button
              onClick={onEditStart}
              className="p-2 rounded-full bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 transition-all duration-200"
              title="Edytuj dowcip"
            >
              <Edit2 size={16} />
            </button>
          )}
          <button
            onClick={onTextToSpeech}
            disabled={!isTextToSpeechSupported}
            className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isTextToSpeechSupported ? (
            isTextToSpeechSpeaking ? (isTextToSpeechPaused ? "Wznów odtwarzanie" : "Wstrzymaj odtwarzanie") : "Przeczytaj na głos"
          ) : "Przeglądarka nie obsługuje funkcji mowy"}
          >
            {isTextToSpeechSpeaking ? (
              isTextToSpeechPaused ? (
                <Volume2 size={16} className="animate-pulse" />
              ) : (
                <Pause size={16} className="animate-pulse" />
              )
            ) : (
              <Volume2 size={16} />
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-6">
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange?.(e.target.value)}
            rows={Math.max(4, Math.ceil(joke.content.length / 40))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y"
            placeholder="Treść dowcipu..."
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {editContent.length} / minimum 10 znaków
          </p>
          {editError && (
            <div className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm">
              {editError}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={onEditSave}
              disabled={editLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {editLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              Zapisz
            </button>
            <button
              onClick={onEditCancel}
              disabled={editLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <X size={16} />
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <Link to={`/dowcip/${joke.slug}`}>
          <div
            className="joke-content mb-6 hover:text-muted-foreground transition-colors duration-200 text-foreground text-base leading-[1.6] [&:not(:first-child)]:mt-2"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {sanitizeText(joke.content)}
          </div>
        </Link>
      )}

      {!isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            {/* Vote Buttons - simplified format: [👍] [score] [👎] */}
            <button
              onClick={() => onVote?.('upvote')}
              disabled={isVoting}
              className={`p-2 rounded-lg transition-all duration-200 ${
                userVoteValue === 1
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              } ${!user ? 'opacity-60 hover:opacity-80' : 'hover:scale-105'} disabled:opacity-50 disabled:cursor-not-allowed`}
              title={!user ? "Zaloguj się, aby zagłosować" : "Głosuj na plus"}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>

            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-w-[3rem] text-center">
              <span className={`text-lg font-bold transition-all duration-300 ${
                scoreAnimation === 'up' ? 'animate-bounce text-green-600 dark:text-green-400 scale-110' :
                scoreAnimation === 'down' ? 'animate-bounce text-red-600 dark:text-red-400 scale-110' :
                animatingScore > 0 ? 'text-green-600 dark:text-green-400' :
                animatingScore < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {animatingScore > 0 ? '+' : ''}{animatingScore}
              </span>
            </div>

            <button
              onClick={() => onVote?.('downvote')}
              disabled={isVoting}
              className={`p-2 rounded-lg transition-all duration-200 ${
                userVoteValue === -1
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              } ${!user ? 'opacity-60 hover:opacity-80' : 'hover:scale-105'} disabled:opacity-50 disabled:cursor-not-allowed`}
              title={!user ? "Zaloguj się, aby zagłosować" : "Głosuj na minus"}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onFavorite}
              id={`heart-${joke.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform ${
                isFavorite
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 scale-105'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:scale-105'
              } ${!user ? 'opacity-60 hover:opacity-80' : ''}`}
              title={!user ? "Zaloguj się, aby dodać do ulubionych" : "Dodaj do ulubionych"}
            >
              <Heart
                size={16}
                className={`transition-all duration-300 ${isFavorite ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">Ulubione</span>
            </button>

            <div className="relative">
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-105"
                title="Udostępnij"
              >
                <Share2 size={16} />
                <span className="text-sm font-medium">Udostępnij</span>
              </button>

              {showShare && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 flex space-x-2 z-10">
                  <FacebookShareButton url={shareUrl} hashtag={shareTitle}>
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
      )}

      {/* Metadata - moved above actions, right-aligned */}
      <div className="mt-4 flex justify-end items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Dodane przez: <span className="font-medium text-gray-700 dark:text-gray-300">{joke.profiles?.username || 'Anonim'}</span></span>
        <span>{new Date(joke.created_at).toLocaleDateString('pl-PL')}</span>
      </div>

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={onLoginPromptClose || (() => {})}
        message="Aby korzystać z tej funkcji, musisz być zalogowany. Zaloguj się lub załóż konto, aby oceniać dowcipy i dodawać je do ulubionych!"
      />
    </article>
  )
}
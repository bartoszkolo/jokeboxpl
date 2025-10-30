import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { JokeWithAuthor } from '@/types/database'
import { Shuffle, Sparkles, Volume2 } from 'lucide-react'

export const RandomJoke: React.FC = () => {
  const [randomJoke, setRandomJoke] = useState<JokeWithAuthor | null>(null)
  const [loading, setLoading] = useState(false)
  const [dailyJoke, setDailyJoke] = useState<JokeWithAuthor | null>(null)

  useEffect(() => {
    fetchDailyJoke()
    fetchRandomJoke()
  }, [])

  const fetchRandomJoke = async () => {
    setLoading(true)
    try {
      // First get the total count of published jokes
      const { count } = await supabase
        .from('jokes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      if (!count || count === 0) {
        setRandomJoke(null)
        return
      }

      // Generate a random offset
      const randomOffset = Math.floor(Math.random() * count)

      // Fetch one joke with random offset using correct syntax
      const { data } = await supabase
        .from('jokes')
        .select(`
          *,
          author:profiles(username),
          category:categories(name, slug)
        `)
        .eq('status', 'published')
        .range(randomOffset, randomOffset + 1)

      setRandomJoke(data?.[0] || null)
    } catch (error) {
      console.error('Error fetching random joke:', error)
      setRandomJoke(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyJoke = async () => {
    try {
      // Get joke of the day based on today's date
      const today = new Date()
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

      const { data } = await supabase
        .from('jokes')
        .select(`
          *,
          author:profiles(username),
          category:categories(name, slug)
        `)
        .eq('status', 'published')
        .order('id', { ascending: true })

      if (data && data.length > 0) {
        const jokeIndex = dayOfYear % data.length
        setDailyJoke(data[jokeIndex])
      }
    } catch (error) {
      console.error('Error fetching daily joke:', error)
    }
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pl-PL'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Random Joke Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border-2 border-dashed border-primary/30 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-pulse"></div>

        <div className="relative p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <Shuffle className="h-6 w-6 text-primary animate-spin" />
              <h2 className="text-2xl font-bold text-gradient heading">Losuj Dowcip</h2>
              <Shuffle className="h-6 w-6 text-primary animate-spin" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-content-muted">Losowanie dowcipu...</p>
            </div>
          ) : randomJoke ? (
            <div className="text-center space-y-4">
              <p className="joke-content text-lg font-medium max-w-3xl mx-auto">
                {randomJoke.content}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-content-light">
                <span>Autor: {randomJoke.author?.username || 'Anonim'}</span>
                {randomJoke.category && (
                  <>
                    <span>•</span>
                    <span>Kategoria: {randomJoke.category.name}</span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={fetchRandomJoke}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Losuj kolejny
                </button>
                <button
                  onClick={() => randomJoke && handleSpeak(randomJoke.content)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-content-muted hover:text-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <Volume2 className="h-4 w-4" />
                  Przeczytaj
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-content-muted">Nie udało się załadować losowego dowcipu</p>
              <button
                onClick={fetchRandomJoke}
                className="btn-outline mt-4"
              >
                Spróbuj ponownie
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Daily Joke Section */}
      {dailyJoke && (
        <div className="relative overflow-hidden bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 rounded-2xl border-2 border-dashed border-accent/30">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-secondary/5"></div>

          <div className="relative p-6">
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                <h3 className="text-lg font-bold text-accent heading">Dowcip Dnia</h3>
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="joke-content text-base max-w-2xl mx-auto">
                {dailyJoke.content}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-content-light">
                <span>Autor: {dailyJoke.author?.username || 'Anonim'}</span>
                {dailyJoke.category && (
                  <>
                    <span>•</span>
                    <span>Kategoria: {dailyJoke.category.name}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => handleSpeak(dailyJoke.content)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-content-muted hover:text-accent hover:bg-accent/5 transition-all duration-200"
              >
                <Volume2 className="h-4 w-4" />
                Przeczytaj na głos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { JokeWithAuthor } from '@/types/database'
import { Shuffle, Volume2, Pause, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RandomJokePage() {
  const [randomJoke, setRandomJoke] = useState<JokeWithAuthor | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
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

  
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return

    if (!isSpeaking) {
      // Start speaking
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
    } else if (isPaused) {
      // Resume if paused
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      // Pause if speaking
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-content-muted hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do strony głównej
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4 heading">
              Losowe Dowcipy
            </h1>
            <p className="text-lg text-content-muted max-w-2xl mx-auto subheading">
              Odkrywaj nowe żarty! Losuj dowcipy i baw się dobrze.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Random Joke Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border-2 border-dashed border-primary/30 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-pulse"></div>

            <div className="relative p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-3">
                  <Shuffle className="h-8 w-8 text-primary animate-spin" />
                  <h2 className="text-3xl font-bold text-gradient heading">Losuj Dowcip</h2>
                  <Shuffle className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6"></div>
                  <p className="text-content-muted text-lg">Losowanie dowcipu...</p>
                </div>
              ) : randomJoke ? (
                <div className="text-center space-y-6">
                  <div className="bg-card/80 backdrop-blur-sm rounded-xl p-8 border border-border">
                    <p className="joke-content text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                      {randomJoke.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-text-content-muted">
                    <span className="bg-background px-4 py-2 rounded-lg border border-border">
                      Autor: {randomJoke.author?.username || 'Anonim'}
                    </span>
                    {randomJoke.category && (
                      <span className="bg-background px-4 py-2 rounded-lg border border-border">
                        Kategoria: {randomJoke.category.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={fetchRandomJoke}
                      disabled={loading}
                      className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:scale-105 text-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-orange-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <Shuffle className="h-7 w-7 animate-spin" />
                        <span>Losuj kolejny 🎲</span>
                      </div>
                    </button>
                    <button
                      onClick={() => randomJoke && handleSpeak(randomJoke.content)}
                      className="flex items-center gap-3 px-6 py-4 rounded-xl text-content-muted hover:text-primary hover:bg-primary/10 transition-all duration-200 border border-border"
                      title={!isSpeaking ? 'Przeczytaj na głos' : (isPaused ? 'Wznów odtwarzanie' : 'Wstrzymaj odtwarzanie')}
                    >
                      {!isSpeaking ? (
                        <Volume2 className="h-5 w-5" />
                      ) : isPaused ? (
                        <Volume2 className="h-5 w-5 animate-pulse" />
                      ) : (
                        <Pause className="h-5 w-5 animate-pulse" />
                      )}
                      {!isSpeaking ? 'Przeczytaj na głos' : (isPaused ? 'Wznów' : 'Wstrzymaj')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-content-muted text-lg mb-6">Nie udało się załadować losowego dowcipu</p>
                  <button
                    onClick={fetchRandomJoke}
                    className="btn-outline"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
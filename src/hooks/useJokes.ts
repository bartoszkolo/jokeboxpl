import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchJokesWithDetails } from '@/lib/jokesHelper'
import { JokeWithAuthor, Database } from '@/types/database'

// Query keys for React Query caching
export const queryKeys = {
  jokes: ['jokes'] as const,
  jokesWithPagination: (page: number, categoryId?: number | null) =>
    ['jokes', 'paginated', page, categoryId] as const,
  joke: (id: number) => ['joke', id] as const,
  categories: ['categories'] as const,
  userVotes: (userId: string, jokeIds: number[]) => ['votes', userId, jokeIds] as const,
  userFavorites: (userId: string, jokeIds: number[]) => ['favorites', userId, jokeIds] as const,
  userAllFavorites: (userId: string) => ['favorites', userId, 'all'] as const,
  searchResults: (query: string, filters?: any) => ['search', query, filters] as const,
}

// Types for vote mutations
type VoteData = Database['public']['Tables']['votes']['Insert']
type FavoriteData = Database['public']['Tables']['favorites']['Insert']

// Hook for fetching jokes with pagination and filtering
export function useJokes(options: {
  page?: number
  categoryId?: number | null
  limit?: number
  orderBy?: 'created_at' | 'score'
  enabled?: boolean
} = {}) {
  const {
    page = 0,
    categoryId = null,
    limit = 15,
    orderBy = 'created_at',
    enabled = true
  } = options

  return useQuery({
    queryKey: queryKeys.jokesWithPagination(page, categoryId),
    queryFn: async () => {
      const offset = page * limit

      // Fetch total count for pagination
      let countQuery = supabase
        .from('jokes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')

      if (categoryId) {
        countQuery = countQuery.eq('category_id', categoryId)
      }

      const { count: totalCount } = await countQuery

      // Fetch jokes for current page
      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        categoryId,
        limit,
        offset,
        orderBy,
        ascending: orderBy === 'created_at' ? false : true
      })

      return {
        jokes: jokesData,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook for fetching a single joke by ID
export function useJoke(id: number, enabled?: boolean) {
  return useQuery({
    queryKey: queryKeys.joke(id),
    queryFn: async () => {
      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        limit: 1,
        offset: 0
      })

      const joke = jokesData.find(j => j.id === id)
      if (!joke) {
        throw new Error('Joke not found')
      }
      return joke
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for fetching a single joke by slug
export function useJokeBySlug(slug: string, enabled?: boolean) {
  return useQuery({
    queryKey: ['joke', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null

      const jokesData = await fetchJokesWithDetails({
        status: 'published',
        limit: 1000 // Fetch more to find by slug
      })

      const joke = jokesData.find(j => j.slug === slug)
      if (!joke) {
        throw new Error('Joke not found')
      }
      return joke
    },
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for fetching categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
  })
}

// Hook for fetching a single category by slug
export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      if (!slug) return null

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error
      }
      return data
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Hook for fetching user votes for specific jokes
export function useUserVotes(userId: string, jokeIds: number[]) {
  return useQuery({
    queryKey: queryKeys.userVotes(userId, jokeIds),
    queryFn: async () => {
      if (!userId || jokeIds.length === 0) return []

      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .in('joke_id', jokeIds)

      if (error) throw error
      return data
    },
    enabled: !!userId && jokeIds.length > 0,
    staleTime: 1000 * 60, // 1 minute
  })
}

// Hook for fetching user favorites for specific jokes
export function useUserFavorites(userId: string, jokeIds: number[]) {
  return useQuery({
    queryKey: queryKeys.userFavorites(userId, jokeIds),
    queryFn: async () => {
      if (!userId || jokeIds.length === 0) return []

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .in('joke_id', jokeIds)

      if (error) throw error
      return data
    },
    enabled: !!userId && jokeIds.length > 0,
    staleTime: 1000 * 60, // 1 minute
  })
}

// Hook for fetching all user favorites with pagination
export function useUserAllFavorites(userId: string, page: number = 0, limit: number = 15) {
  return useQuery({
    queryKey: ['favorites', userId, 'all', 'paginated', page],
    queryFn: async () => {
      if (!userId) return { jokes: [], totalCount: 0, totalPages: 0 }

      const offset = page * limit

      // Get total count of favorites for published jokes
      const { count: totalCount } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get just the joke IDs from favorites with pagination
      const { data: favoriteIds, error: idsError } = await supabase
        .from('favorites')
        .select('joke_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (idsError) throw idsError

      if (!favoriteIds || favoriteIds.length === 0) {
        return {
          jokes: [],
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        }
      }

      // Get joke IDs for the query
      const jokeIds = favoriteIds.map(fav => fav.joke_id)

      // Get full joke details using the existing helper function
      // Fetch more jokes to ensure we get all favorites
      const jokesWithDetails = await fetchJokesWithDetails({
        status: 'published',
        limit: 1000, // Fetch more to ensure we get all favorites
        offset: 0
      })

      // Filter to only include jokes that are in user's favorites and maintain order
      const favoriteJokes = jokeIds
        .filter(jokeId => jokeId !== undefined) // Filter out undefined IDs
        .map(jokeId => jokesWithDetails.find(joke => joke.id === jokeId))
        .filter(joke => joke !== undefined)
        .map(joke => ({
          ...joke,
          isFavorite: true
        }))

      return {
        jokes: favoriteJokes,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook for searching jokes using Full-Text Search (server-side)
export function useSearchJokes(query: string, filters: {
  categoryId?: number | null
  sortBy?: 'created_at' | 'score' | 'relevance'
  page?: number
} = {}) {
  const { categoryId = null, sortBy = 'relevance', page = 0 } = filters
  const limit = 15

  return useQuery({
    queryKey: queryKeys.searchResults(query, { categoryId, sortBy, page }),
    queryFn: async () => {
      if (!query.trim()) return { jokes: [], totalCount: 0, totalPages: 0 }

      const offset = page * limit

      // Use RPC function for server-side full-text search
      const { data: searchResults, error: searchError } = await supabase.rpc('search_jokes', {
        search_query: query.trim(),
        p_category_id: categoryId,
        p_limit: limit,
        p_offset: offset,
        p_order_by: sortBy
      })

      if (searchError) {
        console.error('Search error:', searchError)
        throw new Error('Search failed')
      }

      // Get total count using the count function
      const { data: totalCount, error: countError } = await supabase.rpc('count_search_results', {
        search_query: query.trim(),
        p_category_id: categoryId
      })

      if (countError) {
        console.error('Count error:', countError)
        throw new Error('Count failed')
      }

      // Transform the results to match JokeWithAuthor format
      const jokes = searchResults?.map(result => ({
        id: result.id,
        content: result.content,
        status: result.status,
        author_id: result.author_id,
        category_id: result.category_id,
        slug: result.slug,
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        score: result.score,
        created_at: result.created_at,
        updated_at: result.updated_at,
        profiles: result.author_username ? {
          id: result.author_id,
          username: result.author_username,
          is_admin: false, // We don't need this for search results
          newsletter_consent: false,
          created_at: result.created_at
        } : null,
        categories: result.category_name ? {
          id: result.category_id,
          name: result.category_name,
          slug: result.category_slug,
          description_seo: null,
          created_at: result.created_at
        } : null,
        search_rank: result.rank // Include search relevance rank
      })) || []

      return {
        jokes,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60, // 1 minute
  })
}

// Mutation for voting on jokes
export function useVoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jokeId, userId, voteType }: {
      jokeId: number
      userId: string
      voteType: 'upvote' | 'downvote'
    }) => {
      // First check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .eq('joke_id', jokeId)
        .single()

      let newVoteData: VoteData

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('votes')
            .delete()
            .eq('user_id', userId)
            .eq('joke_id', jokeId)
          return { action: 'removed', jokeId, voteType }
        } else {
          // Update vote type
          const { data } = await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('user_id', userId)
            .eq('joke_id', jokeId)
            .select()
            .single()
          return { action: 'updated', jokeId, voteType, voteData: data }
        }
      } else {
        // Create new vote
        const { data } = await supabase
          .from('votes')
          .insert({ joke_id: jokeId, user_id: userId, vote_type: voteType })
          .select()
          .single()
        return { action: 'created', jokeId, voteType, voteData: data }
      }
    },
    onMutate: async ({ jokeId, voteType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.jokes })

      // Snapshot previous value
      const previousJokes = queryClient.getQueriesData({ queryKey: queryKeys.jokes })

      // Optimistically update all jokes queries
      queryClient.setQueriesData({ queryKey: queryKeys.jokes }, (old: any) => {
        if (!old) return old

        if (Array.isArray(old.jokes)) {
          // For paginated results
          return {
            ...old,
            jokes: old.jokes.map((joke: JokeWithAuthor) => {
              if (joke.id === jokeId) {
                const currentVote = joke.userVote?.vote_type
                let newUpvotes = joke.upvotes
                let newDownvotes = joke.downvotes
                let newUserVote = { vote_type: voteType }

                if (currentVote === voteType) {
                  // Removing vote
                  if (voteType === 'upvote') {
                    newUpvotes = Math.max(0, newUpvotes - 1)
                  } else {
                    newDownvotes = Math.max(0, newDownvotes - 1)
                  }
                  newUserVote = null
                } else if (currentVote) {
                  // Changing vote type
                  if (voteType === 'upvote') {
                    newUpvotes = newUpvotes + 1
                    newDownvotes = Math.max(0, newDownvotes - 1)
                  } else {
                    newUpvotes = Math.max(0, newUpvotes - 1)
                    newDownvotes = newDownvotes + 1
                  }
                } else {
                  // Adding new vote
                  if (voteType === 'upvote') {
                    newUpvotes = newUpvotes + 1
                  } else {
                    newDownvotes = newDownvotes + 1
                  }
                }

                return {
                  ...joke,
                  upvotes: newUpvotes,
                  downvotes: newDownvotes,
                  score: newUpvotes - newDownvotes,
                  userVote: newUserVote
                }
              }
              return joke
            })
          }
        } else if (old.id) {
          // For single joke
          if (old.id === jokeId) {
            const currentVote = old.userVote?.vote_type
            let newUpvotes = old.upvotes
            let newDownvotes = old.downvotes
            let newUserVote = { vote_type: voteType }

            if (currentVote === voteType) {
              // Removing vote
              if (voteType === 'upvote') {
                newUpvotes = Math.max(0, newUpvotes - 1)
              } else {
                newDownvotes = Math.max(0, newDownvotes - 1)
              }
              newUserVote = null
            } else if (currentVote) {
              // Changing vote type
              if (voteType === 'upvote') {
                newUpvotes = newUpvotes + 1
                newDownvotes = Math.max(0, newDownvotes - 1)
              } else {
                newUpvotes = Math.max(0, newUpvotes - 1)
                newDownvotes = newDownvotes + 1
              }
            } else {
              // Adding new vote
              if (voteType === 'upvote') {
                newUpvotes = newUpvotes + 1
              } else {
                newDownvotes = newDownvotes + 1
              }
            }

            return {
              ...old,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              score: newUpvotes - newDownvotes,
              userVote: newUserVote
            }
          }
        }
        return old
      })

      return { previousJokes }
    },
    onError: (err, newVote, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJokes) {
        context.previousJokes.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state is in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.jokes })
    }
  })
}

// Mutation for favoriting jokes
export function useFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jokeId, userId }: {
      jokeId: number
      userId: string
    }) => {
      // Check if already favorited
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('joke_id', jokeId)
        .maybeSingle()

      if (existingFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('joke_id', jokeId)
        return { action: 'removed', jokeId, isFavorite: false }
      } else {
        // Add to favorites
        const { data } = await supabase
          .from('favorites')
          .insert({ joke_id: jokeId, user_id: userId })
          .select()
          .single()
        return { action: 'added', jokeId, isFavorite: true, favoriteData: data }
      }
    },
    onMutate: async ({ jokeId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.jokes })

      // Snapshot previous value
      const previousJokes = queryClient.getQueriesData({ queryKey: queryKeys.jokes })

      // Optimistically update all jokes queries
      queryClient.setQueriesData({ queryKey: queryKeys.jokes }, (old: any) => {
        if (!old) return old

        if (Array.isArray(old.jokes)) {
          // For paginated results
          return {
            ...old,
            jokes: old.jokes.map((joke: JokeWithAuthor) => {
              if (joke.id === jokeId) {
                return {
                  ...joke,
                  isFavorite: !joke.isFavorite
                }
              }
              return joke
            })
          }
        } else if (old.id) {
          // For single joke
          if (old.id === jokeId) {
            return {
              ...old,
              isFavorite: !old.isFavorite
            }
          }
        }
        return old
      })

      return { previousJokes }
    },
    onError: (err, newFavorite, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJokes) {
        context.previousJokes.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData)
        })
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state is in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.jokes })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userAllFavorites })
    }
  })
}
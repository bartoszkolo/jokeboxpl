import { supabase } from '@/lib/supabase'
import { JokeWithAuthor } from '@/types/database'
import { Database } from '@/types/database'

type JokeStatus = Database['public']['Enums']['jokes']['status']
type OrderByField = 'created_at' | 'score'

interface FetchJokesOptions {
  status?: JokeStatus
  categoryId?: number | null
  limit?: number
  offset?: number
  orderBy?: OrderByField
  ascending?: boolean
}

interface JokeFromRPC {
  id: number
  content: string
  created_at: string
  upvotes: number
  downvotes: number
  score: number
  status: JokeStatus
  slug: string
  author_username?: string
  category_name?: string
  category_slug?: string
}

export async function fetchJokesWithDetails(options: FetchJokesOptions = {}): Promise<JokeWithAuthor[]> {
  const {
    status = 'published',
    categoryId = null,
    limit = 50,
    offset = 0,
    orderBy = 'created_at',
    ascending = false
  } = options

  const { data, error } = await supabase.rpc('get_jokes_with_details', {
    p_status: status,
    p_category_id: categoryId,
    p_limit: limit,
    p_offset: offset,
    p_order_by: orderBy,
    p_ascending: ascending
  })

  if (error) {
    console.error('Error fetching jokes:', error)
    return []
  }

  return data?.map((joke: JokeFromRPC) => ({
    ...joke,
    profiles: joke.author_username ? { username: joke.author_username } : null,
    categories: joke.category_name ? { name: joke.category_name, slug: joke.category_slug } : null
  })) || []
}

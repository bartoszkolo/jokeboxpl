// @ts-nocheck
import { supabase } from '@/lib/supabase'

export async function fetchJokesWithDetails(options: {
  status?: string
  categoryId?: number | null
  limit?: number
  orderBy?: 'created_at' | 'score'
  ascending?: boolean
} = {}) {
  const {
    status = 'published',
    categoryId = null,
    limit = 50,
    orderBy = 'created_at',
    ascending = false
  } = options

  const { data, error } = await supabase.rpc('get_jokes_with_details', {
    p_status: status,
    p_category_id: categoryId,
    p_limit: limit,
    p_order_by: orderBy,
    p_ascending: ascending
  })

  if (error) {
    console.error('Error fetching jokes:', error)
    return []
  }

  return data?.map((joke: any) => ({
    ...joke,
    profiles: joke.author_username ? { username: joke.author_username } : null,
    categories: joke.category_name ? { name: joke.category_name, slug: joke.category_slug } : null
  })) || []
}

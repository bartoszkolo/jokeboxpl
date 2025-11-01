import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Admin query keys for React Query caching
export const ADMIN_QUERY_KEYS = {
  jokes: (filters: any) => ['admin', 'jokes', filters] as const,
  categories: () => ['admin', 'categories'] as const,
  users: (filters: any) => ['admin', 'users', filters] as const,
  stats: () => ['admin', 'stats'] as const,
}

// Types for admin data
interface AdminJoke {
  id: number
  content: string
  status: 'pending' | 'published' | 'rejected'
  slug: string
  upvotes: number
  downvotes: number
  score: number
  created_at: string
  updated_at: string
  category?: {
    name: string
    slug: string
  }
  category_id?: number
}

interface AdminCategory {
  id: number
  name: string
  slug: string
  description_seo: string
  created_at: string
  jokes_count?: number
}

interface AdminUser {
  id: string
  username: string
  is_admin: boolean
  created_at: string
  jokes_count?: number
  last_sign_in_at?: string
}

// Hook for fetching admin jokes with filters and pagination
export function useAdminJokes(filters: {
  status: string
  category: string
  search: string
  sort: string
  order: string
  page: number
}) {
  const JOKES_PER_PAGE = 10

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.jokes(filters),
    queryFn: async () => {
      let query = supabase
        .from('jokes')
        .select('*, category:categories(name, slug)', { count: 'exact' })

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.category !== 'all') {
        query = query.eq('category_id', parseInt(filters.category))
      }
      if (filters.search) {
        query = query.ilike('content', `%${filters.search}%`)
      }

      // Apply sorting
      query = query.order(filters.sort, { ascending: filters.order === 'asc' })

      // Apply pagination
      const from = (filters.page - 1) * JOKES_PER_PAGE
      const to = from + JOKES_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        jokes: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / JOKES_PER_PAGE),
      }
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

// Hook for fetching admin categories with joke counts
export function useAdminCategories() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          jokes(count)
        `)
        .order('name')

      if (error) throw error

      const categoriesWithCount = (data || []).map(category => ({
        ...category,
        jokes_count: category.jokes?.[0]?.count || 0
      }))

      return categoriesWithCount
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
  })
}

// Hook for fetching admin users with pagination and filtering
export function useAdminUsers(filters: {
  search: string
  role: 'all' | 'admin' | 'user'
  page: number
}) {
  const USERS_PER_PAGE = 10

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.users(filters),
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.search) {
        query = query.ilike('username', `%${filters.search}%`)
      }
      if (filters.role !== 'all') {
        query = query.eq('is_admin', filters.role === 'admin')
      }

      // Apply sorting and pagination
      query = query
        .order('created_at', { ascending: false })
        .range((filters.page - 1) * USERS_PER_PAGE, filters.page * USERS_PER_PAGE - 1)

      const { data, error, count } = await query

      if (error) throw error

      const usersWithCounts = (data || []).map(user => ({
        ...user,
        jokes_count: 0 // Simplified - removed problematic join
      }))

      return {
        users: usersWithCounts,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / USERS_PER_PAGE),
      }
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

// Hook for fetching admin stats
export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.stats(),
    queryFn: async () => {
      const [jokesResult, categoriesResult, usersResult, pendingResult] = await Promise.all([
        supabase.from('jokes').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('jokes').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      return {
        totalJokes: jokesResult.count || 0,
        totalCategories: categoriesResult.count || 0,
        totalUsers: usersResult.count || 0,
        pendingJokes: pendingResult.count || 0,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Mutation for updating joke status
export function useUpdateJokeStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jokeId, status }: { jokeId: number, status: string }) => {
      const { error } = await supabase
        .from('jokes')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jokeId)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate all admin joke queries to refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'jokes'] })
    },
  })
}

// Mutation for deleting jokes
export function useDeleteJokeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jokeId: number) => {
      const { error } = await supabase
        .from('jokes')
        .delete()
        .eq('id', jokeId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jokes'] })
    },
  })
}

// Mutation for editing jokes
export function useEditJokeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jokeId,
      content,
      categoryId,
      status
    }: {
      jokeId: number
      content: string
      categoryId: number | null
      status: string
    }) => {
      const { error } = await supabase
        .from('jokes')
        .update({
          content,
          category_id: categoryId,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jokeId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jokes'] })
    },
  })
}

// Mutation for adding new jokes
export function useAddJokeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      content,
      categoryId,
      status,
      authorId
    }: {
      content: string
      categoryId: number | null
      status: string
      authorId: string
    }) => {
      // Generate slug
      const slug = content
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now()

      const { error } = await supabase
        .from('jokes')
        .insert({
          content,
          category_id: categoryId,
          status,
          slug,
          author_id: authorId
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jokes'] })
    },
  })
}

// Mutation for saving categories (create or update)
export function useSaveCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      category,
      name,
      descriptionSeo
    }: {
      category: AdminCategory | null
      name: string
      descriptionSeo: string
    }) => {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .replace(/--+/g, '-')

      const categoryData = {
        name: name.trim(),
        slug,
        description_seo: descriptionSeo.trim()
      }

      if (category) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id)

        if (error) throw error
      } else {
        // Add new category
        const { error } = await supabase
          .from('categories')
          .insert(categoryData)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] }) // Also update public categories
    },
  })
}

// Mutation for deleting categories
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: number) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] }) // Also update public categories
    },
  })
}

// Mutation for toggling user admin role
export function useToggleUserRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string, isAdmin: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
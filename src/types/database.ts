export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          is_admin: boolean
          newsletter_consent: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          is_admin?: boolean
          newsletter_consent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          is_admin?: boolean
          newsletter_consent?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description_seo: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description_seo?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description_seo?: string | null
          created_at?: string
        }
      }
      jokes: {
        Row: {
          id: number
          content: string
          status: 'pending' | 'published' | 'rejected'
          author_id: string | null
          category_id: number | null
          slug: string
          upvotes: number
          downvotes: number
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          content: string
          status?: 'pending' | 'published' | 'rejected'
          author_id?: string | null
          category_id?: number | null
          slug?: string
          upvotes?: number
          downvotes?: number
          score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          content?: string
          status?: 'pending' | 'published' | 'rejected'
          author_id?: string | null
          category_id?: number | null
          slug?: string
          upvotes?: number
          downvotes?: number
          score?: number
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: number
          user_id: string
          joke_id: number
          vote_value: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          joke_id: number
          vote_value: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          joke_id?: number
          vote_value?: number
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          joke_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          joke_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          joke_id?: number
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Joke = Database['public']['Tables']['jokes']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']

// Extended types with relations
export type JokeWithAuthor = Joke & {
  profiles: Profile | null
  categories: Category | null
  userVote?: Vote | null
  isFavorite?: boolean
  search_rank?: number // Search relevance rank (0-1)
}

import { supabase } from './supabase'

const SITE_URL = 'https://jokebox.pl'

interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0
}

function formatSitemapEntry(entry: SitemapEntry): string {
  return `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
}

export async function generateSitemap(): Promise<string> {
  try {
    // Fetch all published jokes with their slugs and creation dates
    const { data: jokes, error: jokesError } = await supabase
      .from('jokes')
      .select('slug, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (jokesError) {
      console.error('Error fetching jokes for sitemap:', jokesError)
      throw jokesError
    }

    // Fetch all categories with their slugs
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at')

    if (categoriesError) {
      console.error('Error fetching categories for sitemap:', categoriesError)
      throw categoriesError
    }

    const currentDate = new Date().toISOString()

    // Static pages with high priority
    const staticPages: SitemapEntry[] = [
      {
        url: SITE_URL,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: `${SITE_URL}/losuj`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${SITE_URL}/ranking`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: `${SITE_URL}/wyszukiwarka`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        url: `${SITE_URL}/regulamin`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${SITE_URL}/polityka-prywatnosci`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.3
      }
    ]

    // Category pages
    const categoryPages: SitemapEntry[] = (categories || []).map(category => ({
      url: `${SITE_URL}/kategoria/${category.slug}`,
      lastmod: category.updated_at || currentDate,
      changefreq: 'weekly' as const,
      priority: 0.8
    }))

    // Individual joke pages
    const jokePages: SitemapEntry[] = (jokes || []).map(joke => ({
      url: `${SITE_URL}/dowcip/${joke.slug}`,
      lastmod: joke.created_at,
      changefreq: 'monthly' as const,
      priority: 0.6
    }))

    // Combine all entries
    const allEntries = [...staticPages, ...categoryPages, ...jokePages]

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(formatSitemapEntry).join('')}
</urlset>`

    return sitemap
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return a basic sitemap with just static pages if there's an error
    const currentDate = new Date().toISOString()
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    return basicSitemap
  }
}

// Function to generate sitemap and save it locally (for development/local builds)
export async function generateAndSaveSitemap(): Promise<void> {
  try {
    const sitemap = await generateSitemap()

    // In a real implementation, you would save this to your public directory
    // For Cloudflare Workers, you might handle this differently
    console.log('Generated sitemap:', sitemap)

    // For local development, you could write to public/sitemap.xml
    // import { writeFileSync } from 'fs'
    // writeFileSync('./public/sitemap.xml', sitemap)

    console.log('Sitemap generated successfully')
  } catch (error) {
    console.error('Error generating and saving sitemap:', error)
  }
}
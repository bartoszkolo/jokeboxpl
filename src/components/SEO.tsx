import { Helmet } from 'react-helmet-async'
import { createTextExcerpt } from '@/lib/formatText'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noindex?: boolean
  structuredData?: Record<string, any> | Record<string, any>[]
}

const SITE_URL = 'https://jokebox.pl'
const DEFAULT_TITLE = 'Jokebox - Najlepsze polskie dowcipy'
const DEFAULT_DESCRIPTION = 'Jokebox - platforma z najlepszymi polskimi dowcipami. Czytaj, dodawaj i głosuj na swoje ulubione żarty!'
const DEFAULT_OG_IMAGE = '/og-image.jpg'

export function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  structuredData
}: SEOProps) {
  const fullTitle = title ? `${title} | Jokebox` : DEFAULT_TITLE
  const fullDescription = description || DEFAULT_DESCRIPTION
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL
  const imageUrl = ogImage ? `${SITE_URL}${ogImage}` : DEFAULT_OG_IMAGE

  const jsonLd = Array.isArray(structuredData) ? structuredData : [structuredData].filter(Boolean)

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {canonical && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Jokebox" />
      <meta property="og:locale" content="pl_PL" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Additional Meta Tags */}
      <meta name="language" content="Polish" />
      <meta name="keywords" content="dowcipy, żarty, humor, polskie dowcipy, śmieszne teksty" />
      <meta name="author" content="Jokebox.pl" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />

      {/* Structured Data */}
      {jsonLd.map((data, index) => (
        <script
          key={`json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 2)
          }}
        />
      ))}
    </Helmet>
  )
}

// Helper functions for specific structured data types
export const createJokeStructuredData = (joke: {
  id: number
  slug: string
  content: string
  author: { username: string }
  created_at: string
  upvotes?: number
  downvotes?: number
  category?: { name: string }
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: `Dowcip: ${createTextExcerpt(joke.content, 100)}`,
  description: createTextExcerpt(joke.content, 160),
  author: {
    '@type': 'Person',
    name: joke.author.username
  },
  datePublished: joke.created_at,
  dateModified: joke.created_at,
  url: `${SITE_URL}/dowcip/${joke.slug}`,
  publisher: {
    '@type': 'Organization',
    name: 'Jokebox',
    url: SITE_URL
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/dowcip/${joke.slug}`
  },
  interactionStatistic: [
    {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: joke.upvotes || 0
    },
    {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/DislikeAction',
      userInteractionCount: joke.downvotes || 0
    }
  ],
  about: joke.category ? {
    '@type': 'Thing',
    name: joke.category.name
  } : undefined
})

export const createWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Jokebox',
  description: 'Najlepsze polskie dowcipy w jednym miejscu',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/wyszukiwarka?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  },
  publisher: {
    '@type': 'Organization',
    name: 'Jokebox',
    url: SITE_URL
  }
})

export const createBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url
  }))
})

export const createCategoryStructuredData = (category: {
  slug: string
  name: string
  description?: string
  joke_count?: number
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `Kategoria: ${category.name}`,
  description: category.description || `Najlepsze dowcipy w kategorii ${category.name}`,
  url: `${SITE_URL}/kategoria/${category.slug}`,
  numberOfItems: category.joke_count,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: category.joke_count,
    name: `Dowcipy z kategorii ${category.name}`
  },
  publisher: {
    '@type': 'Organization',
    name: 'Jokebox',
    url: SITE_URL
  }
})
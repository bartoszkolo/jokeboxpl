import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, loading = false }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  const handlePageChange = (page: number) => {
    onPageChange(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex items-center space-x-1">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0 || loading}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        title="Poprzednia strona"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-10 h-10 text-muted-foreground">
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageChange((page as number) - 1)} // Convert to 0-based index
                disabled={loading}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors duration-200 ${
                  (page as number) - 1 === currentPage
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-card text-card-foreground hover:bg-muted hover:text-foreground'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={`Strona ${page}`}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1 || loading}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        title="Następna strona"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
// src/components/ui/ContentRow.jsx
import { useRef } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import MovieCard from './MovieCard'

export default function ContentRow({ title, contents = [], size = 'md' }) {
  const rowRef = useRef(null)

  const scroll = (dir) => {
    const amount = dir === 'left' ? -600 : 600
    rowRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (!contents.length) return null

  return (
    <section className="relative group/row mb-8">
      <h2 className="text-lg font-display tracking-wider uppercase text-dark-100 mb-3 px-4 sm:px-6 lg:px-8">
        {title}
      </h2>

      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-dark-900/80 border border-dark-600 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-dark-700 mt-4"
      >
        <MdChevronLeft size={22} />
      </button>

      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto row-scroll px-4 sm:px-6 lg:px-8 pb-2"
      >
        {contents.map(c => <MovieCard key={c.id} content={c} size={size} />)}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-dark-900/80 border border-dark-600 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-dark-700 mt-4"
      >
        <MdChevronRight size={22} />
      </button>
    </section>
  )
}

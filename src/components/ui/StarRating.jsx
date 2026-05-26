// src/components/ui/StarRating.jsx
import { useState } from 'react'
import { MdStar, MdStarBorder } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { rateContent } from '../../services/firestore'
import toast from 'react-hot-toast'

export default function StarRating({ contentId, currentRating = 0, userRating = null, onRated }) {
  const { user } = useAuth()
  const [hover,   setHover]   = useState(0)
  const [loading, setLoading] = useState(false)

  const handleRate = async (value) => {
    if (!user) { toast.error('Sign in to rate'); return }
    setLoading(true)
    try {
      const newAvg = await rateContent(user.uid, contentId, value)
      toast.success(`Rated ${value}/5 ⭐`)
      onRated?.(newAvg, value)
    } catch { toast.error('Error rating') }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          disabled={loading}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleRate(star)}
          className="transition-transform hover:scale-110 active:scale-90 disabled:opacity-50"
        >
          {(hover || userRating || 0) >= star
            ? <MdStar     size={24} className="text-yellow-400" />
            : <MdStarBorder size={24} className="text-dark-400" />
          }
        </button>
      ))}
      {currentRating > 0 && (
        <span className="ml-2 text-sm text-dark-300">
          {currentRating.toFixed(1)} avg
        </span>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
      setQuery('')
    }
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <form className="d-flex" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="search"
          className="form-control"
          placeholder="Search movies..."
          value={query}
          onChange={handleInputChange}
          aria-label="Search movies"
        />
        <button className="btn btn-outline-light" type="submit">
          <i className="bi bi-search"></i>
        </button>
      </div>
    </form>
  )
}

export default SearchBar
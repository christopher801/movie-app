import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

const Navbar = () => {
  const navigate = useNavigate()

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-film me-2"></i>
          <span>MovieApp</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/popular">Popular</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/top-rated">Top Rated</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/upcoming">Upcoming</Link>
            </li>
          </ul>
          
          <div className="d-flex">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
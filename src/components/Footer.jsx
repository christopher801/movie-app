const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>MovieApp</h5>
            <p className="mb-0">
              Discover your next favorite movie with our extensive collection.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} MovieApp. All rights reserved.
            </p>
            <small className="text-muted">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </small>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
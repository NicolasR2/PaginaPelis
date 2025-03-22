import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('http://<ip-de-tu-ec2>:8000/movies')
      .then(response => setMovies(response.data.movies))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Películas Disponibles</h1>
      <ul>
        {movies.map(movie => (
          <li key={movie.id}>
            <h2>{movie.title}</h2>
            <p>{movie.description}</p>
            <p>Año: {movie.release_year}</p>
            <p>Duración: {movie.length} minutos</p>
            <p>Rating: {movie.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieList;
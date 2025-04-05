import React from "react";
import MovieCard from "./MovieCard";

interface Movie {
  id: number;
  title: string;
  description: string;
  rental_rate: number;
}
interface MovieListProps {
  movies: Movie[];
  onToggleCart: (movie: Movie) => void;
  cart: Movie[];
}

const MovieList: React.FC<MovieListProps> = ({ movies, onToggleCart, cart }) => {
  return (
    <div>
      {movies.length > 0 ? (
        movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onToggleCart={onToggleCart}
            isInCart={cart.some((m) => m.id === movie.id)}
          />
        ))
      ) : (
        <p>No se encontraron películas.</p>
      )}
    </div>
  );
};

export default MovieList;

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
  onAddToCart: (movie: Movie) => void;
  cart: Movie[];
  searchTerm: string;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  onAddToCart,
  cart,
  searchTerm,
}) => {
  // Filtra películas según la búsqueda (ignorando mayúsculas/minúsculas)
  const filteredMovies = (movies ?? []).filter((movie) =>
  movie?.title?.toLowerCase().includes(searchTerm?.toLowerCase() ?? "")
);


  return (
    <div>
      {filteredMovies.length > 0 ? (
        filteredMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onAddToCart={onAddToCart}
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

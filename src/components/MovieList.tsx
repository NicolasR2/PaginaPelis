import React from "react";
import { Box, Typography } from "@mui/material";
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

const MovieList: React.FC<MovieListProps> = ({
  movies,
  onToggleCart,
  cart,
}) => {
  return (
    <Box sx={{ width: "100%" }}>
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            textAlign: "center",
            padding: 3,
          }}
        >
          <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
            🎬 No hemos encontrado películas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Prueba con otra búsqueda o revisa nuestro catálogo más tarde
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MovieList;

import React from "react";
import { Box, Typography, Grid } from "@mui/material";
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
  storeId: number;
  API_BASE_URL: string;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  onToggleCart,
  cart,
  storeId,
  API_BASE_URL,
}) => {
  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      {movies.length > 0 ? (
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ margin: 0, width: "100%" }}
        >
          {movies.map((movie) => (
            <Grid
              item
              key={movie.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={2.4}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 260 }}>
                <MovieCard
                  movie={movie}
                  onToggleCart={onToggleCart}
                  isInCart={cart.some((m) => m.id === movie.id)}
                  storeId={storeId}
                  API_BASE_URL={API_BASE_URL}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
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

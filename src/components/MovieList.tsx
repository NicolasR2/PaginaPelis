import { useState, useEffect } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import MovieCard from "./MovieCard";

interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  rental_rate: number;
  length: number;
  rating: string;
}

interface MovieListProps {
  movies: Movie[];
}

const MovieList: React.FC<MovieListProps> = ({ movies }) => {
  useEffect(() => {
    // Llamada a la API para obtener las películas
    fetch("http://ec2-54-236-45-55.compute-1.amazonaws.com:8000/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data.movies))
      .catch((error) => console.error("Error fetching movies:", error));
  }, []);

  // Filtrar películas por el término de búsqueda

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        padding: "20px",
      }}
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList;

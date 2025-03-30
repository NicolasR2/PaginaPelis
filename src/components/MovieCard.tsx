import React, { useState } from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";

interface Movie {
  id: number;
  title: string;
  description: string;
  rental_rate: number;
}

interface MovieCardProps {
  movie: Movie;
  onToggleCart: (movie: Movie) => void;
  isInCart: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onToggleCart,
  isInCart,
}) => {
  const [added, setAdded] = useState(isInCart);

  const handleAddToCart = () => {
    if (!added) {
      onToggleCart(movie);
      setAdded(true);
    }
  };

  return (
    <Card sx={{ marginBottom: 2, padding: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6">{movie.title}</Typography>
        <Typography variant="body2">{movie.description}</Typography>
        <Typography variant="body1">
          Precio: ${movie.rental_rate.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          color={isInCart ?  "error":"success" } // Cambia de color si fue agregado
          onClick={() => onToggleCart(movie)}
          sx={{ marginTop: 1 }}
        >
          {isInCart ? "Quitar del carrito" : "Agregar al carrito"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MovieCard;

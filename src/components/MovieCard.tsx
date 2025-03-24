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
  onAddToCart: (movie: Movie) => void;
  isInCart: boolean; // Nuevo prop para saber si está en el carrito
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onAddToCart,
  isInCart,
}) => {
  const [added, setAdded] = useState(isInCart);

  const handleAddToCart = () => {
    if (!added) {
      onAddToCart(movie);
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
          color={added ? "success" : "primary"} // Cambia de color si fue agregado
          onClick={handleAddToCart}
          sx={{ marginTop: 1 }}
        >
          {added ? "Agregado al Carrito" : "Añadir al Carrito"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MovieCard;

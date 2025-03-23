import { Card, CardContent, Typography, Button } from "@mui/material";

interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  rental_rate: number;
  length: number;
  rating: string;
}

interface MovieDetailProps {
  movie: Movie;
  onAddToCart: (movie: Movie) => void;
}

const MovieDetail: React.FC<MovieDetailProps> = ({ movie, onAddToCart }) => {
  return (
    <Card sx={{ maxWidth: 400, padding: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5">{movie.title}</Typography>
        <Typography variant="body1" color="text.secondary">
          {movie.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Año: {movie.release_year}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Precio: ${movie.rental_rate}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Duración: {movie.length} min
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rating: {movie.rating}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onAddToCart(movie)}
          sx={{ marginTop: 2 }}
        >
          Agregar al carrito
        </Button>
      </CardContent>
    </Card>
  );
};

export default MovieDetail;

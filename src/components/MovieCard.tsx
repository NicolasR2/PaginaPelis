import { Card, CardContent, Typography } from "@mui/material";

interface Movie {
  id: number;
  title: string;
  description: string;
  release_year: number;
  rental_rate: number;
  length: number;
  rating: string;
}

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Card sx={{ maxWidth: 300, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {movie.title}
        </Typography>
        <Typography color="text.secondary">{movie.description}</Typography>
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
      </CardContent>
    </Card>
  );
};

export default MovieCard;

import {
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

interface Movie {
  id: number;
  title: string;
  description: string;
  rental_rate: number;
}

interface MovieDetails extends Movie {
  language: string;
  actors: { actor_id: number; name: string }[];
  available_copies: number;
  inventory_ids: number[]; // ⬅️ nuevo
}

interface MovieCardProps {
  movie: Movie;
  onToggleCart: (movie: Movie) => void;
  isInCart: boolean;
  storeId: number;
  API_BASE_URL: string;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onToggleCart,
  isInCart,
  storeId,
  API_BASE_URL,
}) => {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchDetails = async () => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/movies/${movie.id}/details?store_id=${storeId}`,
        {
          params: { store_id: storeId },
        }
      );
      setDetails(res.data);
    } catch (err) {
      console.error("Error cargando detalles:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchDetails();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          width: 220,
          height: 320,
          m: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CardContent
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ wordBreak: "break-word" }}
          >
            {movie.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              wordBreak: "break-word", // Permite cortar palabras largas
              overflowWrap: "break-word", // Compatibilidad extra
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {movie.description}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            ${movie.rental_rate?.toFixed(2)}
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: 1,
            p: 2,
          }}
        >
          <Button variant="outlined" fullWidth onClick={handleOpen}>
            Ver detalles
          </Button>
          <Button
            variant="contained"
            color={isInCart ? "error" : "success"}
            fullWidth
            onClick={() => onToggleCart(movie)}
          >
            {isInCart ? "Quitar del carrito" : "Agregar"}
          </Button>
        </CardActions>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de {movie.title}</DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <Typography>Cargando detalles...</Typography>
          ) : details ? (
            <>
              <Typography variant="subtitle1">
                <strong>Título:</strong> {details.title}
              </Typography>
              <Typography variant="subtitle1">
                <strong>ID de la película :</strong> {movie.id}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Copias disponibles:</strong> {details.available_copies}
              </Typography>
              <Typography variant="subtitle1">
                <strong>IDs de inventario:</strong>{" "}
                {details.inventory_ids.length > 0
                  ? details.inventory_ids.join(", ")
                  : "No disponible"}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Descripción:</strong> {details.description}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Idioma:</strong> {details.language}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Precio:</strong> ${details.rental_rate.toFixed(2)}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                <strong>Actores:</strong>
              </Typography>
              <List>
                {details.actors.map(
                  (actor: { actor_id: number; name: string }) => (
                    <ListItem key={actor.actor_id}>
                      <ListItemText primary={actor.name} />
                    </ListItem>
                  )
                )}
              </List>
            </>
          ) : (
            <Typography>No se pudo cargar la información.</Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 3,
            pb: 2,
          }}
        >
          <Button variant="outlined" fullWidth onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            color={isInCart ? "error" : "success"}
            fullWidth
            onClick={() => {
              onToggleCart(movie);
              handleClose();
            }}
          >
            {isInCart ? "Quitar del carrito" : "Agregar al carrito"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MovieCard;

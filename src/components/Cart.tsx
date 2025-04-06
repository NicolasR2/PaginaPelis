import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface Movie {
  id: number;
  title: string;
  rental_rate: number;
}

interface CartProps {
  cart: Movie[];
  onRemoveFromCart: (movieId: number) => void;
  onCheckout: (customerId: number) => Promise<void>;
}

const Cart: React.FC<CartProps> = ({ cart, onRemoveFromCart, onCheckout }) => {
  const [customerId, setCustomerId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCheckout = async () => {
    if (!customerId.trim()) {
      alert("Por favor ingrese un ID de cliente");
      return;
    }

    const id = Number(customerId);
    if (isNaN(id) || id <= 0) {
      alert("El ID debe ser un número positivo");
      return;
    }

    setIsVerifying(true);
    try {
      await onCheckout(id);
    } finally {
      setIsVerifying(false);
    }
  };

  const totalPrice = cart.reduce(
    (total, movie) => total + movie.rental_rate,
    0
  );

  return (
    <Card sx={{ maxWidth: 400, padding: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Carrito de Compras
        </Typography>

        <TextField
          fullWidth
          label="ID del Cliente"
          variant="outlined"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          type="number"
          error={!!error}
          helperText={error}
          sx={{ marginBottom: 2 }}
          inputProps={{
            min: 1,
            step: 1,
          }}
        />

        <List sx={{ marginBottom: 2 }}>
          {cart.map((movie) => (
            <ListItem
              key={movie.id}
              secondaryAction={
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => onRemoveFromCart(movie.id)}
                >
                  Quitar
                </Button>
              }
              sx={{ paddingRight: 8 }}
            >
              <ListItemText
                primary={movie.title}
                secondary={`$${movie.rental_rate.toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>

        <Typography variant="h6" gutterBottom>
          Total: ${totalPrice.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCheckout}
          disabled={cart.length === 0 || !customerId.trim() || isVerifying}
        >
          {isVerifying ? "Verificando..." : "Proceder al pago"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Cart;

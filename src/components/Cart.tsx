import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

interface Movie {
  id: number;
  title: string;
  rental_rate: number;
}

interface CartProps {
  cart: Movie[];
  onRemoveFromCart: (id: number) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onRemoveFromCart, onClearCart }) => {
  const [customerId, setCustomerId] = useState<number | "">("");
  const availableCustomers = [1, 2, 3];

  const handleCheckout = async () => {
    if (!customerId) {
      alert("Selecciona un cliente antes de proceder al pago.");
      return;
    }

    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    try {
      await axios.post("http://44.222.142.138:8000/rentals", {
        customer_id: customerId,
        film_ids: cart.map((movie) => movie.id),
      });

      alert("Películas rentadas exitosamente.");
      onClearCart();
    } catch (error) {
      console.error("Error al alquilar películas:", error);
      alert("Error al alquilar películas. Intenta de nuevo.");
    }
  };

  const totalPrice = cart.reduce((total, movie) => total + movie.rental_rate, 0);

  return (
    <Card sx={{ maxWidth: 400, padding: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5">Carrito</Typography>

        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Selecciona un Cliente</InputLabel>
          <Select
            value={customerId}
            onChange={(e) => setCustomerId(Number(e.target.value))}
            label="Selecciona un Cliente"
          >
            {availableCustomers.map((id) => (
              <MenuItem key={id} value={id}>
                Cliente {id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <List>
          {cart.map((movie) => (
            <ListItem
              key={movie.id}
              secondaryAction={
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => onRemoveFromCart(movie.id)}
                >
                  Quitar
                </Button>
              }
            >
              <ListItemText
                primary={movie.title}
                secondary={`$${movie.rental_rate}`}
              />
            </ListItem>
          ))}
        </List>

        <Typography variant="h6">Total: ${totalPrice.toFixed(2)}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCheckout}
          disabled={cart.length === 0}
          sx={{ marginTop: 2, width: "100%" }}
        >
          Proceder al pago
        </Button>
      </CardContent>
    </Card>
  );
};

export default Cart;

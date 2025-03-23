import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

interface Movie {
  id: number;
  title: string;
  rental_rate: number;
}

interface CartProps {
  cart: Movie[];
  onRemoveFromCart: (id: number) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onRemoveFromCart, onCheckout }) => {
  const totalPrice = cart.reduce(
    (total, movie) => total + movie.rental_rate,
    0
  );

  return (
    <Card sx={{ maxWidth: 400, padding: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5">Carrito</Typography>
        <List>
          {cart.map((movie) => (
            <ListItem
              key={movie.id}
              secondaryAction={
                <Button
                  variant="contained"
                  color="secondary"
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
          onClick={onCheckout}
          disabled={cart.length === 0}
          sx={{ marginTop: 2 }}
        >
          Proceder al pago
        </Button>
      </CardContent>
    </Card>
  );
};

export default Cart;

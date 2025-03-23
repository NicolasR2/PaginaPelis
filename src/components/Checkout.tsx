import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface CheckoutProps {
  totalPrice: number;
  onConfirm: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ totalPrice, onConfirm }) => {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  return (
    <Card sx={{ maxWidth: 400, padding: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5">Finalizar Alquiler</Typography>
        <TextField
          label="Nombre en la tarjeta"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Número de tarjeta"
          fullWidth
          variant="outlined"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Typography variant="h6">
          Total a pagar: ${totalPrice.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={!name || !cardNumber}
          sx={{ marginTop: 2 }}
        >
          Confirmar Pago
        </Button>
      </CardContent>
    </Card>
  );
};

export default Checkout;

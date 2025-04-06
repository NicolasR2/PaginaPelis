import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";

interface Rental {
  rental_id: number;
  film_id: number;
  title: string;
  rental_date: string;
}

interface ReturnsDialogProps {
  open: boolean;
  onClose: () => void;
  API_BASE_URL: string;
}

const ReturnsDialog: React.FC<ReturnsDialogProps> = ({
  open,
  onClose,
  API_BASE_URL,
}) => {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedRentals, setSelectedRentals] = useState<number[]>([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!customerId.trim()) {
      setError("Por favor ingrese un ID de cliente");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customers/${customerId}/rentals`
      );
      setRentals(response.data.rentals);
      setError("");
    } catch (err) {
      setError("Cliente no encontrado o error en la conexión");
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (selectedRentals.length === 0) {
      setError("Seleccione al menos una película para devolver");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/returns`, {
        rental_ids: selectedRentals,
      });
      alert("Devolución realizada con éxito");
      // Actualizar la lista después de devolver
      handleSearch();
      setSelectedRentals([]);
    } catch (err) {
      setError("Error al procesar la devolución");
    } finally {
      setLoading(false);
    }
  };

  const toggleRentalSelection = (rentalId: number) => {
    setSelectedRentals((prev) =>
      prev.includes(rentalId)
        ? prev.filter((id) => id !== rentalId)
        : [...prev, rentalId]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Devolver Películas</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
          <TextField
            label="ID de Cliente"
            variant="outlined"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            type="number"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !customerId.trim()}
          >
            Buscar
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {loading && (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />
        )}

        {rentals.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Películas Rentadas:
            </Typography>
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {rentals.map((rental) => (
                <ListItem key={rental.rental_id}>
                  <Checkbox
                    checked={selectedRentals.includes(rental.rental_id)}
                    onChange={() => toggleRentalSelection(rental.rental_id)}
                  />
                  <ListItemText
                    primary={rental.title}
                    secondary={`Rentada el: ${new Date(
                      rental.rental_date
                    ).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleReturn}
          disabled={selectedRentals.length === 0 || loading}
          variant="contained"
          color="primary"
        >
          Devolver Selección
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReturnsDialog;

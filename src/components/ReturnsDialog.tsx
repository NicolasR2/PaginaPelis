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
import { useAlert } from "../context/AlertContext"; // ✅ Importa el hook global

interface Rental {
  rental_id: number;
  film_id: number;
  title: string;
  rental_date: string;
  inventory_id: number;
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
  const [hasSearched, setHasSearched] = useState(false);

  const { showAlert } = useAlert(); // ✅ Usa el contexto global

  const handleSearch = async () => {
    if (!customerId.trim()) {
      showAlert("❌ Por favor ingrese un ID de cliente", "warning");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/customers/${customerId}/rentals`
      );
      setRentals(response.data.rentals);
    } catch (err) {
      showAlert("⚠️ Cliente no encontrado o error en la conexión", "error");
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (selectedRentals.length === 0) {
      showAlert("⚠️ Seleccione al menos una película para devolver", "info");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/returns`, {
        rental_ids: selectedRentals,
      });
      showAlert("✅ Devolución realizada con éxito", "success");
      handleSearch(); // Refresca la lista
      setSelectedRentals([]);
    } catch (err) {
      showAlert("❌ Error al procesar la devolución", "error");
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

        {loading && (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />
        )}

        {!loading && rentals.length > 0 && (
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
                    secondary={
                      <>
                        {`Rentada el: ${new Date(
                          rental.rental_date
                        ).toLocaleDateString()}`}
                        <br />
                        {`Inventory ID: ${rental.inventory_id}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {!loading && hasSearched && rentals.length === 0 && (
          <Box
            sx={{
              mt: 4,
              p: 2,
              bgcolor: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeeba",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="body1">
              Este cliente no tiene películas rentadas actualmente.
            </Typography>
          </Box>
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

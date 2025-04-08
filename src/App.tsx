import { useState, useEffect } from "react";
import MovieList from "./components/MovieList"; // Asumiendo export default
import Cart from "./components/Cart"; // Asumiendo export default
import SearchBar from "./components/SearchBar"; // Asumiendo export default
import { Button, Container, Box, IconButton } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { AssignmentReturn as AssignmentReturnIcon } from "@mui/icons-material";
import ReturnsDialog from "./components/ReturnsDialog"; // Asumiendo export default
import axios from "axios";
import { useAlert } from "./context/AlertContext";

// Añade este estado al componente App

const API_BASE_URL = "http://3.88.166.111:8000";

function App() {
  interface Movie {
    id: number;
    title: string;
    description: string;
    rental_rate: number;
  }

  const [movies, setMovies] = useState<Movie[]>([]);
  const [cart, setCart] = useState<Movie[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [storeId, setStoreId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { showAlert } = useAlert(); // ⬅️ Esto es lo que permite usar showAlert

  const handleCheckout = async (customerId: number) => {
    try {
      if (!customerId) {
        showAlert("❌ Por favor ingrese un ID de cliente válido", "error");
        return;
      }

      if (cart.length === 0) {
        showAlert("🛒 El carrito está vacío", "warning");
        return;
      }

      let customerExists = false;
      try {
        const customerResponse = await axios.get(
          `${API_BASE_URL}/customers/${customerId}`
        );
        customerExists = customerResponse.data?.exists || false;
      } catch (error) {
        console.error("Error verificando cliente:", error);
        showAlert(
          "⚠️ Error al verificar el cliente. Intente nuevamente.",
          "error"
        );
        return;
      }

      if (!customerExists) {
        showAlert("❌ Cliente no encontrado. Verifique el ID.", "error");
        return;
      }

      const availabilityResults = await Promise.all(
        cart.map(async (movie) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/films/${movie.id}/availability`,
              { params: { store_id: storeId } }
            );

            if (typeof response.data?.available !== "boolean") {
              throw new Error("Respuesta inválida del servidor");
            }

            return {
              movieId: movie.id,
              title: movie.title,
              isAvailable: response.data.available,
              inventoryId: response.data.inventory_id || null,
              error: null,
            };
          } catch (error: unknown) {
            console.error(`Error verificando ${movie.title}:`, error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Error de verificación desconocido";
            return {
              movieId: movie.id,
              title: movie.title,
              isAvailable: false,
              inventoryId: null,
              error: errorMessage,
            };
          }
        })
      );

      const unavailableMovies = availabilityResults.filter(
        (item) => !item.isAvailable
      );
      if (unavailableMovies.length > 0) {
        const movieList = unavailableMovies
          .map((m) => `• ${m.title}${m.error ? ` (${m.error})` : ""}`)
          .join("\n");
        showAlert(`🚫 Películas no disponibles:\n${movieList}`, "warning");
        return;
      }

      const rentalItems = availabilityResults
        .filter((item) => item.isAvailable && item.inventoryId)
        .map((item) => ({
          film_id: item.movieId,
          inventory_id: item.inventoryId,
        }));

      if (rentalItems.length !== cart.length) {
        showAlert("⚠️ Algunas películas no pudieron ser procesadas", "warning");
        return;
      }

      const rentalResponse = await axios.post(
        `${API_BASE_URL}/rentals`,
        {
          customer_id: customerId,
          store_id: storeId,
          items: rentalItems,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = rentalResponse.data;
      const completedIds = result.completed.map((r: any) => r.film_id);
      const failed = result.failed;

      if (failed.length > 0) {
        const failList = failed
          .map((f: any) => `• ID ${f.film_id}: ${f.error}`)
          .join("\n");
        showAlert(
          `⚠️ Algunas películas no se pudieron alquilar:\n${failList}`,
          "warning"
        );
      }

      if (!rentalResponse.data?.success) {
        const message =
          rentalResponse.data?.message || "El alquiler no pudo ser completado";
        showAlert(`⚠️ ${message}`, "error");
        return;
      }

      setCart((prevCart) =>
        prevCart.filter((m) => !completedIds.includes(m.id))
      );

      if (completedIds.length > 0) {
        showAlert(
          `✅ ${completedIds.length} películas alquiladas con éxito.`,
          "success"
        );
      }

      setCart([]);
    } catch (error) {
      console.error("Error en el proceso de alquiler:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          showAlert(
            "⏳ Tiempo de espera agotado. Intente nuevamente.",
            "error"
          );
        } else if (error.response) {
          const status = error.response.status;
          const message =
            error.response.data?.detail ||
            error.response.data?.message ||
            "Error en el servidor";

          if (status === 422) {
            showAlert(`📋 Error de validación: ${message}`, "error");
          } else if (status === 404) {
            showAlert(`🔍 Recurso no encontrado: ${message}`, "error");
          } else {
            showAlert(`⚠️ Error ${status}: ${message}`, "error");
          }
        } else {
          showAlert("🔌 Error de conexión: " + error.message, "error");
        }
      } else {
        showAlert("❌ Error inesperado: " + String(error), "error");
      }
    }
  };

  const fetchMovies = async (search: string, storeId: number) => {
    try {
      let response;

      if (search.trim() !== "") {
        response = await axios.get(`${API_BASE_URL}/movies`, {
          params: { query: search.toLowerCase(), store_id: storeId },
        });
      } else {
        response = await axios.get(`${API_BASE_URL}/movies`, {
          params: { store_id: storeId },
        });

        const allMovies = response.data.movies;
        setMovies(allMovies.slice(0, 15));
        return;
      }

      setMovies(response.data.movies);
    } catch (error) {
      console.error("Error al cargar películas:", error);
      showAlert("⚠️ Error al cargar películas", "error");
    }
  };

  // 🔄 Cargar 10 películas aleatorias al inicio
  useEffect(() => {
    if (searchQuery.trim() === "") {
      fetchMovies("", storeId); // carga inicial si no hay búsqueda
    }
  }, [storeId]);

  // Eliminamos onClearCart ya que ahora se maneja dentro de handleCheckout

  const handleToggleCart = (movie: Movie) => {
    if (cart.some((m) => m.id === movie.id)) {
      setCart(cart.filter((m) => m.id !== movie.id));
    } else {
      setCart([...cart, movie]);
    }
  };

  const removeFromCart = (movieId: number) => {
    setCart((prevCart) => prevCart.filter((movie) => movie.id !== movieId));
  };

  const toggleCart = () => {
    setShowCart((prev) => !prev);
  };
  const handleStoreChange = (event: { target: { value: any } }) => {
    const newStoreId = event.target.value;
    setStoreId(newStoreId);
    setCart([]); // Limpiar carrito al cambiar de tienda
    fetchMovies("", newStoreId); // Volver a cargar películas de esa tienda
  };

  return (
    <Container>
      {/* 🔹 Barra de búsqueda (Oculta en el carrito) */}
      {!showCart && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            backgroundColor: "white",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
            zIndex: 1000,
            height: "60px",
          }}
        >
          {/* Contenedor izquierdo (icono + barra búsqueda) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1, // Ocupa todo el espacio disponible
              maxWidth: "calc(100% - 180px)", // Deja espacio para el botón del carrito
            }}
          >
            <IconButton
              onClick={() => setReturnsOpen(true)}
              color="primary"
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" },
                flexShrink: 0,
              }}
            >
              <AssignmentReturnIcon />
            </IconButton>

            {/* Contenedor de la barra de búsqueda */}
            <Box
              sx={{
                flex: 1,
                height: "100%",
                minWidth: 0, // Permite que el contenido se reduzca
              }}
            >
              <SearchBar
                onSearch={(query) => {
                  fetchMovies(query, storeId);
                  setSearchQuery(query);
                }}
              />
            </Box>
          </Box>

          {/* Botón del carrito */}
          <FormControl
            size="small"
            sx={{ minWidth: 120, marginRight: "20px", marginLeft: "20px" }}
          >
            <InputLabel id="store-select-label">Tienda</InputLabel>
            <Select
              labelId="store-select-label"
              value={storeId}
              label="Tienda"
              onChange={handleStoreChange}
            >
              <MenuItem value={1}>Tienda 1</MenuItem>
              <MenuItem value={2}>Tienda 2</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={toggleCart}
            sx={{
              height: "40px",
              minWidth: "150px", // Ancho mínimo para el botón
              flexShrink: 0,
              marginRight: "20px",
            }}
          >
            {showCart ? "Volver a Películas" : `Ver Carrito (${cart.length})`}
          </Button>
        </Box>

        // Añade el diálogo al final del JSX (antes del </Container>)
      )}

      <Box sx={{ marginTop: showCart ? "20px" : "80px" }}>
        {!showCart ? (
          <MovieList
            movies={movies}
            onToggleCart={handleToggleCart}
            cart={cart}
            storeId={storeId}
            API_BASE_URL={API_BASE_URL}
          />
        ) : (
          <div>
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={toggleCart}
                sx={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                {showCart
                  ? "Volver a Películas"
                  : `Ver Carrito (${cart.length})`}
              </Button>

              <Box sx={{ width: "100%", maxWidth: 400 }}>
                <Cart
                  cart={cart}
                  onRemoveFromCart={removeFromCart}
                  onCheckout={handleCheckout} // Pasamos la función completa
                />
              </Box>
            </Container>
          </div>
        )}
      </Box>
      <ReturnsDialog
        open={returnsOpen}
        onClose={() => setReturnsOpen(false)}
        API_BASE_URL={API_BASE_URL}
      />
    </Container>
  );
}

export default App;

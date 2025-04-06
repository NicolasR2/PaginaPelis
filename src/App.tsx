import { useState, useEffect } from "react";
import MovieList from "./components/MovieList";
import Cart from "./components/Cart";
import SearchBar from "./components/SearchBar";
import { Button, Container, Box } from "@mui/material";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import ReturnsDialog from "./components/ReturnsDialog";
import IconButton from "@mui/material/IconButton";
import axios from "axios";

// Añade este estado al componente App

const API_BASE_URL = "http://18.212.91.156:8000";
const MOVIES_URL = `${API_BASE_URL}/movies`;
const SEARCH_URL = `${API_BASE_URL}/movies/search/`;
const RENTALS_URL = `${API_BASE_URL}/rentals`;
const CUSTOMER_URL = `${API_BASE_URL}/customer`;

function App() {
  interface Movie {
    id: number;
    title: string;
    description: string;
    rental_rate: number;
  }
  const MOCK_MOVIES: Movie[] = [
    {
      id: 1,
      title: "El Padrino",
      description: "Drama sobre la familia mafiosa Corleone",
      rental_rate: 2.99,
    },
    {
      id: 2,
      title: "Pulp Fiction",
      description: "Historias entrelazadas de crimen en Los Ángeles",
      rental_rate: 3.49,
    },
    {
      id: 3,
      title: "El Señor de los Anillos",
      description: "Aventuras épicas en la Tierra Media",
      rental_rate: 2.79,
    },
    {
      id: 4,
      title: "Titanic",
      description: "Historia de amor en el trágico viaje inaugural",
      rental_rate: 1.99,
    },
    {
      id: 5,
      title: "Matrix",
      description: "Un hacker descubre la verdad sobre la realidad",
      rental_rate: 3.29,
    },
  ];

  const [movies, setMovies] = useState<Movie[]>([]);
  const [cart, setCart] = useState<Movie[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);

  const verifyCustomer = async (customerId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`${CUSTOMER_URL}/${customerId}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error verificando cliente:", error);
      return false;
    }
  };
  // Función completa de checkout
  const handleCheckout = async (customerId: number) => {
    try {
      // Verificar primero si el cliente existe
      const customerExists = await verifyCustomer(customerId);

      if (!customerExists) {
        alert("El ID de cliente no existe. Por favor verifique.");
        return;
      }

      if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
      }

      // Verificar disponibilidad de cada película
      const availabilityChecks = await Promise.all(
        cart.map((movie) =>
          axios.get(`${API_BASE_URL}/films/${movie.id}/availability`)
        )
      );

      const unavailableMovies = cart.filter(
        (_, index) => !availabilityChecks[index].data.available
      );

      if (unavailableMovies.length > 0) {
        alert(
          `Las siguientes películas no están disponibles:\n${unavailableMovies
            .map((m) => m.title)
            .join(
              "\n"
            )}\n\nPor favor remuévalas del carrito e intente nuevamente.`
        );
        return;
      }

      // Procesar el alquiler

      alert("Películas rentadas exitosamente.");
      setCart([]);
    } catch (error) {
      console.error("Error al alquilar películas:", error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Error al procesar la renta. Intente nuevamente.");
      }
    }
  };

  // 🔹 Obtener 10 películas aleatorias o buscar por query
  const fetchMovies = async (query: string) => {
    try {
      const url = query ? `${SEARCH_URL}?query=${query}` : MOVIES_URL;
      const response = await fetch(url);
      const data = await response.json();

      let movieList = data.movies || [];

      // Si no hay datos de la API, usar el mock (solo en desarrollo)

      // 🔀 Si la búsqueda está vacía, mostrar 10 películas aleatorias
      if (!query) {
        movieList = movieList.sort(() => Math.random() - 0.5).slice(0, 10);
      }

      setMovies(movieList);
    } catch (error) {
      console.error("Error al obtener películas:", error);
      // Solo usar mock en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.warn("Fallo en la API - Usando datos mockeados");
        setMovies(MOCK_MOVIES.sort(() => Math.random() - 0.5).slice(0, 10));
      }
    }
  };

  // 🔄 Cargar 10 películas aleatorias al inicio
  useEffect(() => {
    fetchMovies("");
  }, []);

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
                onSearch={fetchMovies}
                sx={{
                  width: "100%",
                  height: "40px",
                  "& .MuiInputBase-root": {
                    // Estilos para el input interno
                    height: "100%",
                  },
                  "& .MuiOutlinedInput-input": {
                    // Ajuste del input
                    padding: "10px 14px",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Botón del carrito */}
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

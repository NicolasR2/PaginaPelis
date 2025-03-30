import { useState, useEffect } from "react";
import MovieList from "./components/MovieList";
import Cart from "./components/Cart";
import SearchBar from "./components/SearchBar";
import { Button, Container, Box, Typography } from "@mui/material";

const API_URL = "http://44.222.142.138:8000/movies";
const SEARCH_URL = "http://44.222.142.138:8000/movies/search/";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cart, setCart] = useState<Movie[]>([]);
  const [showCart, setShowCart] = useState(false);

  // 🔹 Obtener 10 películas aleatorias o buscar por query
  const fetchMovies = async (query: string) => {
    try {
      const url = query ? `${SEARCH_URL}?query=${query}` : API_URL;
      const response = await fetch(url);
      const data = await response.json();

      let movieList = data.movies || [];

      // 🔀 Si la búsqueda está vacía, mostrar 10 películas aleatorias
      if (!query) {
        movieList = movieList.sort(() => Math.random() - 0.5).slice(0, 10);
      }

      setMovies(movieList);
    } catch (error) {
      console.error("Error al obtener películas:", error);
    }
  };

  // 🔄 Cargar 10 películas aleatorias al inicio
  useEffect(() => {
    fetchMovies("");
  }, []);
  
  const onClearCart = () => {
    setCart([]); // Vacía el carrito después del pago
  };

  const handleToggleCart = (movie: Movie) => {
    if (cart.some((m) => m.id === movie.id)) {
      setCart(cart.filter((m) => m.id !== movie.id)); // Elimina si ya está en el carrito
    } else {
      setCart([...cart, movie]); // Agrega si no está en el carrito
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
          <Box sx={{ flex: 1, marginRight: 2 }}>
            <SearchBar onSearch={fetchMovies} />
          </Box>

          {/* 🛒 Botón "Ver Carrito" con margen derecho más grande */}
          <Button
            variant="contained"
            color="primary"
            onClick={toggleCart}
            sx={{
              height: "40px",
              display: "flex",
              alignItems: "center",
              marginRight: "30px", // ✅ Aumenta el margen derecho
            }}
          >
            {showCart ? "Volver a Películas" : `Ver Carrito (${cart.length})`}
          </Button>
        </Box>
      )}

      <Box sx={{ marginTop: showCart ? "20px" : "80px" }}>
        {!showCart ? (
          <MovieList movies={movies} onToggleCart={handleToggleCart} cart={cart} />
        ) : (
        <div>
        <Container sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
  <Button
    variant="contained"
    color="primary"
    onClick={toggleCart}
    sx={{
      height: "40px",
      display: "flex",
      alignItems: "center",
      marginBottom: 2, // Espacio entre el botón y el carrito
    }}
  >
    {showCart ? "Volver a Películas" : `Ver Carrito (${cart.length})`}
  </Button>

  <Box sx={{ width: "100%", maxWidth: 400 }}>
    <Cart cart={cart} onRemoveFromCart={removeFromCart} onClearCart={onClearCart} />
  </Box>
</Container>
          </div>
        )}
      </Box>
    </Container>
  );
}

export default App;

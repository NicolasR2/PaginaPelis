import { useState, useEffect } from "react";
import MovieList from "./components/MovieList";
import Cart from "./components/Cart";
import SearchBar from "./components/SearchBar";
import { Button, Container, Box } from "@mui/material";

const API_URL = "http://ec2-18-214-88-89.compute-1.amazonaws.com:8000/movies";
const SEARCH_URL = "http://ec2-18-214-88-89.compute-1.amazonaws.com:8000/movies/search/";

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

      // 🔀 Si la búsqueda está vacía, mezclar películas aleatoriamente
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

  const addToCart = (movie: Movie) => {
    if (!cart.some((m) => m.id === movie.id)) {
      setCart((prevCart) => [...prevCart, movie]);
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
        {/* 🔎 Barra de búsqueda */}
        <Box sx={{ flex: 1, marginRight: 2 }}>
          <SearchBar onSearch={fetchMovies} />
        </Box>

        {/* 🛒 Botón "Ver Carrito" */}
        <Button
          variant="contained"
          color="secondary"
          onClick={toggleCart}
          sx={{ height: "40px", display: "flex", alignItems: "center" }}
        >
          {showCart ? "Volver a Películas" : `Ver Carrito (${cart.length})`}
        </Button>
      </Box>

      <Box sx={{ marginTop: "80px" }}>
        {!showCart ? (
          <MovieList movies={movies} onAddToCart={addToCart} cart={cart} searchTerm="" />
        ) : (
          <Cart cart={cart} onRemoveFromCart={removeFromCart} />
        )}
      </Box>
    </Container>
  );
}

export default App;
